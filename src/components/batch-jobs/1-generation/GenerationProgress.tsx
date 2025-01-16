"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BatchJob } from "@/types/batchJob";
import { GenerationTask } from "@/types/task";
import {
  Loader2,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface GenerationProgressProps {
  job?: BatchJob | null;
  tasks?: GenerationTask[];
}

export function GenerationProgress({ job, tasks = [] }: GenerationProgressProps) {
  if (!job) return null;

  const taskGroups = {
    generating: tasks.filter(t => t.status === 'generating'),
    reviewing: tasks.filter(t => t.status === 'reviewing'),
    approved: tasks.filter(t => t.status === 'approved'),
    rejected: tasks.filter(t => t.status === 'rejected')
  };

  const totalTasks = tasks.length;
  const completedTasks = taskGroups.approved.length + taskGroups.rejected.length;
  const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          レター生成の進捗状況
          <Badge variant="outline">
            完了: {completedTasks}/{totalTasks}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 全体の進捗 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>全体の進捗</span>
              <span>{percentage.toFixed(1)}%</span>
            </div>
            <Progress value={percentage} />
          </div>

          {/* ステータス別の件数 */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-sm font-medium">生成中</span>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline">
                  {taskGroups.generating.length}件
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {totalTasks > 0 ? ((taskGroups.generating.length / totalTasks) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <MessageSquare className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">レビュー待ち</span>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline">
                  {taskGroups.reviewing.length}件
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {totalTasks > 0 ? ((taskGroups.reviewing.length / totalTasks) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">承認済み</span>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="success">
                  {taskGroups.approved.length}件
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {totalTasks > 0 ? ((taskGroups.approved.length / totalTasks) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium">要修正</span>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="destructive">
                  {taskGroups.rejected.length}件
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {totalTasks > 0 ? ((taskGroups.rejected.length / totalTasks) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* 品質スコアの分布 */}
          {tasks.some(t => t.quality_score !== undefined) && (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-3">品質スコアの分布</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">高品質 (90%以上)</div>
                  <Badge variant="success">
                    {tasks.filter(t => t.quality_score && t.quality_score >= 0.9).length}件
                  </Badge>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">中品質 (70-89%)</div>
                  <Badge variant="default">
                    {tasks.filter(t => t.quality_score && t.quality_score >= 0.7 && t.quality_score < 0.9).length}件
                  </Badge>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">要改善 (70%未満)</div>
                  <Badge variant="warning">
                    {tasks.filter(t => t.quality_score && t.quality_score < 0.7).length}件
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 