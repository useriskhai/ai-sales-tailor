import React, { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useAuth } from '@/contexts/AuthContext';
import { analyzePDF } from '@/utils/analyze-pdf';
import { extractTextFromPDF } from '@/utils/pdf-extractor';
import { generateStoragePath } from '@/utils/file-utils';
import { Loader2, Upload } from 'lucide-react';
import { AnalysisResult } from '@/types/analysis';
import { PDFFileInfo } from '@/types/product';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { EditableAnalysisResult } from './EditableAnalysisResult';

interface PDFUploaderProps {
  productId?: string;
  onAnalysisComplete?: (result: AnalysisResult) => void;
  onUploadComplete?: (fileInfo: PDFFileInfo) => void;
  onError?: (error: string) => void;
}

export function PDFUploader({
  productId,
  onAnalysisComplete,
  onUploadComplete,
  onError
}: PDFUploaderProps) {
  const supabase = useSupabaseClient();
  const { session } = useAuth();
  const { toast } = useToast();

  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !session?.user?.id) {
      onError?.('ファイルが選択されていないか、認証されていません');
      return;
    }

    // ファイルサイズチェック（10MB）
    if (file.size > 10 * 1024 * 1024) {
      onError?.('ファイルサイズは10MB以下にしてください');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !session?.user?.id) {
      onError?.('ファイルが選択されていないか、認証されていません');
      return;
    }

    setIsUploading(true);
    try {
      const filePath = generateStoragePath(selectedFile.name, session.user.id, productId);

      // 既存のファイルを削除（更新の場合）
      if (productId) {
        const { data: existingFiles } = await supabase
          .from('product_files')
          .select('file_path')
          .eq('product_id', productId)
          .eq('status', 'active');

        if (existingFiles?.length) {
          const oldFilePath = existingFiles[0].file_path;
          await supabase.storage
            .from('product-pdfs')
            .remove([oldFilePath]);

          await supabase
            .from('product_files')
            .update({ status: 'deleted' })
            .eq('product_id', productId);
        }
      }

      // PDFファイルをストレージにアップロード
      const { error: uploadError } = await supabase.storage
        .from('product-pdfs')
        .upload(filePath, selectedFile, {
          contentType: 'application/pdf',
          cacheControl: '3600'
        });

      if (uploadError) {
        throw new Error('PDFのアップロードに失敗しました');
      }

      const fileInfo = {
        fileName: selectedFile.name,
        file: selectedFile,
        filePath: filePath,
        createdAt: new Date().toISOString()
      };

      if (onUploadComplete) {
        onUploadComplete(fileInfo);
      }

      // PDFの解析を開始
      setIsAnalyzing(true);
      const pdfText = await extractTextFromPDF(selectedFile);
      const result = await analyzePDF({
        pdfText,
        fileName: selectedFile.name,
        userId: session.user.id
      });

      setAnalysisResult(result);
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }

      toast({
        title: '分析完了',
        description: 'PDFの分析が完了しました',
      });

    } catch (error) {
      console.error('処理エラー:', error);
      onError?.(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
      setSelectedFile(null);
    }
  };

  const handleAnalysisUpdate = async (updatedResult: AnalysisResult) => {
    try {
      if (!productId) return;

      const { error } = await supabase
        .from('products')
        .update({
          usp: updatedResult.usp,
          description: updatedResult.description,
          benefits: updatedResult.benefits,
          solutions: updatedResult.solutions,
          price_range: updatedResult.priceRange,
          challenges: updatedResult.challenges,
          case_studies: updatedResult.case_studies,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) throw error;

      setAnalysisResult(updatedResult);
      toast({
        title: '更新完了',
        description: '分析結果を更新しました',
      });

    } catch (error) {
      console.error('更新エラー:', error);
      toast({
        title: '更新エラー',
        description: '分析結果の更新に失敗しました',
        variant: 'destructive',
      });
    }
  };

  const getStatusMessage = () => {
    if (isUploading) return 'PDFをアップロード中...';
    if (isAnalyzing) return 'PDFを分析中...';
    if (selectedFile) return `選択されたファイル: ${selectedFile.name}`;
    return 'クリックまたはドラッグ&ドロップでPDFをアップロード';
  };

  return (
    <div className="space-y-8">
      <div className="w-full max-w-2xl mx-auto">
        <label className="block">
          <div className="text-center p-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading || isAnalyzing}
            />
            <div className="flex flex-col items-center gap-2">
              {(isUploading || isAnalyzing) ? (
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              ) : (
                <Upload className="w-6 h-6 text-gray-400" />
              )}
              <div className="text-sm text-gray-500">
                {getStatusMessage()}
              </div>
              <div className="text-xs text-gray-400">
                最大10MBまで
              </div>
            </div>
          </div>
        </label>

        <div className="mt-4 flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => setSelectedFile(null)}
            disabled={!selectedFile || isUploading || isAnalyzing}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading || isAnalyzing}
          >
            {isAnalyzing ? '分析中...' : 'アップロード'}
          </Button>
        </div>
      </div>

      {analysisResult && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">分析結果</h3>
          <EditableAnalysisResult
            result={analysisResult}
            onSave={handleAnalysisUpdate}
          />
        </div>
      )}
    </div>
  );
} 