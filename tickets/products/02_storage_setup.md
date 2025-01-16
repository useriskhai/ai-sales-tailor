# PDFファイル保存用のストレージセットアップ

## 実装状況
- [x] バケットの作成
- [x] アクセス制御ポリシーの設定
- [x] ファイル命名規則の実装
- [ ] ストレージ管理機能の実装

## 概要
製品資料PDFを安全に保存・管理するためのストレージ環境を構築する。

## 目的
- PDFファイルの安全な保存
- アクセス制御の実装
- 効率的なファイル管理

## 実装詳細

### 1. バケットの作成 ✅
```sql
-- PDFファイル保存用のバケットを作成
insert into storage.buckets (id, name)
values ('products-pdf', 'products-pdf');
```

### 2. アクセス制御ポリシーの設定 ✅
```sql
-- アップロード権限の設定
create policy "Authenticated users can upload PDFs"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'products-pdf' and
  (storage.extension(name) = 'pdf')
);

-- 閲覧権限の設定
create policy "Users can view their own uploads"
on storage.objects for select
to authenticated
using (
  bucket_id = 'products-pdf' and
  auth.uid() = owner
);
```

### 3. ファイル命名規則の実装 ✅
- [x] フォーマット: `{user_id}/{product_id}/{timestamp}_{original_filename}`
- [x] タイムスタンプ形式: `YYYYMMDD_HHMMSS`
- [x] ファイル名の正規化
  - [x] 空白文字の置換
  - [x] 特殊文字の除去
  - [x] 日本語ファイル名の対応

### 4. ストレージ管理機能の実装 ⚠️
- [ ] ファイルメタデータの管理
  - [ ] アップロード日時
  - [ ] ファイルサイズ
  - [ ] MIME type
- [ ] 重複ファイルの検出
- [ ] 不要ファイルの自動削除

## テスト項目
1. バケット作成
   - バケットの存在確認
   - 権限設定の確認
2. アクセス制御
   - アップロード権限の検証
   - 閲覧権限の検証
   - 未認証アクセスの制限確認
3. ファイル操作
   - アップロード機能の動作確認
   - ダウンロード機能の動作確認
   - 削除機能の動作確認
4. エラーハンドリング
   - 容量超過時の処理
   - 不正なファイル形式の処理
   - 重複ファイルの処理 