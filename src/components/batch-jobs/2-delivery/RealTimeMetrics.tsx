"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Timer,
  TrendingUp,
  MoreHorizontal
} from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface RealTimeMetricsProps {
  jobId: string;
  templateId: string;
}

// メトリクスカードコンポーネント
function MetricCard({ title, value, icon: Icon, trend, description }: any) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Card className="cursor-help transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Icon className={`w-5 h-5 ${
                    trend === "positive" ? "text-green-500" :
                    trend === "negative" ? "text-red-500" :
                    "text-blue-500"
                  }`} />
                  <p className="text-sm font-medium text-muted-foreground">{title}</p>
                </div>
                <p className="text-3xl font-bold tracking-tight">{value}</p>
              </div>
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">{title}について</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

function TimelineProgress({ completedTasks, totalTasks, estimatedCompletion }: {
  completedTasks: number;
  totalTasks: number;
  estimatedCompletion: Date;
}) {
  const now = new Date();
  const remainingMinutes = Math.max(0, Math.round((estimatedCompletion.getTime() - now.getTime()) / 60000));
  const progress = (completedTasks / totalTasks) * 100;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Timer className="w-5 h-5 text-blue-500" />
          <div>
            <h3 className="font-medium">予測完了まで</h3>
            <p className="text-2xl font-bold tracking-tight">
              {remainingMinutes}分
            </p>
          </div>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <TrendingUp className="w-4 h-4 mr-2 inline-block" />
          {Math.round((completedTasks / Math.max(1, totalTasks)) * 100)}件/分
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium">{completedTasks}/{totalTasks} 完了</span>
          <span className="text-muted-foreground">{progress.toFixed(1)}%</span>
        </div>
        
        <Progress 
          value={progress} 
          className="h-3"
        />
      </div>
    </div>
  );
}

export function RealTimeMetrics({ jobId, templateId }: RealTimeMetricsProps) {
  const [metrics, setMetrics] = useState({
    successRate: 0.85,
    errorRate: 0.03,
    averageProcessingTime: 2.5,
    completedTasks: 75,
    totalTasks: 100,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        successRate: 0.8 + Math.random() * 0.1,
        errorRate: 0.02 + Math.random() * 0.02
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const estimatedCompletion = new Date(Date.now() + 30 * 60000);

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg font-medium">進捗状況</CardTitle>
        </CardHeader>
        <CardContent>
          <TimelineProgress
            completedTasks={metrics.completedTasks}
            totalTasks={metrics.totalTasks}
            estimatedCompletion={estimatedCompletion}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          title="成功率"
          value={`${(metrics.successRate * 100).toFixed(1)}%`}
          icon={CheckCircle2}
          trend="positive"
          description="正常に処理されたタスクの割合です。90%以上が目標値です。"
        />
        <MetricCard
          title="エラー率"
          value={`${(metrics.errorRate * 100).toFixed(1)}%`}
          icon={XCircle}
          trend="negative"
          description="処理に失敗したタスクの割合です。5%未満に抑えることが推奨されます。"
        />
        <MetricCard
          title="平均処理時間"
          value={`${metrics.averageProcessingTime}秒`}
          icon={Clock}
          trend="neutral"
          description="1タスクあたりの平均処理時間です。通常は2-3秒が目安です。"
        />
      </div>
    </div>
  );
} 