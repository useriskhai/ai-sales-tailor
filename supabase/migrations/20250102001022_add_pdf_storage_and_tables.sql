-- PDFストレージのセットアップ
insert into storage.buckets (id, name)
values ('product-pdfs', 'product-pdfs')
on conflict do nothing;

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

-- アップロードファイル管理テーブルの作成
create table if not exists uploaded_files (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  product_id uuid references products(id),
  file_path text not null,
  file_name text not null,
  file_size integer not null,
  content_type text not null,
  analysis_status text not null default 'pending',
  analysis_result jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLSの有効化
alter table uploaded_files enable row level security;

-- アップロードファイルのRLSポリシー
create policy "Users can view their own uploads"
on uploaded_files for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own uploads"
on uploaded_files for insert
to authenticated
with check (auth.uid() = user_id);

-- productsテーブルの拡張
alter table products
add column if not exists case_studies jsonb default '[]'::jsonb;

-- インデックスの作成
create index if not exists idx_products_case_studies on products using gin (case_studies); 