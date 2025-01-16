import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import CompanyManager from '@/components/companies/CompanyManager';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from "@/components/PageHeader";

const CompaniesPage: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <>
      <Head>
        <title>企業管理 - SalesTailor</title>
        <meta name="description" content="企業情報の管理ページです。" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container mx-auto py-8">
        <PageHeader
          title="企業管理"
          description="取引先企業の情報を管理します"
        />
        <CompanyManager />
        <Toaster />
      </div>
    </>
  );
};

export default CompaniesPage;