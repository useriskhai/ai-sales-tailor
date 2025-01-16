"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BatchJob } from "@/types/batchJob";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Calendar,
  Target
} from "lucide-react";

interface TrendAnalysisProps {
  job?: BatchJob | null;
}

interface TrendDataPoint {
  timestamp: string;
  response_rate: number;
  conversion_rate: number;
  success_rate: number;
}

export function TrendAnalysis({ job }: TrendAnalysisProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);

  useEffect(() => {
    setIsMounted(true);
    if (job) {
      // データの整形
      const data = prepareTrendData(job);
      setTrendData(data);
    }
  }, [job]);

  const prepareTrendData = (job: BatchJob): TrendDataPoint[] => {
    // 実際のデータ整形ロジックを実装
    return [];
  };

  const formatMetricValue = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (!job || !isMounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>トレンド分析</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            読み込み中...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5" />
          <span>トレンド分析</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 期間表示 */}
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(job.created_at).toLocaleDateString()}
            </Badge>
            <Badge variant="outline">
              タスク完了率: {((job.completed_tasks / job.total_tasks) * 100).toFixed(1)}%
            </Badge>
          </div>

          {/* メトリクス表示 */}
          <div className="space-y-4">
            {trendData.map((point, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {new Date(point.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="space-y-3">
                  {/* 応答率 */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">応答率</span>
                      <span className="font-medium">{formatMetricValue(point.response_rate)}</span>
                    </div>
                    <Progress value={point.response_rate * 100} className="h-2" />
                  </div>
                  {/* 商談化率 */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">商談化率</span>
                      <span className="font-medium">{formatMetricValue(point.conversion_rate)}</span>
                    </div>
                    <Progress value={point.conversion_rate * 100} className="h-2" />
                  </div>
                  {/* 成功率 */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">成功率</span>
                      <span className="font-medium">{formatMetricValue(point.success_rate)}</span>
                    </div>
                    <Progress value={point.success_rate * 100} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 概要 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span className="font-medium">平均応答率</span>
              </div>
              <p className="text-2xl font-bold mt-2">
                {formatMetricValue(job.metrics?.response_rate || 0)}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">平均商談化率</span>
              </div>
              <p className="text-2xl font-bold mt-2">
                {formatMetricValue(job.metrics?.conversion_rate || 0)}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span className="font-medium">平均成功率</span>
              </div>
              <p className="text-2xl font-bold mt-2">
                {formatMetricValue(job.metrics?.success_rate || 0)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 