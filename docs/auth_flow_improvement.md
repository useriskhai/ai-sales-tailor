# 認証フロー改善提案

## 概要

テンプレートテスト画面で発生している認証エラー（`認証されていません。再度ログインしてください。`）に対する包括的な改善案を提示します。主な焦点は、セッションの初期化完了前にAPIが呼び出されることを防ぎ、よりスムーズな認証フローを実現することです。

## 改善案の詳細

### 1. セッション初期化の完了を確実に待つ仕組み

#### 1.1 ローディング状態の活用

`useSession` フックの改善:

```typescript
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function getSession() {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        setError(error);
      } else {
        setSession(session);
      }
      setLoading(false);
    }
    getSession();
  }, [supabase]);

  return { session, loading, error };
}
```

テストページでの実装:

```typescript
export default function TemplateTestPage() {
  const { id } = useRouter().query;
  const { session, loading, error } = useSession();
  const { fetchTemplate } = useTemplate(id as string);

  useEffect(() => {
    async function loadTemplate() {
      if (!id) return;
      if (loading) return;
      if (!session) return;
      await fetchTemplate();
    }
    loadTemplate();
  }, [id, fetchTemplate, session, loading]);

  if (loading) {
    return <div>セッションを初期化中…</div>;
  }

  if (!session) {
    return <div>ログインが必要です</div>;
  }

  return (
    <div>
      {/* テンプレートテスト画面の内容 */}
    </div>
  );
}
```

### 2. グローバルな認証状態管理

#### 2.1 AuthContext の実装

```typescript
// AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

type AuthContextProps = {
  session: Session | null;
  loading: boolean;
  error: Error | null;
};

const AuthContext = createContext<AuthContextProps>({
  session: null,
  loading: true,
  error: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(data.session);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    })();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
      }
    );
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

#### 2.2 アプリケーションへの統合

```typescript
// _app.tsx
import { AuthProvider } from '@/context/AuthContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
```

#### 2.3 useTemplate フックの改善

```typescript
export function useTemplate(templateId?: string) {
  const { session } = useAuth();

  const fetchTemplate = useCallback(async () => {
    if (!session?.user?.id) {
      throw new Error('認証されていません。再度ログインしてください。');
    }
    // テンプレート取得処理
  }, [templateId, session]);

  return { fetchTemplate };
}
```

### 3. エラーハンドリングの強化

```typescript
if (error) {
  return (
    <div className="error-container">
      <p>エラーが発生しました: {error.message}</p>
      <button 
        onClick={() => window.location.reload()}
        className="retry-button"
      >
        再読み込み
      </button>
    </div>
  );
}
```

### 4. セッション管理の強化

#### 4.1 トークン期限切れの処理

```typescript
const handleAuthStateChange = async (event: AuthChangeEvent, session: Session | null) => {
  if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
    if (!session) {
      // セッション切れの処理
      router.push('/login');
      showNotification('セッションが切れました。再度ログインしてください。');
    }
  }
};
```

## 期待される効果

1. セッション初期化前のAPI呼び出しによるエラーの防止
2. 一貫した認証状態管理の実現
3. ユーザーフレンドリーなエラーハンドリング
4. 安定したセッション管理

## 実装手順

1. AuthContextの実装と統合
2. useSessionフックの改善
3. テストページの修正
4. エラーハンドリングの実装
5. セッション管理機能の強化

## 注意点

- セッション状態の変更は必ずAuthContextを通して行う
- ローディング状態の適切な管理
- エラーメッセージの多言語対応
- セッショントークンの有効期限の適切な設定

以上の改善を実装することで、より安定した認証フローを実現できます。 