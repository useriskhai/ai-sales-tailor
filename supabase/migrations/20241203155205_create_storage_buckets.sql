-- プロダクトPDF用のバケットを作成
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'product-pdfs') THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('product-pdfs', 'product-pdfs', true);
  END IF;
END $$;

-- バケットのセキュリティポリシーを設定
CREATE POLICY "Authenticated users can upload PDFs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-pdfs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Authenticated users can update their own PDFs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-pdfs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Authenticated users can delete their own PDFs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-pdfs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "PDFs are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-pdfs');

-- uploaded_filesテーブルを作成
CREATE TABLE IF NOT EXISTS public.uploaded_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(product_id, file_path)
);

-- uploaded_filesのRLSポリシーを設定
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own uploaded files"
ON public.uploaded_files
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own uploaded files"
ON public.uploaded_files
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own uploaded files"
ON public.uploaded_files
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own uploaded files"
ON public.uploaded_files
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- トリガーを作成して更新日時を自動更新
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.uploaded_files
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at(); 