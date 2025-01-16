import { DeliveryQueueItem } from '@/types/delivery';

export const mockDeliveryQueue: DeliveryQueueItem[] = [
  {
    id: 'queue-1',
    task_id: 'task-1',
    status: 'processing',
    company: {
      id: 'company-1',
      name: 'テクノロジー株式会社'
    },
    delivery_method: 'dm',
    created_at: '2024/12/3 11:57:54',
    updated_at: '2024/12/3 11:57:54',
    scheduled_time: '2024/12/3 11:57:54',
    retry_count: 0,
    status_message: 'DM送信の準備中...'
  },
  {
    id: 'queue-2',
    task_id: 'task-2',
    status: 'pending',
    company: {
      id: 'company-2',
      name: 'イノベーション株式会社'
    },
    delivery_method: 'form',
    created_at: '2024/12/3 11:57:54',
    updated_at: '2024/12/3 11:57:54',
    scheduled_time: '2024/12/3 11:57:54',
    retry_count: 0,
    status_message: '送信待機中'
  },
  {
    id: 'queue-3',
    task_id: 'task-3',
    status: 'pending',
    company: {
      id: 'company-3',
      name: 'フューチャー株式会社'
    },
    delivery_method: 'form',
    created_at: '2024/12/3 11:57:54',
    updated_at: '2024/12/3 11:57:54',
    scheduled_time: '2024/12/3 11:57:54',
    retry_count: 0,
    status_message: '送信待機中'
  },
  {
    id: 'queue-4',
    task_id: 'task-4',
    status: 'sent',
    company: {
      id: 'company-4',
      name: 'フジタルソリューションズ'
    },
    delivery_method: 'form',
    created_at: '2024/12/3 11:27:54',
    updated_at: '2024/12/3 11:27:54',
    scheduled_time: '2024/12/3 11:27:54',
    completed_at: '2024/12/3 11:27:54',
    retry_count: 0,
    status_message: '送信完了'
  },
  {
    id: 'queue-5',
    task_id: 'task-5',
    status: 'failed',
    company: {
      id: 'company-5',
      name: 'データアナリティクス'
    },
    delivery_method: 'form',
    created_at: '2024/12/3 11:27:54',
    updated_at: '2024/12/3 11:27:54',
    scheduled_time: '2024/12/3 11:27:54',
    retry_count: 1,
    error_message: 'FORM_VALIDATION_ERROR',
    status_message: '送信失敗',
    retry_history: [
      {
        timestamp: '2024/12/3 11:27:54',
        method: 'form',
        success: false
      }
    ]
  }
]; 