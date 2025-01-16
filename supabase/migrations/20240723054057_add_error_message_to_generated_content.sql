-- Add error_message column to generated_content table
ALTER TABLE generated_content ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Comment on the new column
COMMENT ON COLUMN generated_content.error_message IS 'エラーメッセージを格納するカラム。フォーム送信プロセスで発生したエラーの詳細情報を保存します。';