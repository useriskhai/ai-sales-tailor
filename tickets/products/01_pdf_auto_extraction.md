# PDF製品資料からの自動情報抽出機能の実装

## 実装状況
- [x] データモデルの設計と実装
- [x] PDFアップロード機能の実装
- [x] 解析結果表示・編集UIの実装
- [x] AI解析機能の基本実装
- [ ] PDFテキスト抽出機能の実装
- [ ] Edge Functionのデプロイ
- [ ] 統合テストの実施

## 概要
製品情報の登録時にPDFをアップロードすると、AIを使用して自動的に重要な情報を抽出し、製品情報として保存する機能を実装する。

## 現状の実装
### generate-llm関数
- Anthropic（Claude）とOpenAIのモデルに対応
- プロンプトの戦略とトーンを制御する機能あり
- テキスト生成に特化した実装

### データモデル
```sql
-- 製品情報テーブル
create table products (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  name text not null,
  usp text,                    -- 主要な価値提案
  description text,            -- 製品概要
  benefits text[] default '{}',  -- 導入効果（具体的なメリット）
  solutions text[] default '{}', -- 課題解決策
  price_range text,            -- 価格帯
  case_studies jsonb default '[]'::jsonb, -- 導入事例
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- アップロードファイル管理テーブル
create table uploaded_files (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  product_id uuid references products(id),
  file_path text not null,
  file_name text not null,
  file_size integer not null,
  content_type text not null,
  analysis_status text not null,
  analysis_result jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
```

## 目的
- 製品情報登録の効率化
- 情報抽出の精度と一貫性の向上
- ユーザーの入力負担の軽減

## 実装詳細

### 1. PDFアップロード機能の実装 ✅
- [x] Supabase Storageの設定
  - [x] バケットの作成（products-pdf）
  - [x] アクセス制御の設定
  - [x] ファイル命名規則の設定
- [x] PDFファイルのアップロード処理
  - [x] ファイルサイズ制限（最大10MB）
  - [x] 対応フォーマット検証（PDF only）
  - [x] プログレス表示の実装

### 2. PDF解析機能の実装 ⚠️
- [ ] PDFパーサーの導入（pdf-parse）
  - [ ] テキスト抽出の最適化
  - [ ] 日本語文字化け対策
  - [ ] 改行・スペース処理
- [ ] 解析結果の一時保存
  - [ ] Redis/KVストレージの導入
  - [ ] キャッシュ有効期限の設定

### 3. AI解析機能の実装 ✅
- [x] `generate-llm` Edge Functionの拡張
  - [x] PDFコンテンツ解析用のプロンプト設計
  - [x] 情報抽出ロジックの実装
  - [x] エラーハンドリングの強化
- [x] 以下の情報を自動抽出
  - [x] USP（主要な価値提案）
  - [x] 製品概要
  - [x] 導入効果（具体的なメリット、最大5つ）
  - [x] 課題解決策（最大5つ）
  - [x] 価格帯
  - [x] 導入事例（代表的な1-2件）
    - [x] 業界
    - [x] 企業規模
    - [x] 課題
    - [x] 効果

### 4. UI/UX実装 ✅
- [x] アップロードコンポーネントの実装
  - [x] ドラッグ&ドロップ対応
  - [x] ファイル選択ダイアログ
  - [x] バリデーションフィードバック
- [x] プログレス表示
  - [x] アップロード進捗
  - [x] 解析状態の表示
  - [x] エラー表示
- [x] 抽出結果の編集UI
  - [x] プレビュー表示
  - [x] インライン編集機能
  - [x] 変更履歴の管理

## 注意事項
- メモリ使用量の最適化
  - PDFパース時のチャンク処理
  - 一時ファイルの適切な削除
- エラーハンドリング
  - ファイル形式エラー
  - 解析タイムアウト
  - API制限エラー
- プログレス表示
  - 段階的な進捗表示
  - エラー状態の表示
  - リトライ機能
- データの整合性
  - 一時データの有効期限設定
  - 永続化時の検証
  - 重複アップロード防止

## テスト項目
1. ファイルアップロード
   - 各種PDFフォーマットの対応確認
   - サイズ制限の動作確認
   - エラーケースの検証
2. 情報抽出
   - 日本語文字化け対策の確認
   - 抽出精度の検証
   - タイムアウト処理の確認
3. UI/UX
   - プログレス表示の動作確認
   - エラー表示の確認
   - 編集機能の動作確認
4. パフォーマンス
   - 大容量ファイルの処理
   - 同時アップロード時の挙動
   - メモリ使用量の監視
5. データ永続化
   - 保存処理の確認
   - 一時データの削除確認
   - データ整合性の検証 