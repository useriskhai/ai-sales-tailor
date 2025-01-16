-- 既存のデータをバックアップ
CREATE TABLE IF NOT EXISTS job_templates_backup AS SELECT * FROM job_templates;

-- 列挙型の作成
DO $$ BEGIN
  CREATE TYPE template_mode AS ENUM ('ai_auto', 'manual');
  CREATE TYPE template_strategy AS ENUM ('benefit-first', 'problem-solution', 'story-telling', 'direct-offer');
  CREATE TYPE template_tone AS ENUM ('formal', 'professional', 'friendly', 'casual');
  CREATE TYPE execution_priority AS ENUM ('speed', 'balanced', 'quality');
  CREATE TYPE metric_type AS ENUM ('system', 'custom');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- メトリクスの検証関数を作成
CREATE OR REPLACE FUNCTION validate_metrics(metrics jsonb)
RETURNS boolean AS $$
BEGIN
  -- 配列であることを確認
  IF NOT jsonb_typeof(metrics) = 'array' THEN
    RETURN false;
  END IF;

  -- 各メトリクスの構造を確認
  RETURN (
    SELECT bool_and(
      metric ? 'id' AND
      metric ? 'name' AND
      metric ? 'type' AND
      metric ? 'unit' AND
      metric ? 'target' AND
      metric ? 'weight' AND
      (metric->>'type')::text IN ('system', 'custom') AND
      (metric->>'target')::numeric IS NOT NULL AND
      (metric->>'weight')::numeric BETWEEN 0 AND 1
    )
    FROM jsonb_array_elements(metrics) AS metric
  );
END;
$$ LANGUAGE plpgsql;

-- settingsカラムの構造を更新
UPDATE job_templates
SET settings = jsonb_build_object(
  'mode', 'ai_auto',
  'strategy', 'benefit-first',
  'tone_of_voice', 'professional',
  'max_length', 500,
  'use_emoji', false,
  'execution_priority', 'balanced',
  'metrics', jsonb_build_array(),
  'evaluation_period', '30d',
  'parallel_tasks', COALESCE((settings->>'parallel_tasks')::int, 5),
  'retry_attempts', COALESCE((settings->>'retry_attempts')::int, 3),
  'preferred_method', COALESCE(settings->>'preferred_method', 'FORM')
)
WHERE settings IS NULL OR NOT (
  settings ? 'mode' AND
  settings ? 'strategy' AND
  settings ? 'tone_of_voice' AND
  settings ? 'max_length' AND
  settings ? 'use_emoji' AND
  settings ? 'execution_priority' AND
  settings ? 'metrics' AND
  settings ? 'evaluation_period' AND
  settings ? 'parallel_tasks' AND
  settings ? 'retry_attempts' AND
  settings ? 'preferred_method'
);

-- settingsカラムにNOT NULL制約を追加
ALTER TABLE job_templates 
  ALTER COLUMN settings SET NOT NULL,
  ALTER COLUMN settings SET DEFAULT jsonb_build_object(
    'mode', 'manual',
    'strategy', 'benefit-first',
    'tone_of_voice', 'professional',
    'max_length', 500,
    'use_emoji', false,
    'execution_priority', 'balanced',
    'metrics', jsonb_build_array(),
    'evaluation_period', '30d',
    'parallel_tasks', 5,
    'retry_attempts', 3,
    'preferred_method', 'FORM'
  );

-- settingsカラムの検証制約を追加
ALTER TABLE job_templates
  ADD CONSTRAINT job_templates_settings_check CHECK (
    (settings ? 'mode') AND
    (settings ? 'strategy') AND
    (settings ? 'tone_of_voice') AND
    (settings ? 'max_length') AND
    (settings ? 'use_emoji') AND
    (settings ? 'execution_priority') AND
    (settings ? 'metrics') AND
    (settings ? 'evaluation_period') AND
    (settings ? 'parallel_tasks') AND
    (settings ? 'retry_attempts') AND
    (settings ? 'preferred_method')
  );

-- 既存のデータを新しい制約に合わせて更新
UPDATE job_templates
SET settings = jsonb_build_object(
  'mode', CASE 
    WHEN settings->>'mode' IN ('ai_auto', 'manual') THEN settings->>'mode'
    ELSE 'ai_auto'
  END,
  'strategy', CASE 
    WHEN settings->>'strategy' IN ('benefit-first', 'problem-solution', 'story-telling', 'direct-offer') THEN settings->>'strategy'
    ELSE 'benefit-first'
  END,
  'tone_of_voice', CASE 
    WHEN settings->>'tone_of_voice' IN ('formal', 'professional', 'friendly', 'casual') THEN settings->>'tone_of_voice'
    ELSE 'professional'
  END,
  'max_length', GREATEST(1, LEAST(10000, COALESCE((settings->>'max_length')::int, 500))),
  'use_emoji', COALESCE((settings->>'use_emoji')::boolean, false),
  'execution_priority', CASE 
    WHEN settings->>'execution_priority' IN ('speed', 'balanced', 'quality') THEN settings->>'execution_priority'
    ELSE 'balanced'
  END,
  'metrics', COALESCE(settings->'metrics', '[]'::jsonb),
  'evaluation_period', CASE 
    WHEN settings->>'evaluation_period' IN ('24h', '7d', '30d', '90d') THEN settings->>'evaluation_period'
    ELSE '30d'
  END,
  'parallel_tasks', GREATEST(1, LEAST(100, COALESCE((settings->>'parallel_tasks')::int, 5))),
  'retry_attempts', GREATEST(0, LEAST(10, COALESCE((settings->>'retry_attempts')::int, 3))),
  'preferred_method', CASE 
    WHEN settings->>'preferred_method' IN ('FORM', 'EMAIL', 'HYBRID') THEN settings->>'preferred_method'
    ELSE 'FORM'
  END
);

-- settingsカラムの値の検証制約を追加
ALTER TABLE job_templates
  ADD CONSTRAINT job_templates_settings_values_check CHECK (
    (settings->>'mode')::text IN ('ai_auto', 'manual') AND
    (settings->>'strategy')::text IN ('benefit-first', 'problem-solution', 'story-telling', 'direct-offer') AND
    (settings->>'tone_of_voice')::text IN ('formal', 'professional', 'friendly', 'casual') AND
    (settings->>'max_length')::int BETWEEN 1 AND 10000 AND
    (settings->>'use_emoji')::boolean IS NOT NULL AND
    (settings->>'execution_priority')::text IN ('speed', 'balanced', 'quality') AND
    (settings->>'parallel_tasks')::int BETWEEN 1 AND 100 AND
    (settings->>'retry_attempts')::int BETWEEN 0 AND 10 AND
    (settings->>'preferred_method') IN ('FORM', 'EMAIL', 'HYBRID') AND
    validate_metrics(settings->'metrics') AND
    (settings->>'evaluation_period') IN ('24h', '7d', '30d', '90d')
  ); 