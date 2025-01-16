# フォーム送信処理の統合と拡張

## 概要
既存のai-form-assistantを活用し、バッチジョブと連携した送信処理を実装します。

## 現状
- ai-form-assistantでフォーム送信の基本機能は実装済み
- バッチジョブとの連携が未実装
- 送信状態の管理が不十分

## タスク

### 1. バッチジョブとの統合
- ai-form-assistantとバッチジョブの連携
  - 送信タスクの生成
  - 進捗状況の追跡
  - 結果の保存
- 並列処理の制御
  - 同時送信数の制限
  - リソース使用量の管理

### 2. 送信方法の最適化
- フォーム送信機能の拡張
  - 既存のフォーム検出機能の活用
  - フォーム入力の最適化
  - 送信成功率の向上
- DMプラットフォームとの連携
  - プラットフォームAPIの統合
  - メッセージ送信機能
  - 送信状態の追跡
- 送信方法の自動選択
  - 優先順位付けロジック
  - フォールバック処理
  - 成功率に基づく動的調整

### 3. エラーハンドリングの強化
- 送信失敗時の処理
  - エラー種別の分類
  - リトライ条の設定
  - 代替送信方法への切り替え
- エラー情報の管理
  - 詳細なエラーログ
  - エラー分析機能
  - 改善提案の生成

## 技術仕様

### データモデル拡張
```typescript
interface SendingTask {
  id: string;
  batch_job_id: string;
  company_id: string;
  content_id: string;
  preferred_method: 'form' | 'dm';
  status: SendingStatus;
  attempt_count: number;
  last_attempt: {
    timestamp: string;
    error?: string;
    method: 'form' | 'dm';
  };
  form_data?: {
    url: string;
    fields: FormField[];
    success_probability: number;
  };
  dm_data?: {
    platform: string;
    profile_url: string;
    success_probability: number;
  };
}

interface FormField {
  name: string;
  value: string;
  confidence: number;
  alternatives?: string[];
}
```

### API仕様

#### initiateSending
- メソッド: POST
- エンドポイント: `/form-operations`
- リクエストボディ:
```typescript
{
  action: 'initiateSending',
  data: {
    batch_job_id: string;
    tasks: {
      company_id: string;
      content_id: string;
      preferred_method?: 'form' | 'dm';
    }[];
  }
}
```

#### checkSendingStatus
- メソッド: POST
- エンドポイント: `/form-operations`
- リクエストボディ:
```typescript
{
  action: 'checkSendingStatus',
  data: {
    batch_job_id: string;
    task_ids?: string[];
  }
}
```

#### retrySending
- メソッド: POST
- エンドポイント: `/form-operations`
- リクエストボディ:
```typescript
{
  action: 'retrySending',
  data: {
    task_id: string;
    force_method?: 'form' | 'dm';
  }
}
```

## 関連ファイル
- `supabase/functions/ai-form-assistant/index.ts`
- `supabase/functions/job-operations/index.ts`
- `supabase/functions/_shared/types.ts`

## 優先度
高

## 担当
バックエンドエンジニア

## 見積もり工数
5人日

## テスト要件
1. ユニットテスト
   - フォーム送信機能のテスト
   - DM送信機能のテスト
   - エラーハンドリングのテスト
   - 自動選択ロジックのテスト

2. 統合テスト
   - バッチジョブとの連携テスト
   - 並列処理のテスト
   - エラーリカバリーのテスト
   - 長時間実行テスト

## 注意事項
- 送信レート制限の考慮
- エラー時のデータ整合性
- プライバシーとセキュリティ
- リソース使用量の最適化
- 監査ログの記録 