-- アップロードされたファイルのテーブルを作成
CREATE TABLE IF NOT EXISTS uploaded_files (
    id SERIAL PRIMARY KEY,
    file_name TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID NOT NULL,
    product TEXT NOT NULL
);

ALTER TABLE uploaded_files
ADD CONSTRAINT fk_uploaded_files_user
FOREIGN KEY (user_id) 
REFERENCES auth.users(id)
ON DELETE CASCADE;

CREATE INDEX idx_uploaded_files_user_id ON uploaded_files(user_id);
CREATE INDEX idx_uploaded_files_product ON uploaded_files(product);

-- uploaded_files テーブルのポリシー
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ユーザーは自分のファイルのみ参照可能" ON uploaded_files
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分のファイルのみ挿入可能" ON uploaded_files
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分のファイルのみ更新可能" ON uploaded_files
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分のファイルのみ削除可能" ON uploaded_files
FOR DELETE USING (auth.uid() = user_id);

-- 生成されたコンテンツのテーブルを作成
CREATE TABLE generated_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    content TEXT NOT NULL,
    product TEXT NOT NULL,
    industry TEXT NOT NULL,
    company TEXT NOT NULL,
    company_description TEXT,
    company_url TEXT,
    user_id UUID NOT NULL
);

ALTER TABLE generated_content
ADD CONSTRAINT fk_generated_content_user
FOREIGN KEY (user_id) 
REFERENCES auth.users(id)
ON DELETE CASCADE;

CREATE INDEX idx_generated_content_product ON generated_content(product);
CREATE INDEX idx_generated_content_industry ON generated_content(industry);
CREATE INDEX idx_generated_content_company ON generated_content(company);
CREATE INDEX idx_generated_content_company_description ON generated_content(company_description);
CREATE INDEX idx_generated_content_company_url ON generated_content(company_url);
CREATE INDEX idx_generated_content_user_id ON generated_content(user_id);

-- generated_content テーブルのポリシー
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ユーザーは自分のコンテンツのみ参照可能" ON generated_content
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分のコンテンツのみ挿入可能" ON generated_content
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分のコンテンツのみ更新可能" ON generated_content
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分のコンテンツのみ削除可能" ON generated_content
FOR DELETE USING (auth.uid() = user_id);

-- ユーザー設定テーブルを作成
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    api_key TEXT,
    selected_model TEXT,
    domain_restriction TEXT,
    custom_prompt TEXT,
    company_limit INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE user_settings ADD CONSTRAINT user_settings_user_id_key UNIQUE (user_id);
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- ポリシーを作成
CREATE POLICY "ユーザーは自分の設定を管理可能" ON user_settings
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分の設定のみ参照可能" ON user_settings
FOR SELECT USING (auth.uid() = user_id);

-- プロフィールテーブルの作成
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  company TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLSの有効化
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ポリシーの作成
CREATE POLICY "全てのユーザーがプロフィールを閲覧可能" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "ユーザーは自分のプロフィールを更新可能"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 関数とトリガーを作成
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON user_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, company)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'company'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- avatarsバケットのポリシー
CREATE POLICY "全てのユーザーはavatarsバケットにアップロード可能" ON storage.objects
FOR INSERT TO public
WITH CHECK (bucket_id = 'avatars');

-- 全てのユーザーがavatarsバケットのファイルを閲覧可能
CREATE POLICY "全てのユーザーはavatarsバケットのファイルを閲覧可能" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'avatars');