# ファイルアップロード機能の実装

## 概要
プロダクトPDFなどのファイルアップロード機能を実装する。

## 詳細
### 実装する機能
1. ファイルアップロード
   - PDFアップロード
   - 画像アップロード
   - ファイル検証
   - メタデータ抽出

2. ストレージ管理
   - ファイル保存
   - アクセス制御
   - 容量管理
   - 有効期限管理

3. コンテンツ処理
   - PDFテキスト抽出
   - OCR処理
   - メタデータ管理
   - インデックス作成

### 技術仕様
- Supabase Storage
- PDFパーサー
- OCRエンジン
- ファイル処理パイプライン

### データモデル
```sql
-- uploaded_files
CREATE TABLE uploaded_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- file_contents
CREATE TABLE file_contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id UUID REFERENCES uploaded_files(id),
  content_type TEXT NOT NULL,
  content TEXT,
  extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### エラーハンドリング
- アップロード失敗
- ファイル形式エラー
- 容量超過
- 処理タイムアウト

## 受け入れ基準
- [ ] ファイルアップロードが正常に動作
- [ ] コンテンツ抽出が正確
- [ ] ストレージ管理が適切
- [ ] アクセス制御が機能する
- [ ] エラーハンドリングが適切

## 関連リソース
- Supabase Storageドキュメント
- PDFパーサーライブラリ
- OCRエンジン仕様 