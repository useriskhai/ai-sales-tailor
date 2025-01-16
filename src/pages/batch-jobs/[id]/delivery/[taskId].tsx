"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DeliveryQueueItem } from "@/types/delivery";
import { Company } from "@/types/company";
import {
  ArrowLeft,
  Clock,
  Send,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Mail,
  MessageSquare,
  History,
  RefreshCw,
  Building,
  Users,
  Phone,
  MapPin
} from "lucide-react";
import { mockDeliveryQueue } from '@/data/mockData/deliveryQueue';
import { mockCompanies } from '@/data/mockData/companies';
import { CompanyDetails } from '@/components/companies/CompanyDetails';

export default function DeliveryTaskDetailsPage() {
  const router = useRouter();
  const { id, taskId } = router.query;
  const [task, setTask] = useState<DeliveryQueueItem | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Router query:', router.query);
    console.log('taskId:', taskId);
    console.log('mockDeliveryQueue:', mockDeliveryQueue);

    if (taskId) {
      const targetTask = mockDeliveryQueue.find(t => t.id === taskId);
      console.log('Found task:', targetTask);

      if (targetTask) {
        setTask(targetTask);
        const companyInfo = mockCompanies[targetTask.company?.id ?? ''];
        console.log('Found company:', companyInfo);
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
          <h1 className="text-2xl font-bold">送信タスク詳細</h1>
          <p className="text-sm text-muted-foreground mt-1">
            タスクID: {task.id}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push(`/batch-jobs/${id}/delivery`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          一覧に戻る
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* メインコンテンツ */}
        <div className="col-span-8 space-y-6">
          {/* 送信内容 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="w-5 h-5" />
                <span>送信内容</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="prose prose-sm max-w-none">
                  {task.status_message || '送信内容がありません'}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* ステータス */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>送信状況</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {task.status === 'sent' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : task.status === 'failed' ? (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    ) : task.status === 'processing' ? (
                      <Send className="w-5 h-5 text-blue-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-gray-500" />
                    )}
                    <div>
                      <span className="font-medium">
                        {task.status === 'sent' ? '送信完了' :
                         task.status === 'failed' ? '送信失敗' :
                         task.status === 'processing' ? '送信中' :
                         '待機中'}
                      </span>
                      <p className="text-sm text-muted-foreground">
                        送信方法: {task.delivery_method === 'dm' ? 'DM' : 'フォーム'}
                      </p>
                    </div>
                  </div>
                  {task.status === 'failed' && (
                    <Button variant="outline" onClick={() => console.log('retry')}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      再試行
                    </Button>
                  )}
                </div>

                {task.error_message && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-600">{task.error_message}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-medium">スケジュール時刻</h4>
                    <p className="text-sm text-muted-foreground">
                      {task.scheduled_time 
                        ? new Date(task.scheduled_time).toLocaleString() 
                        : '-'}
                    </p>
                  </div>
                  {task.completed_at && (
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-medium">完了時刻</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(task.completed_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {task.retry_count > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-medium">試行回数</h4>
                      <p className="text-sm text-muted-foreground">{task.retry_count}回</p>
                    </div>
                  )}
                </div>

                {task.retry_history && task.retry_history.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <History className="w-4 h-4" />
                      <h4 className="text-sm font-medium">試行履歴</h4>
                    </div>
                    <div className="space-y-2">
                      {task.retry_history.map((attempt, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Badge 
                            variant={attempt.success ? 'success' : 'destructive'}
                            className="text-xs"
                          >
                            {attempt.method === 'dm' ? 'DM' : 'フォーム'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(attempt.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* サイドバー */}
        <div className="col-span-4 space-y-6">
          {/* 会社情報 */}
          {company && <CompanyDetails company={company} />}

          {/* タスク情報 */}
        </div>
      </div>
    </div>
  );
} 