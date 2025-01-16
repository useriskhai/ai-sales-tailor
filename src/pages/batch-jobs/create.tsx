"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { JobCreationWizard } from '@/components/batch-jobs/creation/JobCreationWizard';

export default function CreateBatchJobPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/batch-jobs')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            一覧に戻る
          </Button>
          <div>
            <h1 className="text-2xl font-bold">バッチジョブ作成</h1>
            <p className="text-muted-foreground">新しい自動化タスクを作成</p>
          </div>
        </div>
      </div>

      <JobCreationWizard
        onComplete={() => {
          router.push('/batch-jobs');
        }}
        onCancel={() => {
          router.push('/batch-jobs');
        }}
      />
    </div>
  );
} 