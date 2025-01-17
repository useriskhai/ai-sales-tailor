import { SystemKPITarget, CustomKPITarget } from '@/types/template';
import { DeliveryQueueItem, SentLetter, ErrorLog } from './delivery';
import { FailedTask } from './task';
import { BatchJobAnalytics } from '@/types/analytics';
import { Template } from './template';
import { SendingGroup } from './sendingGroup';
import { Product } from './product';

export interface JobLog {
  created_at: string;
  message: string;
  level: 'info' | 'warning' | 'error';
  job_id: string;
  task_id?: string;
}

export const TASK_STATUS = {
  WAITING: 'waiting',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  ERROR: 'error',
  CANCELLED: 'cancelled'
} as const;

export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];

export enum TaskSubStatus {
  INITIAL = 'initial',
  CONTENT_GENERATION = 'content_generation',
  DM_PROCESS = 'dm_process',
  FORM_PROCESS = 'form_process'
}

export enum TaskDetailedStatus {
  INITIAL = 'initial',
  CONTENT_GENERATION = 'content_generation',
  CONTENT_GENERATED = 'content_generated',
  DM_CHECK = 'dm_check',
  DM_READY = 'dm_ready',
  DM_PREPARATION = 'dm_preparation',
  DM_SENDING = 'dm_sending',
  FORM_DETECTION = 'form_detection',
  FORM_DETECTED = 'form_detected',
  FORM_DATA_PREPARED = 'form_data_prepared',
  AUTO_FILL_READY = 'auto_fill_ready',
  SUBMISSION_IN_PROGRESS = 'submission_in_progress',
  COMPLETED_DM_SENT = 'completed_dm_sent',
  COMPLETED_FORM_SUBMITTED = 'completed_form_submitted',
  FAILED_CONTENT_GENERATION = 'failed_content_generation',
  FAILED_DM_SENDING = 'failed_dm_sending',
  FAILED_FORM_DETECTION = 'failed_form_detection',
  FAILED_FORM_SUBMISSION = 'failed_form_submission',
  FAILED_FALLBACK = 'failed_fallback',
  FALLBACK_TO_FORM = 'fallback_to_form',
  FALLBACK_TO_DM = 'fallback_to_dm',
  FALLBACK_INITIATED = 'fallback_initiated'
}

export type JobStatus = 
  | "completed" 
  | "failed"
  | "running"
  | "processing"
  | "paused"
  | "stopped"
  | "pending"
  | "draft"
  | "scheduled"
  | "error";

export const JOB_STATUS = {
  COMPLETED: "completed" as const,
  FAILED: "failed" as const,
  RUNNING: "running" as const,
  PROCESSING: "processing" as const,
  PAUSED: 'paused' as const,
  STOPPED: 'stopped' as const,
  DRAFT: 'draft' as const,
  SCHEDULED: 'scheduled' as const,
  PENDING: 'pending' as const,
  ERROR: 'error' as const,
} as const;

export const JOB_STATUS_GROUPS = {
  ACTIVE: [JOB_STATUS.RUNNING, JOB_STATUS.PAUSED] as const,
  RECENT: [JOB_STATUS.COMPLETED, JOB_STATUS.ERROR, JOB_STATUS.STOPPED] as const,
} as const;

export interface IndustryPerformanceMetrics {
  responseRate: number;
  conversionRate: number;
}

export interface BatchJobMetrics {
  responseRate: number;
  conversionRate: number;
  successRate: number;
  averageProcessingTime: number;
  targetProcessingTime: number;
  concurrentTasks: number;
  maxConcurrentTasks: number;
  industryPerformance?: Record<string, IndustryPerformanceMetrics>;
}

export interface RawIndustryPerformanceMetrics {
  response_rate: number;
  conversion_rate: number;
}

export interface RawBatchJobMetrics {
  response_rate?: number;
  conversion_rate?: number;
  success_rate?: number;
  average_processing_time?: number;
  target_processing_time?: number;
  concurrent_tasks?: number;
  max_concurrent_tasks?: number;
  industryPerformance?: Record<string, RawIndustryPerformanceMetrics>;
}

export const DEFAULT_METRICS: BatchJobMetrics = {
  responseRate: 0,
  conversionRate: 0,
  successRate: 0,
  averageProcessingTime: 0,
  targetProcessingTime: 0,
  concurrentTasks: 0,
  maxConcurrentTasks: 0,
};

