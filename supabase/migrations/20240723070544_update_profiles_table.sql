-- 新しい列を追加
ALTER TABLE public.profiles
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

-- 新しい列にコメントを追加
COMMENT ON COLUMN public.profiles.phone IS 'ユーザーの電話番号';
COMMENT ON COLUMN public.profiles.gender IS 'ユーザーの性別';
COMMENT ON COLUMN public.profiles.name_kana IS 'ユーザー名のフリガナ';
COMMENT ON COLUMN public.profiles.email IS 'ユーザーのメールアドレス';
COMMENT ON COLUMN public.profiles.address IS 'ユーザーの住所';
COMMENT ON COLUMN public.profiles.birth_date IS 'ユーザーの生年月日';
COMMENT ON COLUMN public.profiles.postal_code IS 'ユーザーの郵便番号';
COMMENT ON COLUMN public.profiles.prefecture IS 'ユーザーの都道府県';
COMMENT ON COLUMN public.profiles.city IS 'ユーザーの市区町村';
COMMENT ON COLUMN public.profiles.company_description IS 'ユーザーの会社概要';
COMMENT ON COLUMN public.profiles.department IS 'ユーザーの事業部';
COMMENT ON COLUMN public.profiles.job_title IS 'ユーザーの肩書き';

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON public.profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_name_kana ON public.profiles(name_kana);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_postal_code ON public.profiles(postal_code);
CREATE INDEX IF NOT EXISTS idx_profiles_prefecture ON public.profiles(prefecture);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON public.profiles(department);
CREATE INDEX IF NOT EXISTS idx_profiles_job_title ON public.profiles(job_title);