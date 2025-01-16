# Edge Functions認証エラーの修正

## 概要
テンプレート操作時の認証エラー（401）を修正し、安定した認証フローを実装する。

## 現状の問題
1. Edge Functions認証エラー
   - `getUser`メソッドによる非推奨の認証検証
   - トークン更新ロジックの不備
   - 認証エラー時の不適切なエラーハンドリング

2. クライアント初期化の不一致
   - フロントエンド：複数の初期化方法が混在
   - Edge Functions：トークン自動更新が無効

3. エラーハンドリングの不備
   - 詳細なエラーログの不足
   - 再試行ロジックの未実装
   - エラーメッセージの不統一

## 修正方針

### 1. Edge Functions側の修正
```typescript
// supabase/functions/_shared/supabase-client.ts
export function createSupabaseClient(options = {}) {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      ...options
    }
  });
}

// supabase/functions/template-operations/index.ts
async function verifyAuth(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('認証トークンが必要です');
  }

  const token = authHeader.split(' ')[1];
  const { data: { session }, error } = await supabase.auth.getSession(token);
  
  if (error || !session?.user) {
    console.error('Auth verification failed:', { error, token: token.slice(0, 10) + '...' });
    throw new Error('認証に失敗しました');
  }

  return session.user;
}
```

### 2. フロントエンド側の修正
```typescript
// src/contexts/SupabaseContext.tsx
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createBrowserSupabaseClient({
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }));

  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}

// src/hooks/useTemplate.ts
export function useTemplate(id: string) {
  const retryCount = 3;
  const retryDelay = 1000;

  async function fetchWithRetry(attempt = 0) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('認証セッションが見つかりません');

      const response = await supabase.functions.invoke('template-operations', {
        body: { action: 'fetchTemplate', data: { id } },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (response.error) throw response.error;
      return response.data;
    } catch (error) {
      if (attempt < retryCount) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return fetchWithRetry(attempt + 1);
      }
      throw error;
    }
  }
}
```

## 実装手順

1. Edge Functions認証の修正
   - `getUser`から`getSession`への移行
   - トークン検証ロジックの改善
   - エラーログの強化

2. クライアント初期化の統一
   - フロントエンド側の初期化方法を統一
   - Edge Functions側の設定を最適化
   - セッション管理の改善

3. エラーハンドリングの強化
   - 再試行ロジックの実装
   - エラーメッセージの統一
   - ログ出力の改善

## 影響範囲
- `template-operations`関連の全機能
- 認証を必要とする他のEdge Functions
- フロントエンドの認証関連コード

## 注意事項
1. 後方互換性の維持
2. セッション管理の一貫性確保
3. エラーメッセージの多言語対応

## 受け入れ基準
1. テンプレート操作時の401エラーが解消されている
2. トークンの自動更新が正常に機能する
3. エラー時の適切なフィードバックが表示される
4. ログに十分な情報が出力される