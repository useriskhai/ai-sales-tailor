# テンプレートテスト画面の認証エラー分析

## プロジェクト構成

```
src/
├── components/
│   ├── templates/
│   │   └── pages/
│   │       └── TemplateTestingPanel.tsx
│   └── ui/
│       └── breadcrumb.tsx
├── hooks/
│   ├── useSession.ts
│   └── useTemplate.ts
├── pages/
│   └── templates/
│       └── [id]/
│           └── test.tsx
└── types/
    └── template.ts
```

## 現在の実装

### セッション管理 (`useSession.ts`)
```typescript
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // セッション初期化処理
    async function getSession() {
      const { data: { session }, error } = await supabase.auth.getSession();
      // ...
    }
    // ...
  }, [supabase]);

  return { session, loading, error };
}
```

### テンプレート取得 (`useTemplate.ts`)
```typescript
export function useTemplate(templateId?: string) {
  const { session } = useSession();

  const fetchTemplate = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) {
      throw new Error('認証されていません。再度ログインしてください。');
    }
    // テンプレート取得処理
  }, [templateId, session, supabase]);

  return { fetchTemplate };
}
```

### テストページ (`test.tsx`)
```typescript
export default function TemplateTestPage() {
  const { session } = useSession();
  const { fetchTemplate } = useTemplate(id as string);

  useEffect(() => {
    async function loadTemplate() {
      if (!id || !session) return;
      // テンプレート読み込み処理
    }
    loadTemplate();
  }, [id, fetchTemplate, session]);
}
```

## エラー情報

```
Error: 認証されていません。再度ログインしてください。
at _callee$ (useTemplate.ts:29:15)
```

エラースタックトレースから、以下の実行フローが確認できます：
1. `test.tsx`の`useEffect`が実行
2. `loadTemplate`関数が呼び出し
3. `useTemplate`の`fetchTemplate`が実行
4. セッションチェックでエラー発生

## 現在の問題点

1. **タイミングの問題**
   - セッションの初期化完了前にテンプレート取得が実行される可能性
   - `useSession`の`loading`状態が適切に考慮されていない

2. **セッション状態の伝播**
   - 複数のフックでセッション状態を個別に管理
   - セッション状態の変更が適切に伝播されない可能性

3. **エラーハンドリング**
   - セッション初期化中のエラー状態が明確に区別されていない
   - ユーザーへの適切なフィードバックが不足

## 検討すべき対策

1. セッション初期化の完了を確実に待つ仕組みの実装
2. グローバルな認証状態管理の導入（例：Context API）
3. ローディング状態とエラー状態の詳細な区別
4. ユーザーフレンドリーなエラーメッセージとリカバリーフロー

## 確認が必要な点

1. `useSession`フックの初期化タイミング
2. Supabaseクライアントの設定状態
3. 認証状態の永続化設定
4. セッショントークンの有効期限と更新メカニズム

以上の情報を元に、認証フローの改善案を検討いただけますでしょうか？ 