-- generated_contentテーブルのcompany_idカラムにNOT NULL制約を追加
ALTER TABLE generated_content
ALTER COLUMN company_id SET NOT NULL;

-- インデックスの作成（存在しない場合のみ）
CREATE INDEX IF NOT EXISTS idx_generated_content_company_id ON generated_content(company_id);

-- 外部キー制約の追加（存在しない場合のみ）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_generated_content_company'
  ) THEN
    ALTER TABLE generated_content
    ADD CONSTRAINT fk_generated_content_company
    FOREIGN KEY (company_id) 
    REFERENCES companies(id)
    ON DELETE CASCADE;
  END IF;
END $$;