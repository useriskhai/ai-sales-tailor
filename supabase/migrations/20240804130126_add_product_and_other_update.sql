-- products テーブルの作成
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_user_id_name ON products(user_id, name);

-- RLSの有効化
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ポリシーの作成
CREATE POLICY "ユーザーは自分の製品のみ参照可能" ON products
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分の製品のみ挿入可能" ON products
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分の製品のみ更新可能" ON products
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分の製品のみ削除可能" ON products
FOR DELETE USING (auth.uid() = user_id);

-- 更新日時を自動更新する関数とトリガー
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_products_updated_at();

-- コメントの追加
COMMENT ON TABLE products IS 'ユーザーが管理するプロダクト情報を格納するテーブル';
COMMENT ON COLUMN products.id IS 'プロダクトの一意識別子';
COMMENT ON COLUMN products.user_id IS 'プロダクトを所有するユーザーのID';
COMMENT ON COLUMN products.name IS 'プロダクト名';
COMMENT ON COLUMN products.description IS 'プロダクトの説明';

-- sending_groupsテーブルの作成
CREATE TABLE IF NOT EXISTS sending_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE,
    CONSTRAINT unique_user_group_name
        UNIQUE (user_id, name)
);

-- sending_group_companiesテーブルの作成
CREATE TABLE IF NOT EXISTS sending_group_companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sending_group_id UUID NOT NULL,
    company_id UUID NOT NULL,
    CONSTRAINT fk_sending_group
        FOREIGN KEY (sending_group_id)
        REFERENCES sending_groups(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_company
        FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON DELETE CASCADE,
    CONSTRAINT unique_group_company
        UNIQUE (sending_group_id, company_id)
);

-- batch_jobsテーブルの更新（sending_group_idフィールドの追加）
ALTER TABLE batch_jobs
ADD COLUMN IF NOT EXISTS sending_group_id UUID,
ADD CONSTRAINT fk_sending_group
    FOREIGN KEY (sending_group_id)
    REFERENCES sending_groups(id)
    ON DELETE SET NULL;

-- job_logs テーブルの作成
CREATE TABLE IF NOT EXISTS job_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES batch_jobs(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    log_level TEXT
);

-- 追加: task_id カラムの追加
ALTER TABLE job_logs ADD COLUMN IF NOT EXISTS task_id UUID;

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_job_logs_job_id ON job_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_job_logs_created_at ON job_logs(created_at);

-- RLSの有効化
ALTER TABLE job_logs ENABLE ROW LEVEL SECURITY;

-- ポリシーの作成
CREATE POLICY "ユーザーは自分のジョブのログのみ参照可能" ON job_logs
FOR SELECT USING (
    auth.uid() IN (
        SELECT user_id 
        FROM batch_jobs 
        WHERE id = job_logs.job_id
    )
);

-- COMMENTの追加
COMMENT ON TABLE job_logs IS 'バッチジョブの実行ログを保存するテーブル';
COMMENT ON COLUMN job_logs.job_id IS '関連するバッチジョブのID';
COMMENT ON COLUMN job_logs.message IS 'ログメッセージ';
COMMENT ON COLUMN job_logs.log_level IS 'ログレベル（例：INFO, WARNING, ERROR）';

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_sending_groups_user_id ON sending_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_sending_group_companies_sending_group_id ON sending_group_companies(sending_group_id);
CREATE INDEX IF NOT EXISTS idx_sending_group_companies_company_id ON sending_group_companies(company_id);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_sending_group_id ON batch_jobs(sending_group_id);

-- profiles テーブルの更新
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS name_kana TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS prefecture TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS company_description TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT;

-- user_settings テーブルの更新
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS footer_text TEXT,
ADD COLUMN IF NOT EXISTS use_footer BOOLEAN DEFAULT false;

-- generated_content テーブルの更新
ALTER TABLE generated_content
DROP COLUMN IF EXISTS search_keyword,
ADD COLUMN IF NOT EXISTS subject TEXT,
ADD COLUMN IF NOT EXISTS fallback_status TEXT;

-- batch_jobs テーブルの更新
ALTER TABLE batch_jobs
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS content_directives TEXT,
ADD COLUMN IF NOT EXISTS parallel_tasks INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS retry_attempts INTEGER DEFAULT 0;

COMMENT ON COLUMN batch_jobs.parallel_tasks IS '同時に実行可能なタスクの数';
COMMENT ON COLUMN batch_jobs.retry_attempts IS 'タスクの再試行回数';

-- companies テーブルの更新
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_form_url TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
DROP COLUMN IF EXISTS search_query;  -- search_query フィールドを削除

-- companies テーブルのインデックス作成
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);

