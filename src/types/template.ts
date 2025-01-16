export enum SYSTEM_METRICS {
  FORM_LINK_CLICK = 'form_link_click',
  FORM_LINK_CLICK_RATE = 'form_link_click_rate'
}

export enum CUSTOM_KPI_UNITS {
  PERCENTAGE = 'percentage',
  NUMBER = 'number',
  CURRENCY = 'currency',
  TIME = 'time'
}

export interface SystemKPITarget {
  type: 'system';
  metric: SYSTEM_METRICS;
  target: number;
  weight: number;
  minimumThreshold: number;
  maximumThreshold: number;
}

export interface CustomKPITarget {
  type: 'custom';
  id: string;
  name: string;
  description: string;
  unit: CUSTOM_KPI_UNITS;
  target: number;
  weight: number;
  minimumThreshold: number;
  maximumThreshold: number;
  trackingMethod: 'manual' | 'automatic';
}

export interface KPISettings {
  systemKPIs: SystemKPITarget[];
  customKPIs: CustomKPITarget[];
  overallTarget: {
    responseRate: number;
    conversionRate: number;
  };
}

export interface TemplateSettings {
  basicInfo: {
    name: string;
    category: string;
    description?: string;
    tags?: string[];
    target_industry?: string;
  };
  strategy: {
    mode: 'ai_auto' | 'manual';
    strategy: Strategy;
    toneOfVoice: ToneOfVoice;
    maxLength: number;
    useEmoji: boolean;
    contentFocus?: ContentFocus;
    customInstructions?: string;
    messageTemplate?: string;
  };
  execution: {
    execution_priority: 'speed' | 'balanced' | 'quality';
    preferred_method?: 'FORM' | 'EMAIL' | 'HYBRID';
  };
  kpi: {
    systemKpi: {
      deliveryRate: {
        target: number;
        weight: number;
      };
      openRate?: {
        target: number;
        weight: number;
      };
      clickRate: {
        target: number;
        weight: number;
      };
      responseRate: {
        target: number;
        weight: number;
      };
    };
    customKpi: {
      find(arg0: (t: any) => boolean): unknown;
      metrics: Array<{
        id: string;
        name: string;
        target: number;
        weight: number;
        unit: string;
      }>;
    };
    evaluationPeriod: number;
  };
}

export interface CreateKPISettings extends Partial<KPISettings> {
  systemKPIs?: SystemKPITarget[];
  customKPIs?: CustomKPITarget[];
  overallTarget?: {
    responseRate: number;
    conversionRate: number;
  };
}

export interface CreateTemplateSettings {
  kpi?: CreateKPISettings;
  parallelTasks?: number;
  retryAttempts?: number;
  maxDailyTasks?: number;
  errorThreshold?: number;
  pauseOnErrorRate?: number;
  preferredMethod?: PreferredMethod;
}

export type Category = 'new-client-acquisition' | 'existing-client' | 'proposal' | 'follow-up' | 'event-announcement';

export const CATEGORY_LABELS: Record<Category, string> = {
  'new-client-acquisition': '新規開拓',
  'existing-client': '関係維持',
  'proposal': '商談促進',
  'follow-up': 'フォローアップ',
  'event-announcement': 'キャンペーン告知'
};

export type ModelType = 
  | "fast"
  | "balanced"
  | "precise";

export const MessageStrategyConfig = {
  strategy: {
    'benefit-first': 'メリット訴求型',
    'problem-solution': '課題解決型',
    'story-telling': 'ストーリー型',
    'direct-offer': '直接提案型'
  },
  tone: {
    'formal': 'フォーマル',
    'professional': 'ビジネス',
    'friendly': 'フレンドリー',
    'casual': 'カジュアル'
  },
  focus: {
    'benefit': '利点',
    'technical': '技術的詳細',
    'case-study': '事例',
    'roi': 'ROI',
    'relationship': '関係構築'
  }
} as const;

export type Strategy = keyof typeof MessageStrategyConfig.strategy;
export type ToneOfVoice = keyof typeof MessageStrategyConfig.tone;
export type ContentFocus = keyof typeof MessageStrategyConfig.focus;

export const isValidStrategy = (strategy: string): strategy is Strategy => {
  return strategy in MessageStrategyConfig.strategy;
};

export const isValidTone = (tone: string): tone is ToneOfVoice => {
  return tone in MessageStrategyConfig.tone;
};

export const isValidFocus = (focus: string): focus is ContentFocus => {
  return focus in MessageStrategyConfig.focus;
};

export type PreferredMethod = 'FORM' | 'EMAIL' | 'HYBRID';

export type AnalysisPeriod = '24h' | '7d' | '30d' | '90d';

