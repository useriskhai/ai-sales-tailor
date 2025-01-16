"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, TrendingDown } from "lucide-react";
import { AnalysisPeriod } from '@/types/template';

interface PerformanceMetricsProps {
  metrics: {
    responseRate: number;
    conversionRate: number;
    meetingRate: number;
    errorRate: number;
    qualityScore: number;
    averageProcessingTime: number;
    personalizationScore: number;
  };
  period: AnalysisPeriod;
  onPeriodChange: (period: AnalysisPeriod) => void;
}

export function PerformanceMetrics({
  metrics,
  period,
  onPeriodChange
}: PerformanceMetricsProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">パフォーマンス指標</h3>
        <Select value={period} onValueChange={onPeriodChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="期間を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7日間</SelectItem>
            <SelectItem value="30d">30日間</SelectItem>
            <SelectItem value="90d">90日間</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="反応率"
          value={metrics.responseRate}
          format="percentage"
          trend={0.05}
        />
        <MetricCard
          title="商談化率"
          value={metrics.conversionRate}
          format="percentage"
          trend={0.02}
        />
        <MetricCard
          title="品質スコア"
          value={metrics.qualityScore}
          format="score"
          trend={0.1}
        />
        <MetricCard
          title="平均処理時間"
          value={metrics.averageProcessingTime}
          format="time"
          trend={-0.15}
          trendReverse
        />
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  format: 'percentage' | 'score' | 'time';
  trend: number;
  trendReverse?: boolean;
}

function MetricCard({ title, value, format, trend, trendReverse = false }: MetricCardProps) {
  const formattedValue = format === 'percentage' ? `${(value * 100).toFixed(1)}%` :
                        format === 'score' ? value.toFixed(1) :
                        `${value}分`;

  const trendValue = trendReverse ? -trend : trend;
  const isPositive = trendValue > 0;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold">{formattedValue}</p>
            <div className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              <span className="text-sm">
                {Math.abs(trend * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 