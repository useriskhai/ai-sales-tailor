-- 既存のポリシーを削除
drop policy if exists "Authenticated users can upload PDFs" on storage.objects;
drop policy if exists "Authenticated users can view PDFs" on storage.objects;

-- PDFアップロード権限の設定
CREATE POLICY "Authenticated users can upload PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-pdfs' AND
  storage.extension(name) = 'pdf'
);

-- PDF閲覧権限の設定
CREATE POLICY "Authenticated users can view PDFs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'product-pdfs'); 