"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BatchJob } from "@/types/batchJob";
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Info,
  ArrowUp,
  ArrowDown
} from "lucide-react";

interface InsightPanelProps {
  job?: BatchJob | null;
}

export function InsightPanel({ job }: InsightPanelProps) {
  if (!job || !job.insights) return null;

  const { key_findings, performance_analysis, industry_insights } = job.insights;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lightbulb className="w-5 h-5" />
          <span>実績分析インサイト</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 主要な発見 */}
        <div>
          <h3 className="text-sm font-medium mb-3">主要な発見</h3>
          <div className="space-y-3">
            {key_findings.map((finding, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  finding.type === 'positive' ? 'bg-green-50' :
                  finding.type === 'negative' ? 'bg-red-50' :
                  'bg-blue-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {finding.type === 'positive' ? (
                    <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
                  ) : finding.type === 'negative' ? (
                    <TrendingDown className="w-5 h-5 text-red-500 mt-0.5" />
                  ) : (
                    <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">{finding.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {finding.description}
                    </p>
                    {finding.metrics && (
                      <div className="flex flex-wrap gap-4 mt-2">
                        {finding.metrics.map((metric, i) => (
                          <div key={i} className="flex items-center space-x-1">
                            <span className="text-sm text-muted-foreground">
                              {metric.label}:
                            </span>
                            <Badge variant="outline">
                              {metric.value}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* パフォーマンス分析 */}
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-3">パフォーマンス分析</h3>
          <ScrollArea className="h-[200px]">
            <div className="space-y-4">
              {performance_analysis.map((category, index) => (
                <div key={index} className="space-y-3">
                  <h4 className="font-medium text-sm">{category.title}</h4>
                  {category.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{detail.metric}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {detail.analysis}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={detail.achievement_rate >= 0.8 ? "success" : "default"}>
                            {(detail.achievement_rate * 100).toFixed(1)}%
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            {detail.trend.startsWith('+') ? (
                              <ArrowUp className="w-3 h-3 text-green-500" />
                            ) : (
                              <ArrowDown className="w-3 h-3 text-red-500" />
                            )}
                            {detail.trend}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* 業界別インサイト */}
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-3">業界別分析</h3>
          <div className="grid grid-cols-2 gap-4">
            {industry_insights.map((insight, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{insight.industry}</h4>
                  <div className="flex space-x-2">
                    <Badge variant="outline">
                      反応率: {(insight.performance.response_rate * 100).toFixed(1)}%
                    </Badge>
                    <Badge variant="outline">
                      商談化率: {(insight.performance.conversion_rate * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {insight.analysis}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 