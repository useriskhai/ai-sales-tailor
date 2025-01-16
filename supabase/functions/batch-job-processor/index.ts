import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabase } from '../_shared/supabase-client.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { logJobProgress } from '../utils/job-logger.ts'
import { retryOperation } from '../utils/batch-job-utils.ts'
import * as jobOperations from '../job-operations/index.ts'

const MAX_CONCURRENT_TASKS = 5

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const { jobId } = await req.json()
  if (!jobId) {
    return new Response(JSON.stringify({ error: 'jobId is required' }), { headers: corsHeaders, status: 400 })
  }

  const { data: job, error: jobError } = await jobOperations.getJobInfo(jobId)

  if (jobError) {
    console.error('ジョブ情報取得エラー:', jobError.message)
    return new Response(JSON.stringify({ error: 'ジョブ情報取得エラー' }), { headers: corsHeaders, status: 500 })
  }

  await updateJobStatus(jobId, 'processing')
  logJobProgress(jobId, null, 'ジョブ処理開始')

  const { data: tasks, error: tasksError } = await supabase.rpc('get_pending_tasks', { job_id: jobId })

  if (tasksError) {
    console.error('タスク情報取得エラー:', tasksError.message)
    return new Response(JSON.stringify({ error: 'タスク情報取得エラー' }), { headers: corsHeaders, status: 500 })
  }

  const taskChunks = chunkArray(tasks, MAX_CONCURRENT_TASKS)
  for (const chunk of taskChunks) {
    await Promise.all(chunk.map((task: { id: string }) => processTask(task.id, jobId)))
  }

  await updateJobStatus(jobId, 'completed')
  logJobProgress(jobId, null, 'ジョブ処理完了')

  return new Response(JSON.stringify({ message: 'ジョブ処理完了' }), { headers: corsHeaders })
})

export async function processTask(taskId: string, jobId: string) {
  await retryOperation(async () => {
    const { error } = await supabase.rpc('process_task', { task_id: taskId })
    if (error) throw error
  }, 3)
  logJobProgress(jobId, taskId, 'タスク処理完了')
}

async function updateJobStatus(jobId: string, status: string, errorMessage: string | null = null) {
  const { error } = await supabase.rpc('update_job_status', { job_id: jobId, status, error_message: errorMessage })
  if (error) {
    console.error('ジョブステータス更新エラー:', error.message)
  }
}

function chunkArray(array: any[], size: number): any[] {
  const result: any[] = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}