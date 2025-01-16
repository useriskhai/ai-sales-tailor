# ユーザー管理機能の実装

## 概要
ユーザープロフィールと設定の管理機能を実装する。

## 詳細
### 実装する機能
1. ユーザー設定
   - 設定情報の取得（APIキー、モデル設定、制限など）
   - 設定の更新/作成
   - デフォルト設定の管理

2. ユーザープロフィール
   - プロフィール情報の取得
   - プロフィール情報の更新
   - アバター画像の管理

3. アバター管理
   - 画像のアップロード
   - 画像の更新
   - 画像の削除

### 技術仕様
- Supabase Storageを使用した画像管理
- プロフィール情報のバリデーション
- 設定値の型チェックと制限

### データモデル
```sql
-- users_settings
CREATE TABLE users_settings (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  api_key TEXT,
  model_settings JSONB,
  limits JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- users_profiles
CREATE TABLE users_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### エラーハンドリング
- 無効な設定値
- 画像アップロード失敗
- ストレージ容量超過
- 不正なファイル形式

## 受け入れ基準
- [ ] ユーザー設定の保存と取得が正常に動作
- [ ] プロフィール情報の更新が正しく反映される
- [ ] アバター画像のアップロードと表示が機能する
- [ ] バリデーションが適切に機能する
- [ ] エラーメッセージが適切に表示される

## 関連リソース
- Supabase Storageドキュメント
- 画像処理ライブラリドキュメント
- APIドキュメント 