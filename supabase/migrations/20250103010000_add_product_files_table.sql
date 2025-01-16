-- テーブルの作成
CREATE TABLE IF NOT EXISTS product_files (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_url text,
  file_size integer,
  content_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS product_files_product_id_idx ON product_files(product_id);
CREATE INDEX IF NOT EXISTS product_files_user_id_idx ON product_files(user_id);

-- 更新日時を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_product_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_files_updated_at
  BEFORE UPDATE ON product_files
  FOR EACH ROW
  EXECUTE FUNCTION update_product_files_updated_at();

-- RLSの有効化
ALTER TABLE product_files ENABLE ROW LEVEL SECURITY;

-- RLSポリシーの作成
CREATE POLICY "Users can view their own product files"
  ON product_files FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own product files"
  ON product_files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product files"
  ON product_files FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own product files"
  ON product_files FOR DELETE
  USING (auth.uid() = user_id); 