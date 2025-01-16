-- statusの列挙型を作成
CREATE TYPE form_submission_status_type AS ENUM ('pending', 'success', 'form_not_found', 'submission_failed');

-- generated_contentテーブルにstatusカラムを追加
ALTER TABLE generated_content
ADD COLUMN status form_submission_status_type;

-- statusカラムにインデックスを作成
CREATE INDEX idx_generated_content_status ON generated_content(status);

-- 送信試行回数と最後の送信試行日時のカラムを追加
ALTER TABLE generated_content
ADD COLUMN attempt_count INTEGER DEFAULT 0,
ADD COLUMN last_attempt_at TIMESTAMP WITH TIME ZONE;

-- 送信試行回数と最後の送信試行日時を更新する関数とトリガー
CREATE OR REPLACE FUNCTION update_generated_content_attempt()
RETURNS TRIGGER AS $$
BEGIN
    NEW.attempt_count = OLD.attempt_count + 1;
    NEW.last_attempt_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_generated_content_attempt
BEFORE UPDATE ON generated_content
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION update_generated_content_attempt();