# PDFアップロードと製品情報登録フローの改善

## 概要
PDFアップロードと製品情報の登録フローを改善し、ユーザーが内容を確認してから保存できるようにします。
また、ファイル管理を`products`テーブルに統合し、データ構造をシンプル化します。

## 現状の課題

### 1. データ構造の複雑さ
- `products`テーブルと`uploaded_files`テーブルで情報が分散
- 不要な外部キー制約による複雑さ
- データの整合性維持が困難

### 2. 登録フローの問題
- PDFアップロード後に即座にデータベースに保存
- ユーザーが内容を確認する前に登録が完了
- 修正が必要な場合の手順が複雑

### 3. エラーハンドリング
- 外部キー制約違反の発生
- ファイルアップロード失敗時の処理が不完全
- エラーメッセージが不明確

## 実装状況

### 1. データベース構造の変更 [✓]
- マイグレーションファイル作成完了
- `products`テーブルにファイル関連カラムを追加
- `uploaded_files`テーブルの削除準備完了

### 2. コンポーネントの実装 [進行中]
- `ProductPDFUploader`コンポーネント作成完了
- `PDFUploader`コンポーネントの修正が必要
  - 現在`uploaded_files`テーブルに保存しようとしてエラー発生
  - `products`テーブルへの保存に変更する必要あり
- `AnalysisResultViewer`コンポーネント作成完了

### 3. 発生している問題
1. アップロード時のエラー:
```
POST http://127.0.0.1:54321/rest/v1/uploaded_files 400 (Bad Request)
Error: null value in column "file_url" of relation "uploaded_files" violates not-null constraint
```

### 4. 次のステップ
1. `PDFUploader`コンポーネントの修正
   - `uploaded_files`テーブルへの保存を削除
   - `products`テーブルの更新に変更
2. エラーハンドリングの強化
   - ファイルURL生成の確認
   - トランザクション処理の追加
3. マイグレーションの実行
   - テーブル構造の変更を適用
   - 既存データの移行

## 改善案

### 1. データ構造の簡素化
```sql
-- productsテーブルの修正
ALTER TABLE products
ADD COLUMN file_name TEXT,
ADD COLUMN file_path TEXT,
ADD COLUMN file_url TEXT,
ADD COLUMN file_size INTEGER,
ADD COLUMN content_type TEXT,
ADD COLUMN uploaded_at TIMESTAMP WITH TIME ZONE;

-- uploaded_filesテーブルの削除
DROP TABLE uploaded_files;
```

### 2. アップロードフローの改善
1. PDFアップロード（一時保存）
   - 一時的なパスにファイルを保存
   - ファイルの内容を解析
   - プレビューを表示

2. 内容の確認と編集
   - 抽出された情報を表示
   - ユーザーが内容を編集可能
   - プレビューで確認可能

3. 確定処理
   - ユーザーが内容を確認
   - 確定ボタンで本保存
   - 一時ファイルを本番環境に移動

### 3. エラーハンドリングの強化
```typescript
try {
  // セッション確認
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) {
    throw new Error('認証が必要です');
  }

  // ファイルの一時保存
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('product-pdfs')
    .upload(tempPath, file);

  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw new Error('ファイルのアップロードに失敗しました');
  }

  // 内容の解析
  const extractedInfo = await extractProductInfo(file);

  // プレビュー用URLの取得
  const { data: { publicUrl } } = supabase.storage
    .from('product-pdfs')
    .getPublicUrl(tempPath);

  // 一時データの作成
  const tempData = {
    file_name: file.name,
    file_path: tempPath,
    file_url: publicUrl,
    extracted_info: extractedInfo
  };

  return tempData;

} catch (error) {
  console.error('Error:', error);
  throw new Error('処理に失敗しました。時間をおいて再度お試しください。');
}
```

### 4. コンポーネントの修正
```typescript
interface PDFUploaderProps {
  onUploadComplete: (tempData: TempFileData) => void;
  onError: (error: Error) => void;
}

export const PDFUploader: React.FC<PDFUploaderProps> = ({
  onUploadComplete,
  onError
}) => {
  const [uploading, setUploading] = useState(false);
  const [tempFile, setTempFile] = useState<TempFileData | null>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const tempData = await uploadToTemp(file);
      setTempFile(tempData);
      onUploadComplete(tempData);
    } catch (error) {
      onError(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Dropzone onDrop={handleUpload}>
        {/* ドロップゾーンのUI */}
      </Dropzone>
      {tempFile && (
        <div>
          <PreviewPanel data={tempFile} />
          <EditForm data={tempFile} />
          <ConfirmButton onConfirm={handleConfirm} />
        </div>
      )}
    </div>
  );
};
```

## 期待される効果

1. データ構造の改善
   - テーブル間の依存関係の削減
   - データの整合性が保ちやすい
   - クエリの単純化

2. ユーザー体験の向上
   - 内容確認が可能
   - 修正が容易
   - エラーメッセージが分かりやすい

3. 保守性の向上
   - コードの見通しが良くなる
   - エラーハンドリングが確実
   - デバッグが容易

## 実装手順

1. データベースの修正
   - マイグレーションファイルの作成
   - テーブル構造の変更
   - 既存データの移行

2. バックエンド処理の実装
   - 一時保存機能の実装
   - ファイル解析処理の実装
   - 確定処理の実装

3. フロントエンド実装
   - アップローダーコンポーネントの修正
   - プレビュー機能の実装
   - 確認画面の実装

4. テストとデバッグ
   - 単体テストの作成
   - 結合テストの実施
   - エラーケースの確認

## リスクと対策

1. データ移行リスク
   - バックアップの作成
   - 段階的な移行
   - ロールバック手順の準備

2. 性能リスク
   - ファイルサイズの制限
   - キャッシュの活用
   - 非同期処理の最適化

3. セキュリティリスク
   - アクセス制御の徹底
   - 一時ファイルの適切な管理
   - 入力値のバリデーション