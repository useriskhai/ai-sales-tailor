-- ファイル関連のカラムをproductsテーブルに追加
ALTER TABLE products
ADD COLUMN IF NOT EXISTS file_name text,
ADD COLUMN IF NOT EXISTS file_path text,
ADD COLUMN IF NOT EXISTS file_url text,
ADD COLUMN IF NOT EXISTS file_size integer,
ADD COLUMN IF NOT EXISTS content_type text,
ADD COLUMN IF NOT EXISTS uploaded_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP;

-- uploaded_filesテーブルのデータをproductsテーブルに移行
UPDATE products p
SET
  file_name = u.file_name,
  file_path = u.file_path,
  file_url = u.file_url,
  uploaded_at = u.created_at
FROM uploaded_files u
WHERE p.id = u.product_id;

-- uploaded_filesテーブルを削除
DROP TABLE IF EXISTS uploaded_files;

-- コメントを追加
COMMENT ON COLUMN products.file_name IS 'アップロードされたPDFのファイル名';
COMMENT ON COLUMN products.file_path IS 'ストレージ内のファイルパス';
COMMENT ON COLUMN products.file_url IS 'ファイルの公開URL';
COMMENT ON COLUMN products.file_size IS 'ファイルサイズ（バイト）';
COMMENT ON COLUMN products.content_type IS 'ファイルのMIMEタイプ';
COMMENT ON COLUMN products.uploaded_at IS 'ファイルのアップロード日時'; 