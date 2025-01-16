# 登録済み企業の重複検索問題の分析

## 現在のディレクトリ構造
```
src/
├── components/
│   ├── SearchCompany.tsx      # 企業検索UI
│   └── CompanyManager.tsx     # 企業管理UI
├── types/
│   └── company.ts            # 企業関連の型定義
└── utils/
    └── generate-message.ts   # ユーティリティ関数

supabase/
├── functions/
│   ├── search-company/       # 企業検索API
│   │   └── index.ts
│   ├── company-operations/   # 企業操作API
│   │   └── index.ts
│   └── _shared/             # 共有モジュール
│       ├── cors.ts
│       ├── supabase-client.ts
│       └── types.ts
└── migrations/              # データベースマイグレーション
```

## 現在の問題点
1. 一度DBに登録した企業が検索結果に再度表示される
2. 除外処理が正しく機能していない
3. 型エラーが発生している

## エラーログ
```typescript
// 型エラー（search-company/index.ts）
Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
```

## 現在の実装フロー
1. 検索処理（search-company/index.ts）
   - Google Custom Search APIで企業を検索
   - 除外企業と重複をフィルタリング
   - 結果を返却

2. 除外企業の取得（company-operations/index.ts）
```typescript
export async function getExcludedCompanies(userId: string) {
  // 除外企業を取得
  const { data: excludedData } = await supabase
    .from('excluded_companies')
    .select(\`
      company_id,
      companies (
        id,
        url
      )
    \`)
    .eq('user_id', userId);

  // 登録済み企業を取得
  const { data: registeredData } = await supabase
    .from('companies')
    .select('id, url')
    .eq('user_id', userId);

  // URLを結合して返却
  const excludedUrls = excludedData.map(...)
  const registeredUrls = registeredData.map(...)
  return [...excludedUrls, ...registeredUrls];
}
```

3. 企業登録処理（company-operations/index.ts）
```typescript
export async function insertCompanyData(
  userId: string, 
  companies: Partial<Company>[], 
  searchKeyword: string,
  excludedCompanies?: { id: string, url: string }[]
) {
  const insertedCompanies = await insertCompanies(companies);
  await insertSearchLogs(userId, insertedCompanies, searchKeyword);
  
  if (excludedCompanies?.length) {
    await insertExcludedCompanies(userId, excludedCompanies);
  }
}
```

## 考えられる問題点
1. 除外企業の取得
   - user_idによる絞り込みが不十分
   - URLの正規化が不統一

2. 検索結果のフィルタリング
   - 型の不一致による除外処理の失敗
   - Set使用時の型安全性の問題

3. データベース設計
   - companies テーブルとの関連付けが不明確
   - URLのユニーク制約の扱いが不明確

## 必要な情報
1. データベーススキーマの詳細
2. 企業登録時のURL正規化ルール
3. 除外企業テーブルの具体的な使用方法
4. ユーザーIDと企業の関連付け方法

## 分析と対策のポイント
1. データの流れの追跡
   - 検索 → 除外処理 → 結果表示
   - 登録 → DB保存 → 除外リスト更新

2. 型の整合性
   - Company型の定義
   - URL処理の一貫性
   - 除外処理での型チェック

3. パフォーマンスと信頼性
   - インデックスの活用
   - トランザクション処理
   - エラーハンドリング

この問題の解決には、上記の情報を基に以下の点を明確にする必要があります：
1. 登録済み企業の判定方法
2. URLの正規化と比較ロジック
3. 型の安全性確保
4. データベースの整合性維持 