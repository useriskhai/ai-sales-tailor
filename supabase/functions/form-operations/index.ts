import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { supabase } from '../_shared/supabase-client.ts';
import { sendViaForm } from '../ai-form-assistant/index.ts';
import { CustomFormData, FormField, SendingStatus, SendingTask } from '../utils/types.ts';

// リクエストペイロードの型定義
interface FormOperationsPayload {
  action: 'initiateSending' | 'checkSendingStatus' | 'retrySending';
  data: {
    batch_job_id?: string;
    task_ids?: string[];
    task_id?: string;
    tasks?: {
      company_id: string;
      content_id: string;
      user_id: string;
      preferred_method?: 'form' | 'dm';
    }[];
    force_method?: 'form' | 'dm';
  };
}

async function handleFormAction(action: string, data: FormOperationsPayload['data']) {
  switch (action) {
    case 'initiateSending': {
      const { batch_job_id, tasks } = data;
      if (!batch_job_id || !tasks || tasks.length === 0) {
        throw new Error('バッチジョブIDとタスクは必須です');
      }

      // 送信タスクの作成
      const sendingTasks = tasks.map(task => ({
        batch_job_id,
        company_id: task.company_id,
        content_id: task.content_id,
        user_id: task.user_id,
        preferred_method: task.preferred_method || 'form',
        status: SendingStatus.PENDING,
        attempt_count: 0,
        last_attempt: {
          timestamp: new Date().toISOString(),
          method: task.preferred_method || 'form'
        }
      }));

      const { data: createdTasks, error } = await supabase
        .from('sending_tasks')
        .insert(sendingTasks)
        .select();

      if (error) {
        console.error('Task creation error:', error);
        throw new Error('送信タスクの作成に失敗しました');
      }

      // バックグラウンドでタスクの処理を開始
      processTasks(createdTasks);

      return { message: '送信タスクを作成しました', tasks: createdTasks };
    }

    case 'checkSendingStatus': {
      const { batch_job_id, task_ids } = data;
      if (!batch_job_id) {
        throw new Error('バッチジョブIDは必須です');
      }

      let query = supabase
        .from('sending_tasks')
        .select('*')
        .eq('batch_job_id', batch_job_id);

      if (task_ids && task_ids.length > 0) {
        query = query.in('id', task_ids);
      }

      const { data: tasks, error } = await query;

      if (error) {
        console.error('Status check error:', error);
        throw new Error('送信状態の確認に失敗しました');
      }

      return tasks;
    }

    case 'retrySending': {
      const { task_id, force_method } = data;
      if (!task_id) {
        throw new Error('タスクIDは必須です');
      }

      const { data: task, error: fetchError } = await supabase
        .from('sending_tasks')
        .select('*')
        .eq('id', task_id)
        .single();

      if (fetchError) {
        console.error('Task fetch error:', fetchError);
        throw new Error('タスクの取得に失敗しました');
      }

      const updateData = {
        status: SendingStatus.PENDING,
        attempt_count: task.attempt_count + 1,
        last_attempt: {
          timestamp: new Date().toISOString(),
          method: force_method || task.preferred_method
        }
      };

      const { error: updateError } = await supabase
        .from('sending_tasks')
        .update(updateData)
        .eq('id', task_id);

      if (updateError) {
        console.error('Task update error:', updateError);
        throw new Error('タスクの更新に失敗しました');
      }

      // タスクの再処理を開始
      processTask(task);

      return { message: '送信タスクを再試行します', task };
    }

    default:
      throw new Error(`不明なアクション: ${action}`);
  }
}

async function processTasks(tasks: SendingTask[]) {
  for (const task of tasks) {
    await processTask(task);
  }
}

async function processTask(task: SendingTask) {
  try {
    // タスクのステータスを更新
    await supabase
      .from('sending_tasks')
      .update({ status: SendingStatus.IN_PROGRESS })
      .eq('id', task.id);

    // 会社情報の取得
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', task.company_id)
      .single();

    if (companyError) {
      throw new Error('会社情報の取得に失敗しました');
    }

    // コンテンツの取得
    const { data: content, error: contentError } = await supabase
      .from('contents')
      .select('*')
      .eq('id', task.content_id)
      .single();

    if (contentError) {
      throw new Error('コンテンツの取得に失敗しました');
    }

    // フォーム送信の実行
    if (task.preferred_method === 'form') {
      const formData: CustomFormData = {
        action: task.form_data?.url || '',
        method: 'POST',
        fields: task.form_data?.fields || []
      };

      await sendViaForm(formData, company.name, content.body, task.user_id);
    } else {
      // DMプラットフォームでの送信（未実装）
      throw new Error('DMプラットフォームでの送信は未実装です');
    }

    // 成功時の更新
    await supabase
      .from('sending_tasks')
      .update({
        status: SendingStatus.COMPLETED,
        last_attempt: {
          timestamp: new Date().toISOString(),
          method: task.preferred_method
        }
      })
      .eq('id', task.id);

  } catch (error) {
    console.error('Task processing error:', error);

    // 失敗時の更新
    await supabase
      .from('sending_tasks')
      .update({
        status: SendingStatus.FAILED,
        last_attempt: {
          timestamp: new Date().toISOString(),
          method: task.preferred_method,
          error: error.message
        }
      })
      .eq('id', task.id);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, ...data } = await req.json();
    const result = await handleFormAction(action, data);

    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 200,
    });

  } catch (error) {
    console.error('Form operation error:', error);

    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    );
  }
}); 