"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RealTimeMetrics } from "./RealTimeMetrics";
import { BatchJob } from "@/types/batchJob";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Clock,
  Send,
  CheckCircle2,
  AlertTriangle,
  Mail,
  FormInput,
  History,
  RefreshCw,
  Filter,
  ArrowUpDown
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface JobMonitoringDashboardProps {
  job?: BatchJob | null;
}

interface TaskDisplay {
  id: string;
  type: 'queue' | 'letter' | 'failed';
  status: 'pending' | 'processing' | 'sent' | 'failed';
  company_name: string;
  completed_at?: string;
  scheduled_time?: string;
  last_retry?: string;
  error_message?: string;
  retry_count?: number;
  retry_history?: Array<{
    timestamp: string;
    method: 'dm' | 'form';
    success: boolean;
  }>;
}

export function JobMonitoringDashboard({ job }: JobMonitoringDashboardProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'failed'>('all');
  const [sort, setSort] = useState<'time' | 'status'>('time');
  const [retryMethod, setRetryMethod] = useState<'dm' | 'form'>('dm');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);

  if (!job) return null;

  const allTasks: TaskDisplay[] = [
    ...(job.delivery_queue || []).map(item => ({
      id: item.id,
      type: 'queue' as const,
      status: item.status,
      company_name: item.company?.name || '',
      completed_at: item.completed_at,
      scheduled_time: item.created_at,
      error_message: item.error,
      retry_count: item.retry_count
    })),
    ...(job.sent_letters || []).map(letter => ({
      id: letter.id,
      type: 'letter' as const,
      status: 'sent' as const,
      company_name: letter.company_name,
      completed_at: letter.sent_at
    })),
    ...(job.failed_tasks || []).map(task => ({
      id: task.id,
      type: 'failed' as const,
      status: 'failed' as const,
      company_name: task.company_name || '',
      error_message: task.failure_reason,
      retry_count: task.retry_count,
      last_retry: task.failed_at,
      retry_history: task.retry_history
    }))
  ];

  const filteredTasks = allTasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sort === 'time') {
      const aTime = a.completed_at || a.scheduled_time || a.last_retry;
      const bTime = b.completed_at || b.scheduled_time || b.last_retry;
      return new Date(bTime || '').getTime() - new Date(aTime || '').getTime();
    }
    const statusOrder = { failed: 3, processing: 2, pending: 1, sent: 0 };
    return statusOrder[b.status] - statusOrder[a.status];
  });

  const handleRetry = async (taskIds: string[]) => {
    setIsRetrying(true);
    try {
      console.log('Retrying tasks:', taskIds, 'with method:', retryMethod);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="space-y-6">
      <RealTimeMetrics jobId={job.id} templateId={job.product_id} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>送信管理</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {job.completed_tasks}/{job.total_tasks} 完了
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* フィルターとソート */}
          <div className="flex items-center space-x-4 mb-4">
            <Select
              value={filter}
              onValueChange={(value: any) => setFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="ステータスでフィルター" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="pending">待機中</SelectItem>
                <SelectItem value="in_progress">送信中</SelectItem>
                <SelectItem value="completed">完了</SelectItem>
                <SelectItem value="failed">失敗</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sort}
              onValueChange={(value: any) => setSort(value)}
            >
              <SelectTrigger className="w-[180px]">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue placeholder="並び替え" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time">時間順</SelectItem>
                <SelectItem value="status">ステータス順</SelectItem>
              </SelectContent>
            </Select>

            {/* 再試行設定 */}
            {filter === 'failed' && (
              <>
                <Select
                  value={retryMethod}
                  onValueChange={(value: 'dm' | 'form') => setRetryMethod(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="送信方法" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dm">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        DMで送信
                      </div>
                    </SelectItem>
                    <SelectItem value="form">
                      <div className="flex items-center">
                        <FormInput className="w-4 h-4 mr-2" />
                        フォームで送信
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRetry(selectedTasks)}
                  disabled={isRetrying || selectedTasks.length === 0}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                  選択項目を再試行
                </Button>
              </>
            )}
          </div>

          {/* タスク一覧 */}
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {sortedTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-accent ${
                    task.status === 'processing' ? 'bg-blue-50' :
                    task.status === 'sent' ? 'bg-green-50' :
                    task.status === 'failed' ? 'bg-red-50' :
                    ''
                  }`}
                  onClick={() => {
                    console.log('Navigating to task:', task);
                    router.push(`/batch-jobs/${job.id}/delivery/${task.id}`);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {task.status === 'processing' ? (
                        <Send className="w-4 h-4 text-blue-500 animate-pulse" />
                      ) : task.status === 'sent' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : task.status === 'failed' ? (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-500" />
                      )}
                      <div>
                        <p className="font-medium">{task.company_name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {task.type === 'failed' && (
                            <Badge variant="outline" className="text-xs">
                              試行回数: {task.retry_count}/3
                            </Badge>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {task.completed_at ? `完了: ${new Date(task.completed_at).toLocaleString()}` :
                             task.last_retry ? `最終試行: ${new Date(task.last_retry).toLocaleString()}` :
                             task.scheduled_time ? `予定: ${new Date(task.scheduled_time).toLocaleString()}` :
                             ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {task.type === 'failed' && (
                        <Checkbox
                          checked={selectedTasks.includes(task.id)}
                          onCheckedChange={(checked) => {
                            setSelectedTasks(prev => 
                              checked 
                                ? [...prev, task.id]
                                : prev.filter(id => id !== task.id)
                            );
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      <Badge
                        variant={
                          task.status === 'sent' ? 'success' :
                          task.status === 'failed' ? 'destructive' :
                          task.status === 'processing' ? 'default' :
                          'outline'
                        }
                      >
                        {task.status === 'sent' ? '完了' :
                         task.status === 'failed' ? '失敗' :
                         task.status === 'processing' ? '送信中' :
                         '待機中'}
                      </Badge>
                    </div>
                  </div>
                  {task.type === 'failed' && task.error_message && (
                    <div className="mt-2">
                      <p className="text-sm text-red-600 mb-2">
                        {task.error_message}
                      </p>
                      {task.retry_history && (
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <History className="w-4 h-4" />
                          <span>試行履歴:</span>
                          {task.retry_history.map((attempt, index) => (
                            <Badge 
                              key={index}
                              variant={attempt.success ? 'success' : 'destructive'}
                              className="text-xs"
                            >
                              {attempt.method === 'dm' ? 'DM' : 'フォーム'}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}