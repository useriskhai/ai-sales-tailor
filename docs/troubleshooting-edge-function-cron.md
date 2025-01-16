# Edge Function Cronトラブルシューティング

## 現在の実装概要

### ディレクトリ構成
```
supabase/
├── functions/
│   ├── _shared/
│   │   ├── cors.ts
│   │   └── supabase-client.ts
│   ├── crawl-company/
│   │   └── index.ts
│   ├── process-crawl-batch/
│   │   └── index.ts
│   └── proxy-html/
│       └── index.ts
└── migrations/
    ├── 20250107000004_fix_crawl_queue_http_headers.sql
    ├── 20250107000005_fix_crawl_queue_pg_net.sql
    ├── 20250107000006_fix_crawl_queue_pg_net_signature.sql
    ├── 20250107000007_fix_crawl_queue_curl.sql
    └── 20250107000008_fix_crawl_queue_edge_function.sql
```

### 現在の処理フロー
1. PostgreSQL関数 `process_crawl_queue()`がCronで定期実行
2. 未処理のキューアイテムをバッチにまとめる
3. Edge Function `process-crawl-batch`がバッチ内のアイテムを処理
4. 処理結果を`crawl_results`テーブルに保存

### エラー情報
1. PostgreSQL関数でのHTTPリクエストエラー
```sql
ERROR:  function net.http_post(text, jsonb, text) does not exist
LINE 1: SELECT net.http_post(
```

2. Edge Function実行時のエラー
```
[Error] Batch processing error: Unknown error
```

### ログ情報
```
[Info] proxy-html - リクエストメソッド: POST
[Info] proxy-html - リクエストヘッダー: {
  accept: "*/*",
  authorization: "Bearer eyJhbGci...",
  "content-type": "application/json",
  ...
}
[Info] HTMLコンテンツ取得開始: https://www.cyberagent.co.jp/
[Info] fetch 完了: https://www.cyberagent.co.jp/
[Info] レスポンスステータス: 200
[Info] Content-Type: text/html; charset=utf-8
[Info] HTMLコンテンツ取得成功
```

## 現在の問題点

1. PostgreSQL関数の制約
- `pg_net`拡張機能が利用できない
- `http`拡張機能も利用できない
- PostgreSQL関数からのHTTPリクエストが制限されている

2. Edge Function連携の課題
- PostgreSQL関数からEdge Functionを直接呼び出せない
- バッチ処理の状態管理が複雑
- エラーハンドリングが不十分

3. 環境変数の問題
```
Env name cannot start with SUPABASE_, skipping: SUPABASE_URL
Env name cannot start with SUPABASE_, skipping: SUPABASE_SERVICE_ROLE_KEY
```

## 検討すべき代替案

1. Edge Function Cron
- Supabase Edge Functionのスケジュール実行機能を利用
- PostgreSQL関数を使用せずに直接Edge Functionで処理

2. Worker + Queue
- Edge Functionをワーカーとして実装
- キューイングシステムを利用して処理を分散

3. Webhook + External Cron
- 外部のCronサービスからWebhookでEdge Functionを呼び出し
- 状態管理をシンプル化

## 分析のポイント

1. アーキテクチャ
- 現在の実装は複雑すぎないか
- 責務の分離は適切か
- スケーラビリティは確保されているか

2. エラーハンドリング
- エラーの種類と原因の特定
- リトライ戦略の妥当性
- エラー通知の仕組み

3. 運用性
- モニタリングの容易さ
- デバッグのしやすさ
- 設定変更の柔軟性

## 期待する分析結果

1. 技術的な制約の明確化
- Supabaseの制約事項
- Edge Functionの制限
- PostgreSQLの制限

2. 最適なアーキテクチャの提案
- シンプルで保守性の高い設計
- エラーに強い実装
- スケーラブルな構成

3. 具体的な実装方針
- コード修正の方向性
- 設定変更の内容
- 移行手順 

## 実装パターンの詳細分析

### 1. Edge Function Direct Cronパターン

#### 基本構成
```typescript
// supabase/functions/process-batch/index.ts
const BATCH_SIZE = 10;
const MAX_RETRIES = 3;

Deno.serve(async (req) => {
  // CORSハンドリング
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // バッチ処理
  try {
    const { data: items } = await supabase
      .from('crawl_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('retry_count', MAX_RETRIES)
      .limit(BATCH_SIZE);

    // 処理実行
    const results = await processBatch(items);
    
    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders } }
    );
  } catch (error) {
    // エラーハンドリング
  }
});
```

#### メリット
- シンプルな実装構造
- 直接的なエラーハンドリング
- デバッグの容易さ

#### デメリット
- スケーリングの制限
- 同時実行の制御が必要

### 2. Worker + Queueパターン

