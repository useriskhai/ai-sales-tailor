"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BatchJob } from "@/types/batchJob";
import { Template, TemplateMetrics } from "@/types/template";
import { TestAnalysisResult, TestAnalysis } from "@/types/templateTest";
import { useTemplateTest } from "@/hooks/useTemplateTest";
import {
  Settings,
  MessageSquare,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";

interface TemplateOptimizerProps {
  job: BatchJob;
}

export function TemplateOptimizer({ job }: TemplateOptimizerProps) {
  const [template, setTemplate] = useState<Template | null>(null);
  const [testResults, setTestResults] = useState<TestAnalysisResult | null>(null);
  const { getTestResults, analyzeResults } = useTemplateTest();

  useEffect(() => {
    const loadData = async () => {
      if (job.template_id) {
        try {
          // テンプレートの取得処理（実際の実装に合わせて調整）
          // const templateData = await getTemplate(job.template_id);
          // setTemplate(templateData);

          // テスト結果の取得
          const results = await getTestResults(job.template_id);
          if (results.length > 0) {
            const analysis = await analyzeResults(job.template_id);
            const analysisResult: TestAnalysisResult = {
              testId: job.template_id,
              startDate: new Date().toISOString(),
              endDate: new Date().toISOString(),
              sampleSize: results.reduce((acc, curr) => acc + curr.metrics.sampleSize, 0),
              variants: results,
              statisticalSignificance: results[0]?.statisticalSignificance || 0,
              recommendations: results[0]?.recommendations || []
            };
            setTestResults(analysisResult);
          }
        } catch (error) {
          console.error('Failed to load optimization data:', error);
        }
      }
    };

    loadData();
  }, [job.template_id]);

  if (!template || !testResults) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>テンプレート最適化</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* メトリクス */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span className="font-medium">応答率</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {((template.metrics?.responseRate ?? 0) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span className="font-medium">商談化率</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {((template.metrics?.conversionRate ?? 0) * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* 改善提案 */}
        <div>
          <h3 className="text-sm font-medium mb-3">改善提案</h3>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {testResults.recommendations?.map((suggestion, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Settings className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">{suggestion.action}</span>
                    </div>
                    <Badge variant="outline">
                      期待改善率: +{suggestion.expectedImpact.improvement}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {suggestion.reason}
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <TrendingUp className="w-3 h-3" />
                      <span>難易度: {suggestion.implementation.difficulty}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <TrendingUp className="w-3 h-3" />
                      <span>影響時間: {suggestion.implementation.timeToImpact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* 実装の優先順位 */}
        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium mb-3">実装の優先順位</h3>
          <div className="space-y-3">
            {testResults.recommendations?.map((priority, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    {index + 1}
                  </div>
                  <span>{priority.action}</span>
                </div>
                <Badge variant="outline">
                  優先度: {priority.priority}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 