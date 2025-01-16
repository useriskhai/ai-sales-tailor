// 新しいメトリクス関連の型定義
export interface PerformanceMetrics {
  successRate: number;
  averageTime: number;
  responseRate: number;
  conversionRate: number;
  meetingRate: number;
  averageResponseTime: number;
  industryPerformance: {
    [industry: string]: {
      successRate: number;
      responseRate: number;
      sampleSize: number;
    };
  };
}

export interface MetricResult {
  current: number;
  target: number;
  trend: number;
  lastUpdated?: string;
}

export interface MetricsAnalysis {
  period: string;
  startDate: string;
  endDate: string;
  metrics: PerformanceMetrics;
  insights: {
    type: 'success' | 'warning' | 'improvement';
    message: string;
    metric: string;
    impact: number;
  }[];
}

export interface MetricsData {
  jobId: string;
  templateId: string;
  timestamp: string;
  metrics: {
    successRate: number;
    responseRate: number;
    errorRate: number;
    averageProcessingTime: number;
    completedTasks: number;
    totalTasks: number;
    activeConnections: number;
    queuedTasks: number;
    qualityScore: number;
  };
}

export interface Alert {
  type: 'error_rate' | 'response_rate' | 'quality_score';
  severity: 'high' | 'medium' | 'low';
  message: string;
} 