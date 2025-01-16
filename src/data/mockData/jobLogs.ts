import { JobLog } from '@/types/batchJob';

export const mockJobLogs: JobLog[] = [
  {
    created_at: '2024-02-15T10:00:00Z',
    message: 'バッチジョブを開始しました',
    level: 'info',
    job_id: 'job-1'
  },
  {
    created_at: '2024-02-15T10:05:00Z',
    message: 'タスクの生成を開始します',
    level: 'info',
    job_id: 'job-1',
    task_id: 'task-1'
  },
  {
    created_at: '2024-02-15T10:10:00Z',
    message: 'フォーム送信に失敗しました',
    level: 'error',
    job_id: 'job-1',
    task_id: 'task-2'
  }
]; 