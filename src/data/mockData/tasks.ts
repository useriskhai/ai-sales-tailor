import { Task, FailedTask } from '@/types/task';
import { TASK_STATUS, TaskDetailedStatus } from '@/types/batchJob';

// 失敗タスクのモックデータ
export const mockFailedTasks: FailedTask[] = [
  {
    id: 'failed-1',
    task_id: 'task-1',
    job_id: 'job-1',
    company_name: 'グローバルテクノロジー',
    error_message: 'DMの送信に失敗しました: Rate limit exceeded',
    failure_reason: 'RATE_LIMIT_ERROR',
    failure_code: 'ERR_001',
    failed_at: new Date(Date.now() - 45 * 60000).toISOString(),
    retry_count: 2,
    last_retry: new Date(Date.now() - 15 * 60000).toISOString(),
    last_status: TASK_STATUS.ERROR,
    last_detailed_status: TaskDetailedStatus.FAILED_DM_SENDING,
    retry_history: [
      { 
        timestamp: new Date(Date.now() - 45 * 60000).toISOString(), 
        method: 'dm', 
        success: false 
      },
      { 
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(), 
        method: 'form', 
        success: false 
      }
    ]
  },
  {
    id: 'failed-2',
    task_id: 'task-2',
    job_id: 'job-1',
    company_name: 'データアナリティクス',
    error_message: 'フォームの送信に失敗しました: Invalid form data',
    failure_reason: 'FORM_VALIDATION_ERROR',
    failure_code: 'ERR_002',
    failed_at: new Date(Date.now() - 30 * 60000).toISOString(),
    retry_count: 1,
    last_retry: new Date(Date.now() - 30 * 60000).toISOString(),
    last_status: TASK_STATUS.ERROR,
    last_detailed_status: TaskDetailedStatus.FAILED_FORM_SUBMISSION,
    retry_history: [
      { 
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(), 
        method: 'form', 
        success: false 
      }
    ]
  }
];

// タスクのモックデータ
export const mockTasks: Task[] = [
  {
    id: 'task-1',
    batch_job_id: 'batch-1',
    company_id: 'company-1',
    company_name: 'テック株式会社',
    status: TASK_STATUS.COMPLETED,
    main_status: TASK_STATUS.COMPLETED,
    retry_count: 0,
    detailed_status: TaskDetailedStatus.COMPLETED_FORM_SUBMITTED,
    content: `テック株式会社様

貴社の業務効率化に向けた提案をさせていただきます。

弊社のAIソリューションは、以下の課題を解決いたします：

- システム運用コストの削減（平均40%減）
- 業務プロセスの自動化（工数70%削減）
- データ分析の効率化（処理時間85%短縮）

すでに200社以上の導入実績があり、平均して：

・初年度ROI 250%以上
・導入後3ヶ月で効果実現
・カスタマイズ不要で即導入可能

15分程度のオンラインデモンストレーションにてご説明させていただければ幸いです。`,
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-03-01T10:30:00Z',
    completed_at: '2024-03-01T10:30:00Z',
    metrics: {
      quality: 0.92,
      relevance: 0.85,
      risk: 'low'
    },
    review_status: {
      reviewer: '山田太郎',
      reviewed_at: '2024-03-01T10:15:00Z',
      status: 'approved',
      notes: '問題ありません。送信可能です。'
    }
  },
  {
    id: 'task-2',
    batch_job_id: 'batch-1',
    company_id: 'company-2',
    company_name: 'ITソリューションズ',
    status: TASK_STATUS.PROCESSING,
    main_status: TASK_STATUS.PROCESSING,
    retry_count: 0,
    detailed_status: TaskDetailedStatus.CONTENT_GENERATION,
    content: `ITソリューションズ様

貴社のデジタルトランスフォーメーション推進に向けて、ご提案させていただきます。

弊社のクラウドプラットフォームは、以下の価値を提供いたします：

- インフラコストの最適化（平均35%削減）
- セキュリティ強化（インシデント90%減）
- 運用効率の向上（管理工数60%減）

導入企業150社以上の実績から：

・投資回収期間6ヶ月
・顧客満足度95%
・24時間365日のサポート体制

具体的な導入事例を交え、詳しくご説明させていただければ幸いです。`,
    created_at: '2024-03-01T10:05:00Z',
    updated_at: '2024-03-01T10:35:00Z',
    metrics: {
      quality: 0.88,
      relevance: 0.82,
      risk: 'low'
    }
  },
  {
    id: 'task-3',
    batch_job_id: 'batch-1',
    company_id: 'company-3',
    company_name: 'デジタルイノベーション',
    status: TASK_STATUS.WAITING,
    main_status: TASK_STATUS.WAITING,
    retry_count: 0,
    detailed_status: TaskDetailedStatus.INITIAL,
    created_at: '2024-03-01T10:10:00Z',
    updated_at: '2024-03-01T10:10:00Z'
  }
]; 