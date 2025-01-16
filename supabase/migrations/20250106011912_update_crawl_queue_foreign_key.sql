-- 既存の外部キー制約を削除
ALTER TABLE crawl_queue
DROP CONSTRAINT IF EXISTS crawl_queue_company_id_fkey;

-- ON DELETE CASCADEを指定して外部キー制約を再作成
ALTER TABLE crawl_queue
ADD CONSTRAINT crawl_queue_company_id_fkey
FOREIGN KEY (company_id)
REFERENCES companies(id)
ON DELETE CASCADE;

-- コメントを追加
COMMENT ON CONSTRAINT crawl_queue_company_id_fkey ON crawl_queue IS '企業が削除された時に、関連するクロールキューも自動的に削除されます'; 