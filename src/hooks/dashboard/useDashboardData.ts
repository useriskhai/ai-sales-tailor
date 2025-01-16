import { useState, useEffect } from 'react';
import { DashboardData } from '@/types/dashboard';

interface UseDashboardDataReturn {
  data: DashboardData;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useDashboardData = (): UseDashboardDataReturn => {
  const [data, setData] = useState<DashboardData>({
    kpi: {
      conversionRate: 12.5,
      conversionRateDiff: 1.5,
      responseRate: 30,
      responseRateDiff: -2,
      roi: 1.8,
      roiDiff: 0.3,
      lastJobId: 'job-123',
    },
    currentJob: {
      jobId: 'job-124',
      name: 'バッチジョブ #124',
      status: 'running',
      progress: {
        completed: 45,
        total: 100,
        percentage: 45,
      },
      metrics: {
        averageResponseTime: 2.4,
        errorCount: 2,
        responseRate: 0.32,
      },
      analytics: {
        insights: [
          {
            type: 'positive',
            title: '反応率が向上傾向',
            description: '前回比+3%の改善が見られます',
          },
          {
            type: 'negative',
            title: 'エラー率が上昇',
            description: '要対応',
          },
        ],
      },
    },
    recentResults: [
      {
        jobId: 'job-123',
        name: 'バッチジョブ #123',
        successRate: 80,
        responseRateChange: 3,
        targetIndustry: 'IT業界',
        completedAt: '2024-03-10T10:00:00Z',
        insights: [
          {
            type: 'positive',
            title: '特定業界への刺さり度UP',
            description: 'IT業界向けの反応率が改善',
          },
        ],
      },
    ],
    improvements: [
      {
        templateId: 'template-a',
        templateName: 'テンプレートA',
        suggestion: '件名を短くする',
        expectedImprovement: '+5%',
        timing: '朝10時前に送信',
        actionUrl: '/templates/template-a/edit',
      },
    ],
    nextActions: [
      {
        type: 'template_edit',
        title: 'テンプレートAの改善',
        description: '件名を短くして反応率を改善',
        priority: 'high',
        actionUrl: '/templates/template-a/edit',
        expectedImpact: '+5%',
      },
      {
        type: 'new_batch_job',
        title: '新しいバッチジョブの作成',
        description: '改善したテンプレートで新しいジョブを開始',
        priority: 'medium',
        actionUrl: '/batch-jobs/create',
        expectedImpact: undefined,
      },
    ],
    lastUpdated: new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboardData = async () => {
    // 実際のAPIコールはここに実装
    // 現在はモックデータを返すだけ
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchDashboardData,
  };
}; 