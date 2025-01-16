import { DeliveryQueueItem, SentLetter, ErrorLog } from '@/types/delivery';

// 送信キューのモックデータ
export const mockDeliveryQueue: DeliveryQueueItem[] = [
  {
    id: 'queue-1',
    task_id: 'task-1',
    status: 'processing',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    delivery_method: 'dm',
    retry_count: 0,
    company: {
      name: 'テクノロジー株式会社',
      id: 'company-1'
    },
    status_message: 'DM送信処理中...'
  },
  {
    id: 'queue-2',
    task_id: 'task-2',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    delivery_method: 'form',
    retry_count: 0,
    company: {
      name: 'イノベーション株式会社',
      id: 'company-2'
    },
    scheduled_time: new Date(Date.now() + 5 * 60000).toISOString()
  },
  {
    id: 'queue-3',
    task_id: 'task-3',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    delivery_method: 'form',
    retry_count: 0,
    company: {
      name: 'フューチャー株式会社',
      id: 'company-3'
    },
    scheduled_time: new Date(Date.now() + 10 * 60000).toISOString()
  }
];

// 送信済みレターのモックデータ
export const mockSentLetters: SentLetter[] = [
  {
    id: 'letter-1',
    task_id: 'task-4',
    sent_at: new Date(Date.now() - 30 * 60000).toISOString(),
    delivery_method: 'dm',
    status: 'replied',
    company_name: 'デジタルソリューションズ',
    subject: '業務効率化ソリューションのご提案',
    content: '御社の業務効率化に向けた提案をさせていただきます...',
    response: {
      received_at: new Date(Date.now() - 15 * 60000).toISOString(),
      message: 'ご提案ありがとうございます。詳細を確認させていただきたく...'
    }
  },
  {
    id: 'letter-2',
    task_id: 'task-5',
    sent_at: new Date(Date.now() - 60 * 60000).toISOString(),
    delivery_method: 'form',
    status: 'opened',
    company_name: 'クラウドテクノロジー',
    subject: 'クラウドサービスのご提案',
    content: 'クラウドインフラの最適化について...'
  },
  {
    id: 'letter-3',
    task_id: 'task-6',
    sent_at: new Date(Date.now() - 90 * 60000).toISOString(),
    delivery_method: 'form',
    status: 'delivered',
    company_name: 'スマートビジネス',
    subject: 'AI活用ソリューションのご提案',
    content: 'AI技術を活用した業務改善について...'
  }
];

// エラーログのモックデータ
export const mockErrorLogs: ErrorLog[] = [
  {
    id: 'error-1',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    type: 'DM送信エラー',
    severity: 'high',
    message: 'DMの送信に失敗しました',
    stackTrace: 'Error: Failed to send DM\n    at sendDM (dm-sender.ts:42)\n    at processTask (task-processor.ts:156)',
    status: 'new',
    job_id: 'job-1',
    created_at: new Date(Date.now() - 45 * 60000).toISOString()
  },
  {
    id: 'error-2',
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    type: 'API接続エラー',
    severity: 'medium',
    message: 'APIサーバーとの接続がタイムアウトしました',
    status: 'investigating',
    job_id: 'job-1',
    created_at: new Date(Date.now() - 120 * 60000).toISOString()
  }
]; 