# 企業情報クローリング機能の実装

## コンテンツ取得プロセス
### 1. 検索時の初期情報取得（`description`）
- 実行タイミング：`SearchCompany.tsx`での企業検索時
- 取得方法：Google Custom Search APIのスニペット
- 保存先：`companies.description`カラム
- 用途：企業の概要把握、検索結果での表示

### 2. 詳細情報のクローリング（`website_content`）
- 実行タイミング：企業登録後の非同期処理
- 取得方法：Firecrawlによる本格的なクローリング
- 処理フロー：
  1. 企業登録完了後に`queue-crawl`でキューイング
  2. `crawl-company`が2分間隔で未処理タスクを処理
  3. Firecrawlでウェブサイトコンテンツを取得
- 保存先：`companies.website_content`カラム
- 用途：詳細な企業分析、セールスレターの品質向上

## 実装詳細

### クロール処理の設定
- 実行間隔: 2分
- バッチサイズ: 1件
- リトライ回数: 最大3回
- レート制限: 2秒のインターバル

### Firecrawl Professional プラン制限
- 1分あたり: 60リクエスト
- 1日あたり: 10,000リクエスト
- 1ヶ月あたり: 100,000リクエスト

### 想定処理量
- 1時間あたり: 30件（2分 × 30回）
- 1日あたり: 720件（24時間 × 30回）
- 1ヶ月あたり: 約21,600件

## 進捗状況

### Phase 1: 基盤実装 ✅
- [x] 環境変数の設定
  - [x] `.env.local`の更新
  - [x] Firecrawl APIキーの設定
- [x] データベーススキーマの更新
  - [x] `companies`テーブルの拡張（`website_content`, `last_crawled_at`カラム追加）
  - [x] `crawl_queue`テーブルの作成
  - [x] `error_logs`テーブルの作成
  - [x] インデックスの作成
- [x] 型定義の更新
  - [x] `Company`インターフェースの更新
  - [x] キュー関連の型定義追加
- [x] エラーログ機能の実装
  - [x] `error-logger.ts`の作成
  - [x] エラーログテーブルの作成
- [x] Firecrawlクライアントのインストール
  - [x] パッケージのインストール
  - [x] 動作確認

### Phase 2: Edge Function実装 🔄
- [x] `queue-crawl` Edge Functionの作成
  - [x] 基本実装（`queue-crawl/index.ts`）
  - [x] エラーハンドリング
  - [x] テスト
- [x] `crawl-company` Edge Functionの作成
  - [x] 基本実装（`crawl-company/index.ts`）
  - [x] 並列処理（バッチサイズ: 1件）
  - [x] リトライ処理（最大3回）
  - [x] レート制限（2秒インターバル）
  - [x] テスト
- [x] Supabase Schedulerの設定
  - [x] スケジュール設定（2分間隔、`cron.json`）
  - [x] 動作確認
- [ ] `company-operations`の修正
  - [x] メタ情報取得処理の実装（`proxy-html`使用）
  - [ ] キュー登録処理の追加（`queue-crawl`連携）
  - [x] エラーハンドリング
  - [ ] テスト
- [ ] `SearchCompany.tsx`の修正
  - [x] Google Custom Search APIからの`description`取得
  - [x] 検索結果への`description`表示
  - [ ] テスト

### テスト 🔄
- [ ] 初期情報取得フロー
  - [ ] Google Custom Search APIからの`description`取得
  - [ ] エラー時のフォールバック処理
- [ ] キュー登録フロー
  - [ ] URLあり
  - [ ] URLなし
  - [ ] DB接続エラー
- [ ] クロール処理
  - [ ] 単一URL
  - [ ] 複数URL
  - [ ] タイムアウト
  - [ ] APIエラー
- [ ] リトライ処理
  - [ ] カウント増加
  - [ ] 最大回数超過
- [ ] 並列処理
  - [ ] 同時実行
  - [ ] リソース確認
- [ ] エラーハンドリング
  - [ ] ログ記録
  - [ ] 処理の独立性

## 残タスク
1. `company-operations`の修正
   - `queue-crawl`エンドポイントの呼び出し実装
   - 企業保存後のクロール処理キューイング
   - テストの実施

2. 総合テスト
   - キュー登録からクロール完了までの一連のフロー確認
   - エラーケースの検証
   - パフォーマンステスト

## 大目的
企業登録時に自動的にウェブサイトの情報を取得し、パーソナライズされたセールスレターの品質向上に活用する。

## フータフロー詳細

### 1. 初期情報取得フロー
1. ユーザーが企業名を検索
   - `SearchCompany.tsx`での検索イベント発火
   - Google Custom Search APIへのリクエスト送信
2. 検索結果の処理
   - スニペット（`description`）の抽出
   - 企業基本情報との紐付け
3. UI表示
   - 検索結果一覧への表示
   - ユーザーによる企業選択

