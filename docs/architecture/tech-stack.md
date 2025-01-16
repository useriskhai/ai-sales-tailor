# 技術スタック

最終更新日: 2024-12-27

## フロントエンド

### コア技術
- **フレームワーク:** Next.js 14.2.16
- **言語:** TypeScript
- **状態管理:** Zustand
- **UIライブラリ:** 
  - Tailwind CSS
  - Radix UI
  - shadcn/ui

### 主要パッケージ
- **フォーム管理:** React Hook Form
- **バリデーション:** Zod
- **日付処理:** date-fns
- **HTTP通信:** Axios
- **ファイル処理:** 
  - XLSX（Excelファイル）
  - pdf-parse（PDFファイル）

## バックエンド

### インフラストラクチャ
- **プラットフォーム:** Supabase
- **データベース:** PostgreSQL 15
- **認証:** Supabase Auth
- **ストレージ:** Supabase Storage
- **Functions:** Deno（Edge Functions）

### 外部API
- **AI機能:**
  - OpenAI API（GPT-4）
  - Anthropic API（Claude）
- **検索機能:** Google Custom Search API

## 開発環境

### 必須ツール
- Node.js 18以上
- Docker Desktop
- Supabase CLI
- Git

### 推奨ツール
- VSCode
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
- Postman/Insomnia（API開発）

## テスト

### テストフレームワーク
- Jest
- React Testing Library
- Playwright（E2Eテスト）

### テストカバレッジ
- **ユニットテスト:** Jest
- **統合テスト:** React Testing Library
- **E2Eテスト:** Playwright

## CI/CD

### プラットフォーム
- GitHub Actions
- Vercel

### 主要なワークフロー
- プルリクエスト時の自動テスト
- mainブランチへのマージ時の自動デプロイ
- Supabase Functionsの自動デプロイ

## モニタリング

### エラー監視
- Sentry

### パフォーマンス監視
- Vercel Analytics
- Supabase Monitoring

## セキュリティ

### 認証
- JWT認証
- OAuth2.0（Google, GitHub）

### データ保護
- Row Level Security（RLS）
- 環境変数による機密情報管理

## バージョン管理
- **バージョン管理システム:** Git
- **ホスティング:** GitHub
- **ブランチ戦略:** GitHub Flow

## ドキュメント
- Markdown
- Draw.io（図表作成）
- Swagger/OpenAPI（API仕様） 