# クロールキュー処理システムの実装

## 目的
会社情報のクロール処理を効率的かつ信頼性高く実行するため、バッチ処理とCronジョブを使用したキュー処理システムを実装する。

### 背景
- 会社情報の登録/更新時にWebサイトのクロールが必要
- 複数のクロール要求を効率的に処理する必要がある
- 処理の失敗時のリトライ機能が必要

## ファイル構造
```
supabase/
├── migrations/
│   └── 20250107000000_add_crawl_trigger.sql  # 新規作成
└── functions/
    ├── _shared/
    │   └── database.types.ts                  # 新規作成
    └── crawl-company/
        ├── index.ts                          # 実装完了
        └── test.ts                           # 新規作成
```

## 修正対象ファイル

### 1. `supabase/migrations/20250107000000_add_crawl_trigger.sql`
#### 現状
- ファイルが存在しない

#### あるべき姿
以下の機能を実装：
- クロールキューテーブルの作成
- バッチキューテーブルの作成
- トリガー関数の実装
- キュー処理関数の実装
- Cronジョブの設定

#### 修正内容
- [x] `crawl_batch_queue`テーブルの作成
- [x] `handle_company_crawl()`トリガー関数の実装
- [x] `process_crawl_queue()`関数の実装
- [x] `setup_crawl_cron()`関数の実装
- [x] Cronジョブのスケジュール設定

### 2. `supabase/functions/crawl-company/index.ts`
#### 現状
- Edge Function側の実装が不完全

#### あるべき姿
- バッチIDに基づいてキューアイテムを取得
- 各会社のWebサイトをクロール
- クロール結果をデータベースに保存
- エラーハンドリングとリトライ機能

#### 修正内容
- [x] バッチ処理の実装
  - [x] キューアイテムの取得
  - [x] 会社情報の取得
  - [x] エラーハンドリング
  - [x] リトライロジック
- [x] クロール処理の実装
  - [x] HTMLコンテンツの取得
  - [x] データベースへの保存
- [x] テストケースの作成
  - [x] 新規会社登録時のテスト
  - [x] URL更新時のテスト
  - [x] エラー時のリトライテスト

### 3. `supabase/functions/_shared/database.types.ts`
#### 現状
- 新規作成

#### あるべき姿
- データベースのテーブル定義を型として表現
- 型安全性の確保

#### 修正内容
- [x] `companies`テーブルの型定義
- [x] `crawl_queue`テーブルの型定義
- [x] `crawl_batch_queue`テーブルの型定義

### 4. `supabase/functions/crawl-company/test.ts`
#### 現状
- 新規作成

#### あるべき姿
- 各機能の動作確認
- エラーケースの検証
- クリーンアップ処理の実装

#### 修正内容
- [x] テストケースの実装
  - [x] 新規会社登録時のテスト
  - [x] URL更新時のテスト
  - [x] エラー時のリトライテスト
- [x] アサーションの追加
- [x] クリーンアップ処理の実装

## 関連ファイル
- `supabase/functions/_shared/types.ts`
  - キュー関連の型定義
- `supabase/functions/proxy-html/index.ts`
  - HTMLコンテンツの取得に使用

## 技術的な詳細

### データベース設計
1. **crawl_batch_queue**
```sql
CREATE TABLE IF NOT EXISTS public.crawl_batch_queue (
  batch_id uuid DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  processed boolean DEFAULT false
);
```

2. **crawl_queue** (既存)
```sql
-- company_id: 対象の会社ID
-- status: pending/processing/completed/failed
-- retry_count: リトライ回数
```

### 処理フロー
1. 会社の新規登録/URL更新時にトリガーが発火
2. クロールキューにエントリを追加
3. バッチキューにバッチを作成
4. Cronジョブ（毎分実行）がバッチを処理
5. Edge Functionがクロール処理を実行
6. 結果をデータベースに保存

### 環境変数
- `app.settings.supabase_url`
- `app.settings.anon_key`

## 進捗状況
- [x] マイグレーションファイルの作成
- [x] テーブルとトリガーの作成
- [x] キュー処理関数の実装
- [x] Cronジョブの設定
- [x] データベース型定義の作成
- [x] バッチ処理の基本実装
- [x] クロール処理の実装
- [x] テストケースの作成
- [ ] 動作確認とデバッグ

## 次のステップ
1. テストの実行
   - ローカル環境での動作確認
   - エラーケースの検証
2. デバッグと改善
   - ログの確認
   - パフォーマンスの最適化
3. 本番環境への適用
   - 環境変数の設定
   - デプロイ手順の確認 