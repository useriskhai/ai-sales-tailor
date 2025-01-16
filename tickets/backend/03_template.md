# テンプレート管理機能の実装

## 概要
営業メールテンプレートの管理機能を実装する。

## 詳細
### 実装する機能
1. テンプレート基本操作
   - 新規テンプレート作成
   - テンプレート更新
   - テンプレート削除
   - テンプレート取得（単一/一覧）

2. テンプレート分析
   - パフォーマンス分析
   - 類似テンプレート検索
   - 業界別インサイト生成
   - プロンプト最適化
   - 最適化ルールの更新

3. テンプレートテスト
   - テストケースの作成/更新/削除
   - テストの実行管理
   - テスト結果の分析
   - 改善提案の生成

### 技術仕様
- OpenAI APIを使用した分析
- パフォーマンス指標の計算
- テスト自動化の実装

### データモデル
```sql
-- templates
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  settings JSONB,
  metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- template_tests
CREATE TABLE template_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES templates(id),
  test_case TEXT NOT NULL,
  expected_result TEXT,
  actual_result TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### エラーハンドリング
- API呼び出し失敗
- 無効なテンプレート形式
- テスト実行エラー
- 分析処理タイムアウト

## 受け入れ基準
- [ ] テンプレートのCRUD操作が正常に動作
- [ ] 分析機能が正確な結果を返す
- [ ] テスト機能が期待通りに動作
- [ ] パフォーマンス指標が正しく計算される
- [ ] エラーハンドリングが適切に機能する

## 関連リソース
- OpenAI APIドキュメント
- テスト自動化フレームワーク
- 分析アルゴリズム仕様 