-- 重複チェック用のカラムを追加
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS domain_for_check TEXT,
ADD COLUMN IF NOT EXISTS normalized_name TEXT;

-- インデックスを作成（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_companies_domain_check ON companies(domain_for_check);
CREATE INDEX IF NOT EXISTS idx_companies_normalized_name ON companies(normalized_name);

-- 既存データの正規化（domain_for_checkとnormalized_nameを更新）
UPDATE companies
SET 
  domain_for_check = (
    CASE 
      WHEN url IS NOT NULL AND url != '' 
      THEN regexp_replace(regexp_replace(url, '^https?://(?:www\.)?([^/]+).*$', '\1'), '^[^.]+\.([^.]+\.[^.]+)$', '\1')
      ELSE NULL 
    END
  ),
  normalized_name = regexp_replace(
    regexp_replace(
      regexp_replace(name, '[[:space:]　]+', ''), -- 全角・半角スペースを削除
      '[（）()[\]「」『』【】\-\.]', '', 'g'    -- 括弧や記号を削除
    ),
    '[|｜]', '', 'g'                           -- パイプ記号を削除
  ); 