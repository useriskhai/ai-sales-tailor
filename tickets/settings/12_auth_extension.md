# 認証機能の拡張

## 概要
既存のSupabase認証機能を拡張し、より細かな権限管理と認証フローの改善を実装します。

## 現状
- Supabaseによる基本的な認証機能は実装済み
- メール/パスワード認証とGoogleログインが利用可能
- 権限管理が最小限

## タスク

### 1. 権限管理の実装
- ロールベースのアクセス制御
  - ユーザーロールの定義
  - 権限の階層構造
  - リソースごとの権限設定
- アクセス制御の実装
  - APIエンドポイントの保護
  - データアクセスの制限
  - 操作権限の確認

### 2. 認証フローの改善
- セッション管理の強化
  - トークン有効期限の最適化
  - リフレッシュトークンの実装
  - セッション無効化機能
- 多要素認証の実装
  - 2要素認証のオプション
  - バックアップコードの生成
  - リカバリーフロー

### 3. セキュリティ強化
- パスワードポリシーの強化
  - 複雑性要件の設定
  - 定期的な変更要求
  - 履歴管理
- アクセスログの管理
  - ��細なログ記録
  - 異常検知
  - 監査機能

## 技術仕様

### データモデル拡張
```typescript
interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

interface UserPermission {
  id: string;
  name: string;
  resource_type: string;
  actions: string[];
  conditions?: Record<string, any>;
}

interface UserSession {
  id: string;
  user_id: string;
  device_info: {
    browser: string;
    os: string;
    ip: string;
  };
  last_active: string;
  expires_at: string;
  is_valid: boolean;
}
```

### API仕様

#### assignRole
- メソッド: POST
- エンドポイント: `/auth-operations`
- リクエストボディ:
```typescript
{
  action: 'assignRole',
  data: {
    user_id: string;
    role_id: string;
  }
}
```

#### checkPermission
- メソッド: POST
- エンドポイント: `/auth-operations`
- リクエストボディ:
```typescript
{
  action: 'checkPermission',
  data: {
    user_id: string;
    resource_type: string;
    action: string;
    resource_id?: string;
  }
}
```

#### manageSessions
- メソッド: POST
- エンドポイント: `/auth-operations`
- リクエストボディ:
```typescript
{
  action: 'manageSessions',
  data: {
    user_id: string;
    operation: 'list' | 'revoke' | 'revokeAll';
    session_id?: string;
  }
}
```

## 関連ファイル
- `src/pages/login.tsx`
- `src/contexts/AuthContext.tsx`
- `supabase/functions/_shared/auth.ts`

## 優先度
中

## 担当
バックエンドエンジニア

## 見積もり工数
3人日

## テスト要件
1. ユニットテスト
   - 権限チェックのテスト
   - セッション管理のテスト
   - パスワードポリシーのテスト
   - 多要素認証のテスト

2. 統合テスト
   - 認証フローのテスト
   - 権限管理のテスト
   - セキュリティ機能のテスト
   - エラーハンドリングのテスト

## 注意事項
- 既存の認証フローの維持
- セキュリティベストプラクティス
- パフォーマンスへの影響
- ユーザー体験の考慮
- データ保護とプライバシー 