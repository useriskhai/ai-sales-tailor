import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { PDFUploader } from '@/components/products/PDFUploader';
import { ProductFileList } from '@/components/products/ProductFileList';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeftIcon, Trash2Icon } from 'lucide-react';
import { AnalysisResult } from '@/types/analysis';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const supabase = useSupabaseClient();
  const [product, setProduct] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchFiles();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: 'エラー',
        description: '製品情報の取得に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('product_files')
        .select('*')
        .eq('product_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: 'エラー',
        description: 'ファイル一覧の取得に失敗しました',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = () => {
    fetchFiles();
  };

  const handleAnalysisComplete = async (analysisResult: AnalysisResult) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          usp: analysisResult.usp,
          description: analysisResult.description,
          benefits: analysisResult.benefits,
          solutions: analysisResult.solutions,
          price_range: analysisResult.priceRange,
          case_studies: analysisResult.case_studies,
          challenges: analysisResult.challenges
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: '成功',
        description: '分析結果を保存しました',
      });

      fetchProduct();
    } catch (error) {
      console.error('Error saving analysis result:', error);
      toast({
        title: 'エラー',
        description: '分析結果の保存に失敗しました',
        variant: 'destructive',
      });
    }
  };

  const handleChange = (field: string, value: any) => {
    setProduct(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          usp: product.usp,
          description: product.description,
          benefits: Array.isArray(product.benefits) ? product.benefits : product.benefits?.split('\n').filter(Boolean),
          solutions: Array.isArray(product.solutions) ? product.solutions : product.solutions?.split('\n').filter(Boolean),
          price_range: product.price_range,
          case_studies: Array.isArray(product.case_studies) ? product.case_studies : product.case_studies?.split('\n\n').filter(Boolean),
          challenges: product.challenges
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: '成功',
        description: '製品情報を保存しました',
      });

      fetchProduct();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'エラー',
        description: '製品情報の保存に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      // まず関連ファイルを削除
      const { data: productFiles } = await supabase
        .from('product_files')
        .select('file_path')
        .eq('product_id', id)
        .eq('status', 'active');

      if (productFiles && productFiles.length > 0) {
        // ストレージからファイルを削除
        const filePaths = productFiles.map(file => file.file_path);
        await supabase.storage
          .from('product-pdfs')
          .remove(filePaths);

        // ファイルのステータスを更新
        await supabase
          .from('product_files')
          .update({ status: 'deleted' })
          .eq('product_id', id);
      }

      // プロダクトを削除
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: '成功',
        description: 'プロダクトを削除しました',
      });

      // 一覧ページに戻る
      router.push('/products');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'エラー',
        description: '削除に失敗しました',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="p-8">読み込み中...</div>;
  }

  if (!product) {
    return <div className="p-8">製品が見つかりません</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => router.push('/products')}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            製品一覧に戻る
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
        </div>

        <div className="flex justify-between items-center mb-6">
          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-500 hover:bg-red-600"
          >
            <Trash2Icon className="h-4 w-4 mr-2" />
            プロダクトを削除
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左カラム: 製品情報 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">基本情報</h2>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? '保存中...' : '保存'}
                </Button>
              </div>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="usp" className="text-base">
                    USP（独自の強み）
                  </Label>
                  <Textarea
                    id="usp"
                    value={product.usp || ''}
                    onChange={e => handleChange('usp', e.target.value)}
                    placeholder="競合製品と比較した際の独自の価値提案"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-base">
                    製品概要
                  </Label>
                  <Textarea
                    id="description"
                    value={product.description || ''}
                    onChange={e => handleChange('description', e.target.value)}
                    placeholder="製品の概要を入力"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="challenges" className="text-base">
                    課題
                  </Label>
                  <Textarea
                    id="challenges"
                    value={product.challenges || ''}
                    onChange={e => handleChange('challenges', e.target.value)}
                    placeholder="製品が解決する顧客の課題"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="solutions" className="text-base">
                    解決策
                  </Label>
                  <Textarea
                    id="solutions"
                    value={Array.isArray(product.solutions) ? product.solutions.join('\n') : product.solutions || ''}
                    onChange={e => handleChange('solutions', e.target.value)}
                    placeholder="課題に対する製品の解決方法（1行に1つ）"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="benefits" className="text-base">
                    メリット
                  </Label>
                  <Textarea
                    id="benefits"
                    value={Array.isArray(product.benefits) ? product.benefits.join('\n') : product.benefits || ''}
                    onChange={e => handleChange('benefits', e.target.value)}
                    placeholder="製品導入による具体的なメリット（1行に1つ）"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="price_range" className="text-base">
                    価格帯
                  </Label>
                  <Input
                    id="price_range"
                    value={product.price_range || ''}
                    onChange={e => handleChange('price_range', e.target.value)}
                    placeholder="価格帯を入力"
                  />
                </div>

                <div>
                  <Label htmlFor="case_studies" className="text-base">
                    導入事例
                  </Label>
                  <Textarea
                    id="case_studies"
                    value={Array.isArray(product.case_studies) ? product.case_studies.join('\n\n') : product.case_studies || ''}
                    onChange={e => handleChange('case_studies', e.target.value)}
                    placeholder="導入事例を入力（複数の事例は空行で区切る）"
                    rows={6}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 右カラム: 資料 */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">資料アップロード</h2>
              <PDFUploader
                productId={id as string}
                onUploadComplete={handleFileUpload}
                onAnalysisComplete={handleAnalysisComplete}
                onError={(error) => {
                  console.error('PDFアップロードエラー:', error);
                  toast({
                    title: 'エラー',
                    description: typeof error === 'string' ? error : ((error as Error)?.message || String(error)),
                    variant: 'destructive',
                  });
                }}
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">アップロード済み資料</h2>
              <ProductFileList
                productId={id as string}
                files={files}
                onFileUpdate={fetchFiles}
              />
            </div>
          </div>
        </div>

        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>プロダクトを削除しますか？</AlertDialogTitle>
              <AlertDialogDescription>
                この操作は取り消せません。プロダクトに関連するすべてのファイルも削除されます。
                本当に「{product?.name}」を削除しますか？
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>キャンセル</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteProduct}
                className="bg-red-500 hover:bg-red-600"
              >
                削除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
} 