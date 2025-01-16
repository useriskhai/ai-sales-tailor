import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { logJobProgress } from '../utils/job-logger.ts'
import { retryOperation } from '../utils/batch-job-utils.ts'
import { supabase } from '../_shared/supabase-client.ts'

serve(async (req) => {
  let jobId: string | undefined;
  let taskId: string | undefined;

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { jobId: jId, taskId: tId, status, errorMessage } = await req.json()
    jobId = jId;
    taskId = tId;

    // 入力バリデーション
    if (!jobId || !taskId || !status) {
      throw new Error('必須パラメータが不足しています')
    }

    const result = await retryOperation(async () => {
      const { data, error } = await supabase.functions.invoke('job-operations', {
        body: JSON.stringify({
          action: 'updateJobStatus',
          data: { jobId, taskId, status, errorMessage }
        })
      })

      if (error) throw error
      return data
    }, 3)

    const { isCompleted, newStatus } = result

    logJobProgress(jobId, taskId, `タスクステータス更新: ${status}, ジョブステータス: ${newStatus}`)

    if (isCompleted) {
      // ジョブ完了通知の送信
      await sendJobCompletionNotification(jobId, newStatus)
    }

    return new Response(JSON.stringify({ success: true, isCompleted, newStatus }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) { // 修正
    console.error('Error:', error.message)
    logJobProgress(jobId ?? '不明', taskId ?? '不明', `エラー発生: ${error.message}`, 'error')
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

async function sendJobCompletionNotification(jobId: string, status: string) {
  try {
    await fetch(`${Deno.env.get('SUPABASE_FUNCTIONS_URL')}/job-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      },
      body: JSON.stringify({ jobId, status }),
    })
  } catch (error: any) { // 修正
    console.error('通知送信エラー:', error.message)
    logJobProgress(jobId, null, `通知送信エラー: ${error.message}`, 'error')
  }
}