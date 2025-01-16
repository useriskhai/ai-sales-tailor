# 製品情報管理用のデータベースセットアップ

## 実装状況
- [x] 製品情報テーブルの作成
- [x] アップロードファイル管理テーブルの作成
- [x] アクセス制御ポリシーの設定
- [x] インデックスの作成

## 概要
製品情報とPDFファイルの解析結果を管理するためのデータベース構造を設計・実装する。

## 目的
- 製品情報の効率的な管理
- PDFファイルの解析結果の保存
- データの整合性と安全性の確保

## 実装詳細

### 1. 製品情報テーブルの作成 ✅
```sql
-- 製品情報テーブル
create table products (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  name text not null,
  usp text,                    -- 主要な価値提案
  description text,            -- 製品概要
  benefits text[] default '{}',  -- 導入効果（具体的なメリット）
  solutions text[] default '{}', -- 課題解決策
  price_range text,            -- 価格帯
  case_studies jsonb default '[]'::jsonb, -- 導入事例
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- インデックスの作成
create index idx_products_user_id on products(user_id);
create index idx_products_case_studies on products using gin(case_studies);
```

### 2. アップロードファイル管理テーブルの作成 ✅
```sql
-- アップロードファイル管理テーブル
create table uploaded_files (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  product_id uuid references products(id),
  file_path text not null,
  file_name text not null,
  file_size integer not null,
  content_type text not null,
  analysis_status text not null,
  analysis_result jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- インデックスの作成
create index idx_uploaded_files_user_id on uploaded_files(user_id);
create index idx_uploaded_files_product_id on uploaded_files(product_id);
create index idx_uploaded_files_analysis_status on uploaded_files(analysis_status);
```

### 3. アクセス制御ポリシーの設定 ✅
```sql
-- 製品情報のアクセス制御
create policy "Users can view their own products"
on products for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own products"
on products for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own products"
on products for update
to authenticated
using (auth.uid() = user_id);

-- アップロードファイルのアクセス制御
create policy "Users can view their own files"
on uploaded_files for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own files"
on uploaded_files for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own files"
on uploaded_files for update
to authenticated
using (auth.uid() = user_id);
```

## テスト項目
1. テーブル作成
   - テーブルの存在確認
   - カラム定義の確認
   - インデックスの確認
2. アクセス制御
   - 所有者のアクセス権限確認
   - 他ユーザーのアクセス制限確認
   - 未認証アクセスの制限確認
3. データ操作
   - レコードの作成
   - レコードの更新
   - レコードの取得
4. 整合性チェック
   - 外部キー制約の確認
   - NULL制約の確認
   - デフォルト値の確認 