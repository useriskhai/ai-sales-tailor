"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, CheckCircle2, AlertTriangle } from "lucide-react";

interface ProgressOverviewProps {
  total: number;
  generating: number;
  reviewing: number;
  completed: number;
}

interface PhaseIndicatorProps {
  phase: string;
  status: 'pending' | 'current' | 'completed';
  count: number;
  total: number;
  icon: React.ReactNode;
}

function PhaseIndicator({ phase, status, count, total, icon }: PhaseIndicatorProps) {
  return (
    <div className={`
      p-4 rounded-lg border
      ${status === 'completed' ? 'bg-green-50 border-green-200' : 
        status === 'current' ? 'bg-blue-50 border-blue-200' : 
        'bg-gray-50 border-gray-200'}
    `}>
      <div className="flex items-center space-x-3">
        {icon}
        <div>
          <p className="font-medium">{phase}</p>
          <div className="flex items-center space-x-2">
            <Progress 
              value={(count / total) * 100} 
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">
              {count}/{total}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProgressOverview({
  total,
  generating,
  reviewing,
  completed
}: ProgressOverviewProps) {
  const progress = (completed / total) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>進捗状況</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 全体の進捗 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>全体の進捗</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>

          {/* フェーズごとの進捗 */}
          <div className="grid grid-cols-3 gap-4">
            <PhaseIndicator
              phase="生成中"
              status={generating > 0 ? 'current' : completed === total ? 'completed' : 'pending'}
              count={generating}
              total={total}
              icon={<Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
            />
            <PhaseIndicator
              phase="レビュー中"
              status={reviewing > 0 ? 'current' : completed === total ? 'completed' : 'pending'}
              count={reviewing}
              total={total}
              icon={<MessageSquare className="w-5 h-5 text-yellow-500" />}
            />
            <PhaseIndicator
              phase="完了"
              status={completed === total ? 'completed' : 'pending'}
              count={completed}
              total={total}
              icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
            />
          </div>

          {/* 統計情報 */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-muted-foreground">総タスク数</p>
              <p className="text-2xl font-bold">{total}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-muted-foreground">生成中</p>
              <p className="text-2xl font-bold text-blue-500">{generating}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-muted-foreground">レビュー中</p>
              <p className="text-2xl font-bold text-yellow-500">{reviewing}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-muted-foreground">完了</p>
              <p className="text-2xl font-bold text-green-500">{completed}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 