### 2. 詳細情報取得フロー
1. トリガー：企業データの登録
   - `SearchCompany.tsx`での企業選択・登録
   - `company-operations`での企業データ保存
   - `queue-crawl`でクロール処理をキューに登録

2. バックグラウンド処理（`crawl-company`）
   - Supabase Schedulerによる定期実行（2分間隔）
   - キューからの未処理タスク取得
   - Firecrawlによるウェブサイトクロール
   - クロール結果の`website_content`への保存
   - エラー発生時のリトライ管理

## ファイル構造
```
src/
├── components/
│   └── SearchCompany.tsx      # 企業検索・登録コンポーネント（修正）
├── types/
│   └── company.ts            # 企業情報の型定義（修正）
supabase/
└── functions/
    ├── company-operations/   # 企業情報操作関連の関数（修正）
    │   └── index.ts
    ├── queue-crawl/         # クロール処理のキュー登録（新規）
    │   └── index.ts
    ├── crawl-company/       # クロール処理のワーカー（新規）
    │   └── index.ts
    └── _shared/
        ├── types.ts         # 共有型定義（修正）
        └── error-logger.ts  # エラーログ機能（新規）
.env.local                   # 環境変数（修正）
```

## 修正対象ファイルと変更内容

### 1. `.env.local`
#### 現状
```
GOOGLE_SEARCH_API_KEY="..."
GOOGLE_SEARCH_ENGINE_ID="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
NEXT_PUBLIC_SUPABASE_URL="..."
```

#### あるべき姿
```
GOOGLE_SEARCH_API_KEY="..."
GOOGLE_SEARCH_ENGINE_ID="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
NEXT_PUBLIC_SUPABASE_URL="..."
FIRECRAWL_API_KEY="fc-6f51ce0b6b2f456082367c62e04b493b"
```

### 2. `src/types/company.ts`
#### 現状
```typescript
export interface Company {
  id: string;
  name: string;
  url?: string;
  description?: string;
}
```

#### あるべき姿
```typescript
export interface Company {
  id: string;
  name: string;
  url?: string;
  description?: string;
  website_content?: string;  // マークダウン形式のウェブサイトコンテンツ
  last_crawled_at?: string;
}
```

### 3. `src/components/SearchCompany.tsx`
#### 現状
```typescript
const handleConfirmSelection = async () => {
  const { data: result, error } = await supabase.functions.invoke('company-operations', {
    body: {
      action: 'insertCompanies',
      data: {
        companies: targetCompanies,
        userId: session.user.id,
        searchKeyword
      }
    }
  });
  // ...
};
```

#### あるべき姿
```typescript
const handleConfirmSelection = async () => {
  try {
    const { data: result, error } = await supabase.functions.invoke('company-operations', {
      body: {
        action: 'insertCompanies',
        data: {
          companies: targetCompanies,
          userId: session.user.id,
          searchKeyword
        }
      }
    });

    if (error) throw error;

    if (onClose) {
      onClose();
    }
    onCompaniesSelected(result);
  } catch (error) {
    console.error('企業登録エラー:', error);
  }
};
```

### 4. `supabase/functions/company-operations/index.ts`
#### 現状
```typescript
export async function insertCompanies(companies: Partial<Company>[]) {
  const { data, error } = await supabase
    .from('companies')
    .upsert(companies.map(company => ({
      name: company.name,
      url: company.url,
      description: company.description,
      created_at: new Date().toISOString()
    })));
  // ...
}
```

#### あるべき姿
```typescript
export async function insertCompanies(companies: Partial<Company>[]) {
  // 1. 企業情報の保存
  const { data: insertedCompanies, error } = await supabase
    .from('companies')
    .upsert(companies.map(company => ({
      name: company.name,
      url: company.url,
      description: company.description,
      created_at: new Date().toISOString()
    })))
    .select();

  if (error) throw error;

  // 2. クロール処理のキューへの登録
  for (const company of insertedCompanies) {
    if (company.url) {
      try {
        await supabase.functions.invoke('queue-crawl', {
          body: { company_id: company.id }
        });
      } catch (error) {
        console.error(`Failed to queue crawling for ${company.name}: ${error}`);
        // エラーは記録するが、処理は続行
      }
    }
  }

  return insertedCompanies;
}
```

