"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BatchJob } from "@/types/batchJob";
import { GenerationTask } from "@/types/task";

interface BatchReviewProps {
  job: BatchJob | null;
  tasks: GenerationTask[];
  onRegenerate?: (taskIds: string[]) => void;
  onApprove?: (taskIds: string[]) => void;
}

export function BatchReview({
  job,
  tasks,
  onRegenerate,
  onApprove
}: BatchReviewProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'needs_revision' | 'approved'>('all');

  if (!job) return null;

  const reviewableTasks = tasks.filter(task => 
    task.status === 'reviewing' || task.review_status
  );

  const filteredTasks = reviewableTasks.filter(task => {
    if (filterStatus === 'all') return true;
    return task.review_status?.status === filterStatus;
  });

  const stats = {
    reviewed: reviewableTasks.filter(t => t.review_status).length,
    pending: reviewableTasks.filter(t => !t.review_status).length,
    needsRevision: reviewableTasks.filter(t => t.review_status?.status === 'needs_revision').length
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          生成結果の確認
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                確認済み: {stats.reviewed}
              </Badge>
              <Badge variant="outline">
                未確認: {stats.pending}
              </Badge>
              <Badge variant="warning">
                要確認: {stats.needsRevision}
              </Badge>
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => onRegenerate?.(selectedItems)}
                disabled={selectedItems.length === 0}
              >
                選択項目を再生成
              </Button>
              <Button 
                onClick={() => onApprove?.(selectedItems)}
                disabled={selectedItems.length === 0}
              >
                選択項目を承認
              </Button>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* フィルターとソート */}
        <div className="flex items-center space-x-4 mb-4">
          <Select
            value={filterStatus}
            onValueChange={(value: any) => setFilterStatus(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="ステータス" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="needs_revision">要確認</SelectItem>
              <SelectItem value="approved">承認済み</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 結果一覧 */}
        <ScrollArea className="h-[500px]">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="p-4 border-b last:border-b-0"
            >
              <div className="flex items-start space-x-4">
                <Checkbox
                  checked={selectedItems.includes(task.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedItems([...selectedItems, task.id]);
                    } else {
                      setSelectedItems(selectedItems.filter(id => id !== task.id));
                    }
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{task.company.name}</h3>
                      {task.review_status && (
                        <p className="text-sm text-muted-foreground">
                          確認者: {task.review_status.reviewer} | 
                          確認日時: {new Date(task.review_status.reviewed_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Badge variant={
                      !task.review_status ? 'outline' :
                      task.review_status.status === 'needs_revision' ? 'warning' : 
                      'success'
                    }>
                      {!task.review_status ? '未確認' :
                       task.review_status.status === 'needs_revision' ? '要確認' : 
                       '承認済み'}
                    </Badge>
                  </div>
                  <div className="mt-2 prose prose-sm max-w-none">
                    {task.content}
                  </div>
                  {task.review_status?.notes && (
                    <div className="mt-2 p-2 bg-muted rounded">
                      <p className="text-sm font-medium">修正メモ:</p>
                      <p className="text-sm text-muted-foreground">
                        {task.review_status.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 