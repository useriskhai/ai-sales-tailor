import { useState } from 'react';
import { toast } from "@/components/ui/use-toast";

const EXTENSION_ID = process.env.NEXT_PUBLIC_EXTENSION_ID;

export const useFormAutomation = (supabase, session, onStatusUpdate) => {
  const [isLoading, setIsLoading] = useState(false);

  const openContactPage = async (content) => {
    if (!session?.user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('form-finder', {
        body: JSON.stringify({
          url: content.company_url || '',
          userId: session.user.id
        })
      });

      if (error) throw error;

      if (data.formUrl) {
        window.open(data.formUrl, '_blank');
      } else {
        toast({
          title: "通知",
          description: "問い合わせページが見つかりませんでした",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "エラー",
        description: "問い合わせページの検索に失敗しました",
      });
    }
  };

  const autoSubmitForm = async (content) => {
    if (!session?.user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-form-assistant', {
        body: JSON.stringify({
          action: 'sendForm',
          ...content,
          userId: session.user.id
        })
      });

      if (error) throw error;

      onStatusUpdate(content.id, data.status || 'success', data.errorMessage);
      toast({
        title: data.message ? "成功" : "エラー",
        description: data.message || data.error,
        variant: data.message ? "default" : "destructive",
      });
    } catch (error) {
      console.error('自動送信エラー:', error);
      onStatusUpdate(content.id, 'error', error instanceof Error ? error.message : '不明なエラーが発生しました');
      toast({
        title: "エラー",
        description: "自動送信の準備中に予期せぬエラーが発生しました。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const autoFillForm = async (content) => {
    if (!session?.user) {
      toast({
        title: "エラー",
        description: "ログインが必要です。",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-form-assistant', {
        body: JSON.stringify({
          action: 'autoFill',
          url: content.company_url,
          companyName: content.company_name,
          content: content.content,
          userId: session.user.id
        })
      });

      if (error) throw error;

      if (!data || !data.formUrl || !data.formData) {
        throw new Error('サーバーから必要なデータが返されませんでした。');
      }

      if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage(
          EXTENSION_ID,
          {
            action: 'setAutoFillData',
            data: {
              formUrl: data.formUrl,
              formData: data.formData
            }
          },
          async (response) => {
            if (chrome.runtime.lastError) {
              console.error('拡張機能へのメッセージ送信エラー:', chrome.runtime.lastError);
              // エラーの場合のみ新しいタブを開く
              window.open(data.formUrl, '_blank');
              await updateFormSubmissionStatus(content.id, 'extension_communication_failed', chrome.runtime.lastError.message);
            } else {
              console.log('拡張機能からの応答:', response);
              await updateFormSubmissionStatus(content.id, 'auto_fill_ready');
              onStatusUpdate(content.id, 'success', '自動入力準備完了');
              toast({
                title: "自動入力準備完了",
                description: "フォームページが新しいタブで開かれました。拡張機能が自動入力を行います。",
              });
            }
          }
        );
      } else {
        console.warn('Chrome拡張機能APIが利用できません。デバッグモードで実行している可能性があります。');
        window.open(data.formUrl, '_blank');
        await updateFormSubmissionStatus(content.id, 'extension_not_available');
      }
    } catch (error) {
      console.error('自動入力エラー:', error);
      await updateFormSubmissionStatus(content.id, 'auto_fill_failed', error instanceof Error ? error.message : '不明なエラーが発生しました');
      onStatusUpdate(content.id, 'error', error instanceof Error ? error.message : '不明なエラーが発生しました');
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "自動入力の準備中に予期せぬエラーが発生しました。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormSubmissionStatus = async (generatedContentId: string, status: string, errorMessage?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('content-operations', {
        body: JSON.stringify({
          action: 'updateGeneratedContentStatus',
          data: { generatedContentId, status, errorMessage }
        })
      });

      if (error) throw error;

      console.log('フォーム送信状況が更新されました:', data);
    } catch (error) {
      console.error('フォーム送信状況の更新に失敗しました:', error);
    }
  };

  return { openContactPage, autoSubmitForm, autoFillForm, isLoading };
};