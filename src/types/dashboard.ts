import { BatchJob, BatchJobMetrics, JobStatus } from './batchJob';
import { PerformanceMetrics, BatchJobAnalytics, TemplateAnalysis } from './analytics';

export interface KPIStats {
  conversionRate: number;
  conversionRateDiff: number;
  responseRate: number;
  responseRateDiff: number;
  roi: number;
  roiDiff: number;
  lastJobId: string;
}

export interface BatchJobSummary {
  jobId: string;
  name: string;
  status: JobStatus;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  metrics: {
    averageResponseTime: number;
    errorCount: number;
    responseRate?: number;
  };
  analytics?: {
    insights: Array<{
      type: 'positive' | 'negative' | 'neutral';
      title: string;
      description: string;
    }>;
  };
}

export interface JobResult {
  jobId: string;
  name: string;
  successRate: number;
  responseRateChange: number;
  targetIndustry?: string;
  completedAt: string;
  insights: Array<{
    type: 'positive' | 'negative' | 'neutral';
    title: string;
    description: string;
  }>;
}

export interface TemplateImprovement {
  templateId: string;
  templateName: string;
  suggestion: string;
  expectedImprovement: string;
  timing?: string;
  actionUrl: string;
}

export interface NextAction {
  type: 'template_edit' | 'new_batch_job' | 'apply_suggestion';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionUrl: string;
  expectedImpact?: string;
}

export interface DashboardData {
  kpi: KPIStats;
  currentJob: BatchJobSummary | null;
  recentResults: JobResult[];
  improvements: TemplateImprovement[];
  nextActions: NextAction[];
  lastUpdated: string;
} 