export interface DeliveryQueueItem {
  id: string;
  task_id: string;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  created_at: string;
  updated_at: string;
  sent_at?: string;
  scheduled_time?: string;
  error?: string;
  retry_count: number;
  delivery_method: 'dm' | 'form';
  company?: {
    name: string;
    id?: string;
  };
  status_message?: string;
  error_message?: string;
  completed_at?: string;
  retry_history?: Array<{
    timestamp: string;
    method: 'dm' | 'form';
    success: boolean;
  }>;
}

export interface SentLetter {
  id: string;
  task_id: string;
  sent_at: string;
  delivery_method: 'dm' | 'form';
  status: 'delivered' | 'failed' | 'opened' | 'replied';
  company_name: string;
  subject: string;
  content: string;
  metadata?: {
    recipient_id?: string;
    message_id?: string;
    platform?: string;
  };
  response?: {
    received_at: string;
    message: string;
  };
}

export interface ErrorLog {
  id: string;
  timestamp: string;
  type: string;
  severity: 'high' | 'medium' | 'low' | 'critical';
  message: string;
  status: 'new' | 'investigating' | 'resolved';
  stackTrace?: string;
  task_id?: string;
  job_id: string;
  error_code?: string;
  created_at: string;
  resolved?: boolean;
  resolved_at?: string;
  resolution_notes?: string;
}

// 送信レターの状態を定義する定数
export const SENT_LETTER_STATUS = {
  DELIVERED: 'delivered' as const,
  FAILED: 'failed' as const,
  OPENED: 'opened' as const,
  REPLIED: 'replied' as const,
} as const;

// 型の安全性を確保するためのユーティリティ型
export type SentLetterStatus = typeof SENT_LETTER_STATUS[keyof typeof SENT_LETTER_STATUS]; 