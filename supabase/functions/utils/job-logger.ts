import { supabase } from '../_shared/supabase-client.ts'

export async function logJobProgress(jobId: string, taskId: string | null, message: string, level: 'info' | 'warning' | 'error' = 'info') {
  try {
    const { error } = await supabase.functions.invoke('log-operations', {
      body: JSON.stringify({
        action: 'insertJobLog',
        data: {
          job_id: jobId,
          task_id: taskId,
          message: message,
          level: level,
          created_at: new Date().toISOString()
        }
      })
    });

    if (error) throw error
  } catch (error) {
    console.error('ジョブログ記録エラー:', error.message)
  }
}

export async function getJobLogs(jobId: string) {
  try {
    const { data, error } = await supabase.functions.invoke('log-operations', {
      body: JSON.stringify({
        action: 'getJobLogs',
        data: { jobId }
      })
    });

    if (error) throw error
    return data
  } catch (error: any) { // 修正
    console.error('ジョブログ取得エラー:', error.message)
    return []
  }
}

export async function getTaskLogs(taskId: string) {
  try {
    const { data, error } = await supabase.functions.invoke('log-operations', {
      body: JSON.stringify({
        action: 'getTaskLogs',
        data: { taskId }
      })
    });

    if (error) throw error
    return data
  } catch (error: any) { // 修正
    console.error('タスクログ取得エラー:', error.message)
    return []
  }
}

export async function getErrorLogs(jobId: string) {
  try {
    const { data, error } = await supabase.functions.invoke('log-operations', {
      body: JSON.stringify({
        action: 'getErrorLogs',
        data: { jobId }
      })
    });

    if (error) throw error
    return data
  } catch (error: any) { // 修正
    console.error('エラーログ取得エラー:', error.message)
    return []
  }
}

export async function rotateJobLogs(retentionDays: number) {
  try {
    const { data, error } = await supabase.functions.invoke('log-operations', {
      body: JSON.stringify({
        action: 'rotateJobLogs',
        data: { retentionDays }
      })
    });

    if (error) throw error
    return data
  } catch (error: any) { // 修正
    console.error('ログローテーションエラー:', error.message)
    return 0
  }
}