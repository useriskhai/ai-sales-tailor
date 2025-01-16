import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { toast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

export const useFormSubmission = (onStatusUpdate?: (generatedContentId: string, status: string, errorMessage?: string) => void) => {
  const supabase = useSupabaseClient();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const [profileDetails, setProfileDetails] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchProfileDetails(user.id);
    }
  }, [user]);

  const fetchProfileDetails = async (userId) => {
    try {
      const { data, error } = await supabase.functions.invoke('user-operations', {
        body: JSON.stringify({
          action: 'getUserProfile',
          data: { userId }
        })
      });

      if (error) throw error;
      setProfileDetails(data);
    } catch (error) {
      console.error('プロフィール詳細の取得に失敗しました:', error);
    }
  };

  const submitForm = async (
    companyName: string,
    companyUrl: string,
    content: string,
    userId: string,
    companyId: string,
    generatedContentId: string
  ) => {
    setIsLoading(true);

    if (!profileDetails) {
      console.error('プロフィール詳細が取得できていません');
      setIsLoading(false);
      return { success: false, status: 'error', errorMessage: 'プロフィール情報の取得に失敗しました' };
    }

    try {
      await updateFormSubmissionStatus(generatedContentId, 'pending');

      const response = await fetch(`${API_URL}/fill-form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: companyUrl,
          form_fill_data: {
            content,
            companyName,
            ...profileDetails
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        await updateFormSubmissionStatus(generatedContentId, 'form_submission_failed', `HTTPエラー! ステータス: ${response.status}, メッセージ: ${errorData.error || '不明なエラー'}`);
        throw new Error(`HTTPエラー! ステータス: ${response.status}, メッセージ: ${errorData.error || '不明なエラー'}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        return { success: true, status: 'success', data: result };
      } else {
        await updateFormSubmissionStatus(generatedContentId, 'form_data_generation_failed', '自動入力データの生成に失敗しました');
        return { success: false, status: 'error', errorMessage: '自動入力データの生成に失敗しました' };
      }
    } catch (error) {
      console.error('フォーム送信エラー:', error);
      if (!['form_detection_failed', 'form_not_found', 'form_submission_failed', 'submission_unconfirmed'].includes(await getCurrentStatus(generatedContentId))) {
        await updateFormSubmissionStatus(generatedContentId, 'general_error', error instanceof Error ? error.message : '不明なエラーが発生しました');
      }
      return { success: false, status: 'error', errorMessage: error instanceof Error ? error.message : '不明なエラーが発生しました' };
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormSubmissionStatus = async (generatedContentId: string, status: string, errorMessage?: string) => {
    console.log('フォーム送信状況を更新中:', { generatedContentId, status, errorMessage });
    try {
      const { data, error } = await supabase.functions.invoke('content-operations', {
        body: JSON.stringify({
          action: 'updateGeneratedContentStatus',
          data: { generatedContentId, status, errorMessage }
        })
      });
  
      if (error) throw error;
  
      console.log('フォーム送信状況が更新されました:', data);
      if (onStatusUpdate) {
        onStatusUpdate(generatedContentId, status, errorMessage);
      }
    } catch (error) {
      console.error('フォーム送信状況の更新に失敗しました:', error);
    }
  };

  const getCurrentStatus = async (generatedContentId: string): Promise<string> => {
    try {
      if (!user?.id) {
        console.error('ユーザーIDが見つかりません');
        return 'error';
      }

      const { data, error } = await supabase.functions.invoke('content-operations', {
        body: JSON.stringify({
          action: 'getUserContents',
          data: { userId: user.id }
        })
      });

      if (error) throw error;

      const content = data.find((item: any) => item.id === generatedContentId);
      return content ? content.status : 'unknown';
    } catch (error) {
      console.error('ステータス取得エラー:', error);
      return 'error';
    }
  };

  return { submitForm, isLoading };
};