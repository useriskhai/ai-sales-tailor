ALTER TABLE job_templates
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 既存のレコードのdeleted_atをNULLに設定
UPDATE job_templates SET deleted_at = NULL WHERE deleted_at IS NOT NULL;
