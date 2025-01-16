import { BatchJobAnalytics } from '@/types/analytics';

export const mockAnalytics: BatchJobAnalytics = {
  performanceMetrics: {
    responseRate: 0.35,
    conversionRate: 0.15,
    averageTime: 2.5,
    qualityScore: 0.85
  },

  // 以下は型定義外のため削除または別の変数として定義
  // systemKPIs: { ... },
  // customKPIs: { ... },
  // insights: { ... },
  // trends: { ... },
  // performance: { ... }
};

// 追加のメトリクスデータは別の変数として定義
export const mockDetailedAnalytics = {
  systemKPIs: {
    response_rate: 0.35,
    conversion_rate: 0.15,
    success_rate: 0.92,
    average_processing_time: 2.5,
    target_processing_time: 3.0,
    concurrent_tasks: 8,
    max_concurrent_tasks: 10,
    targets: {
      daily_responses: {
        name: '1日あたりの応答数',
        current_value: 85,
        target_value: 100,
        achieved: false
      },
      success_rate: {
        name: '成功率',
        current_value: 92,
        target_value: 95,
        achieved: false
      }
    }
  },

  customKPIs: {
    metrics: [
      {
        name: '商談設定率',
        value: '25%',
        trend: 5,
        status: 'good'
      },
      {
        name: '初期応答時間',
        value: '2.5時間',
        trend: -10,
        status: 'good'
      },
      {
        name: '商談化率',
        value: '15%',
        trend: 3,
        status: 'warning'
      }
    ],
    targets: [
      {
        name: '月間商談数',
        current_value: 85,
        target_value: 100,
        achieved: false,
        description: '月間の商談設定目標'
      },
      {
        name: '応答品質スコア',
        current_value: 4.2,
        target_value: 4.5,
        achieved: false,
        description: '返信内容の品質評価（5段階）'
      }
    ],
    alerts: [
      {
        title: '商談設定率の改善',
        message: '先週比で25%向上しています',
        severity: 'low',
        recommendation: '現在の施策を継続してください'
      },
      {
        severity: 'medium',
        title: '応答時間の警告',
        message: '平均応答時間が目標を上回っています',
        recommendation: '自動応答の設定を見直すことを推奨します'
      }
    ]
  },

  insights: {
    key_findings: [
      {
        type: 'positive',
        title: '応答率の改善',
        description: '先週比で15%の向上が見られます',
        metrics: [
          { label: '現在', value: '35%' },
          { label: '先週', value: '20%' }
        ]
      },
      {
        type: 'negative',
        title: '応答時間の悪化',
        description: '平均応答時間が増加傾向にあります',
        metrics: [
          { label: '現在', value: '2.5時間' },
          { label: '目標', value: '2時間' }
        ]
      }
    ],
    recommendations: [
      {
        title: 'テンプレートの最適化',
        description: '開封率の高い文面パターンの活用を推奨',
        priority: '高',
        impact: '予想効果: 応答率+5%'
      },
      {
        title: '送信時間の調整',
        description: '午前中の送信でより高い反応が期待できます',
        priority: '中',
        impact: '予想効果: 開封率+3%'
      }
    ],
    alerts: [
      {
        severity: 'high',
        title: 'エラー率の上昇',
        message: '送信エラー率が基準値を超えています',
        action: 'システム設定の見直しを推奨'
      },
      {
        severity: 'medium',
        title: '応答率の低下',
        message: '特定の業種で応答率が低下しています',
        action: 'テンプレートの業種別最適化を検討'
      }
    ]
  },

  trends: {
    hourly: [
      { timestamp: '2024-03-01T00:00:00Z', response_rate: 0.32, conversion_rate: 0.12, success_rate: 0.95 },
      { timestamp: '2024-03-01T01:00:00Z', response_rate: 0.35, conversion_rate: 0.14, success_rate: 0.94 },
      { timestamp: '2024-03-01T02:00:00Z', response_rate: 0.38, conversion_rate: 0.15, success_rate: 0.93 },
      { timestamp: '2024-03-01T03:00:00Z', response_rate: 0.33, conversion_rate: 0.13, success_rate: 0.96 },
      { timestamp: '2024-03-01T04:00:00Z', response_rate: 0.36, conversion_rate: 0.16, success_rate: 0.92 }
    ],
    daily: [
      { date: '2024-02-25', response_rate: 0.31, conversion_rate: 0.11 },
      { date: '2024-02-26', response_rate: 0.33, conversion_rate: 0.12 },
      { date: '2024-02-27', response_rate: 0.35, conversion_rate: 0.14 },
      { date: '2024-02-28', response_rate: 0.34, conversion_rate: 0.13 },
      { date: '2024-02-29', response_rate: 0.36, conversion_rate: 0.15 }
    ]
  }
}; 