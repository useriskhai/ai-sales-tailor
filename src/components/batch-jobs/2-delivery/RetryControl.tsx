"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BatchJob } from "@/types/batchJob";
import {
  RefreshCw,
  AlertTriangle,
  Mail,
  FormInput,
  History,
  CheckCircle2,
  Clock
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface RetryControlProps {
  job?: BatchJob | null;
}

export function RetryControl({ job }: RetryControlProps) {
  const [retryMode, setRetryMode] = useState<'auto' | 'manual'>('auto');
  const [retryMethod, setRetryMethod] = useState<'dm' | 'form'>('dm');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);

  if (!job) return null;

  const failedTasks = job.failed_tasks || [];
  const hasFailedTasks = failedTasks.length > 0;

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          再試行制御
          <div className="flex items-center space-x-2">
            <Badge variant={hasFailedTasks ? "destructive" : "success"}>
              {hasFailedTasks ? `${failedTasks.length}件の失敗` : "すべて成功"}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 再試行設定 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2">再試行モード</h3>
              <Select
                value={retryMode}
                onValueChange={(value: 'auto' | 'manual') => setRetryMode(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="再試行モード" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">自動再試行</SelectItem>
                  <SelectItem value="manual">手動再試行</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">送信方法</h3>
              <Select
                value={retryMethod}
                onValueChange={(value: 'dm' | 'form') => setRetryMethod(value)}
              >
                <SelectTrigger>
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
            </div>
          </div>

          {/* 失敗タスク一覧 */}
          {hasFailedTasks ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h3 className="text-sm font-medium">失敗タスク</h3>
                  <Checkbox
                    checked={selectedTasks.length === failedTasks.length}
                    onCheckedChange={(checked) => {
                      setSelectedTasks(checked ? failedTasks.map(t => t.id) : []);
                    }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedTasks.length}件選択中
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRetry(selectedTasks)}
                    disabled={isRetrying || selectedTasks.length === 0}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                    選択項目を再試行
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRetry(failedTasks.map(t => t.id))}
                    disabled={isRetrying}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                    全て再試行
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {failedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectedTasks.includes(task.id)}
                            onCheckedChange={(checked) => {
                              setSelectedTasks(prev => 
                                checked 
                                  ? [...prev, task.id]
                                  : prev.filter(id => id !== task.id)
                              );
                            }}
                          />
                          <div>
                            <p className="font-medium">{task.company_name}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                試行回数: {task.retry_count}/3
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                最終試行: {new Date(task.last_retry).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRetry([task.id])}
                            disabled={isRetrying}
                          >
                            再試行
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-sm text-red-600 mb-2">
                          {task.error_message}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <History className="w-4 h-4" />
                          <span>試行履歴:</span>
                          {task.retry_history?.map((attempt, index) => (
                            <Badge 
                              key={index}
                              variant={attempt.success ? 'success' : 'destructive'}
                              className="text-xs"
                            >
                              {attempt.method === 'dm' ? 'DM' : 'フォーム'}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="font-medium">すべてのタスクが成功しました</h3>
              <p className="text-sm text-muted-foreground mt-1">
                失敗したタスクはありません
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 