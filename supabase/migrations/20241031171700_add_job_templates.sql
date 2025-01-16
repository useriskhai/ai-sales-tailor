-- テンプレートカテゴリのEnum型
CREATE TYPE template_category AS ENUM (
  '新規開拓',
  'フォローアップ',
  '商談促進',
  '関係維持',
  'キャンペーン告知',
  '製品アップデート案内'
);

-- テンプレート属性のEnum型
CREATE TYPE template_speed AS ENUM ('高速', '標準', '慎重');
CREATE TYPE template_reliability AS ENUM ('安定重視', 'バランス', 'スピード重視');
CREATE TYPE template_parallelism AS ENUM ('低', '中', '高');
CREATE TYPE template_retry_strategy AS ENUM ('最小限', '標準', '粘り強い');

-- タグテーブル
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ジョブテンプレートテーブル
CREATE TABLE job_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  category template_category NOT NULL,
  recommended BOOLEAN DEFAULT false,
  success_rate INTEGER CHECK (success_rate BETWEEN 0 AND 100),
  average_time INTEGER,
  usage_count INTEGER DEFAULT 0,
  average_response_rate FLOAT,
  is_public BOOLEAN DEFAULT false,
  settings JSONB NOT NULL DEFAULT '{
    "parallel_tasks": 5,
    "retry_attempts": 3,
    "preferred_method": "FORM"
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- テンプレート属性テーブル
CREATE TABLE template_attributes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES job_templates(id) ON DELETE CASCADE,
  speed template_speed NOT NULL,
  reliability template_reliability NOT NULL,
  parallelism template_parallelism NOT NULL,
  retry_strategy template_retry_strategy NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (template_id)
);

-- テンプレートタグ中間テーブル
CREATE TABLE template_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES job_templates(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (template_id, tag_id)
);

-- テンプレートメトリクステーブル
CREATE TABLE template_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES job_templates(id) ON DELETE CASCADE,
  total_uses INTEGER DEFAULT 0,
  successful_uses INTEGER DEFAULT 0,
  average_completion_time FLOAT,
  response_rate FLOAT,
  performance_data JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (template_id)
);

-- インデックス
CREATE INDEX idx_job_templates_category ON job_templates(category);
CREATE INDEX idx_job_templates_recommended ON job_templates(recommended) WHERE recommended = true;
CREATE INDEX idx_job_templates_success_rate ON job_templates(success_rate DESC);
CREATE INDEX idx_template_tags_template_id ON template_tags(template_id);
CREATE INDEX idx_template_tags_tag_id ON template_tags(tag_id);

-- 初期データ: タグ
INSERT INTO tags (name, color, description) VALUES
('高速', '#3B82F6', '処理速度を重視したテンプレート'),
('大量送信', '#10B981', '大規模な送信に適したテンプレート'),
('高応答率', '#F59E0B', '高い応答率を実現したテンプレート'),
('関係構築', '#8B5CF6', '顧客との関係構築を重視したテンプレート'),
('丁寧', '#EC4899', '丁寧なアプローチを行うテンプレート');

-- 初期データ: テンプレート
INSERT INTO job_templates 
  (name, description, category, recommended, success_rate, average_time, settings) 
VALUES
  (
    'スピード重視の新規開拓テンプレート',
    '短時間で多くの企業にアプローチする際に最適です',
    '新規開拓',
    true,
    92,
    30,
    '{"parallel_tasks": 10, "retry_attempts": 2, "preferred_method": "FORM"}'
  ),
  (
    '丁寧なフォローアップテンプレート',
    '既存顧客との関係強化に最適な慎重なアプローチ',
    'フォローアップ',
    true,
    98,
    60,
    '{"parallel_tasks": 3, "retry_attempts": 5, "preferred_method": "DM"}'
  );

-- トリガー: 更新日時の自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_job_templates_updated_at
  BEFORE UPDATE ON job_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS ポリシー
ALTER TABLE job_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_metrics ENABLE ROW LEVEL SECURITY;

-- 公開テンプレートは全ユーザーが参照可能
CREATE POLICY "Public templates are viewable by all users"
  ON job_templates FOR SELECT
  USING (is_public = true OR user_id = auth.uid());

-- 自分のテンプレートのみ編集可能
CREATE POLICY "Users can manage their own templates"
  ON job_templates FOR ALL
  USING (user_id = auth.uid());

-- メトリクスは関連テンプレートの所有者のみアクセス可能
CREATE POLICY "Template owners can view metrics"
  ON template_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM job_templates
      WHERE job_templates.id = template_metrics.template_id
      AND job_templates.user_id = auth.uid()
    )
  ); 