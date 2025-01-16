# ジョブ管理APIの改良

## 概要
バッチジョブの管理機能を拡充し、より柔軟で信頼性の高いジョブ制御を実現します。

## 現状
- 基本的なジョブ管理機能は実装済み
- 詳細な制御機能が不足
- エラーハンドリングが不十分

## タスク

### 1. `createJob`APIの拡張
- 並列実行数の制御機能
  - 最大同時実行数の設定
  - リソース使用量の制限
- リトライ設定の追加
  - リトライ回数の設定
  - リトライ間隔の設定
  - エラー種別によるリトライ制御
- ジョブの優先度設定

### 2. `updateBatchJob`APIの改良
- ステータス遷移の厳密な管理
  - 状態遷移図に基づく制御
  - 不正な遷移の防止
- エラーハンドリングの強化
  - 詳細なエラー情報の記録
  - エラー種別の分類
  - リカバリー処理の実装
- 進捗状況の詳細な管理

### 3. `deleteJob`APIの実装
- 関連するタスクとログの削除
- 実行中ジョブの安全な停止
- クリーンアップ処理の実装

## 技術仕様

### データモデル拡張
```typescript
interface BatchJob {
  // 既存のフィールド
  id: string;
  status: BatchJobStatus;
  product_id: string;
  sending_group_id: string;
  user_id: string;
  
  // 新規追加フィールド
  priority: number;
  max_parallel_tasks: number;
  retry_config: {
    max_attempts: number;
    retry_interval: number;
    retry_on_errors: string[];
  };
  resource_limits: {
    max_memory: number;
    max_cpu: number;
  };
  detailed_status: {
    current_phase: string;
    progress_percentage: number;
    active_tasks: number;
    error_count: number;
  };
}
```

### API仕様

#### createJob（拡張版）
- メソッド: POST
- エンドポイント: `/job-operations`
- リクエストボディ:
```typescript
{
  action: 'createJob',
  data: {
    product_id: string;
    sending_group_id: string;
    priority?: number;
    max_parallel_tasks?: number;
    retry_config?: {
      max_attempts: number;
      retry_interval: number;
      retry_on_errors: string[];
    };
    resource_limits?: {
      max_memory: number;
      max_cpu: number;
    };
  }
}
```

#### updateBatchJob（改良版）
- メソッド: POST
- エンドポイント: `/job-operations`
- リクエストボディ:
```typescript
{
  action: 'updateBatchJob',
  data: {
    job_id: string;
    status?: BatchJobStatus;
    detailed_status?: {
      current_phase: string;
      progress_percentage: number;
      active_tasks: number;
      error_count: number;
    };
    error_details?: {
      code: string;
      message: string;
      stack?: string;
    };
  }
}
```

#### deleteJob
- メソッド: POST
- エンドポイント: `/job-operations`
- リクエストボディ:
```typescript
{
  action: 'deleteJob',
  data: {
    job_id: string;
    force?: boolean;
  }
}
```

## 関連ファイル
- `supabase/functions/job-operations/index.ts`
- `supabase/functions/_shared/types.ts`
- `supabase/functions/task-operations/index.ts`

## 優先度
高

## 担当
バックエンドエンジニア

## 見積もり工数
4人日

## テスト要件
1. ユニットテスト
   - ジョブ作成・更新・削除の基本機能テスト
   - 並列実行制御のテスト
   - リトライ機能のテスト
   - エラーハンドリングのテスト

2. 統合テスト
   - 複数ジョブの同時実行テスト
   - リソース制限のテスト
   - エラーリカバリーのテスト
   - パフォーマンステスト

## 注意事項
- デッドロックの防止
- リソース使用量の監視
- エラー通知の実装
- 監査ログの記録
- バックアップと復旧手順の整備 