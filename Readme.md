# AI営業アシスタント

AI営業アシスタントは、営業活動を効率化し、パーソナライズされた営業文を生成するためのNext.jsベースのウェブアプリケーションです。

## 主な機能

- 製品資料のアップロードとPDF解析
- ターゲット企業の自動検索と選択
- AIを活用したカスタマイズされた営業文の生成
- 設定可能なAPIキーとモデル選択
- カスタマイズ可能なプロンプト

## 技術スタック

- フロントエンド: Next.js, TypeScript, Tailwind CSS, Framer Motion
- バックエンド: Node.js, Express.js
- データベース: PostgreSQL
- 外部API: Google Custom Search API, Claude API

## セットアップ

1. リポジトリをクローン:

   git clone https://github.com/yourusername/ai-sales-assistant.git

   cd ai-sales-assistant

2. 依存関係をインストール:

   npm install

3. 環境変数を設定:
   `.env.local`ファイルを作成し、以下の変数を設定:

    GOOGLE_SEARCH_API_KEY=your_google_search_api_key
    GOOGLE_SEARCH_ENGINE_ID=your_google_search_engine_id
    DATABASE_URL=your_postgresql_database_url

4. データベースのセットアップ:

   npm run db:setup

5. アプリケーションを実行:

   npm run dev

6. ブラウザで`http://localhost:3000`を開きます。

## 使用方法

1. 設定ページでClaude APIキーを入力し、使用するモデルを選択します。
2. メインページで製品資料をアップロードし、製品名を入力します。
3. ターゲット業界を入力し、企業を検索します。
4. 検索結果から不要な企業のチェックを外し、選択を確定します。
5. 「営業文を生成」ボタンをクリックして、AIが作成した営業文を取得します。
6. 必要に応じて生成された文章を編集します。

## 企業検索機能の詳細

- データベースに保存された企業情報を優先的に検索
- 結果が不十分な場合、Google APIを使用して補完
- ユーザーが過去に除外した企業は検索結果から自動的に除外
- 選択された企業情報はデータベースに保存され、将来の検索に活用

## カスタマイズ

プロンプトは設定ページでカスタマイズできます。以下の変数を使用できます：

- `{product}`: 製品名
- `{industry}`: 業界
- `{company}`: ターゲット企業名
- `{fileContent}`: アップロードされた製品資料の内容

## データベース構造

主要なテーブル:
- `companies`: 企業情報
- `industries`: 業界情報
- `company_industries`: 企業と業界の関連付け
- `excluded_companies`: 除外された企業の記録
- `search_logs`: 検索履歴

## 貢献

プルリクエストは歓迎します。大きな変更を加える場合は、まずissueを開いて変更内容を議論してください。

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。