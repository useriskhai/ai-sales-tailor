-- 既存のapi_keyカラムの名前を変更し、anthropic_api_keyとする
ALTER TABLE user_settings
RENAME COLUMN api_key TO anthropic_api_key;

-- OpenAI APIキー用の新しいカラムを追加
ALTER TABLE user_settings
ADD COLUMN openai_api_key TEXT;

-- 新しいカラムにコメントを追加
COMMENT ON COLUMN user_settings.anthropic_api_key IS 'Anthropic API key for the user';
COMMENT ON COLUMN user_settings.openai_api_key IS 'OpenAI API key for the user';

-- インデックスを作成（オプション、パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_user_settings_anthropic_api_key ON user_settings(anthropic_api_key);
CREATE INDEX IF NOT EXISTS idx_user_settings_openai_api_key ON user_settings(openai_api_key);

-- 既存のデータに対してNULLを許可
ALTER TABLE user_settings
ALTER COLUMN anthropic_api_key DROP NOT NULL,
ALTER COLUMN openai_api_key DROP NOT NULL;
