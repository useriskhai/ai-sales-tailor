import { JOB_STATUS } from '@/types/batchJob';

export const mockJobDetails = {
  // レター生成関連のデータ
  generation: {
    status: {
      completed: 45,
      processing: 3,
      pending: 52,
      errors: 0,
      progress: 45
    },
    samples: [
      {
        id: 'sample-1',
        company_name: 'テック株式会社',
        content: '貴社の業務効率化にお役立てください...',
        quality_score: 0.85,
        risk_level: 'low'
      },
      {
        id: 'sample-2',
        company_name: 'ITソリューションズ',
        content: 'デジタル化推進のご提案...',
        quality_score: 0.92,
        risk_level: 'low'
      }
    ]
  },

  // 内容確認関連のデータ
  review: {
    reviewed_count: 30,
    pending_review: 15,
    flagged_for_review: 5,
    items: [
      {
        id: 'review-1',
        company_name: 'テック株式会社',
        content: '貴社の業務効率化にお役立てください...',
        status: JOB_STATUS.COMPLETED,
        review_date: '2024-02-15T10:15:00Z',
        reviewer: '山田太郎'
      },
      {
        id: 'review-2',
        company_name: 'ITソリューションズ',
        content: 'デジタル化推進のご提案...',
        status: 'needs_revision',
        review_date: '2024-02-15T10:30:00Z',
        reviewer: '山田太郎',
        revision_notes: '具体的な数値を追加'
      }
    ]
  },

  // 進行状況関連のデータ
  progress: {
    phase: 2, // 0: 準備, 1: 生成, 2: 確認, 3: 送信
    timeline: [
      {
        timestamp: '2024-02-15T10:00:00Z',
        event: 'ジョブ開始',
        type: 'info'
      },
      {
        timestamp: '2024-02-15T10:05:00Z',
        event: 'レター生成開始',
        type: 'info'
      },
      {
        timestamp: '2024-02-15T10:15:00Z',
        event: 'API rate limitに到達',
        type: 'warning'
      }
    ],
    metrics: {
      generation_completed: 45,
      review_completed: 30,
      sent_completed: 15,
      total: 100
    },
    recent_activities: [
      {
        id: 'activity-1',
        type: 'generation',
        status: 'completed',
        company: 'テック株式会社',
        timestamp: '2024-02-15T10:10:00Z'
      },
      {
        id: 'activity-2',
        type: 'review',
        status: 'pending',
        company: 'ITソリューションズ',
        timestamp: '2024-02-15T10:12:00Z'
      }
    ]
  },

  // 実績分析関連のデータ
  analysis: {
    performance: {
      response_rate: 0.35,
      conversion_rate: 0.15,
      average_time: 45,
      quality_score: 0.85
    },
    trends: [
      {
        date: '2024-02-15',
        response_rate: 0.35,
        conversion_rate: 0.15,
        quality_score: 0.85
      },
      {
        date: '2024-02-14',
        response_rate: 0.32,
        conversion_rate: 0.12,
        quality_score: 0.83
      }
    ],
    industry_comparison: {
      response_rate: {
        current: 0.35,
        industry_avg: 0.30,
        top_quartile: 0.40
      },
      conversion_rate: {
        current: 0.15,
        industry_avg: 0.12,
        top_quartile: 0.18
      }
    }
  },

  // 改善提案関連のデータ
  optimization: {
    suggestions: [
      {
        id: 'suggestion-1',
        type: 'content',
        title: '製品価値の強調',
        description: 'ROIに関する具体的な数値を追加することで、説得力が向上する可能性があります',
        expected_improvement: 0.15,
        priority: 'high'
      },
      {
        id: 'suggestion-2',
        type: 'timing',
        title: '送信時間の最適化',
        description: '火曜日の午前中の反応率が最も高くなっています',
        expected_improvement: 0.08,
        priority: 'medium'
      }
    ],
    historical_improvements: [
      {
        date: '2024-02-14',
        suggestion_id: 'suggestion-1',
        actual_improvement: 0.12
      }
    ],
    automated_tests: [
      {
        id: 'test-1',
        variant: 'A',
        response_rate: 0.35,
        sample_size: 50
      },
      {
        id: 'test-2',
        variant: 'B',
        response_rate: 0.38,
        sample_size: 50
      }
    ]
  }
}; 