"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTemplate } from "@/hooks/useTemplate";
import { useTemplateAnalytics } from "@/hooks/useTemplateAnalytics";
import { PerformanceMetrics } from "@/components/analytics/PerformanceMetrics";
import { TestResultsChart } from "@/components/analytics/TestResultsChart";
import { Template } from "@/types/template";
import { AnalysisPeriod } from "@/types/analytics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  BarChart2,
  TrendingUp,
  Target,
  Calendar,
  Star,
  AlertTriangle,
  CheckCircle2,
  RefreshCw
} from "lucide-react";

// 業界インサイトの型定義
interface IndustryInsight {
  industry: string;
  topTemplates: Template[];
  benchmarks: {
    metric: string;
    average: number;
    topQuartile: number;
  }[];
  recommendations: {
    action: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
    expectedImpact: {
      improvement: number;
    };
    implementation: {
      difficulty: string;
    };
  }[];
}

export default function TemplateAnalyticsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [period, setPeriod] = useState<AnalysisPeriod>('30d');
  const [isLoading, setIsLoading] = useState(false);

  const { fetchTemplates } = useTemplate();
  const { predictPerformance } = useTemplateAnalytics();

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      loadAnalytics();
    }
  }, [selectedTemplate, period]);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const data = await fetchTemplates();
      setTemplates(data);
      if (data.length > 0) {
        setSelectedTemplate(data[0]);
      }
    } catch (error) {
      console.error('テンプレート一覧の取得に失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    if (!selectedTemplate) return;
    setIsLoading(true);
    try {
      // 業界別インサイトは決して
      // const insights = await Promise.all(
      //   Object.keys(selectedTemplate.metrics.industryPerformance).map(industry =>
      //     analyzeTargetCompany(industry)
      //   )
      // );
      // setIndustryInsights(insights);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getPerformanceIndicator = (value: number) => {
    if (value > 0.5) return { icon: CheckCircle2, color: 'text-green-500' };
    if (value > 0.3) return { icon: TrendingUp, color: 'text-yellow-500' };
    return { icon: AlertTriangle, color: 'text-red-500' };
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">テンプレート分析</h1>
          <p className="text-muted-foreground">
            パフォーマンス指標と最適化機会の分析
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select
            value={period}
            onValueChange={(value: AnalysisPeriod) => setPeriod(value)}
          >
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="期間を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24時間</SelectItem>
              <SelectItem value="7d">7日間</SelectItem>
              <SelectItem value="30d">30日間</SelectItem>
              <SelectItem value="90d">90日間</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={loadAnalytics}
            disabled={isLoading || !selectedTemplate}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            更新
          </Button>
        </div>
      </div>

      {/* テンプレート選択 */}
      <ScrollArea className="h-[120px] border rounded-lg">
        <div className="flex p-4 space-x-4">
          {templates.map((template) => {
            const performance = getPerformanceIndicator(template.metrics?.successRate ?? 0);
            const PerformanceIcon = performance.icon;
            
            return (
              <Card
                key={template.id}
                className={`cursor-pointer transition-colors hover:bg-accent min-w-[300px] ${
                  selectedTemplate?.id === template.id ? 'border-primary' : ''
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{template.name}</h3>
                      {template.recommended && (
                        <Badge variant="secondary">
                          <Star className="w-3 h-3 mr-1" />
                          おすすめ
                        </Badge>
                      )}
                    </div>
                    <PerformanceIcon className={`w-5 h-5 ${performance.color}`} />
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {template.usage_count}回使用
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {selectedTemplate && (
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">
              <BarChart2 className="w-4 h-4 mr-2" />
              概要
            </TabsTrigger>
            <TabsTrigger value="tests">
              <Target className="w-4 h-4 mr-2" />
              テスト結果
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <PerformanceMetrics
              metrics={{
                responseRate: selectedTemplate?.metrics?.responseRate ?? 0,
                conversionRate: selectedTemplate?.metrics?.conversionRate ?? 0,
                meetingRate: 0,
                errorRate: 0,
                qualityScore: selectedTemplate?.metrics?.qualityScore ?? 0,
                averageProcessingTime: selectedTemplate?.metrics?.averageProcessingTime ?? 0,
                personalizationScore: 0
              }}
              period={period as AnalysisPeriod}
              onPeriodChange={setPeriod}
            />
          </TabsContent>

          <TabsContent value="tests" className="space-y-6">
            {selectedTemplate.metrics?.testHistory?.map((test) => (
              <TestResultsChart
                key={test.testId}
                testResults={{
                  testId: test.testId,
                  startDate: test.startDate,
                  endDate: test.endDate,
                  variants: test.variants.map(v => ({
                    id: v.variantId,
                    metrics: v.metrics,
                    improvement: 0,  // 要計算
                    confidence: 0.95,  // 要計算
                    isWinner: false  // 要判定
                  })),
                  statisticalSignificance: 0.95,  // 要計算
                  recommendations: []  // 要生成
                }}
              />
            ))}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
} 