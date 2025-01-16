# テンプレート作成機能の実装完了

## 変更内容

### Edge Functions認証チェックの削除とユーザーID取得方法の変更
- Edge Functionsの認証チェックを削除し、`product-operations`と同じパターンで実装
- ユーザーIDの取得方法を変更：
  - 認証チェックからの取得 → リクエストボディからの取得
  - `handleTemplateAction`関数の引数を修正
  - ユーザーIDのバリデーションを追加

### 変更点
- `template-operations/index.ts`から認証チェック（`verifyAuth`）を削除
- リクエスト処理を`product-operations`と同じパターンに統一
- エラーハンドリングとCORSヘッダーの処理は維持
- `handleTemplateAction`関数の修正：
  ```typescript
  async function handleTemplateAction(action: string, data: any) {
    const userId = data.userId;
    if (!userId) {
      throw new Error('ユーザーIDは必須です');
    }
    // ... アクション処理
  }
  ```

## 概要
テンプレート作成機能のためのEdge Functionを実装する。既存の`product-operations`の実装パターンに倣い、`template-operations`として実装する。

## 実装詳細

### 1. ファイル構成
```
supabase/functions/template-operations/
├── index.ts
└── README.md
```

### 2. 主要な機能
- テンプレートの作成（createTemplate）
- テンプレートの更新（updateTemplate）
- テンプレートの取得（fetchTemplate）
- テンプレートの削除（deleteTemplate）
- テンプレート一覧の取得（fetchTemplates）

### 3. データ構造
```typescript
// src/types/template.tsから継承
export type Category = 
  | '新規開拓'
  | 'フォローアップ'
  | '商談促進'
  | '関係維持'
  | 'キャンペーン告知'
  | '製品アップデート案内';

interface TemplateData {
  name: string;
  content: string;
  category: Category;
  promptConfig: PromptConfig;
  optimizationRules?: OptimizationRules;
  settings?: TemplateSettings;
  metrics?: TemplateMetrics;
}

interface TemplateContent {
  strategy: {
    type: Strategy;
    customInstructions?: string;
  };
  execution: {
    preferredMethod: PreferredMethod;
    parallelTasks: number;
    retryAttempts: number;
  };
  kpi: KPISettings;
}
```

### 4. API仕様

#### createTemplate
```typescript
// リクエスト
{
  action: 'createTemplate',
  data: {
    name: string;
    content: string;
    category: Category;
    promptConfig: PromptConfig;
    optimizationRules?: OptimizationRules;
    settings?: TemplateSettings;
  }
}

// レスポンス
{
  success: true;
  data: {
    id: string;
    name: string;
    content: string;
    category: Category;
    created_at: string;
    promptConfig: PromptConfig;
    optimizationRules?: OptimizationRules;
    settings?: TemplateSettings;
  }
}
```

#### updateTemplate
```typescript
// リクエスト
{
  action: 'updateTemplate',
  data: {
    id: string;
    name?: string;
    content?: string;
    category?: Category;
    promptConfig?: Partial<PromptConfig>;
    optimizationRules?: Partial<OptimizationRules>;
    settings?: Partial<TemplateSettings>;
  }
}

// レスポンス
{
  success: true;
  data: Template;
}
```

#### fetchTemplate
```typescript
// リクエスト
{
  action: 'fetchTemplate',
  data: {
    id: string;
  }
}

// レスポンス
{
  data: Template;
}
```

#### fetchTemplates
```typescript
// リクエスト
{
  action: 'fetchTemplates',
  data: {
    page: number;
    itemsPerPage: number;
    searchTerm?: string;
    category?: Category;
  }
}

// レ��ポンス
{
  data: Template[];
  count: number;
}
```

### 5. エラーハンドリング
- 各アクションで適切なエラーハンドリングを実装
- エラーレスポンスは統一フォーマットで返却
```typescript
{
  error: string;
  details?: any;
  code?: string; // エラーコード（例: 'TEMPLATE_NOT_FOUND', 'INVALID_CATEGORY'）
}
```

### 6. 実装手順

1. Edge Function基本構造の実装
   - CORS設定の適用（`_shared/cors.ts`を使用）
   - Supabaseクライアントの設定（`_shared/supabase-client.ts`を使用）
   - リクエストハンドラの実装（認証トークンの検証含む）

2. アクションハンドラの実装
```typescript
async function handleTemplateAction(action: string, data: any) {
  switch (action) {
    case 'createTemplate':
      return await createTemplate(data);
    case 'updateTemplate':
      return await updateTemplate(data);
    case 'fetchTemplate':
      return await fetchTemplate(data.id);
    case 'fetchTemplates':
      return await fetchTemplates(data);
    case 'deleteTemplate':
      return await deleteTemplate(data.id);
    default:
      throw new Error(`不明なテンプレートアクション: ${action}`);
  }
}
```

3. 各アクション関数の実装
   - データベースアクセス処理の実装
   - バリデーション処理の実装
   - エラーハンドリングの実装

### 7. フロントエンド連携
`CreateTemplateDialog.tsx`での使用例：
```typescript
const { data, error } = await supabase.functions.invoke('template-operations', {
  body: {
    action: 'createTemplate',
    data: {
      name: data.basicInfo.name,
      content: JSON.stringify({
        strategy: {
          type: data.messageStrategy.type,
          customInstructions: data.messageStrategy.customInstructions,
        },
        execution: {
          preferredMethod: data.executionSettings.preferredMethod,
          parallelTasks: data.executionSettings.parallelTasks,
          retryAttempts: data.executionSettings.retryAttempts,
        },
        kpi: data.kpiSettings,
      }),
      category: data.basicInfo.category,
      promptConfig: {
        strategy: data.messageStrategy.type,
        toneOfVoice: data.messageStrategy.tone,
        contentFocus: data.messageStrategy.focus,
        maxLength: data.messageStrategy.maxLength,
        customInstructions: data.messageStrategy.customInstructions,
        outputFormat: data.messageStrategy.format,
      },
    }
  }
});
```

## 注意事項
- セキュリティ考慮事項の徹底
  - 認証トークンの検証
  - 入力値のバリデーション
  - SQLインジェクション対策
- パフォーマンス最適化
  - クエリの最適化
  - 不要なデータの削除
- エラーハンドリングの徹底
  - 詳細なエラーメッセージ
  - エラーログの記録
- 適切なログ出力
  - 重要な操作のログ記録
  - エラー発生時のコンテキスト情報

## 受け渡し口の定義
1. フロントエンド（`CreateTemplateDialog.tsx`）
   - `useTemplate` hookを作成し、テンプレート操作のための関数を提供
   - Edge Functionへのリクエスト処理をカプセル化
   - 認証トークンの自動付与
   - エラーハンドリングとトースト通知の統一

2. バックエンド（Edge Function）
   - `template-operations/index.ts`でリクエストを受け付け
   - アクションタイプに応じて適切なハンドラにディスパッチ
   - レスポンスは統一フォーマットで返却
   - 詳細なエラー情報の提供

## 完了条件
- [ ] Edge Functionの実装完了
- [ ] 全てのアクションが正常に動作することを確認
- [ ] エラーハンドリングが適切に実装されていることを確認
- [ ] フロントエンドとの連携が正常に動作することを確認
