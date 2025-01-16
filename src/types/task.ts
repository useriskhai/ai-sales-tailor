import { TaskStatus, TaskSubStatus, TaskDetailedStatus } from './batchJob';

export interface Task {
  id: string;
  batch_job_id: string;
  company_id: string;
  company_name: string;
  status: TaskStatus;
  main_status: TaskStatus;
  sub_status?: TaskSubStatus;
  detailed_status?: TaskDetailedStatus;
  error_message?: string;
  error?: string;
  content?: string;
  title?: string;
  send_method?: 'dm' | 'form';
  completed_at?: string;
  retry_count: number;
  last_retry?: string;
  created_at: string;
  updated_at: string;
  metrics?: {
    quality?: number;
    relevance?: number;
    risk?: 'low' | 'medium' | 'high';
  };
  review_status?: {
    reviewer: string;
    reviewed_at: string;
    status: 'approved' | 'needs_revision';
    notes?: string;
  };
}

export interface GenerationTask {
  id: string;
  batch_job_id?: string;
  company: {
    id?: string;
    name: string;
  };
  status: 'pending' | 'generating' | 'reviewing' | 'approved' | 'rejected';
  content?: string;
  quality_score?: number;
  metrics?: {
    quality?: number;
    relevance?: number;
    risk?: 'low' | 'medium' | 'high';
  };
  review_status?: {
    reviewer: string;
    reviewed_at: string;
    status: 'approved' | 'needs_revision';
    notes?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface GenerationProgress {
  total_tasks: number;
  completed_tasks: number;
  current_phase: 'preparation' | 'generation' | 'review' | 'sending';
  tasks: GenerationTask[];
}

export interface FailedTask {
  id: string;
  task_id: string;
  job_id: string;
  company_name: string;
  error_message: string;
  failure_reason: string;
  failure_code?: string;
  failed_at: string;
  retry_count: number;
  last_retry: string;
  last_status: TaskStatus;
  last_detailed_status: TaskDetailedStatus;
  retry_history: Array<{
    timestamp: string;
    method: 'dm' | 'form';
    success: boolean;
  }>;
}

export type { TaskStatus, TaskSubStatus, TaskDetailedStatus };
