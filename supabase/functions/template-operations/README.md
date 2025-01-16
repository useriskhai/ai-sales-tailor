# template-operations

テンプレート作成・管理機能を提供する Edge Function。

## エンドポイント

- `POST /`: テンプレート操作のエンドポイント

## リクエストボディ

```json
{
  "action": "createTemplate" | "updateTemplate" | "fetchTemplate" | "fetchTemplates" | "deleteTemplate",
  "data": {
    // 各アクションに必要なデータ
  }
}
```

詳細は [tickets/16_template_creation_completion.md](tickets/16_template_creation_completion.md) を参照してください。

## 開発手順

1. `supabase/functions/template-operations` ディレクトリを作成。
2. `index.ts` に Edge Function のロジックを実装。
3. 必要に応じて、共有ファイル (`_shared`) を利用。

## 注意事項

- 環境変数が正しく設定されていることを確認してください。
- エラーハンドリングを適切に行ってください。