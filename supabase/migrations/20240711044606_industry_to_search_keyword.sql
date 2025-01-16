-- generated_contentテーブルのindustryカラムをsearchKeywordに変更
ALTER TABLE generated_content
RENAME COLUMN industry TO search_keyword;

-- インデックスの更新（もし存在する場合）
DROP INDEX IF EXISTS idx_generated_content_industry;
CREATE INDEX idx_generated_content_search_keyword ON generated_content(search_keyword);