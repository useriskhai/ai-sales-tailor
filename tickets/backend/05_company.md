# 企業管理機能の実装

## 概要
営業対象企業の管理機能を実装する。

## 詳細
### 実装する機能
1. 企業基本操作
   - 企業情報の検索
   - 新規企業追加
   - 企業情報編集
   - 企業情報削除

2. データインポート/エクスポート
   - CSVインポート
   - CSVエクスポート
   - 一括追加機能

3. 送信グループ管理
   - グループ作成/更新/削除
   - グループへの企業追加/削除
   - グループ企業一覧取得

### 技術仕様
- 全文検索の実装
- CSVパーサーの実装
- バッチ処理の最適化

### データモデル
```sql
-- companies
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  industry TEXT,
  size TEXT,
  location TEXT,
  website TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- sending_groups
CREATE TABLE sending_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- group_companies
CREATE TABLE group_companies (
  group_id UUID REFERENCES sending_groups(id),
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (group_id, company_id)
);
```

### エラーハンドリング
- 重複企業データ
- 無効なCSVフォーマット
- データ整合性エラー
- インポート/エクスポート失敗

## 受け入れ基準
- [ ] 企業情報のCRUD操作が正常に動作
- [ ] CSVインポート/エクスポートが正しく機能
- [ ] 送信グループ管理が適切に動作
- [ ] 検索機能が期待通りの結果を返す
- [ ] エラーハンドリングが適切に機能する

## 関連リソース
- CSVパーサーライブラリ
- 全文検索エンジン設定
- データベース設計ドキュメント 