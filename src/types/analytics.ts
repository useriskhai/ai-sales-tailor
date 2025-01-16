export type AnalysisPeriod = '24h' | '7d' | '30d' | '90d';

export interface PerformanceMetrics {
  responseRate: number;
  conversionRate: number;
  meetingRate: number;
  errorRate: number;
  qualityScore: number;
  averageProcessingTime: number;
  personalizationScore: number;
}

export interface IndustryPerformance {
  industry: string;
  metrics: {
    responseRate: number;
    conversionRate: number;
    meetingRate: number;
  };
  significance: number;
}

import type { KPIResult } from './template';

export interface TemplateAnalysis {
  metrics: PerformanceMetrics;
  industryPerformance: IndustryPerformance[];
  period: AnalysisPeriod;
  kpiResults: KPIResult[];
  recommendations: {
    type: 'optimization' | 'alert' | 'insight';
    priority: 'high' | 'medium' | 'low';
    message: string;
    expectedImpact: number;
    suggestedActions: string[];
  }[];
}

export interface BatchJobAnalytics {
  performanceMetrics: {
    responseRate: number;
    conversionRate: number;
    averageTime: number;
    qualityScore: number;
  };
  systemKPIs?: {
    response_rate: number;
    conversion_rate: number;
    success_rate: number;
    average_processing_time: number;
    target_processing_time: number;
    concurrent_tasks: number;
    max_concurrent_tasks: number;
    targets: {
      daily_responses: {
        name: string;
        current_value: number;
        target_value: number;
        achieved: boolean;
      };
      success_rate: {
        name: string;
        current_value: number;
        target_value: number;
        achieved: boolean;
      };
    };
  };
  customKPIs?: {
    metrics: Array<{
      name: string;
      value: string;
      trend: number;
      status: string;
    }>;
    targets: Array<{
      name: string;
      current_value: number;
      target_value: number;
      achieved: boolean;
      description: string;
    }>;
    alerts: Array<{
      title: string;
      message: string;
      severity: string;
      recommendation: string;
    }>;
  };
  insights?: {
    key_findings: Array<{
      type: string;
      title: string;
      description: string;
      metrics: Array<{
        label: string;
        value: string;
      }>;
    }>;
    recommendations: Array<{
      title: string;
      description: string;
      priority: string;
      impact: string;
    }>;
    alerts: Array<{
      severity: string;
      title: string;
      message: string;
      action: string;
    }>;
  };
  trends?: {
    hourly: Array<{
      timestamp: string;
      response_rate: number;
      conversion_rate: number;
      success_rate: number;
    }>;
    daily: Array<{
      date: string;
      response_rate: number;
      conversion_rate: number;
    }>;
  };
}

export type MetricType = 
  | 'response_rate'
  | 'conversion_rate'
  | 'meeting_rate'
  | 'quality_score'
  | 'error_rate';

export interface TestAnalysisResult {
  testId: string;
  startDate: string;
  endDate: string;
  sampleSize: number;
  variants: Array<{
    id: string;
    promptConfig: {
      strategy: string;
      toneOfVoice: string;
      maxLength: number;
    };
    isWinner: boolean;
    improvement: number;
    confidence: number;
    metrics: {
      responseRate: number;
      conversionRate: number;
      qualityScore: number;
      sampleSize: number;
    };
  }>;
  statisticalSignificance: number;
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    action: string;
    reason: string;
    expectedImpact: {
      improvement: number;
    };
    implementation: {
      difficulty: string;
      timeToImpact: string;
    };
  }>;
}

export interface QualityAnalysis {
  issues: Array<{
    type: 'length' | 'structure' | 'content';
    severity: 'high' | 'medium' | 'low';
    suggestions: string[];
  }>;
  score: number;
  recommendations: string[];
}

export interface OptimizationSuggestion {
  targetConfig: {
    strategy?: string;
    toneOfVoice?: string;
    maxLength?: number;
    customInstructions?: string;
  };
  expectedImprovements: Array<{
    metric: string;
    improvement: number;
    confidence: number | 'high' | 'medium' | 'low';
  }>;
  reasoning: string[];
  similarSuccessfulTemplates?: string[];
}

export interface MetricsAnalysis {
  period: string;
  metrics: {
    responseRate: number;
    conversionRate: number;
    qualityScore: number;
    averageTime: number;
  };
  trends: Array<{
    date: string;
    metrics: {
      responseRate: number;
      conversionRate: number;
      qualityScore: number;
    };
  }>;
  insights: Array<{
    type: 'success' | 'warning' | 'improvement';
    message: string;
    metric: string;
    impact: number;
  }>;
}

export interface BatchJobAnalytics {
  performanceMetrics: {
    responseRate: number;
    conversionRate: number;
    averageTime: number;
    qualityScore: number;
  };
} 