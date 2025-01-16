-- 会社情報テーブル
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    url TEXT,
    description TEXT,
    search_query TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- URLの一意性制約を追加
ALTER TABLE companies ADD CONSTRAINT companies_url_key UNIQUE (url);

-- 除外された会社の記録テーブル
CREATE TABLE IF NOT EXISTS excluded_companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, company_id)
);

-- 検索履歴テーブル
CREATE TABLE IF NOT EXISTS search_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    query TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックスの作成
CREATE INDEX idx_companies_search_query ON companies(search_query);
CREATE INDEX idx_excluded_companies_user_id ON excluded_companies(user_id);
CREATE INDEX idx_excluded_companies_company_id ON excluded_companies(company_id);
CREATE INDEX idx_search_logs_user_id ON search_logs(user_id);
CREATE INDEX idx_search_logs_company_id ON search_logs(company_id);
CREATE INDEX idx_search_logs_query ON search_logs(query);

-- RLSの有効化
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE excluded_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

-- ポリシーの作成
CREATE POLICY "全てのユーザーが会社情報を閲覧可能" ON companies FOR SELECT USING (true);
CREATE POLICY "全てのユーザーが会社情報を挿入可能" ON companies FOR INSERT WITH CHECK (true);
CREATE POLICY "全てのユーザーが会社情報を更新可能" ON companies FOR UPDATE USING (true);

CREATE POLICY "ユーザーは自分の除外会社のみ参照可能" ON excluded_companies
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分の除外会社のみ挿入可能" ON excluded_companies
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分の検索履歴のみ参照可能" ON search_logs
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "認証されたユーザーは検索履歴を挿入可能" ON search_logs
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 更新日時を自動更新する関数とトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- search_logsテーブルにユーザーIDと会社IDの組み合わせの一意性制約を追加
ALTER TABLE search_logs
ADD CONSTRAINT search_logs_user_id_company_id_key UNIQUE (user_id, company_id);