"use client";

import { Card } from "@/components/ui/card";
import { SuccessRateChart } from "./charts/SuccessRateChart";
import { ProcessingTimeChart } from "./charts/ProcessingTimeChart";
import { ErrorDistributionChart } from "./charts/ErrorDistributionChart";
import { PerformanceTrends } from "./charts/PerformanceTrends";

interface JobPerformanceDashboardProps {
  jobId?: string;
  period?: 'day' | 'week' | 'month';
}

export function JobPerformanceDashboard({ 
  jobId, 
  period = 'day' 
}: JobPerformanceDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">ジョブパフォーマンスダッシュボード</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">成功率推移</h3>
          <SuccessRateChart />
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">処理時間分析</h3>
          <ProcessingTimeChart />
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">エラー分布</h3>
          <ErrorDistributionChart />
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">パフォーマンストレンド</h3>
          <PerformanceTrends />
        </Card>
      </div>
    </div>
  );
} 