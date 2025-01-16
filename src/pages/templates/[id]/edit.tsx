import { useState, useEffect } from 'react';
import { Template } from '@/types/template';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import { toast } from '@/components/ui/use-toast';
import { TemplateTestingPanel } from '@/components/templates/pages/TemplateTestingPanel';

export default function EditTemplatePage() {
  const router = useRouter();
  const { id } = router.query;
  const [isUpdating, setIsUpdating] = useState(false);
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchTemplate(id);
    }
  }, [id]);

  const fetchTemplate = async (templateId: string) => {
    try {
      const { data: userSession } = await supabase.auth.getSession();
      if (!userSession?.session?.user?.id) {
        throw new Error('認証が必要です');
      }

      const { data, error } = await supabase.functions.invoke('template-operations', {
        body: JSON.stringify({
          action: 'fetchTemplate',
          data: {
            id: templateId,
            userId: userSession.session.user.id,
          },
        }),
      });

      if (error) throw error;
      setTemplate(data);
    } catch (error) {
      console.error('テンプレート取得エラー:', error);
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : 'テンプレートの取得に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateUpdate = async (updatedTemplate: Template) => {
    if (isUpdating) return;
    
    console.log('テンプレート更新処理開始:', {
      templateId: updatedTemplate.id,
      content: updatedTemplate.content
    });
    
    try {
      setIsUpdating(true);
      const { data: userSession } = await supabase.auth.getSession();
      if (!userSession?.session?.user?.id) {
        throw new Error('認証が必要です');
      }

      console.log('template-operations APIを呼び出し:', {
        action: 'updateTemplate',
        templateId: updatedTemplate.id,
        userId: userSession.session.user.id
      });

      const { error } = await supabase.functions.invoke('template-operations', {
        body: JSON.stringify({
          action: 'updateTemplate',
          data: {
            id: updatedTemplate.id,
            userId: userSession.session.user.id,
            content: updatedTemplate.content,
          },
        }),
      });

      if (error) throw error;

      console.log('テンプレート更新API呼び出し完了');
      setTemplate(updatedTemplate);
      console.log('ローカルのテンプレート状態を更新');
      
      toast({
        title: '更新完了',
        description: 'テンプレートを更新しました',
      });

      console.log('最新のテンプレートデータを再取得');
      if (id && typeof id === 'string') {
        fetchTemplate(id);
      }
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

  if (!id || typeof id !== 'string') {
    return null;
  }

  if (isLoading) {
    return <div>読み込み中...</div>;
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