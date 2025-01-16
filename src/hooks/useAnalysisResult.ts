import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AnalysisResult, UploadedFile } from '@/types/analysis';

interface UseAnalysisResult {
  result: AnalysisResult | null;
  isLoading: boolean;
  error: Error | null;
  updateResult: (updates: Partial<AnalysisResult>) => Promise<void>;
  revertChanges: () => void;
}

export const useAnalysisResult = (fileId: string): UseAnalysisResult => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [originalResult, setOriginalResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 解析結果の取得
  const fetchResult = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('uploaded_files')
        .select('*')
        .eq('id', fileId)
        .single();

      if (error) throw error;

      const file = data as UploadedFile;
      setResult(file.analysisResult);
      setOriginalResult(file.analysisResult);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('解析結果の取得に失敗しました'));
    } finally {
      setIsLoading(false);
    }
  }, [fileId]);

  // 解析結果の更新
  const updateResult = useCallback(async (updates: Partial<AnalysisResult>) => {
    if (!result) return;

    setIsLoading(true);
    setError(null);

    try {
      const updatedResult = { ...result, ...updates };
      const { error } = await supabase
        .from('uploaded_files')
        .update({
          analysis_result: updatedResult,
          updated_at: new Date().toISOString(),
        })
        .eq('id', fileId);

      if (error) throw error;

      setResult(updatedResult);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('解析結果の更新に失敗しました'));
    } finally {
      setIsLoading(false);
    }
  }, [fileId, result]);

  // 変更の取り消し
  const revertChanges = useCallback(() => {
    setResult(originalResult);
  }, [originalResult]);

  // 初回マウント時に解析結果を取得
  useEffect(() => {
    fetchResult();
  }, [fetchResult]);

  return {
    result,
    isLoading,
    error,
    updateResult,
    revertChanges,
  };
}; 