export interface KPIResult {
  kpiId: string;
  type: 'system' | 'custom';
  value: number;
  targetValue: number;
  achievement: number;
  trend: number;
  sampleSize: number;
  lastUpdated: string;
  dataSource: 'system' | 'manual';
}

export interface KPIAnalysis {
  templateId: string;
  period: string;
  startDate: string;
  endDate: string;
  systemResults: {
    [key: string]: KPIResult;
  };
  customResults: {
    [key: string]: KPIResult;
  };
  overallScore: number;
  insights: Array<{
    type: 'success' | 'warning' | 'improvement';
    message: string;
    metric: string;
    impact: number;
  }>;
}

export interface TemplateMetrics {
  successRate: number;
  responseRate: number;
  conversionRate: number;
  meetingRate: number;
  errorRate: number;
  qualityScore: number;
  averageProcessingTime: number;
  personalizationScore: number;
  testHistory: Array<{
    testId: string;
    startDate: string;
    endDate: string;
    variants: Array<{
      variantId: string;
      metrics: Record<string, number>;
    }>;
  }>;
}

export interface PromptConfig {
  strategy: Strategy;
  toneOfVoice: ToneOfVoice;
  contentFocus: ContentFocus;
  maxLength: number;
  customInstructions?: string;
  outputFormat: string;
  industrySpecificRules?: string[];
}

export interface OptimizationRules {
  contentRules: {
    minLength: number;
    maxLength: number;
    requiredElements: string[];
    forbiddenElements: string[];
    forbiddenPhrases: string[];
    styleGuide: string[];
  };
  personalizationRules: {
    required: string[];
    optional: string[];
    format: string;
  };
  testingRules: {
    minSampleSize: number;
    significanceLevel: number;
    metrics: string[];
  };
  targetAudience: {
    industries: string[];
    companySize: string[];
    roles: string[];
    jobTitles: string[];
    painPoints: string[];
  };
  timingRules: {
    bestTimeToSend: string[];
    frequency: {
      min: number;
      max: number;
      unit: 'hour' | 'day' | 'week';
    };
    minimumInterval: number;
    blackoutPeriods: Array<{
      start: string;
      end: string;
      reason: string;
    }>;
  };
}

export interface PerformanceMetrics {
  responseRate: number;
  conversionRate: number;
  qualityScore: number;
  averageProcessingTime: number;
  errorRate: number;
  costPerConversion: number;
  roi: number;
  period: AnalysisPeriod;
  sampleSize: number;
  meetingRate: number;
  personalizationScore: number;
}

export interface TemplateAnalysis {
  templateId: string;
  period: string;
  startDate: string;
  endDate: string;
  metrics: {
    responseRate: number;
    conversionRate: number;
    qualityScore: number;
    averageProcessingTime: number;
    errorRate: number;
    costPerConversion: number;
    roi: number;
  };
  trends: {
    daily: Array<{
      date: string;
      metrics: Record<string, number>;
    }>;
    weekly: Array<{
      weekStart: string;
      metrics: Record<string, number>;
    }>;
  };
  insights: Array<{
    type: 'improvement' | 'warning' | 'success';
    metric: string;
    message: string;
    impact: number;
  }>;
  comparisonWithBaseline: {
    metric: string;
    change: number;
    significance: number;
  }[];
  sampleSize: number;
}

export interface TemplateMetric {
  id: string;
  name: string;
  type: 'system' | 'custom';
  unit: string;
  target: number;
  weight: number;
}

export interface TemplateContent {
  basicInfo?: {
    description?: string;
    tags?: string[];
    target_industry?: string;
  };
  strategy: {
    mode: 'ai_auto' | 'manual';
    strategy: Strategy;
    toneOfVoice: ToneOfVoice;
    maxLength: 300 | 400 | 500 | 600 | 800;
    useEmoji: boolean;
    contentFocus?: ContentFocus;
    customInstructions?: string;
    messageTemplate?: string;
  };
  execution: {
    execution_priority: ExecutionPriority;
    parallel_tasks?: number;
    retry_attempts?: number;
    preferred_method?: PreferredMethod;
  };
  kpi: {
    metrics: TemplateMetric[];
    evaluationPeriod: number;
  };
}

export interface Template {
  id: string;
  name: string;
  template_settings: string; // JSON string stored as settings
  category: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  recommended?: boolean;
  success_rate?: number;
  average_time?: number;
  usage_count?: number;
  average_response_rate?: number;
  is_public?: boolean;

  // Add the missing settings property here
  settings?: TemplateSettings; // Use TemplateSettings for a strongly-typed structure
}


export type ExecutionPriority = 'speed' | 'balanced' | 'quality';


