# エラーリカバリー機能の実装

## 概要
バッチジョブやコンテンツ生成、送信処理でのエラー発生時のリカバリー機能を実装します。

## 現状
- 基本的なエラーハンドリングは実装済み
- 自動リカバリー機能が不足
- エラー情報の管理が不十分

## タスク

### 1. 自動リトライ機能の実装
- リトライ設定の管理
  - エラー種別ごとのリトライ条件
  - 最大リトライ回数の設定
  - リトライ間隔の制御
- リトライロジックの実装
  - エラー種別の判定
  - リトライ可否の判断
  - バックオフ戦略の実装

### 2. 手動リカバリー機能の実装
- 失敗したジョブの管理
  - エラー状態の一覧表示
  - エラー詳細の表示
  - 手動再実行機能
- 部分的な再実行
  - 特定のタスクの再実行
  - 再実行条件の設定
  - 依存関係の管理

### 3. エラー分析と予防
- エラー情報の収集
  - エラーパターンの分析
  - 失敗率の統計
  - 改善提案の生成
- 予防措置の実装
  - リスク検出
  - 事前チェック
  - 自動最適化

## 技術仕様

### データモデル拡張
```typescript
interface ErrorRecord {
  id: string;
  job_id?: string;
  task_id?: string;
  error_type: string;
  error_message: string;
  stack_trace?: string;
  timestamp: string;
  retry_count: number;
  recovery_status: 'pending' | 'in_progress' | 'recovered' | 'failed';
  recovery_attempts: {
    timestamp: string;
    method: string;
    result: string;
  }[];
}

interface RetryConfig {
  error_type: string;
  max_attempts: number;
  initial_delay: number;
  max_delay: number;
  backoff_factor: number;
  retry_conditions: {
    field: string;
    operator: string;
    value: any;
  }[];
}
```

### API仕様

#### configureRetry
- メソッド: POST
- エンドポイント: `/error-operations`
- リクエストボディ:
```typescript
{
  action: 'configureRetry',
  data: {
    error_type: string;
    config: RetryConfig;
  }
}
```

#### manualRecover
- メソッド: POST
- エンドポイント: `/error-operations`
- リクエ���トボディ:
```typescript
{
  action: 'manualRecover',
  data: {
    error_record_id: string;
    recovery_options?: {
      force?: boolean;
      ignore_conditions?: boolean;
      custom_params?: Record<string, any>;
    };
  }
}
```

#### analyzeErrors
- メソッド: POST
- エンドポイント: `/error-operations`
- リクエストボディ:
```typescript
{
  action: 'analyzeErrors',
  data: {
    period?: {
      start: string;
      end: string;
    };
    error_types?: string[];
    job_ids?: string[];
  }
}
```

## 関連ファイル
- `supabase/functions/error-operations/index.ts`
- `supabase/functions/job-operations/index.ts`
- `supabase/functions/_shared/types.ts`

## 優先度
高

## 担当
バックエンドエンジニア

## 見積もり工数
4人日

## テスト要件
1. ユニットテスト
   - リトライロジックのテスト
   - エラー判定のテスト
   - リカバリー処理のテスト
   - バックオフ戦略のテスト

2. 統合テスト
   - 実際のエラーシナリオテスト
   - 長期実行時の安定性テスト
   - 並行処理時のテスト
   - データ整合性のテスト

## 注意事項
- 無限ループの防止
- リソース消費の管理
- エラーログの適切な保持
- セキュリティ考慮事項
- パフォーマンスへの影響 