#### 基本構成
```typescript
// Queue Worker
class CrawlQueueWorker {
  private supabase: SupabaseClient;
  private isProcessing: boolean = false;

  async start() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (true) {
        const batch = await this.fetchBatch();
        if (!batch.length) {
          await this.sleep(5000); // バックオフ
          continue;
        }
        await this.processBatch(batch);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async fetchBatch() {
    const { data } = await this.supabase
      .from('crawl_queue')
      .select('*')
      .eq('status', 'pending')
      .limit(10);
    return data || [];
  }
}
```

#### メリット
- 高いスケーラビリティ
- バックプレッシャー制御
- 柔軟な再試行戦略

#### デメリット
- 実装の複雑さ
- 状態管理の必要性

### 3. Hybrid実装パターン

#### 基本構成
```typescript
// Coordinator
class CrawlCoordinator {
  private workers: Worker[] = [];
  private maxWorkers: number = 3;

  async coordinate() {
    // キューの状態監視
    const queueStatus = await this.checkQueueStatus();
    
    // ワーカー数の動的調整
    await this.adjustWorkers(queueStatus);
    
    // タスク分配
    await this.distributeTasks();
  }

  private async adjustWorkers(status: QueueStatus) {
    const currentLoad = status.pendingItems / status.totalItems;
    if (currentLoad > 0.7 && this.workers.length < this.maxWorkers) {
      await this.addWorker();
    }
  }
}
```

#### メリット
- 負荷に応じた動的スケーリング
- リソースの効率的な利用
- 柔軟な障害対応

#### デメリット
- 設定の複雑さ
- 運用コストの増加

## 実装選択の判断基準

### 1. 処理量による判断
- 小規模（1日1000件未満）: Edge Function Direct
- 中規模（1日1000-10000件）: Worker + Queue
- 大規模（1日10000件以上）: Hybrid実装

### 2. リソース効率による判断
- メモリ使用量の制約
- 実行時間の制限
- コスト効率

### 3. 運用負荷による判断
- モニタリングの必要性
- デバッグの容易さ
- 保守性の要件

## モニタリングと運用

### 1. メトリクス収集
```typescript
interface ProcessMetrics {
  batchSize: number;
  processTime: number;
  successCount: number;
  errorCount: number;
  retryCount: number;
}

async function collectMetrics(metrics: ProcessMetrics) {
  await supabase
    .from('process_metrics')
    .insert([metrics]);
}
```

### 2. アラート設定
- エラー率閾値の設定（例：エラー率20%以上で通知）
- 処理遅延の監視（例：処理待ち時間10分以上で通知）
- リソース使用率の監視（例：メモリ使用率80%以上で通知）

### 3. ログ管理
```typescript
enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

async function logEvent(level: LogLevel, message: string, metadata?: any) {
  await supabase
    .from('process_logs')
    .insert([{
      level,
      message,
      metadata,
      timestamp: new Date().toISOString()
    }]);
}
```

## 障害復旧プロセス

### 1. 自動リカバリー
```typescript
async function recoverFailedJobs() {
  const { data: failedJobs } = await supabase
    .from('crawl_queue')
    .select('*')
    .eq('status', 'failed')
    .lt('retry_count', MAX_RETRIES);

  for (const job of failedJobs) {
    await retryJob(job);
  }
}
```

### 2. 手動介入ポイント
- 再試行回数超過のジョブの処理
- デッドレターキューの管理
- システムパラメータの調整

### 3. バックアッププロセス
- 定期的なキュー状態のスナップショット
- リカバリーポイントの設定
- ロールバック手順の整備

## パフォーマンスチューニング

### 1. バッチサイズの最適化
```typescript
async function optimizeBatchSize(metrics: ProcessMetrics[]): Promise<number> {
  const averageProcessTime = calculateAverageProcessTime(metrics);
  return Math.floor(TARGET_PROCESS_TIME / averageProcessTime);
}
```

### 2. リトライ戦略
- 指数バックオフの実装
- エラー種別に応じた再試行間隔の調整
- 永続的なエラーの早期検出

### 3. キャッシュ戦略
- 重複リクエストの防止
- 一時的なデータの保持
- キャッシュの有効期限管理 

# ベストプラクティスと実装推奨案

## 1. 全体アーキテクチャの見直し

### 1-1. 「DBでのHTTPリクエスト」は極力避ける

- **制限やトラブルが多い**  
  PostgreSQL側で`pg_net`や`http`拡張を使おうとしても、マネージド環境(Supabase)ではセキュリティ上・バージョン上の制限があり、エラーが起きやすいです。
- **責務分離**  
  "データベースはデータの保管・整合性管理を担う" という原則に立ち返り、外部API呼び出しやクロール処理などは**アプリ層 (Edge Function や他のサーバー) に集約**するほうが保守性が高いです。

### 1-2. 「Edge Function Cron」または「外部Cron」からの実行を主とする

