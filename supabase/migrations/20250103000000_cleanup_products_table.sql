-- 不要なカラムの削除
ALTER TABLE products
    DROP COLUMN IF EXISTS features,  -- benefitsとsolutionsで置き換えられているため削除
    DROP COLUMN IF EXISTS file_path, -- file_urlがあれば十分
    DROP COLUMN IF EXISTS content_type; -- PDFのみを扱うため不要

-- ファイル関連フィールドにコメントを追加
COMMENT ON COLUMN products.file_url IS 'PDFファイルの公開URL';
COMMENT ON COLUMN products.file_name IS 'アップロードされたPDFのオリジナルファイル名';
COMMENT ON COLUMN products.file_size IS 'PDFファイルのサイズ（バイト）';

-- NOT NULL制約の追加（必要に応じて）
ALTER TABLE products
    ALTER COLUMN benefits SET NOT NULL,
    ALTER COLUMN solutions SET NOT NULL; 