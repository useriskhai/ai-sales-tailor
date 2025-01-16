import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { logJobProgress } from '../utils/job-logger.ts'
import { sendEmail } from '../utils/email-sender.ts' // Ensure correct import path

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let jobId; // Define jobId here

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { jobId: id, status } = await req.json()
    jobId = id; // Assign jobId

    // ジョブ情報とユーザー設定の取得
    const { data: jobData, error: jobError } = await supabase.functions.invoke('job-operations', {
      body: JSON.stringify({
        action: 'getJobAndUserSettings',
        data: { jobId }
      })
    })

    if (jobError) throw new Error(`ジョブ情報取得エラー: ${jobError.message}`)

    const { job, userSettings } = jobData

    // 通知メッセージの作成
    let message = ''
    if (status === 'completed') {
      message = `バッチジョブ ${jobId} が完了しました。処理されたタスク: ${job.completed_tasks}/${job.total_tasks}`
    } else if (status === 'failed') {
      message = `バッチジョブ ${jobId} が失敗しました。処理されたタスク: ${job.completed_tasks}/${job.total_tasks}`
    } else {
      message = `バッチジョブ ${jobId} のステータスが ${status} に更新されました。`
    }

    // 通知の送信（データベースに保存）
    const { error: notificationError } = await supabase.functions.invoke('notification-operations', {
      body: JSON.stringify({
        action: 'insertNotification',
        data: {
          userId: job.user_id,
          message,
          jobId,
          status
        }
      })
    })

    if (notificationError) throw new Error(`通知送信エラー: ${notificationError.message}`)

    // メール通知（ユーザー設定に基づく）
    if (userSettings.email_notification) {
      await sendEmail(job.user_id, message)
    }

    logJobProgress(jobId, 'notification', `通知送信完了: ${status}`)

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) { // 修正
    console.error('Error:', error.message)
    logJobProgress(jobId, 'notification', `エラー発生: ${error.message}`, 'error')
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})