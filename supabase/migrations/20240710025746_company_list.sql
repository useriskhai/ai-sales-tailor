-- 法人情報テーブル
CREATE TABLE IF NOT EXISTS corporate_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    corporate_number TEXT UNIQUE NOT NULL,
    corporate_name TEXT NOT NULL,
    corporate_name_kana TEXT,
    corporate_name_en TEXT,
    postal_code TEXT,
    headquarters_address TEXT,
    status TEXT,
    closure_date DATE,
    closure_reason TEXT,
    representative_name TEXT,
    representative_title TEXT,
    capital TEXT,
    employee_count TEXT,
    male_employee_details TEXT,
    female_employee_details TEXT,
    business_items TEXT,
    business_overview TEXT,
    company_website TEXT,
    establishment_date DATE,
    founding_year INTEGER,
    last_update TIMESTAMP WITH TIME ZONE,
    qualification_grade TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックスの作成
CREATE INDEX idx_corporate_info_corporate_number ON corporate_info(corporate_number);
CREATE INDEX idx_corporate_info_corporate_name ON corporate_info(corporate_name);
CREATE INDEX idx_corporate_info_postal_code ON corporate_info(postal_code);

-- 更新日時を自動更新する関数とトリガー
CREATE OR REPLACE FUNCTION update_corporate_info_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_corporate_info_updated_at
BEFORE UPDATE ON corporate_info
FOR EACH ROW
EXECUTE FUNCTION update_corporate_info_updated_at();

-- RLSの有効化
ALTER TABLE corporate_info ENABLE ROW LEVEL SECURITY;

-- ポリシーの作成
CREATE POLICY "認証されたユーザーが法人情報を閲覧可能" ON corporate_info
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "管理者のみが法人情報を挿入・更新・削除可能" ON corporate_info
FOR ALL USING (auth.role() = 'admin')
WITH CHECK (auth.role() = 'admin');