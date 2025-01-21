import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { TemplateManager } from '@/components/templates/pages/TemplateManager';
import { useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { Template } from '@/types/template';

const TemplatesPage: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleTemplateCreated = (newTemplate: Template) => {
    // テンプレート作成後の処理（必要に応じて実装）
    console.log('新しいテンプレートが作成されました:', newTemplate);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">読み込み中...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>テンプレート管理 - SalesTailor</title>
        <meta name="description" content="SalesTailorのテンプレート管理ページです。" />
      </Head>
      <div className="container mx-auto p-4">
        <TemplateManager onTemplateCreatedAction={handleTemplateCreated} />
        <Toaster />
      </div>
    </>
  );
};

export default TemplatesPage; 
