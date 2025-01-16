"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Crown,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Info,
  Users,
  Target,
  BarChart2
} from "lucide-react";
import { TestAnalysisResult, MetricType } from '@/types/analytics';

interface TestResultsViewProps {
  results: TestAnalysisResult;
  showDetails?: boolean;
  className?: string;
}

export function TestResultsView({ results, showDetails = true, className = '' }: TestResultsViewProps) {
  const formatMetricValue = (value: number, metric: MetricType) => {
    if (metric.includes('rate')) {
      return `${(value * 100).toFixed(1)}%`;
    }
    return value.toFixed(2);
  };

  const getMetricTrend = (value: number, baseline: number) => {
    const improvement = ((value - baseline) / baseline) * 100;
    if (improvement > 5) {
      return { icon: TrendingUp, color: 'text-green-500', value: improvement };
    } else if (improvement < -5) {
      return { icon: TrendingDown, color: 'text-red-500', value: improvement };
    }
    return { icon: TrendingUp, color: 'text-yellow-500', value: improvement };
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* サマリー */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>テスト結果サマリー</CardTitle>
            <Badge variant="outline">
              信頼度: {(results.statisticalSignificance * 100).toFixed(1)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span className="font-medium">サンプルサイズ</span>
              </div>
              <p className="text-2xl font-bold mt-2">{results.sampleSize}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span className="font-medium">最大改善率</span>
              </div>
              <p className="text-2xl font-bold mt-2 text-green-500">
                +{(Math.max(...results.variants.map(v => v.improvement)) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <BarChart2 className="w-4 h-4" />
                <span className="font-medium">テスト期間</span>
              </div>
              <p className="text-sm mt-2">
                {new Date(results.startDate).toLocaleDateString()} - {new Date(results.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* バリアント比較 */}
      <Card>
        <CardHeader>
          <CardTitle>バリアント比較</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>バリアント</TableHead>
                  <TableHead>サンプル数</TableHead>
                  <TableHead>応答率</TableHead>
                  <TableHead>商談化率</TableHead>
                  <TableHead>改善率</TableHead>
                  <TableHead>信頼度</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.variants.map((variant) => {
                  const baselineMetrics = results.variants[0].metrics;
                  return (
                    <TableRow key={variant.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {variant.isWinner && <Crown className="w-4 h-4 text-yellow-500" />}
                          <span>{variant.id}</span>
                        </div>
                      </TableCell>
                      <TableCell>{variant.metrics.sampleSize}</TableCell>
                      {Object.entries(variant.metrics).map(([key, value]) => {
                        if (key === 'sampleSize') return null;
                        const trend = getMetricTrend(value, baselineMetrics[key]);
                        const TrendIcon = trend.icon;
                        return (
                          <TableCell key={key}>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <div className="flex items-center space-x-2">
                                    <span>{formatMetricValue(value, key as MetricType)}</span>
                                    <TrendIcon className={`w-4 h-4 ${trend.color}`} />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {trend.value > 0 ? '+' : ''}
                                    {trend.value.toFixed(1)}% vs コントロール
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        );
                      })}
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className={variant.improvement > 0 ? 'text-green-500' : 'text-red-500'}>
                            {variant.improvement > 0 ? '+' : ''}
                            {(variant.improvement * 100).toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={variant.confidence * 100} className="w-20" />
                          <span className="text-sm">
                            {(variant.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {showDetails && (
        <>
          {/* 推奨アクション */}
          <Card>
            <CardHeader>
              <CardTitle>推奨アクション</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.recommendations?.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      {rec.priority === 'high' ? (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      ) : rec.priority === 'medium' ? (
                        <Info className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{rec.action}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{rec.reason}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge variant="outline">
                          期待改善: +{(rec.expectedImpact.improvement * 100).toFixed(1)}%
                        </Badge>
                        <Badge variant="outline">
                          難易度: {rec.implementation.difficulty}
                        </Badge>
                        <Badge variant="outline">
                          効果: {rec.implementation.timeToImpact}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 統計的有意性の説明 */}
          {results.statisticalSignificance < 0.95 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">統計的有意性が低い</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      より確実な結論を得るためには、さらにサンプルサイズを増やすことを推奨します。
                      現在の信頼度は{(results.statisticalSignificance * 100).toFixed(1)}%です。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
} 