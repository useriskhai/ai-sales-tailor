-- batch_jobs テーブルの作成
CREATE TABLE IF NOT EXISTS batch_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_tasks INTEGER NOT NULL,
    completed_tasks INTEGER DEFAULT 0,
    error_message TEXT,
    preferred_method TEXT,
    content_directives TEXT
);

-- インデックスの作成
CREATE INDEX idx_batch_jobs_user_id ON batch_jobs(user_id);
CREATE INDEX idx_batch_jobs_status ON batch_jobs(status);

-- RLSの有効化
ALTER TABLE batch_jobs ENABLE ROW LEVEL SECURITY;

-- ポリシーの作成
CREATE POLICY "ユーザーは自分のバッチジョブのみ参照可能" ON batch_jobs
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分のバッチジョブのみ挿入可能" ON batch_jobs
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分のバッチジョブのみ更新可能" ON batch_jobs
FOR UPDATE USING (auth.uid() = user_id);

-- generated_content テーブルの更新
ALTER TABLE generated_content
ADD COLUMN IF NOT EXISTS batch_job_id UUID REFERENCES batch_jobs(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS result JSONB,
ADD COLUMN IF NOT EXISTS form_url TEXT;

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_generated_content_batch_job_id ON generated_content(batch_job_id);

-- user_settings テーブルの更新
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS preferred_method TEXT;

-- コメントの追加
COMMENT ON COLUMN user_settings.preferred_method IS 'デフォルトの優先送信方法 (form または dm)';