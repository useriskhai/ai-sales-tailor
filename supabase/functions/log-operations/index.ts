import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { supabase } from '../_shared/supabase-client.ts';

export async function handleLogAction(action: string, data: any) {
  switch (action) {
    case 'logJobProgress':
      return await logJobProgress(data.jobId, data.taskId || null, data.message, data.level);
    case 'getJobLogs':
      return await getJobLogs(data.jobId);
    case 'getTaskLogs':
      return await getTaskLogs(data.taskId);
    case 'getErrorLogs':
      return await getErrorLogs(data.jobId);
    case 'rotateJobLogs':
      return await rotateJobLogs(data.retentionDays);
    default:
      throw new Error(`不明なログアクション: ${action}`);
  }
}

export async function logJobProgress(jobId: string, taskId: string | null, message: string, log_level: 'info' | 'error' | 'warning' = 'info') {
  try {
    const { error } = await supabase
      .from('job_logs')
      .insert({
        job_id: jobId,
        task_id: taskId,
        message: message,
        log_level: log_level,
        created_at: new Date().toISOString()
      });

    if (error) throw new Error(`ログ記録エラー: ${error.message}`);
    return { success: true };
  } catch (error) {
    console.error('ジョブログ記録エラー:', error);
    return { success: false, error: error.message };
  }
}

export async function getJobLogs(jobId: string) {
  try {
    const { data, error } = await supabase
      .from('job_logs')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('ジョブログ取得エラー:', error.message);
    return [];
  }
}

export async function getTaskLogs(taskId: string) {
  try {
    const { data, error } = await supabase
      .from('job_logs')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('タスクログ取得エラー:', error.message);
    return [];
  }
}

export async function getErrorLogs(jobId: string) {
  try {
    const { data, error } = await supabase
      .from('job_logs')
      .select('*')
      .eq('job_id', jobId)
      .eq('log_level', 'error')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('エラーログ取得エラー:', error.message);
    return [];
  }
}

export async function rotateJobLogs(retentionDays: number) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  try {
    const { data, error } = await supabase
      .from('job_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
      .select('count'); // 削除された行数を取得

    if (error) throw error;
    return { success: true, deletedCount: data[0]?.count ?? 0 }; // 修正: 配列の最初の要素からcountを取得
  } catch (error: any) {
    console.error('ログローテーションエラー:', error.message);
    return { success: false, error: error.message };
  }
}

// HTTP サーバーを設定
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method === 'POST') {
    try {
      const bodyText = await req.text();
      const parsedData = JSON.parse(bodyText);
      const { action, data } = parsedData;

      const result = await handleLogAction(action, data);

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 405,
  });
});
