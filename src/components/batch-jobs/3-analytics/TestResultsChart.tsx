"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  Crown,
  AlertTriangle,
  Target,
  BarChart2,
  BarChartHorizontal,
  Calendar,
  CheckCircle2,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { TestAnalysisResult, MetricType } from '@/types/analytics';

interface TestResultsChartProps {
  testResults: TestAnalysisResult;
  onVariantSelect?: (variantId: string) => void;
}

export function TestResultsChart({ testResults, onVariantSelect }: TestResultsChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('response_rate');

  const formatMetricValue = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getMetricColor = (value: number, baseline: number) => {
    const improvement = ((value - baseline) / baseline) * 100;
    if (improvement > 10) return 'text-green-500';
    if (improvement < -10) return 'text-red-500';
    return 'text-yellow-500';
  };

  return (
    <div className="space-y-6">
      {/* コントロール */}
      <div className="flex justify-between items-center">
        <Select
          value={selectedMetric}
          onValueChange={(value: MetricType) => setSelectedMetric(value)}
        >
          <SelectTrigger className="w-[180px]">
            <Target className="w-4 h-4 mr-2" />
            <SelectValue placeholder="メトリクスを選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="response_rate">応答率</SelectItem>
            <SelectItem value="conversion_rate">商談化率</SelectItem>
            <SelectItem value="meeting_rate">面談設定率</SelectItem>
            <SelectItem value="quality_score">品質スコア</SelectItem>
            <SelectItem value="error_rate">エラー率</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            <Calendar className="w-4 h-4 mr-1" />
            {new Date(testResults.startDate).toLocaleDateString()} - {new Date(testResults.endDate).toLocaleDateString()}
          </Badge>
          <Badge variant="outline">
            サンプルサイズ: {testResults.sampleSize}
          </Badge>
        </div>
      </div>

      {/* バリアント結果 */}
      <Card>
        <CardHeader>
          <CardTitle>バリアント比較</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testResults.variants.map((variant) => (
              <div
                key={variant.id}
                className={`p-4 rounded-lg border ${
                  variant.isWinner ? 'bg-green-50 border-green-200' : ''
                } hover:bg-gray-50 cursor-pointer`}
                onClick={() => onVariantSelect?.(variant.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {variant.isWinner && (
                      <Crown className="w-5 h-5 text-yellow-500" />
                    )}
                    <h4 className="font-medium">バリアント {variant.id}</h4>
                  </div>
                  <Badge variant={variant.improvement > 0 ? "success" : "destructive"}>
                    <span className="flex items-center">
                      {variant.improvement > 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                      {Math.abs(variant.improvement * 100).toFixed(1)}%
                    </span>
                  </Badge>
                </div>

                <div className="space-y-3">
                  {Object.entries(variant.metrics).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{key}</span>
                        <span className="font-medium">{formatMetricValue(value)}</span>
                      </div>
                      <Progress value={value * 100} className="h-2" />
                    </div>
                  ))}
                </div>

                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    サンプル: {variant.metrics.sampleSize}
                  </span>
                  <span className="text-muted-foreground">
                    信頼度: {(variant.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 統計的有意性 */}
      <div className="flex items-center space-x-2">
        <Badge variant="outline" className="text-blue-600">
          信頼度: {(testResults.statisticalSignificance * 100).toFixed(1)}%
        </Badge>
        {testResults.statisticalSignificance < 0.95 && (
          <span className="text-yellow-500 text-sm flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1" />
            より多くのサンプルが必要かもしれません
          </span>
        )}
      </div>
    </div>
  );
} 