CREATE TABLE llm_models (
  id SERIAL PRIMARY KEY,
  model_name TEXT NOT NULL UNIQUE,
  api_type TEXT NOT NULL CHECK (api_type IN ('anthropic', 'openai', 'google')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 初期データの挿入
INSERT INTO llm_models (model_name, api_type) VALUES
-- Anthropic
('claude-3-opus-20240229', 'anthropic'),
('claude-3-sonnet-20240229', 'anthropic'),
('claude-3-haiku-20240307', 'anthropic'),
('claude-3-5-sonnet-20240620', 'anthropic'),
-- OpenAI
('gpt-4o-2024-05-13', 'openai'),
('gpt-4o-mini-2024-07-18', 'openai'),
-- Google (Gemini)
('gemini-1.5-pro', 'google'),
('gemini-1.5-flash', 'google');