# 企業重複登録問題の分析

## 現在の問題

既存の企業が検索結果に表示され続け、重複登録のエラーが発生しています。

## システム構成

### ディレクトリ構造
```
supabase/functions/
├── company-operations/
│   └── index.ts        # 企業操作の関数群
├── search-company/
│   └── index.ts        # Google検索API連携
└── _shared/
    ├── utils.ts        # URL正規化などのユーティリティ
    └── types.ts        # 共通の型定義
```

### 主要な処理フロー

1. フロントエンド（SearchCompany.tsx）
   - 検索キーワード入力
   - 企業選択
   - 選択企業の登録リクエスト

2. バックエンド
   - `search-company`: Google検索実行
   - `company-operations`: 企業情報の登録処理

## エラーログ分析

### 重要なログポイント

1. 検索時の既存URL確認
```typescript
[Info] 既存URLリストの状態: { 
  count: 0, 
  urls: [], 
  is_array: true, 
  type: "object" 
}
```

2. 登録時の重複チェック
```typescript
[Info] URL比較: {
  new_url: "https://meiji.co.jp",
  existing_url: "https://meiji.co.jp",
  is_duplicate: true
}
```

### 問題点

1. 検索時に既存URLリストが空（count: 0）
2. 登録時に重複として検出
3. 正規化されたURLの比較が機能していない可能性

## 調査が必要な点

1. `SearchCompany.tsx`での既存URL取得ロジック
   - 既存URLリストが空である原因
   - 検索リクエスト時のパラメータ構築

2. `company-operations/index.ts`の重複チェックロジック
   - URL正規化処理の動作確認
   - 重複判定の正確性

3. `search-company/index.ts`のフィルタリング
   - 既存URLとの比較ロジック
   - 正規化URLの扱い

## 改善案の方向性

1. フロントエンド側での対策
   - 検索リクエスト前の既存URL取得確実化
   - 選択済み企業の状態管理改善

2. バックエンド側での対策
   - URL正規化ロジックの統一
   - 重複チェックの二重化（検索時・登録時）

3. ログ強化
   - URL正規化の各段階での詳細ログ
   - 重複判定の判断根拠の明確化

## 確認すべき仮説

1. 既存URLリストが検索時に正しく渡されていない
2. URL正規化処理に不整合がある
3. 重複チェックのタイミングに問題がある

この問題の解決には、フロントエンドとバックエンドの連携部分、特に既存URLリストの受け渡しと、URL正規化ロジックの一貫性に焦点を当てた調査が必要と考えられます。 