export interface BatchJob {
  id: string;
  name?: string;
  status: JobStatus;
  product_id: string;
  sending_group_id: string;
  completed_tasks: number;
  total_tasks: number;
  preferred_method: string;
  user_id: string;
  parallel_tasks?: number;
  retry_attempts?: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  template_name?: string;
  template_id?: string;
  scheduled_at?: string;
  sending_group?: {
    id: string;
    name: string;
    description?: string;
    total_contacts?: number;
    tags?: string[];
    created_at?: string;
    last_used_at?: string | null;
  };
  metrics?: RawBatchJobMetrics;
  analytics?: BatchJobAnalytics;
  events?: Array<{
    timestamp: string;
    type: string;
    description: string;
  }>;
  delivery_queue?: DeliveryQueueItem[];
  sent_letters?: SentLetter[];
  error_logs?: ErrorLog[];
  failed_tasks?: FailedTask[];
  kpiConfig?: {
    system: {
      targets: SystemKPITarget[];
    };
    custom: {
      targets: CustomKPITarget[];
    };
  };
  kpiResults?: {
    systemResults: {
      [key: string]: {
        kpiId: string;
        current: number; 
        target: number;
        type: 'system';
        value: number;
        targetValue: number;
        achievement: number;
        trend: number;
        sampleSize: number;
        lastUpdated: string;
        dataSource: 'system';
      };
    };
    customResults: {
      [key: string]: {
        kpiId: string;
        current: number; 
        target: number;
        type: 'custom';
        value: number;
        targetValue: number;
        achievement: number;
        trend: number;
        sampleSize: number;
        lastUpdated: string;
        dataSource: 'manual';
      };
    };
  };
  insights?: {
    key_findings: Array<{
      type: 'positive' | 'negative' | 'neutral';
      title: string;
      description: string;
      metrics?: Array<{
        label: string;
        value: string;
      }>;
    }>;
    performance_analysis: Array<{
      category: string;
      title: string;
      details: Array<{
        metric: string;
        value: number;
        target: number;
        achievement_rate: number;
        trend: string;
        analysis: string;
      }>;
    }>;
    industry_insights: Array<{
      industry: string;
      performance: {
        response_rate: number;
        conversion_rate: number;
      };
      analysis: string;
    }>;
  };
  ai_analysis?: {
    quality_score: number;
    efficiency_score: number;
    optimization_score: number;
    key_findings: Array<{
      type: 'success' | 'warning' | 'info' | 'error';
      title: string;
      description: string;
      metrics?: Array<{
        label: string;
        value: string;
      }>;
    }>;
    improvement_opportunities: Array<{
      title: string;
      description: string;
      expected_improvement: number;
      impact_scope: string;
      implementation_difficulty: string;
    }>;
    recommended_actions: Array<{
      category: 'template' | 'targeting' | 'system';
      title: string;
      description: string;
      priority: string;
    }>;
  };
  suggestions?: {
    targeting: {
      expected_improvement: number;
      recommendations: Array<{
        title: string;
        description: string;
        impact_score: number;
        metrics?: Array<{
          label: string;
          value: string;
        }>;
      }>;
    };
    scheduling: {
      expected_improvement: number;
      recommendations: Array<{
        title: string;
        description: string;
        priority: string;
        metrics?: Array<{
          label: string;
          value: string;
        }>;
      }>;
    };
    content: {
      expected_improvement: number;
      recommendations: Array<{
        title: string;
        description: string;
        type: 'critical' | 'improvement';
        examples?: Array<{
          before: string;
          after: string;
        }>;
      }>;
    };
    implementation_order: Array<{
      title: string;
      expected_improvement: number;
      implementation_difficulty: string;
    }>;
  };
  optimization_suggestions?: Array<{
    title: string;
    description: string;
    expected_improvement: number;
    metrics: Array<{
      label: string;
      value: string;
    }>;
  }>;
  optimization_priorities?: Array<{
    title: string;
    level: string;
    expected_impact: number;
  }>;
  template_config?: {
    kpiConfig: {
      system: {
        targets: SystemKPITarget[];
      };
      custom: {
        targets: CustomKPITarget[];
      };
    };
    optimizationConfig: {
      industry_targeting?: {
        enabled: boolean;
        rules: Array<{
          industry: string;
          keywords: string[];
          emphasis_points: string[];
        }>;
      };
      personalization?: {
        enabled: boolean;
        variables: Array<{
          name: string;
          type: 'text' | 'number' | 'boolean';
          defaultValue: any;
        }>;
      };
      content_rules?: Array<{
        type: 'replacement' | 'addition' | 'removal';
        condition: string;
        action: string;
      }>;
    };
    execution_config: {
      preferred_method: 'FORM' | 'DM';
      retry_policy: {
        max_attempts: number;
        backoff_strategy: 'linear' | 'exponential';
        initial_delay: number;
      };
      error_handling: {
        threshold: number;
        action: 'stop' | 'notify' | 'continue';
      };
    };
  };
}

export interface BatchJobWithProcessedMetrics extends Omit<BatchJob, 'metrics'> {
  metrics?: BatchJobMetrics;
  analytics?: BatchJobAnalytics;
}

export interface JobHistoryResponse {
  data: BatchJob[];
  totalCount: number;
}

export interface BatchJobError {
  message: string;
  code?: string;
  details?: string;
}

export const isInStatusGroup = (status: JobStatus, group: readonly JobStatus[]) => {
  return group.includes(status as any);
};

export type Step = 'template' | 'group' | 'product' | 'settings' | 'preview';

export interface JobSettings {
  name: string;
  maxDailyTasks: number;
  parallelTasks: number;
  retryAttempts: number;
  errorThreshold: number;
  startDate?: Date;
  endDate?: Date;
  preferred_method?: 'FORM' | 'DM';
}

export interface JobConfig {
  template?: Template;
  sendingGroup?: SendingGroup;
  product?: Product;
  settings?: JobSettings;
}
