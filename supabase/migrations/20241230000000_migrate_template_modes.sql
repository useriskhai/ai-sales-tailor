-- 既存のcustomモードをmanualに変換
UPDATE job_templates
SET settings = jsonb_set(
  settings,
  '{mode}',
  '"manual"'::jsonb
)
WHERE settings->>'mode' = 'custom';

-- contentフィールドも更新
UPDATE job_templates
SET content = REPLACE(
  content::text,
  '"mode":"custom"',
  '"mode":"manual"'
)::jsonb
WHERE content::text LIKE '%"mode":"custom"%';

-- 変更されたレコードの数を表示
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % templates from custom to manual mode', updated_count;
END $$; 