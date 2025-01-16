"use client";

import { useRouter } from "next/router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { SystemKPIs } from "@/components/batch-jobs/3-analytics/SystemKPIs";
import { CustomKPIs } from "@/components/batch-jobs/3-analytics/CustomKPIs";
import { TrendAnalysis } from "@/components/batch-jobs/3-analytics/TrendAnalysis";
import { InsightPanel } from "@/components/batch-jobs/3-analytics/InsightPanel";
import { PerformanceChart } from "@/components/batch-jobs/3-analytics/PerformanceChart";
import { PerformanceMetrics } from "@/components/batch-jobs/3-analytics/PerformanceMetrics";
import { useBatchJob } from "@/hooks/useBatchJob";
import { useEffect } from "react";
import { BatchJobKPIDashboard } from "@/components/batch-jobs/3-analytics/BatchJobKPIDashboard";
import { BatchJob, BatchJobMetrics, RawBatchJobMetrics } from "@/types/batchJob";

// メトリクスの変換関数
function convertMetrics(metrics?: RawBatchJobMetrics): BatchJobMetrics | undefined {
  if (!metrics) return undefined;

  return {
    responseRate: metrics.response_rate || 0,
    conversionRate: metrics.conversion_rate || 0,
    successRate: metrics.success_rate || 0,
    averageProcessingTime: metrics.average_processing_time || 0,
    targetProcessingTime: metrics.target_processing_time || 0,
    concurrentTasks: metrics.concurrent_tasks || 0,
    maxConcurrentTasks: metrics.max_concurrent_tasks || 0,
    industryPerformance: metrics.industryPerformance ? 
      Object.entries(metrics.industryPerformance).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: {
          responseRate: value.response_rate,
          conversionRate: value.conversion_rate
        }
      }), {}) : undefined
  };
}

export default function BatchJobAnalytics() {
  const router = useRouter();
  const { id } = router.query;
  const { job, isLoading, getJob, refreshJob } = useBatchJob();

  useEffect(() => {
    if (id) {
      getJob(id as string);
    }
  }, [id, getJob]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-32">
          <p className="text-muted-foreground">読み込み中...</p>
        </CardContent>
      </Card>
    );
  }

  if (!job) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-32">
          <p className="text-muted-foreground">バッチジョブが見つかりません</p>
        </CardContent>
      </Card>
    );
  }

  // パフォーマンスデータの準備
  const performanceData = job.events?.map(event => ({
    date: event.timestamp,
    response_rate: job.metrics?.response_rate || 0,
    conversion_rate: job.metrics?.conversion_rate || 0
  })) || [];

  // メトリクスデータの準備
  const metricsData = {
    response_rate: job.metrics?.response_rate || 0,
    conversion_rate: job.metrics?.conversion_rate || 0,
    trends: job.events?.map(event => ({
      date: event.timestamp,
      value: job.metrics?.response_rate || 0
    })) || []
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/batch-jobs/${id}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            詳細に戻る
          </Button>
          <h1 className="text-2xl font-bold">実績分析</h1>
        </div>
        <Button
          variant="outline"
          onClick={() => refreshJob()}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          更新
        </Button>
      </div>

      {/* KPI表示 */}
      <div className="grid gap-6">
        <BatchJobKPIDashboard job={job} />
      </div>

      {/* パフォーマンス分析 */}
      <div className="grid grid-cols-2 gap-6">
        <PerformanceChart data={performanceData} />
        <PerformanceMetrics data={metricsData} />
      </div>

      {/* トレンド分析とインサイト */}
      <div className="grid grid-cols-2 gap-6">
        <TrendAnalysis job={job} />
        <InsightPanel job={job} />
      </div>
    </div>
  );
} 