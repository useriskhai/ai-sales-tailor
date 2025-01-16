-- 既存のデータを一時的なテキストカラムにバックアップ
ALTER TABLE job_templates ADD COLUMN temp_category text;
UPDATE job_templates SET temp_category = category::text;

-- 既存のENUM型を削除（依存関係があるのでCASCADEを使用）
DROP TYPE template_category CASCADE;

-- 新しいENUM型を作成
CREATE TYPE template_category AS ENUM (
  'new-client-acquisition',
  'existing-client',
  'proposal',
  'follow-up',
  'event-announcement'
);

-- カテゴリカラムを新しい型で再作成
ALTER TABLE job_templates ADD COLUMN category template_category;

-- データを変換して新しいカラムに移行
UPDATE job_templates
SET category = CASE temp_category
  WHEN '新規開拓' THEN 'new-client-acquisition'
  WHEN 'フォローアップ' THEN 'follow-up'
  WHEN '商談促進' THEN 'proposal'
  WHEN '関係維持' THEN 'existing-client'
  WHEN 'キャンペーン告知' THEN 'event-announcement'
  ELSE 'new-client-acquisition'  -- デフォルト値
END::template_category;

-- 一時カラムを削除
ALTER TABLE job_templates DROP COLUMN temp_category;

-- NOT NULL制約を追加（必要な場合）
ALTER TABLE job_templates ALTER COLUMN category SET NOT NULL; 