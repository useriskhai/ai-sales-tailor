-- 既存の型を削除
DROP TYPE IF EXISTS template_strategy;
DROP TYPE IF EXISTS tone_of_voice;
DROP TYPE IF EXISTS content_focus;

-- 新しい型を作成
CREATE TYPE template_strategy AS ENUM (
  'benefit-first',
  'problem-solution',
  'story-telling',
  'direct-offer'
);

CREATE TYPE tone_of_voice AS ENUM (
  'formal',
  'professional',
  'friendly',
  'casual'
);

CREATE TYPE content_focus AS ENUM (
  'benefit',
  'technical',
  'case-study',
  'roi',
  'relationship'
);

-- 既存のデータを新しい型に変換
UPDATE job_templates
SET settings = jsonb_set(
  settings,
  '{strategy}',
  to_jsonb((settings->>'strategy')::text)
)
WHERE settings->>'strategy' IS NOT NULL;

UPDATE job_templates
SET settings = jsonb_set(
  settings,
  '{tone_of_voice}',
  to_jsonb((settings->>'tone_of_voice')::text)
)
WHERE settings->>'tone_of_voice' IS NOT NULL;

UPDATE job_templates
SET settings = jsonb_set(
  settings,
  '{content_focus}',
  to_jsonb((settings->>'content_focus')::text)
)
WHERE settings->>'content_focus' IS NOT NULL; 