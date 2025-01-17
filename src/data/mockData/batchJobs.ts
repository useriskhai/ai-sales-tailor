import { 
  BatchJob, 
  JOB_STATUS, 
  TASK_STATUS, 
  TaskDetailedStatus 
} from '@/types/batchJob';
import { SYSTEM_METRICS, CUSTOM_KPI_UNITS } from '@/types/template';

export const mockBatchJobs: BatchJob[] = [
  {
    id: 'batch-1',
    name: 'IT企業向け新規開拓キャンペーン #1',
    template_id: 'template-1',
    template_name: 'IT企業向け新規開拓テンプレート',
    status: JOB_STATUS.COMPLETED,
    created_at: '2024-03-01T10:00:00Z',
    completed_at: '2024-03-01T11:30:00Z',
    total_tasks: 100,
    completed_tasks: 100,
    product_id: 'product-1',
    sending_group_id: 'group-1',
    preferred_method: 'FORM',
    user_id: 'user-1',
    parallel_tasks: 10,
    retry_attempts: 3,
    updated_at: '2024-03-01T11:30:00Z',
    sending_group: {
      id: 'group-1',
      name: 'IT企業グループA',
      description: '首都圏のIT企業（従業員100名以上）',
      total_contacts: 100,
      tags: ['IT', '首都圏', '中堅企業'],
      created_at: '2024-02-28T00:00:00Z',
      last_used_at: '2024-03-01T11:30:00Z'
    },
    kpiConfig: {
      system: {
        targets: [
          {
            type: 'system',
            metric: SYSTEM_METRICS.FORM_LINK_CLICK,
            target: 100,
            weight: 0.6,
            minimumThreshold: 50,
            maximumThreshold: 200
          },
          {
            type: 'system',
            metric: SYSTEM_METRICS.FORM_LINK_CLICK_RATE,
            target: 0.15,
            weight: 0.4,
            minimumThreshold: 0.05,
            maximumThreshold: 0.3
          }
        ]
      },
      custom: {
        targets: [
          {
            type: 'custom',
            id: 'meeting_count',
            name: '商談獲得数',
            description: '月間の新規商談獲得数',
            unit: CUSTOM_KPI_UNITS.NUMBER,
            target: 100,
            weight: 0.3,
            minimumThreshold: 30,
            maximumThreshold: 150,
            trackingMethod: 'manual'
          },
          {
            type: 'custom',
            id: 'conversion_rate',
            name: '商談成約率',
            description: '商談から成約に至った割合',
            unit: CUSTOM_KPI_UNITS.PERCENTAGE,
            target: 0.20,
            weight: 0.3,
            minimumThreshold: 0.15,
            maximumThreshold: 0.30,
            trackingMethod: 'manual'
          }
        ]
      }
    },
    kpiResults: {
      systemResults: {
        form_link_click: {
          current: 85,
          target: 100,
          trend: 0.1,
          kpiId: '',
          type: 'system',
          value: 0,
          targetValue: 0,
          achievement: 0,
          sampleSize: 0,
          lastUpdated: '',
          dataSource: 'system'
        },
        form_link_click_rate: {
          current: 0.085,
          target: 0.15,
          trend: -0.05,
          kpiId: '',
          type: 'system',
          value: 0,
          targetValue: 0,
          achievement: 0,
          sampleSize: 0,
          lastUpdated: '',
          dataSource: 'system'
        }
      },
      customResults: {
        meeting_count: {
          current: 45,
          target: 100,
          trend: 0.5,
          kpiId: '',
          type: 'custom',
          value: 0,
          targetValue: 0,
          achievement: 0,
          sampleSize: 0,
          lastUpdated: '',
          dataSource: 'manual'
        },
        conversion_rate: {
          current: 0.17,
          target: 0.20,
          trend: 0.13,
          kpiId: '',
          type: 'custom',
          value: 0,
          targetValue: 0,
          achievement: 0,
          sampleSize: 0,
          lastUpdated: '',
          dataSource: 'manual'
        }
      }
    },
    metrics: {
      response_rate: 0.35,
      conversion_rate: 0.12,
      success_rate: 0.98,
      average_processing_time: 2.5,
      target_processing_time: 3.0,
      concurrent_tasks: 10,
      max_concurrent_tasks: 20,
      industryPerformance: {
        'IT': { response_rate: 0.38, conversion_rate: 0.15 },
        'Manufacturing': { response_rate: 0.32, conversion_rate: 0.10 },
        'Finance': { response_rate: 0.30, conversion_rate: 0.08 }
      }
    },
    events: [
      {
        timestamp: '2024-03-01T10:00:00Z',
        type: 'start',
        description: 'バッチジョブ開始'
      },
      {
        timestamp: '2024-03-01T11:30:00Z',
        type: 'complete',
        description: '全タスク完了'
      }
    ],
    insights: {
      key_findings: [
        {
          type: 'positive',
          title: '商談獲得数の改善傾向',
          description: '前月比で50%の改善が見られ、特に製造業セグメントで顕著な成果が出ています',
          metrics: [
            { label: '今月', value: '45件' },
            { label: '前月', value: '30件' },
            { label: '改善率', value: '+50%' }
          ]
        },
        {
          type: 'negative',
          title: 'フォームクリック率の低下',
          description: 'クリック率が目標値の56.7%に留まっており、改善の余地があります',
          metrics: [
            { label: '現在', value: '8.5%' },
            { label: '目標', value: '15%' },
            { label: '達成率', value: '56.7%' }
          ]
        },
        {
          type: 'neutral',
          title: '商談成約率は目標に近づいている',
          description: '成約率は17%で目標値の85%を達成。着実な改善が見られます',
          metrics: [
            { label: '現在', value: '17%' },
            { label: '目標', value: '20%' },
            { label: '達成率', value: '85%' }
          ]
        }
      ],
      performance_analysis: [
        {
          category: 'response_metrics',
          title: '反応率分析',
          details: [
            {
              metric: 'フォームクリック数',
              value: 85,
              target: 100,
              achievement_rate: 0.85,
              trend: '+10%',
              analysis: '目標達成率85%。製造業セグメントで特に高い反応'
            },
            {
              metric: 'クリック率',
              value: 0.085,
              target: 0.15,
              achievement_rate: 0.567,
              trend: '-5%',
              analysis: '目標を下回る傾向。コンテンツの訴求力強化が必要'
            }
          ]
        },
        {
          category: 'conversion_metrics',
          title: '商談創出分析',
          details: [
            {
              metric: '商談獲得数',
              value: 45,
              target: 100,
              achievement_rate: 0.45,
              trend: '+50%',
              analysis: '前月比で大幅改善。特に製造業での反応が良好'
            },
            {
              metric: '商談成約率',
              value: 0.17,
              target: 0.20,
              achievement_rate: 0.85,
              trend: '+13%',
              analysis: '目標達成率85%で順調な推移'
            }
          ]
        }
      ],
      industry_insights: [
        {
          industry: 'IT',
          performance: {
            response_rate: 0.38,
            conversion_rate: 0.15
          },
          analysis: '業界平均を上回る反応率。特にSaaS企業からの反応が良好'
        },
        {
          industry: 'Manufacturing',
          performance: {
            response_rate: 0.32,
            conversion_rate: 0.10
          },
          analysis: '前月比で反応率が向上。製造業向けの訴求が効果的'
        },
        {
          industry: 'Finance',
          performance: {
            response_rate: 0.30,
            conversion_rate: 0.08
          },
          analysis: '反応率は平均的だが、商談化率に改善の余地あり'
        }
      ]
    },
    ai_analysis: {
      quality_score: 85,
      efficiency_score: 78,
      optimization_score: 82,
      key_findings: [
        {
          type: 'success',
          title: 'コンテンツ品質の向上',
          description: '前回比で品質スコアが15%向上しています',
          metrics: [
            { label: '現在', value: '85/100' },
            { label: '前回', value: '70/100' }
          ]
        },
        {
          type: 'warning',
          title: '送信時間の最適化が必要',
          description: '現在の送信時間帯での反応率が低下傾向にありす',
          metrics: [
            { label: '朝の反応率', value: '35%' },
            { label: '夕方の反応率', value: '22%' }
          ]
        }
      ],
      improvement_opportunities: [
        {
          title: '送信時間の最適化',
          description: '朝9-11時の時間帯での送信に変更することで、反応率の向上が期待できます',
          expected_improvement: 15,
          impact_scope: '全体の40%のタスク',
          implementation_difficulty: '低'
        },
        {
          title: 'セグメント別テンプレート',
          description: '業界別にテンプレートを最適化することで、より高い反応が期待できます',
          expected_improvement: 25,
          impact_scope: '全体の60%のタスク',
          implementation_difficulty: '中'
        }
      ],
      recommended_actions: [
        {
          category: 'template',
          title: '業界別キーワードの追加',
          description: '各業界の特徴的なキーワードを含めることで、関連性を向上させます',
          priority: '高'
        },
        {
          category: 'targeting',
          title: '送信時間の最適化',
          description: '反応率の高い時間帯への変更を推奨します',
          priority: '中'
        }
      ]
    },
    suggestions: {
      targeting: {
        expected_improvement: 20,
        recommendations: [
          {
            title: '業界別セグメント最適化',
            description: 'IT界と製造業で異なアプローチを採用することで、反応率の向上が期待できます',
            impact_score: 8,
            metrics: [
              { label: 'IT業界反応率', value: '38%' },
              { label: '製造業反応率', value: '32%' }
            ]
          },
          {
            title: '企業規模による最適化',
            description: '企業規模に応じたメッセージ内容の調整により、より高い共感を得られます',
            impact_score: 7,
            metrics: [
              { label: '大企業反応率', value: '35%' },
              { label: '中小企業反応率', value: '28%' }
            ]
          }
        ]
      },
      scheduling: {
        expected_improvement: 15,
        recommendations: [
          {
            title: '送信時間の最適化',
            description: '朝9-11時の時間帯での送信を推奨します',
            priority: '高',
            metrics: [
              { label: '朝の反応率', value: '35%' },
              { label: '夕方の反応率', value: '22%' }
            ]
          }
        ]
      },
      content: {
        expected_improvement: 25,
        recommendations: [
          {
            title: '業界特化キーワードの活用',
            description: '業界固有の課題や用語を活用することで、より高い共感を得られます',
            type: 'critical',
            examples: [
              {
                before: '業務効率化ソリューション',
                after: 'IT業界向け: クラウドベースの開発効率化ソリューション'
              }
            ]
          },
          {
            title: '数値データの活用強化',
            description: '具体的な数値やROIの提示により、説得力を向上させます',
            type: 'improvement',
            examples: [
              {
                before: '効率が向上します',
                after: '平均30%の工数削減を実現しています'
              }
            ]
          }
        ]
      },
      implementation_order: [
        {
          title: '送信時間の最適化',
          expected_improvement: 15,
          implementation_difficulty: '低'
        },
        {
          title: '業界別テンプレート作成',
          expected_improvement: 25,
          implementation_difficulty: '中'
        },
        {
          title: 'パーソナライゼーション強化',
          expected_improvement: 20,
          implementation_difficulty: '高'
        }
      ]
    },
    optimization_suggestions: [
      {
        title: 'テンプレート構成の改善',
        description: '課題提起から解決策の提示までの流れを最適化することで、より高い共感を得られます',
        expected_improvement: 20,
        metrics: [
          { label: '現在の反応率', value: '35%' },
          { label: '期待反応率', value: '42%' }
        ]
      },
      {
        title: 'パーソナライゼーション強化',
        description: '企業規模や業界に応じたメッセージのカスタマイズにより、より高い効果が期待できます',
        expected_improvement: 25,
        metrics: [
          { label: '現在の商談化率', value: '15%' },
          { label: '期待商談化率', value: '19%' }
        ]
      }
    ],
    optimization_priorities: [
      {
        title: '送信時間の最適化',
        level: '高',
        expected_impact: 15
      },
      {
        title: 'テンプレート改善',
        level: '中',
        expected_impact: 20
      }
    ]
  },
  {
    id: 'batch-2',
    name: '自治体向けソリューション提案 2024/3',
    template_id: 'template-2',
    template_name: '公共団体向けソリューション提案',
    status: JOB_STATUS.RUNNING,
    created_at: '2024-03-02T09:00:00Z',
    total_tasks: 50,
    completed_tasks: 30,
    product_id: 'product-2',
    sending_group_id: 'group-2',
    preferred_method: 'FORM',
    user_id: 'user-1',
    updated_at: '2024-03-02T09:00:00Z',
    failed_tasks: [
      {
        id: 'failed-1',
        task_id: 'task-1',
        job_id: 'batch-2',
        company_name: '○○市役所',
        error_message: 'フォーム送信に失敗しました',
        failure_reason: 'FORM_SUBMISSION_ERROR',
        failure_code: 'ERR_001',
        failed_at: '2024-03-02T10:00:00Z',
        retry_count: 2,
        last_retry: '2024-03-02T10:30:00Z',
        last_status: TASK_STATUS.ERROR,
        last_detailed_status: TaskDetailedStatus.FAILED_FORM_SUBMISSION,
        retry_history: [
          {
            timestamp: '2024-03-02T10:15:00Z',
            method: 'form',
            success: false
          },
          {
            timestamp: '2024-03-02T10:30:00Z',
            method: 'form',
            success: false
          }
        ]
      },
      {
        id: 'failed-2',
        task_id: 'task-2',
        job_id: 'batch-2',
        company_name: '△△市役所',
        error_message: 'DM送信に失敗しました',
        failure_reason: 'DM_SENDING_ERROR',
        failure_code: 'ERR_002',
        failed_at: '2024-03-02T11:00:00Z',
        retry_count: 1,
        last_retry: '2024-03-02T11:15:00Z',
        last_status: TASK_STATUS.ERROR,
        last_detailed_status: TaskDetailedStatus.FAILED_DM_SENDING,
        retry_history: [
          {
            timestamp: '2024-03-02T11:15:00Z',
            method: 'dm',
            success: false
          }
        ]
      }
    ],
    sending_group: {
      id: 'group-2',
      name: '地方自治体グループ',
      description: '人口10万人以上の地方自治体',
      total_contacts: 50,
      tags: ['公共団体', '地方自治体', '人口10万以上'],
      created_at: '2024-02-25T00:00:00Z',
      last_used_at: '2024-03-02T09:00:00Z'
    },
    metrics: {
      response_rate: 0.28,
      conversion_rate: 0.08,
      success_rate: 0.95,
      average_processing_time: 3.2,
      target_processing_time: 3.0,
      concurrent_tasks: 5,
      max_concurrent_tasks: 10,
      industryPerformance: {
        'Government': { response_rate: 0.25, conversion_rate: 0.07 },
        'Education': { response_rate: 0.30, conversion_rate: 0.09 }
      }
    },
    events: [
      {
        timestamp: '2024-03-02T09:00:00Z',
        type: 'start',
        description: 'バッチジョブ開始'
      }
    ]
  },
  {
    id: 'batch-3',
    name: '関西IT企業向けキャンペーン #1',
    template_id: 'template-1',
    template_name: 'IT企業向け新規開拓テンプレート',
    status: JOB_STATUS.SCHEDULED,
    created_at: '2024-03-03T00:00:00Z',
    scheduled_at: '2024-03-04T10:00:00Z',
    total_tasks: 75,
    completed_tasks: 0,
    product_id: 'product-1',
    sending_group_id: 'group-3',
    preferred_method: 'FORM',
    user_id: 'user-1',
    updated_at: '2024-03-03T00:00:00Z',
    failed_tasks: [],
    sending_group: {
      id: 'group-3',
      name: 'IT企業グループB',
      description: '関西圏のIT企業（従業員50名以上）',
      total_contacts: 75,
      tags: ['IT', '関西圏', '中小企業'],
      created_at: '2024-03-01T00:00:00Z',
      last_used_at: null
    },
    metrics: {
      response_rate: 0,
      conversion_rate: 0,
      success_rate: 0,
      average_processing_time: 0,
      target_processing_time: 3.0,
      concurrent_tasks: 0,
      max_concurrent_tasks: 15,
      industryPerformance: {}
    },
    events: [
      {
        timestamp: '2024-03-03T00:00:00Z',
        type: 'schedule',
        description: 'バッチジョブスケジュール設定'
      }
    ]
  }
]; 