### 5. `supabase/functions/queue-crawl/index.ts`（新規）
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { supabase } from '../_shared/supabase-client.ts'
import { logError } from '../_shared/error-logger.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { company_id } = await req.json();

    // キューへの登録
    const { error } = await supabase
      .from('crawl_queue')
      .insert({
        company_id,
        status: 'pending',
        retry_count: 0
      });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Queue error:', error);
    await logError(error, {
      company_id: req.body?.company_id,
      action: 'queue-crawl'
    });

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
```

### 6. `supabase/functions/crawl-company/index.ts`（新規）
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { supabase } from '../_shared/supabase-client.ts'
import { logError } from '../_shared/error-logger.ts'
import FirecrawlApp from '@mendable/firecrawl-js'

const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
if (!FIRECRAWL_API_KEY) {
  throw new Error('FIRECRAWL_API_KEY is not set');
}

const app = new FirecrawlApp({ apiKey: FIRECRAWL_API_KEY });

const BATCH_SIZE = 5;
const MAX_RETRIES = 3;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. キューから未処理タスクを取得
    const { data: tasks, error: fetchError } = await supabase
      .from('crawl_queue')
      .select('id, company_id, retry_count')
      .eq('status', 'pending')
      .lt('retry_count', MAX_RETRIES)
      .order('created_at', { ascending: true })
      .limit(BATCH_SIZE);

    if (fetchError) throw fetchError;
    if (!tasks?.length) {
      return new Response(
        JSON.stringify({ message: 'No pending tasks' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. 並列処理でクロール実行
    const results = await Promise.allSettled(
      tasks.map(async (task) => {
        try {
          // 2.1 企業情報の取得
          const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('id, name, url')
            .eq('id', task.company_id)
            .single();

          if (companyError) throw companyError;
          if (!company?.url) throw new Error('URL is not set');

          // 2.2 Firecrawlでウェブサイトをクロール
          const crawlResult = await app.scrapeUrl(company.url, {
            pageOptions: {
              fetchPageContent: true
            }
          });

          // 2.3 クロール結果を保存
          const { error: updateError } = await supabase
            .from('companies')
            .update({
              website_content: crawlResult.data.markdown,
              last_crawled_at: new Date().toISOString()
            })
            .eq('id', company.id);

          if (updateError) throw updateError;

          // 2.4 キューのステータスを更新
          await supabase
            .from('crawl_queue')
            .update({ status: 'completed' })
            .eq('id', task.id);

          return { success: true, company_id: company.id };

        } catch (error) {
          // エラー時はリトライカウントを増やす
          await supabase
            .from('crawl_queue')
            .update({ 
              status: 'failed',
              retry_count: task.retry_count + 1,
              error_message: error.message
            })
            .eq('id', task.id);

          throw error;
        }
      })
    );

    // 3. 結果の集計
    const summary = {
      total: results.length,
      succeeded: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length
    };

    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Crawling error:', error);
    await logError(error, {
      action: 'crawl-company'
    });

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
```

### 7. `supabase/functions/_shared/error-logger.ts`
```typescript
export async function logError(error: Error, context: {
  company_id?: string;
  company_name?: string;
  action: string;
}) {
  try {
    await supabase
      .from('error_logs')
      .insert({
        error_message: error.message,
        error_stack: error.stack,
        context: context,
        created_at: new Date().toISOString()
      });
  } catch (logError) {
    console.error('エラーログの保存に失敗:', logError);
  }
}
```

## データベース変更
```sql
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS website_content TEXT,
ADD COLUMN IF NOT EXISTS last_crawled_at TIMESTAMP WITH TIME ZONE;

-- クロール処理のキューテーブル
CREATE TABLE IF NOT EXISTS crawl_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- エラーログテーブル
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  error_message TEXT NOT NULL,
  error_stack TEXT,
  context JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_crawl_queue_status ON crawl_queue(status);
CREATE INDEX IF NOT EXISTS idx_crawl_queue_company_id ON crawl_queue(company_id);
```

## 実装手順

### Phase 1: 基盤実装（1日）
1. 環境変数の設定
2. データベーススキーマの更新
   - `companies`テーブルの拡張
   - `crawl_queue`テーブルの作成
   - `error_logs`テーブルの作成
   - インデックスの作成
3. 型定義の更新
4. エラーログ機能の実装
5. Firecrawlクライアントのインストール

### Phase 2: Edge Function実装（2日）
1. `queue-crawl` Edge Functionの作成
2. `crawl-company` Edge Functionの作成
3. `company-operations`の修正
4. Supabase Schedulerの設定
5. エラーハンドリングの実装

## テスト計画
1. 初期情報取得フロー
   - Google Custom Search APIからの`description`取得
   - エラー時のフォールバック処理
2. キュー登録フロー
   - 正常系：URLあり/なし
   - 異常系：DB接続エラー
3. クロール処理
   - 正常系：単一URL/複数URL
   - 異常系：タイムアウト、APIエラー
4. リトライ処理
   - リトライカウントの増加
   - 最大リトライ回数超過
5. 並列処理
   - 複数タスクの同時実行
   - リソース使用量の確認
6. エラーハンドリング
   - エラーログの記録
   - 処理の独立性確認

## 見積もり工数
- 基盤実装: 1人日
- Edge Function実装: 2人日
合計: 3人日 