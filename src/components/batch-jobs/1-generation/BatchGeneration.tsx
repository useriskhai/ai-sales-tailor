"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, CheckCircle2, Clock, Loader2, Search, MessageSquare } from "lucide-react";
import { BatchJob } from "@/types/batchJob";
import { GenerationTask } from "@/types/task";

interface BatchGenerationProps {
  job: BatchJob | null;
  tasks: GenerationTask[];
  onApprove?: (taskIds: string[]) => void;
}

export function BatchGeneration({ job, tasks, onApprove }: BatchGenerationProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'generating' | 'reviewing' | 'completed'>('generating');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const taskGroups = {
    generating: tasks.filter(t => t.status === 'generating'),
    reviewing: tasks.filter(t => t.status === 'reviewing'),
    completed: tasks.filter(t => ['approved', 'rejected'].includes(t.status))
  };

  const getStatusIcon = (status: GenerationTask['status']) => {
    switch (status) {
      case 'generating':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'reviewing':
        return <MessageSquare className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleTaskClick = (taskId: string) => {
    router.push(`/batch-jobs/${job?.id}/tasks/${taskId}`);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(taskGroups[activeTab].map(task => task.id));
    } else {
      setSelectedTasks([]);
    }
  };

  const handleSelectTask = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTasks([...selectedTasks, taskId]);
    } else {
      setSelectedTasks(selectedTasks.filter(id => id !== taskId));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          タスク一覧
          <div className="flex items-center space-x-4">
            <Badge variant="outline">
              生成中: {taskGroups.generating.length}
            </Badge>
            <Badge variant="outline">
              レビュー待ち: {taskGroups.reviewing.length}
            </Badge>
            <Badge variant="outline">
              完了: {taskGroups.completed.length}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="generating">
                <Loader2 className="w-4 h-4 mr-2" />
                生成中
              </TabsTrigger>
              <TabsTrigger value="reviewing">
                <MessageSquare className="w-4 h-4 mr-2" />
                レビュー待ち
              </TabsTrigger>
              <TabsTrigger value="completed">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                完了
              </TabsTrigger>
            </TabsList>

            {activeTab === 'reviewing' && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => onApprove?.(selectedTasks)}
                  disabled={selectedTasks.length === 0}
                >
                  選択したタスクを承認
                </Button>
              </div>
            )}
          </div>

          {Object.entries(taskGroups).map(([status, groupTasks]) => (
            <TabsContent key={status} value={status}>
              <div className="mb-4 flex items-center space-x-2">
                {status === 'reviewing' && (
                  <>
                    <Checkbox
                      checked={selectedTasks.length === groupTasks.length}
                      onCheckedChange={(checked: boolean) => handleSelectAll(checked)}
                    />
                    <span className="text-sm text-muted-foreground">
                      全て選択 ({selectedTasks.length}/{groupTasks.length})
                    </span>
                  </>
                )}
              </div>
              <ScrollArea className="h-[600px]">
                <div className="grid grid-cols-1 gap-4">
                  {groupTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        {status === 'reviewing' && (
                          <Checkbox
                            checked={selectedTasks.includes(task.id)}
                            onCheckedChange={(checked: boolean) => handleSelectTask(task.id, checked)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => handleTaskClick(task.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(task.status)}
                              <div>
                                <h4 className="font-medium">{task.company.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  作成日時: {new Date(task.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            {task.quality_score && (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">
                                  品質スコア:
                                </span>
                                <Badge variant={task.quality_score > 0.8 ? 'success' : 'warning'}>
                                  {(task.quality_score * 100).toFixed(0)}%
                                </Badge>
                              </div>
                            )}
                          </div>
                          {task.review_status && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              レビュアー: {task.review_status.reviewer} | 
                              確認日時: {new Date(task.review_status.reviewed_at).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
} 