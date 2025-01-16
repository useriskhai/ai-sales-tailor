ALTER TABLE job_templates
ADD COLUMN content TEXT NOT NULL DEFAULT '';

-- 既存のレコードにデフォルト値を設定
UPDATE job_templates
SET content = description
WHERE content = '';
