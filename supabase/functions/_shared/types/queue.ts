export type QueueStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface QueueItem {
  id: number;
  status: QueueStatus;
  retry_count: number;
  next_retry_at: Date | null;
  error_code?: string;
  error_message?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProcessMetrics {
  timestamp: Date;
  batch_size: number;
  success_count: number;
  failure_count: number;
  processing_time: number; // milliseconds
}

export interface ProcessLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
  metadata?: Record<string, unknown>;
}

export interface BatchProcessResult {
  success: boolean;
  item: QueueItem;
  result?: unknown;
  error?: Error;
} 