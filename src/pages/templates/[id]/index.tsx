"use client";

import React from 'react';
import { useEffect, useState } from 'react';
import { useTemplate } from '@/hooks/useTemplate';
import { Template } from '@/types/template';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/router';
import { useSession } from '@/hooks/useSession';
import { TemplateDetails } from '@/components/templates/pages/TemplateDetails';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, Loader2Icon } from 'lucide-react';

export default function TemplateDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [template, setTemplate] = useState<Template | null>(null);
  const { fetchTemplate, isLoading } = useTemplate(id as string);
  const { toast } = useToast();
  const { session, loading: sessionLoading } = useSession();

  useEffect(() => {
    if (!id || sessionLoading) return;

    async function loadTemplate() {
      try {
        const data = await fetchTemplate(id as string);
        setTemplate(data);
      } catch (error) {
        console.error('テンプレート取得エラー:', error);
        toast({
          title: "エラー",
          description: error instanceof Error ? error.message : "テンプレートの取得に失敗しました",
          variant: "destructive",
        });
      }
    }

    if (session?.user?.id) {
      loadTemplate();
    }
  }, [id, fetchTemplate, toast, session, sessionLoading]);

  if (sessionLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2Icon className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session?.user?.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">認証が必要です</h1>
        <Button onClick={() => router.push('/login')}>
          ログインページへ
        </Button>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">テンプレートが見つかりません</h1>
        <Button onClick={() => router.push('/templates')}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          テンプレート一覧に戻る
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button
        variant="ghost"
        onClick={() => router.push('/templates')}
        className="mb-6"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        一覧に戻る
      </Button>

      <TemplateDetails template={template} />
    </div>
  );
} 