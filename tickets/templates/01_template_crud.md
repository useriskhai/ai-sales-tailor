# ✅ テンプレートの作成・更新・削除API実装

## 概要
テンプレートの基本的なCRUD操作を実装し、テンプレート管理機能を完成させます。

## 現状
- 現在は`fetchTemplates`と`updateTemplateMetrics`のみ実装されている
- テンプレートの作成・更新・削除機能が未実装

## タスク

### 1. `createTemplate`APIの実装
- テンプレート名、内容、属性、タグの登録
- ユーザーIDとの紐付け
- バリデーション処理の実装
- 重複チェックの実装

### 2. `updateTemplate`APIの実装
- テンプレート情報の更新
- 属性とタグの更新
- 更新履歴の記録
- 楽観的ロックの実装

### 3. `deleteTemplate`APIの実装
- 関連するメトリクス、属性、タグの削除
- 論理削除の実装
- 参照整合性の確認

## 技術仕様

### データモデル
```typescript
interface Template {
  id: string;
  name: string;
  content: string;
  user_id: string;
  attributes: TemplateAttribute[];
  tags: TemplateTag[];
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}
```

### API仕様

#### createTemplate
- メソッド: POST
- エンドポイント: `/template-operations`
- リクエストボディ:
```typescript
{
  action: 'createTemplate',
  data: {
    name: string;
    content: string;
    attributes?: TemplateAttribute[];
    tags?: string[];
  }
}
```

#### updateTemplate
- メソッド: POST
- エンドポイント: `/template-operations`
- リクエストボディ:
```typescript
{
  action: 'updateTemplate',
  data: {
    id: string;
    name?: string;
    content?: string;
    attributes?: TemplateAttribute[];
    tags?: string[];
  }
}
```

#### deleteTemplate
- メソッド: POST
- エンドポイント: `/template-operations`
- リクエストボディ:
```typescript
{
  action: 'deleteTemplate',
  data: {
    id: string;
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
3人日

## テスト要件
1. ユニットテスト
   - 各APIの正常系テスト
   - バリデーションテスト
   - エラーハンドリングテスト

2. 統合テスト
   - フロントエンドとの連携テスト
   - 権限チェックテスト
   - パフォーマンステスト

## 注意事項
- 認証・認可の適切な実装
- 入力値のバリデーション
- エラーハンドリングの実装
- パフォーマンスの考慮 