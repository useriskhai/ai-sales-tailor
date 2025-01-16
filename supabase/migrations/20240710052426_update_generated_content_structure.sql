-- generated_contentテーブルの更新
ALTER TABLE generated_content
DROP COLUMN company,
DROP COLUMN company_description,
DROP COLUMN company_url,
ADD COLUMN company_id UUID REFERENCES companies(id);

-- インデックスの更新
DROP INDEX IF EXISTS idx_generated_content_company;
DROP INDEX IF EXISTS idx_generated_content_company_description;
DROP INDEX IF EXISTS idx_generated_content_company_url;

-- 新しいインデックスの作成
CREATE INDEX idx_generated_content_company_id ON generated_content(company_id);

-- 外部キー制約の追加（もし既に追加されていない場合）
ALTER TABLE generated_content
ADD CONSTRAINT fk_generated_content_company
FOREIGN KEY (company_id) 
REFERENCES companies(id)
ON DELETE CASCADE;