-- llm_models テーブルの作成
CREATE TABLE IF NOT EXISTS llm_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_name TEXT NOT NULL UNIQUE,
    api_type TEXT NOT NULL CHECK (api_type IN ('anthropic', 'openai', 'google')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- batch_job_companies テーブルの作成
CREATE TABLE IF NOT EXISTS batch_job_companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_job_id UUID REFERENCES batch_jobs(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE (batch_job_id, company_id)
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_name_kana ON profiles(name_kana);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_postal_code ON profiles(postal_code);
CREATE INDEX IF NOT EXISTS idx_profiles_prefecture ON profiles(prefecture);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON profiles(department);
CREATE INDEX IF NOT EXISTS idx_profiles_job_title ON profiles(job_title);

CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_user_id_name ON companies(user_id, name);

CREATE INDEX IF NOT EXISTS idx_batch_jobs_user_id_product_id_status ON batch_jobs(user_id, product_id, status);

-- コメントの追加
COMMENT ON COLUMN profiles.phone IS 'ユーザーの電話番号';
COMMENT ON COLUMN profiles.gender IS 'ユーザーの性別';
COMMENT ON COLUMN profiles.name_kana IS 'ユーザー名のフリガナ';
COMMENT ON COLUMN profiles.email IS 'ユーザーのメールアドレス';
COMMENT ON COLUMN profiles.address IS 'ユーザーの住所';
COMMENT ON COLUMN profiles.birth_date IS 'ユーザーの生年月日';
COMMENT ON COLUMN profiles.postal_code IS 'ユーザーの郵便番号';
COMMENT ON COLUMN profiles.prefecture IS 'ユーザーの都道府県';
COMMENT ON COLUMN profiles.city IS 'ユーザーの市区町村';
COMMENT ON COLUMN profiles.company_description IS 'ユーザーの会社概要';
COMMENT ON COLUMN profiles.department IS 'ユーザーの事業部';
COMMENT ON COLUMN profiles.job_title IS 'ユーザーの肩書き';

COMMENT ON COLUMN user_settings.footer_text IS 'ユーザーのカスタムフッターテキスト';
COMMENT ON COLUMN user_settings.use_footer IS 'フッターを使用するかどうかのフラグ';

COMMENT ON COLUMN generated_content.subject IS '生成されたコンテンツの主題';
COMMENT ON COLUMN generated_content.fallback_status IS 'フォールバック状態';

COMMENT ON COLUMN batch_jobs.product_id IS '関連する製品のID';
COMMENT ON COLUMN batch_jobs.content_directives IS 'バッチジョブ固有のコンテンツ生成指示や注意事項';

COMMENT ON COLUMN companies.industry IS '企業の業種';
COMMENT ON COLUMN companies.contact_email IS '企業の連絡先メールアドレス';
COMMENT ON COLUMN companies.contact_form_url IS '企業のコンタクトフォームURL';
COMMENT ON COLUMN companies.notes IS '企業に関するメモ';

COMMENT ON TABLE llm_models IS 'LLMモデル情報を格納するテーブル';
COMMENT ON COLUMN llm_models.model_name IS 'モデル名';
COMMENT ON COLUMN llm_models.api_type IS 'APIタイプ（anthropic, openai, google）';

COMMENT ON TABLE batch_job_companies IS 'バッチジョブと送信対象企業の関連を格納するテーブル';
COMMENT ON COLUMN batch_job_companies.batch_job_id IS '関連するバッチジョブのID';
COMMENT ON COLUMN batch_job_companies.company_id IS '送信対象企業のID';

-- uploaded_files テーブルの更新
ALTER TABLE uploaded_files
DROP COLUMN IF EXISTS product,
ADD COLUMN product_id UUID REFERENCES products(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS file_url TEXT;

-- id カラムの型を UUID に変更
ALTER TABLE uploaded_files
ALTER COLUMN id DROP DEFAULT,
ALTER COLUMN id SET DATA TYPE UUID USING (gen_random_uuid()),
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- インデックスの更新
DROP INDEX IF EXISTS idx_uploaded_files_product;
CREATE INDEX IF NOT EXISTS idx_uploaded_files_product_id ON uploaded_files(product_id);

COMMENT ON COLUMN uploaded_files.product_id IS '関連する製品のID';

-- companies テーブルのRLS設定
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ユーザーは自分の企業のみ参照可能" ON companies
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分の企業のみ挿入可能" ON companies
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分の企業のみ更新可能" ON companies
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分の企業のみ削除可能" ON companies
FOR DELETE USING (auth.uid() = user_id);

-- companies テーブルのコメント追加
COMMENT ON COLUMN companies.user_id IS '企業を所有するユーザーのID';