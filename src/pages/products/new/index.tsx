import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useSession } from '@/hooks/useSession';
import { generateStoragePath } from '@/utils/file-utils';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PDFUploader } from '@/components/products/PDFUploader';
import { ProductFormData, PDFFileInfo } from '@/types/product';
import { AnalysisResult } from '@/types/analysis';

export default function ProductNew() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const { session } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);
  const [product, setProduct] = useState<ProductFormData>({
    name: '',
    description: '',
    usp: '',
    benefits: [],
    solutions: [],
    priceRange: '',
    challenges: '',
    caseStudies: []
  });

  const handleChange = (field: keyof ProductFormData, value: any) => {
    setProduct(prev => ({ ...prev, [field]: value }));
  };

  const handleFileComplete = (fileInfo: PDFFileInfo) => {
    handleChange('pdfFile', fileInfo);
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setProduct(prev => ({
      ...prev,
      description: result.description || '',
      usp: result.usp || '',
      benefits: result.benefits || [],
      solutions: result.solutions || [],
      priceRange: result.priceRange || '',
      challenges: result.challenges || ''
    }));
    setIsAnalysisComplete(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      if (!session?.user?.id || !product.pdfFile) {
        throw new Error('必要な情報が不足しています');
      }

      // 同名製品の存在チェック
      const { data: existingProduct, error: checkError } = await supabase
        .from('products')
        .select('id, name')
        .eq('user_id', session.user.id)
        .eq('name', product.name)
        .maybeSingle();

      if (checkError) {
        throw new Error('製品名の重複チェックに失敗しました');
      }

      if (existingProduct) {
        throw new Error(`「${product.name}」という名前の製品は既に登録されています。別の名前を指定してください。`);
      }

      // プロダクトの保存
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert({
          name: product.name,
          user_id: session.user.id,
          description: product.description,
          usp: product.usp,
          benefits: product.benefits,
          solutions: product.solutions,
          price_range: product.priceRange,
          challenges: product.challenges
        })
        .select()
        .single();

      if (productError) throw productError;

      // PDFファイル情報の保存
      const filePath = generateStoragePath(
        product.pdfFile.fileName,
        session.user.id,
        productData.id
      );

      const { error: uploadError } = await supabase.storage
        .from('product-pdfs')
        .upload(filePath, product.pdfFile.file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-pdfs')
        .getPublicUrl(filePath);

      const { error: fileError } = await supabase
        .from('product_files')
        .insert({
          product_id: productData.id,
          user_id: session.user.id,
          file_name: product.pdfFile.fileName,
          file_path: filePath,
          file_url: publicUrl,
          file_size: product.pdfFile.file.size,
          content_type: 'application/pdf'
        });

      if (fileError) throw fileError;

      router.push('/products');
    } catch (error) {
      console.error('保存エラー:', error);
      setError(error instanceof Error ? error : new Error('保存に失敗しました'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container max-w-3xl py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">プロダクト登録</h1>
        <Button
          variant="outline"
          onClick={() => router.push('/products')}
        >
          プロダクト一覧に戻る
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">プロダクト名</h2>
          <Input
            value={product.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="プロダクト名を入力してください"
          />
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">製品資料のアップロード</h2>
          <PDFUploader
            onAnalysisComplete={handleAnalysisComplete}
            onUploadComplete={handleFileComplete}
            onError={(error: unknown) => {
              const errorMessage = error instanceof Error ? error.message : String(error);
              setError(new Error(errorMessage));
            }}
          />
        </Card>

        {isAnalysisComplete && (
          <div className="space-y-6">            
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/products')}
                disabled={isSaving}
              >
                キャンセル
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !product.name || !product.pdfFile}
              >
                {isSaving ? '保存中...' : '保存'}
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm">
            {error.message}
          </div>
        )}
      </div>
    </div>
  );
} 