- **パターンA: Edge Functionのスケジュール実行機能を利用**  
  - Supabaseが提供している「Edge Functionsのスケジュール実行（Cron）」機能を使い、1分ごと・5分ごとなどの間隔でEdge Functionを定期実行する。  
  - Edge Function内で直接`crawl_queue`テーブルをポーリングし、未処理アイテムを処理→結果をDBに書き込む。
- **パターンB: 外部Cron + Webhook**  
  - 外部のCronサービス(例えばGitHub ActionsやAWS EventBridge、Zapierなど)を使い、定期的にSupabase Edge Functionのエンドポイントを`POST`で叩く。  
  - 以降のフローはパターンA同様「Edge FunctionがDBのキューを処理→結果保存」。

## 2. キューとバッチ処理の実装

### 2-1. シンプルな「キューのみ」実装

```typescript
// process-crawl-batch/index.ts
const MAX_RETRIES = 3;
const BATCH_SIZE = 10;

Deno.serve(async (req) => {
  try {
    const { data: items } = await supabase
      .from('crawl_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('retry_count', MAX_RETRIES)
      .order('created_at', { ascending: true })
      .limit(BATCH_SIZE);

    const results = await Promise.allSettled(
      items.map(async (item) => {
        try {
          const result = await processItem(item);
          return { success: true, item, result };
        } catch (error) {
          return { success: false, item, error };
        }
      })
    );

    await updateBatchResults(supabase, results);
    return new Response(JSON.stringify({ processed: results.length }));
  } catch (error) {
    console.error('Batch processing error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
```

### 2-2. エラーハンドリングとリトライ戦略

```typescript
// types/queue.ts
interface QueueItem {
  id: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retry_count: number;
  next_retry_at: Date | null;
  error_code?: string;
  error_message?: string;
}

// utils/retry.ts
export function calculateNextRetry(retryCount: number): Date {
  const backoffMinutes = Math.pow(2, retryCount); // 指数バックオフ
  const nextRetry = new Date();
  nextRetry.setMinutes(nextRetry.getMinutes() + backoffMinutes);
  return nextRetry;
}

// utils/error-handler.ts
export function handleError(error: Error): {
  shouldRetry: boolean;
  errorCode: string;
  errorMessage: string;
} {
  // エラー種別の判定ロジック
  if (error instanceof NetworkError) {
    return {
      shouldRetry: true,
      errorCode: 'NETWORK_ERROR',
      errorMessage: error.message
    };
  }
  
  if (error instanceof ValidationError) {
    return {
      shouldRetry: false,
      errorCode: 'VALIDATION_ERROR',
      errorMessage: error.message
    };
  }
  
  return {
    shouldRetry: true,
    errorCode: 'UNKNOWN_ERROR',
    errorMessage: error.message
  };
}
```

### 2-3. モニタリングと運用

```typescript
// utils/metrics.ts
interface ProcessMetrics {
  timestamp: Date;
  batchSize: number;
  successCount: number;
  failureCount: number;
  processingTime: number;
}

async function recordMetrics(metrics: ProcessMetrics) {
  await supabase
    .from('process_metrics')
    .insert([metrics]);
    
  // エラー率が閾値を超えた場合はSlack通知
  if (metrics.failureCount / metrics.batchSize > 0.2) {
    await notifySlack({
      channel: '#alerts',
      message: `High error rate detected: ${metrics.failureCount}/${metrics.batchSize} failures`
    });
  }
}

// utils/monitoring.ts
interface ProcessLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
  metadata?: Record<string, unknown>;
}

async function logProcess(log: ProcessLog) {
  await supabase
    .from('process_logs')
    .insert([log]);
}
```

## 3. 環境変数の管理

### 3-1. 命名規則の変更
```typescript
// _shared/config.ts
export const config = {
  projectUrl: Deno.env.get('PROJECT_URL') ?? '',
  serviceRoleKey: Deno.env.get('SERVICE_ROLE_KEY') ?? '',
  batchSize: parseInt(Deno.env.get('BATCH_SIZE') ?? '10'),
  maxRetries: parseInt(Deno.env.get('MAX_RETRIES') ?? '3'),
};
```

### 3-2. 設定例
```bash
# .env
PROJECT_URL="https://xxx.supabase.co"
SERVICE_ROLE_KEY="xxx"
BATCH_SIZE=10
MAX_RETRIES=3
```

## 4. 移行手順

1. **新実装の準備**
   - Edge Function用の新しいコードを実装
   - 環境変数の名前を変更
   - モニタリング用のテーブルを作成

2. **テスト環境での検証**
   - 小規模なテストデータで動作確認
   - エラーハンドリングの検証
   - メトリクス収集の確認

3. **段階的な移行**
   - 既存のPostgreSQL Cronジョブを停止
   - 新しいEdge Function Cronを開始
   - 処理状況を監視

4. **運用監視の開始**
   - メトリクスの収集開始
   - アラート閾値の設定
   - ログ収集の開始 