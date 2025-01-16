import type { Strategy, ToneOfVoice } from './template';

export type TestStatus = 'draft' | 'running' | 'paused' | 'completed' | 'stopped';

export interface TestResult {
  variantId: string;
  metrics: {
    responseRate: number;
    conversionRate: number;
    meetingRate: number;
    averageResponseTime: number;
    errorRate: number;
    completionRate: number;
  };
  sampleSize: number;
  confidence: number;
}

export interface TestVariantResult {
  id: string;
  variantId: string;
  promptConfig: {
    strategy: Strategy;
    toneOfVoice: ToneOfVoice;
    maxLength: number;
  };
  isWinner: boolean;
  improvement: number;
  statisticalSignificance: number;
  metrics: {
    responseRate: number;
    conversionRate: number;
    qualityScore: number;
    sampleSize: number;
    meetingRate: number;
    averageResponseTime: number;
    errorRate: number;
    completionRate: number;
  };
  recommendations: Array<{
    action: string;
    reason: string;
    expectedImpact: {
      improvement: number;
    };
    implementation: {
      difficulty: string;
      timeToImpact: string;
    };
    priority: 'high' | 'medium' | 'low';
  }>;
}

export interface TemplateTest {
  id: string;
  templateId: string;
  name: string;
  description: string;
  status: TestStatus;
  
  // テスト設定
  config: {
    startDate: string;
    endDate?: string;
    targetSampleSize: number;
    minimumConfidence: number;
    stopConditions: {
      maxDuration: number;  // 日数
      minImprovementThreshold: number;
      errorRateThreshold: number;
    };
  };

  // コントロール群（現在のテンプレート）
  control: {
    id: string;
    promptConfig: import('./template').PromptConfig;
    results?: TestResult;
  };

  // テストバリエーション
  variants: {
    id: string;
    name: string;
    description: string;
    promptConfig: import('./template').PromptConfig;
    weight: number;
    results?: TestVariantResult;
  }[];

  // テスト進捗
  progress: {
    totalSamples: number;
    completedSamples: number;
    startedAt: string;
    lastUpdatedAt: string;
    estimatedCompletionDate?: string;
  };

  // 分析結果
  analysis?: {
    winner?: {
      variantId: string;
      improvement: number;
      confidence: number;
    };
    insights: {
      type: 'positive' | 'negative' | 'neutral';
      message: string;
      metric: string;
      significance: number;
    }[];
    recommendations: {
      action: string;
      reason: string;
      expectedImpact: number;
    }[];
  };

  // メタデータ
  metadata: {
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    tags: string[];
    notes?: string;
  };
}

export interface TestExecutionContext {
  testId: string;
  variantId: string;
  companyId: string;
  metrics: {
    startTime: string;
    completionTime?: string;
    responseTime?: string;
    hasResponse: boolean;
    hasConversion: boolean;
    hasMeeting: boolean;
    error?: string;
  };
}

export interface TestAnalysisResult {
  testId: string;
  startDate: string;
  endDate: string;
  sampleSize: number;
  variants: Array<TestVariantResult>;
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

export interface TestAnalysis {
  winner?: {
    variantId: string;
    improvement: number;
    confidence: number;
  };
  insights: {
    type: 'positive' | 'negative' | 'neutral';
    message: string;
    metric: string;
    significance: number;
  }[];
  recommendations: {
    action: string;
    reason: string;
    expectedImpact: number;
  }[];
}