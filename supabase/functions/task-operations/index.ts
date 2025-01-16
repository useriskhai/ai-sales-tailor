import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { supabase } from '../_shared/supabase-client.ts';
import { TaskStatus } from '../_shared/types.ts';

export async function handleTaskAction(action: string, data: any) {
  switch (action) {
    case 'updateTaskStatus':
      return await updateTaskStatus(data.taskId, data.status);
    case 'getPendingTasks':
      return await getPendingTasks(data.jobId);
    case 'fetchJobTasks':
      return await fetchJobTasks(data.jobId);
    default:
      throw new Error(`不明なタスクアクション: ${action}`);
  }
}

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
  try {
    const { error } = await supabase
      .from('generated_content')
      .update({ status })
      .eq('id', taskId);

    if (error) throw new Error(`タスクステータス更新エラー: ${error.message}`);
  } catch (error) {
    console.error('タスクステータス更新中にエラーが発生:', error);
    throw new Error(`タスクステータス更新中のエラー: ${error.message}`);
  }
}

export async function getPendingTasks(jobId: string): Promise<{ id: string }[]> {
  const { data, error } = await supabase
    .from('generated_content')
    .select('id')
    .eq('batch_job_id', jobId)
    .eq('status', 'pending');

  if (error) throw error;
  return data;
}

export async function fetchJobTasks(jobId: string) {
  const { data, error } = await supabase
    .from('generated_content')
    .select('*')
    .eq('batch_job_id', jobId);

  if (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message }),
    };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
}

// HTTP サーバーを設定
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method === 'POST') {
    try {
      const bodyText = await req.text();
      const parsedData = JSON.parse(bodyText);
      const { action, data } = parsedData;

      const result = await handleTaskAction(action, data);

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