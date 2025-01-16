-- user_settingsテーブルにフッター関連の列を追加
ALTER TABLE user_settings
ADD COLUMN footer_text TEXT,
ADD COLUMN use_footer BOOLEAN DEFAULT false;