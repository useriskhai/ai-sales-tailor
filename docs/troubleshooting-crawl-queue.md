# クロールキュー処理システムのトラブルシューティング

## 現在のディレクトリ構成

```
supabase/
├── migrations/
│   └── 20250107000000_add_crawl_trigger.sql  # クロールキュー処理の実装
└── functions/
    ├── _shared/
    │   └── database.types.ts                  # データベース型定義
    └── crawl-company/
        ├── index.ts                          # Edge Function実装
        └── test.ts                           # テストコード
```

## 現在の問題点と原因分析

### 1. Edge Function呼び出しの問題
- **問題**: `net.http_post`の戻り値が期待と異なる
- **原因**: 
  - Supabaseのマネージド環境での拡張機能の制限
  - HTTPリクエスト実行方法が環境に適していない
- **影響**:
  - レスポンスのステータスコードとボディが取得できない
  - エラーハンドリングが不完全

### 2. バッチ処理の問題
- **問題**: バッチ処理の制御が不適切
- **原因**:
  - キューアイテムとバッチの紐付けタイミングの不整合
  - バッチステータス更新のロジックが不適切
- **影響**:
  - バッチが即座に`processed = true`になる
  - キューアイテムが`pending`状態のまま

### 3. エラーハンドリングの問題
- **問題**: エラー処理とリトライの仕組みが不十分
- **原因**:
  - リトライ条件が限定的（`retry_count = 0`のみ）
  - エラー状態の管理が不完全
- **影響**:
  - リトライが適切に機能しない
  - エラー状態の可視化が困難

## 具体的な対策案

### 1. アーキテクチャの見直し

#### 1-1. Edge Function中心の設計への移行
- Edge Functionで定期的なポーリング処理を実装
- キュー処理をEdge Function側で完結
- DBはデータストアとしてのみ使用

```typescript
// Edge Function側の実装例
async function processCrawlQueue() {
  const { data: pendingItems } = await supabase
    .from('crawl_queue')
    .select('*')
    .eq('status', 'pending')
    .lt('retry_count', 3)
    .is('next_retry_at', null)
    .order('created_at')
    .limit(10);

  for (const item of pendingItems) {
    try {
      await processItem(item);
      await updateQueueStatus(item.id, 'completed');
    } catch (error) {
      await handleError(item, error);
    }
  }
}
```

#### 1-2. キュー管理の簡素化
- バッチテーブルの廃止を検討
- キューテーブルのステータス管理の強化
```sql
ALTER TABLE crawl_queue 
ADD COLUMN next_retry_at timestamptz,
ADD COLUMN last_error text,
ADD COLUMN processing_started_at timestamptz;
```

### 2. エラーハンドリングの強化

#### 2-1. リトライ戦略の実装
```typescript
async function handleError(item: QueueItem, error: Error) {
  const shouldRetry = isRetryableError(error) && item.retry_count < 3;
  const nextRetryAt = shouldRetry 
    ? new Date(Date.now() + getRetryDelay(item.retry_count))
    : null;

  await supabase
    .from('crawl_queue')
    .update({
      status: shouldRetry ? 'pending' : 'failed',
      error_message: error.message,
      retry_count: item.retry_count + 1,
      next_retry_at: nextRetryAt,
      updated_at: new Date().toISOString()
    })
    .eq('id', item.id);
}
```

#### 2-2. モニタリングの実装
```typescript
async function logProcessingMetrics(batchId: string, results: ProcessingResult[]) {
  await supabase
    .from('processing_metrics')
    .insert({
      batch_id: batchId,
      total_processed: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      processing_time: Date.now() - startTime,
      errors: results.filter(r => r.error).map(r => r.error)
    });
}
```

### 3. 運用改善

#### 3-1. ログ管理の強化
- 詳細なログ情報の保存
- エラー分析のための情報収集
- 処理性能の計測

#### 3-2. 監視体制の確立
- 異常検知の仕組み
- アラート設定
- ダッシュボードの整備

## 移行計画

1. **フェーズ1: 基盤整備**
   - テーブル構造の更新
   - Edge Function実装の準備
   - モニタリング基盤の構築

2. **フェーズ2: 実装移行**
   - Edge Function側の処理実装
   - 既存のクロール処理の移行
   - エラーハンドリングの実装

3. **フェーズ3: 運用体制確立**
   - モニタリングの開始
   - アラート設定
   - 運用手順の整備

## 期待される効果

1. **安定性の向上**
   - エラーハンドリングの改善
   - リトライ処理の確実な実行
   - 処理の可視化

2. **運用効率の改善**
   - トラブルシューティングの容易化
   - 異常の早期発見
   - 性能モニタリング

3. **スケーラビリティの確保**
   - 処理量の増加への対応
   - 並行処理の制御
   - リソース使用の最適化 