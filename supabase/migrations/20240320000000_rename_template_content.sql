-- テンプレート設定のカラム名を変更
ALTER TABLE job_templates 
ADD COLUMN template_settings jsonb;

-- 既存のデータを移行
UPDATE job_templates 
SET template_settings = content::jsonb;

-- NOT NULL制約を追加（既存データの移行が完了した後）
ALTER TABLE job_templates 
ALTER COLUMN template_settings SET NOT NULL;

-- 古いカラムを削除
ALTER TABLE job_templates 
DROP COLUMN content;

-- インデックスの作成
CREATE INDEX idx_job_templates_settings ON job_templates USING gin (template_settings);

-- ロールバック用
-- ALTER TABLE job_templates ADD COLUMN content text;
-- UPDATE job_templates SET content = template_settings::text;
-- ALTER TABLE job_templates ALTER COLUMN content SET NOT NULL;
-- ALTER TABLE job_templates DROP COLUMN template_settings;
-- DROP INDEX idx_job_templates_settings; 