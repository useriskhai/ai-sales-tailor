# テンプレート取得APIの改良

## 概要
既存のテンプレート取得APIを拡張し、より柔軟な検索と取得機能を実装します。

## 現状
- 基本的な取得機能は実装済み
- フィルタリングやページネーション機能が不足
- 単一テンプレート取得APIが未実装

## タスク

### 1. `fetchTemplates`APIの拡張
- カテゴリ、業界、タグによるフィルタリング機能
- 検索キーワードによる絞り込み機能
- ページネーション対応
- ソート機能の追加

### 2. `fetchTemplate`（単一テンプレート取得）APIの実装
- IDによるテンプレート取得
- 関連データ（メトリクス、属性、タグ）の同時取得
- アクセス権限の確認

## 技術仕様

### API仕様

#### fetchTemplates（拡張版）
- メソッド: POST
- エンドポイント: `/template-operations`
- リクエストボディ:
```typescript
{
  action: 'fetchTemplates',
  data: {
    filters?: {
      categories?: string[];
      industries?: string[];
      tags?: string[];
      keyword?: string;
    };
    pagination?: {
      page: number;
      perPage: number;
    };
    sort?: {
      field: 'name' | 'created_at' | 'updated_at' | 'success_rate';
      order: 'asc' | 'desc';
    };
    includeMetrics?: boolean;
    includeAttributes?: boolean;
    includeTags?: boolean;
  }
}
```

#### fetchTemplate
- メソッド: POST
- エンドポイント: `/template-operations`
- リクエストボディ:
```typescript
{
  action: 'fetchTemplate',
  data: {
    id: string;
    includeMetrics?: boolean;
    includeAttributes?: boolean;
    includeTags?: boolean;
  }
}
```

## 関連ファイル
- `supabase/functions/template-operations/index.ts`
- `supabase/functions/_shared/types.ts`

## 優先度
高

## 担当
バックエンドエンジニア

## 見積もり工数
2人日

## テスト要件
1. ユニットテスト
   - フィルタリングのテスト
   - ページネーションのテスト
   - ソート機能のテスト
   - 権限チェックのテスト

2. 統合テスト
   - フロントエンドとの連携テスト
   - パフォーマンステスト
   - エラーハンドリングテスト

## 注意事項
- N+1問題の回避
- インデックスの適切な設定
- キャッシュの活用
- クエリパフォーマンスの最適化 