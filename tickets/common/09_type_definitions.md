# 型定義の整備

## 概要
バックエンド機能全体で使用される型定義を整備し、型安全性とコードの品質を向上させます。

## 現状
- 基本的な型定義は実装済み
- 新機能に対応する型が不足
- 型定義の一貫性が不十分

## タスク

### 1. 通知関連の型定義追加
- 通知関連の型定義
  - 通知タイプの定義
  - 通知設定の型定義
  - 通知ステータスの型定義
- 通知APIのリクエスト/レスポンス型

### 2. メトリクス関連の型定義追加
- メトリクス関連の型定義
  - メトリクスカテゴリの定義
  - 集計関数の型定義
  - フィルタ条件の型定義
- メトリクスAPIのリクエスト/レスポンス型

### 3. 既存型定義の整理と最適化
- 共通型の抽出
- 型の命名規則の統一
- 不要な型の削除
- ドキュメントの追加

## 技術仕様

### 通知関連の型定義
```typescript
// 通知タイプ
enum NotificationType {
  JOB_COMPLETED = 'job_completed',
  JOB_FAILED = 'job_failed',
  SYSTEM_ALERT = 'system_alert',
  TASK_COMPLETED = 'task_completed',
  TASK_FAILED = 'task_failed'
}

// 通知設定
interface NotificationSettings {
  user_id: string;
  email_enabled: boolean;
  app_enabled: boolean;
  notification_preferences: {
    [key in NotificationType]: {
      email: boolean;
      app: boolean;
      priority: 'high' | 'medium' | 'low';
    };
  };
}

// 通知
interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  status: 'unread' | 'read';
  created_at: string;
  read_at?: string;
  metadata?: Record<string, unknown>;
}
```

### メトリクス関連の型定義
```typescript
// メトリクスカテゴリ
enum MetricCategory {
  PERFORMANCE = 'performance',
  RESOURCE = 'resource',
  BUSINESS = 'business',
  ERROR = 'error'
}

// メトリクス
interface Metric {
  id: string;
  timestamp: string;
  category: MetricCategory;
  name: string;
  value: number;
  tags: Record<string, string>;
  metadata?: Record<string, unknown>;
}

// メトリクス集計
interface MetricAggregation {
  period: string;
  category: MetricCategory;
  name: string;
  min: number;
  max: number;
  avg: number;
  count: number;
}

// メトリクスフィルタ
interface MetricFilter {
  categories?: MetricCategory[];
  names?: string[];
  tags?: Record<string, string>;
  min_value?: number;
  max_value?: number;
  date_range?: {
    start: string;
    end: string;
  };
}
```

### 共通型定義
```typescript
// ページネーション
interface Pagination {
  page: number;
  per_page: number;
  total?: number;
}

// ソート
interface Sort {
  field: string;
  order: 'asc' | 'desc';
}

// API応答
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    pagination?: Pagination;
  };
}
```

## 関連ファイル
- `supabase/functions/_shared/types.ts`

## 優先度
中

## 担当
バックエンドエンジニア

## 見積もり工数
2人日

## テスト要件
1. 型チェック
   - 型定義の整合性チェック
   - 型の互換性チェック
   - 必須プロパティのチェック

2. コンパイルテスト
   - 全ファイルのコンパイル
   - 型エラーの確認
   - 型推論の確認

## 注意事項
- 後方互換性の維持
- 型の命名規則の統一
- 適切なドキュメント化
- 型の再利用性の向上
- 型定義の一貫性確保 