import { Template } from '@/types/template';

export const mockTemplates: Template[] = [
  {
    id: 'template-1',
    name: 'IT企業向け新規開拓テンプレート',
    description: 'IT企業向けの新規開拓用テンプレート。製品のROIを強調し、技術的な価値提案を行います。',
    category: 'new-client-acquisition',
    content: JSON.stringify({
      basicInfo: {
        description: 'IT企業向けの新規開拓用テンプレート。製品のROIを強調し、技術的な価値提案を行います。',
        tags: ['IT', 'ROI重視', '新規開拓'],
        target_industry: 'IT・情報通信',
      },
      strategy: {
        mode: 'ai_auto',
        strategy: 'benefit-first',
        toneOfVoice: 'professional',
        maxLength: 400,
        useEmoji: false,
        contentFocus: 'roi',
        customInstructions: '技術的な価値とROIを重視し、具体的な数値を含める。',
        messageTemplate: '{{company_name}}様\n\n貴社の{{pain_point}}に対して、弊社の{{product_name}}は{{benefit}}を提供します。\n\n具体的には、{{specific_value}}の効果が期待できます。',
      },
      execution: {
        execution_priority: 'balanced',
        parallel_tasks: 5,
        retry_attempts: 3,
        preferred_method: 'FORM',
      },
      kpi: {
        metrics: [
          {
            id: 'metric-1',
            name: '返信率',
            type: 'system',
            unit: '%',
            target: 30,
            weight: 1,
          },
          {
            id: 'metric-2',
            name: '商談化率',
            type: 'system',
            unit: '%',
            target: 10,
            weight: 1,
          },
        ],
        evaluationPeriod: 30,
      },
    }),
    settings: {
      kpi: {
        metrics: [
          {
            id: 'metric-1',
            name: '返信率',
            type: 'system',
            unit: '%',
            target: 30,
            weight: 1,
          },
          {
            id: 'metric-2',
            name: '商談化率',
            type: 'custom',
            unit: '%',
            target: 10,
            weight: 1,
          },
        ],
        overallTarget: {
          responseRate: 0.3,
          conversionRate: 0.1,
        },
        systemKpi: {
          deliveryRate: {
            target: 0,
            weight: 0
          },
          openRate: undefined,
          clickRate: {
            target: 0,
            weight: 0
          },
          responseRate: {
            target: 0,
            weight: 0
          }
        },
        customKpi: {
          metrics: []
        },
        evaluationPeriod: 0
      },
      parallelTasks: 5,
      retryAttempts: 3,
      maxDailyTasks: 100,
      errorThreshold: 0.1,
      pauseOnErrorRate: 0.2,
      preferredMethod: 'FORM',
      basicInfo: {
        name: '',
        category: '',
        description: undefined,
        tags: undefined,
        target_industry: undefined
      },
      strategy: {
        mode: 'ai_auto',
        strategy: 'benefit-first',
        toneOfVoice: 'professional',
        maxLength: 0,
        useEmoji: false,
        contentFocus: undefined,
        customInstructions: undefined,
        messageTemplate: undefined
      },
      execution: {
        execution_priority: 'balanced',
        preferred_method: undefined
      }
    },
    promptConfig: {
      strategy: 'benefit-first',
      toneOfVoice: 'professional',
      contentFocus: 'roi',
      maxLength: 400,
      customInstructions: `技術的な価値とROIを重視し、具体的な数値を含める。
      プロンプト設定:
      - トーン: プロフェッショナルかつ具体的
      - 文体: ですます調
      - 長さ: 300-400文字程度`,
      outputFormat: 'text',
    },
    metrics: {
      successRate: 0.85,
      responseRate: 0.4,
      conversionRate: 0.15,
      meetingRate: 0.08,
      errorRate: 0.02,
      qualityScore: 0.92,
      averageProcessingTime: 5.2,
      personalizationScore: 0.88,
      testHistory: [],
    },
    usage_count: 150,
    recommended: true,
    tags: ['IT', 'ROI重視', '新規開拓'],
    created_at: '2023-12-01T00:00:00Z',
    updated_at: '2023-12-15T00:00:00Z',
    user_id: 'user-1',
    template_settings: ''
  },
];
