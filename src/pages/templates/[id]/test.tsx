import React from 'react';
import { useRouter } from 'next/router';
import { TemplateTestingPanel } from '@/components/templates/pages/TemplateTestingPanel';
import { useTemplate } from '@/hooks/useTemplate';
import { useState } from 'react';
import { Template } from '@/types/template';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export default function TemplateTestPage() {
  const router = useRouter();
  const { id } = router.query;
  const { session } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const {
    template,
    isLoading,
    error,
    mutate: refetchTemplate
  } = useTemplate(typeof id === 'string' ? id : undefined);

  const handleTemplateUpdate = async (updatedTemplate: Template) => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      
      if (!session?.user?.id) {
        throw new Error('認証が必要です');
      }

      const { error } = await supabase.functions.invoke('template-operations', {
        body: JSON.stringify({
          action: 'updateTemplate',
          data: {
            id: updatedTemplate.id,
            userId: session.user.id,
            content: updatedTemplate.content,
          },
        }),
      });

      if (error) throw error;

      toast({
        title: '更新完了',
        description: 'テンプレートを更新しました',
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
      await refetchTemplate();
    } catch (error) {
      console.error('テンプレート更新エラー:', error);
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : 'テンプレートの更新に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!session) {
    return (
      <div className="space-y-4">
        <p>このページにアクセスするにはログインが必要です</p>
        <button
          onClick={() => router.push('/login')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          ログインページへ
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <div>テンプレートを読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">エラーが発生しました: {error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          再読み込み
        </button>
      </div>
    );
  }

  if (!template) {
    return <div>テンプレートが見つかりません</div>;
  }

  return (
    <div className="container py-6">
      <TemplateTestingPanel
        template={template}
        onTemplateUpdate={handleTemplateUpdate}
      />
    </div>
  );
}
