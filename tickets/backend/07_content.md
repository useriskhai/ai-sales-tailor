# コンテンツ管理機能の実装

## 概要
AIによる営業コンテンツの生成と管理機能を実装する。

## 詳細
### 実装する機能
1. コンテンツ生成
   - AI生成コンテンツの作成
   - テンプレートベースの生成
   - カスタマイズオプション

2. コンテンツ管理
   - 生成コンテンツの取得
   - コンテンツの更新
   - コンテンツの削除
   - 除外企業の管理

3. コンテンツ最適化
   - 文脈に応じた調整
   - トーン調整
   - パーソナライゼーション

### 技術仕様
- OpenAI APIの統合
- コンテンツ生成パイプライン
- 最適化アルゴリズム

### データモデル
```sql
-- contents
CREATE TABLE contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  template_id UUID REFERENCES templates(id),
  company_id UUID REFERENCES companies(id),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- excluded_companies
CREATE TABLE excluded_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  company_id UUID REFERENCES companies(id),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### エラーハンドリング
- AI生成失敗
- コンテンツ制限超過
- API制限到達
- 無効なパラメータ

## 受け入れ基準
- [ ] コンテンツ生成が高品質
- [ ] 生成速度が要件を満たす
- [ ] カスタマイズが正しく反映される
- [ ] 除外企業の管理が適切
- [ ] エラーハンドリングが機能する

## 関連リソース
- OpenAI APIドキュメント
- コンテンツ生成ガイドライン
- 最適化アルゴリズム仕様 