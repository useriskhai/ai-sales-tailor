-- 企業テーブルに重複チェック用のカラムを追加
ALTER TABLE companies
ADD COLUMN domain_for_check text,
ADD COLUMN normalized_name text;

-- 重複チェック用のドメインにユニークインデックスを追加
CREATE UNIQUE INDEX idx_domain_check 
ON companies (domain_for_check) 
WHERE domain_for_check IS NOT NULL;

-- 正規化された企業名にインデックスを追加
CREATE INDEX idx_normalized_name 
ON companies (normalized_name) 
WHERE normalized_name IS NOT NULL;

-- 既存データの移行関数
CREATE OR REPLACE FUNCTION migrate_existing_company_data()
RETURNS void AS $$
BEGIN
    -- 既存のURLからドメインを抽出して正規化
    UPDATE companies
    SET domain_for_check = 
        CASE 
            WHEN url IS NOT NULL AND url != '' THEN
                -- URLからドメイン部分を抽出（簡易的な実装）
                REGEXP_REPLACE(
                    REGEXP_REPLACE(
                        REGEXP_REPLACE(url, '^https?://(www\.)?', ''),
                        '/.*$', ''
                    ),
                    '^[^.]+\.',
                    ''
                )
            ELSE NULL
        END
    WHERE domain_for_check IS NULL;

    -- 企業名の正規化
    UPDATE companies
    SET normalized_name = 
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                REGEXP_REPLACE(
                    REGEXP_REPLACE(name, '株式会社|㈱', '(株)'),
                    '有限会社|㈲', '(有)'
                ),
                '[\s　]+', ' '  -- 全角・半角スペースを単一の半角スペースに
            ),
            '^\s+|\s+$', ''    -- 前後の空白を削除
        )
    WHERE normalized_name IS NULL;
END;
$$ LANGUAGE plpgsql;

-- 移行関数の実行
SELECT migrate_existing_company_data(); 