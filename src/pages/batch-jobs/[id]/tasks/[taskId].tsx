"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Globe, Building, Users, Mail, Phone, MapPin, CheckCircle2, X, MessageSquare, Edit } from "lucide-react";
import { mockTasks } from '@/data/mockData/tasks';
import { mockCompanies } from '@/data/mockData/companies';
import { Task } from '@/types/task';
import { Company } from '@/types/company';
import { useTaskActions } from '@/hooks/useTaskActions';
import { useTaskKeyboardShortcuts } from '@/hooks/useTaskKeyboardShortcuts';
import { TASK_STATUS } from '@/types/batchJob';
import { CompanyDetails } from '@/components/companies/CompanyDetails';

export default function TaskDetailsPage() {
  const router = useRouter();
  const { id, taskId } = router.query;
  const [task, setTask] = useState<Task | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    isProcessing,
    handleApprove,
    handleReject,
    handleAIEdit,
    handleManualEdit,
    handleNextTask,
    handlePreviousTask
  } = useTaskActions({
    task: task!,
    batchJobId: id as string
  });

  useTaskKeyboardShortcuts({
    onApprove: handleApprove,
    onReject: handleReject,
    onAIEdit: () => {
      const notes = prompt('AIへの修正指示内容を入力してください');
      if (notes) {
        handleAIEdit(notes);
      }
    },
    onManualEdit: handleManualEdit,
    onNext: handleNextTask,
    onPrevious: handlePreviousTask,
    isProcessing
  });

  useEffect(() => {
    if (taskId) {
      const targetTask = mockTasks.find(t => t.id === taskId);
      if (targetTask) {
        setTask(targetTask);
        const companyInfo = mockCompanies[targetTask.company_id];
        setCompany(companyInfo);
      }
      setIsLoading(false);
    }
  }, [taskId]);

  if (isLoading || !task) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container max-w-[1200px] mx-auto py-6 px-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">タスク詳細</h1>
          <p className="text-sm text-muted-foreground mt-1">
            タスクID: {task.id}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push(`/batch-jobs/${id}/tasks`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          一覧に戻る
        </Button>
      </div>

      {/* アクションヘッダー */}
      <Card className="sticky top-4 z-40 mb-6">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant={task.status === TASK_STATUS.COMPLETED ? 'default' : 'outline'}
                size="sm"
                className="min-w-[120px]"
                onClick={handleApprove}
                disabled={isProcessing}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                送信する
                <span className="ml-2 text-xs text-muted-foreground">(Enter)</span>
              </Button>
              <Button
                variant={task.status === TASK_STATUS.ERROR ? 'destructive' : 'outline'}
                size="sm"
                className="min-w-[120px]"
                onClick={handleReject}
                disabled={isProcessing}
              >
                <X className="w-4 h-4 mr-2" />
                送信しない
                <span className="ml-2 text-xs text-muted-foreground">(Esc)</span>
              </Button>
            </div>

            <Separator orientation="vertical" className="h-8" />

            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const notes = prompt('AIへの修正指示内容を入力してください');
                  if (notes) {
                    handleAIEdit(notes);
                  }
                }}
                disabled={isProcessing}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                AI修正
                <span className="ml-2 text-xs text-muted-foreground">(A)</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualEdit}
                disabled={isProcessing}
              >
                <Edit className="w-4 h-4 mr-2" />
                手動編集
                <span className="ml-2 text-xs text-muted-foreground">(E)</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-12 gap-6">
        {/* メインコンテンツ */}
        <div className="col-span-8 space-y-6">
          {/* セールスレター */}
          <Card>
            <CardHeader>
              <CardTitle>セールスレター</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="prose prose-sm max-w-none">
                  <h2>{task.title}</h2>
                  <p>{task.content}</p>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* サイドバー */}
        <div className="col-span-4 space-y-6">
          {/* 会社情報 */}
          {company && <CompanyDetails company={company} />}

          {/* タスク情報 */}
          <Card>
            <CardHeader>
              <CardTitle>タスク情報</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-medium">ステータス</h4>
                    <Badge>{task.status}</Badge>
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-medium">作成日時</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(task.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-medium">更新日時</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(task.updated_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-medium">送信方法</h4>
                    <p className="text-sm text-muted-foreground">
                      {task.send_method === 'dm' ? 'DM' : 'フォーム'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 