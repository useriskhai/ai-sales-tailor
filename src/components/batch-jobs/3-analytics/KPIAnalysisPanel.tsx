"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Template, KPIAnalysis, KPIResult, SYSTEM_METRICS, CUSTOM_KPI_UNITS } from '@/types/template';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon, PencilIcon, CheckIcon, XIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Settings2 } from 'lucide-react';

interface KPIAnalysisPanelProps {
  template: Template;
  batchJobId: string;
  analysis: KPIAnalysis | null;
  onUpdateCustomKPI: (kpiId: string, value: number) => Promise<void>;
}
interface CustomKpi {
  metrics: {
    id: string;
    name: string;
    target: number;
    weight: number;
    unit: string;
  }[];
}

export function KPIAnalysisPanel({
  template,
  batchJobId,
  analysis,
  onUpdateCustomKPI
}: KPIAnalysisPanelProps) {
  const router = useRouter();
  const [editingKPI, setEditingKPI] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  // KPI達成度に基づくスタイルを取得
  const getAchievementStyle = (achievement: number) => {
    if (achievement >= 1) return "text-green-600";
    if (achievement >= 0.8) return "text-yellow-600";
    return "text-red-600";
  };

  // トレンドアイコンを取得
  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUpIcon className="w-4 h-4 text-green-600" />;
    if (trend < 0) return <ArrowDownIcon className="w-4 h-4 text-red-600" />;
    return <MinusIcon className="w-4 h-4 text-gray-600" />;
  };

  // 単位に応じた値のフォーマット
  const formatValue = (value: number, unit: string) => {
    switch (unit) {
      case CUSTOM_KPI_UNITS.PERCENTAGE:
        return `${(value * 100).toFixed(1)}%`;
      case CUSTOM_KPI_UNITS.CURRENCY:
        return `¥${value.toLocaleString()}`;
      case CUSTOM_KPI_UNITS.TIME:
        return `${value}日`;
      default:
        return value.toLocaleString();
    }
  };

  // カスタムKPIの値を更新
  const handleUpdateCustomKPI = async (kpiId: string, value: number, unit: CUSTOM_KPI_UNITS) => {
    try {
      // 保存時に単位に応じた変換を行う
      const convertedValue = convertValueForSave(value, unit);
      await onUpdateCustomKPI(kpiId, convertedValue);
      setEditingKPI(null);
    } catch (error) {
      console.error('Failed to update KPI value:', error);
    }
  };

  // 単位に応じた入力ステップを取得
  const getStepByUnit = (unit: CUSTOM_KPI_UNITS) => {
    switch (unit) {
      case CUSTOM_KPI_UNITS.PERCENTAGE:
        return 0.01;
      case CUSTOM_KPI_UNITS.TIME:
        return 1;
      case CUSTOM_KPI_UNITS.CURRENCY:
        return 1000;
      default:
        return 1;
    }
  };

  // 単位に応じた入力の最小値を取得
  const getMinByUnit = (unit: CUSTOM_KPI_UNITS) => {
    switch (unit) {
      case CUSTOM_KPI_UNITS.PERCENTAGE:
        return 0;
      case CUSTOM_KPI_UNITS.TIME:
        return 0;
      case CUSTOM_KPI_UNITS.CURRENCY:
        return 0;
      default:
        return 0;
    }
  };

  // 単位に応じた入力の最大値を取得
  const getMaxByUnit = (unit: CUSTOM_KPI_UNITS) => {
    switch (unit) {
      case CUSTOM_KPI_UNITS.PERCENTAGE:
        return 1;
      case CUSTOM_KPI_UNITS.TIME:
        return 365;  // 1年
      case CUSTOM_KPI_UNITS.CURRENCY:
        return 1000000000;  // 10億円
      default:
        return 1000000;
    }
  };

  // 単位のラベルを取得
  const getUnitLabel = (unit: CUSTOM_KPI_UNITS) => {
    switch (unit) {
      case CUSTOM_KPI_UNITS.PERCENTAGE:
        return '%';
      case CUSTOM_KPI_UNITS.TIME:
        return '日';
      case CUSTOM_KPI_UNITS.CURRENCY:
        return '円';
      default:
        return '';
    }
  };

  // 編集用の値を単位に応じて変換
  const convertValueForEdit = (value: number, unit: CUSTOM_KPI_UNITS) => {
    if (unit === CUSTOM_KPI_UNITS.PERCENTAGE) {
      return value * 100;
    }
    return value;
  };

  // 保存用の値を単位に応じて変換
  const convertValueForSave = (value: number, unit: CUSTOM_KPI_UNITS) => {
    if (unit === CUSTOM_KPI_UNITS.PERCENTAGE) {
      return value / 100;
    }
    return value;
  };

  // analysisがnullの場合の処理を追加
  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KPI分析</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <p className="text-muted-foreground">分析データが読み込まれていません</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>KPI分析</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/templates/${template.id}?tab=kpi`)}
          >
            <Settings2 className="w-4 h-4 mr-2" />
            KPI設定を編集
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="system">
          <TabsList>
            <TabsTrigger value="system">システムKPI</TabsTrigger>
            <TabsTrigger value="custom">カスタムKPI</TabsTrigger>
          </TabsList>

          <TabsContent value="system" className="space-y-6">
            {Object.entries(analysis.systemResults).map(([metric, result]: [string, KPIResult]) => (
              <div key={metric} className="border p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">
                    {metric === SYSTEM_METRICS.FORM_LINK_CLICK ? 'フォームリンククリック数' : 'フォームリンククリック率'}
                  </Badge>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(result.trend)}
                    <span className={getAchievementStyle(result.achievement)}>
                      {(result.achievement * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>現在値: {formatValue(result.value, 'number')}</span>
                    <span>目標値: {formatValue(result.targetValue, 'number')}</span>
                  </div>
                  <Progress value={result.achievement * 100} />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>サンプル数: {result.sampleSize}</span>
                    <span>前期比: {(result.trend * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            {Object.entries(analysis.customResults).map(([kpiId, result]: [string, KPIResult]) => {
              const kpiConfig = template.settings?.kpi.customKpi.metrics.find(t => t.id === kpiId);

              if (!kpiConfig) return null;

              return (
                <div key={kpiId} className="border p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <Badge variant="outline">{kpiConfig.name}</Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {kpiConfig.description}
                      </p>
                    </div>
                    {editingKPI === kpiId ? (
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Input
                            type="number"
                            value={convertValueForEdit(editValue, kpiConfig.unit as CUSTOM_KPI_UNITS)}
                            onChange={(e) => setEditValue(Number(e.target.value))}
                            className="w-32 pr-8"
                            step={getStepByUnit(kpiConfig.unit as CUSTOM_KPI_UNITS)}
                            min={getMinByUnit(kpiConfig.unit as CUSTOM_KPI_UNITS)}
                            max={getMaxByUnit(kpiConfig.unit as CUSTOM_KPI_UNITS)}
                          />

                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            {getUnitLabel(kpiConfig.unit as CUSTOM_KPI_UNITS)}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUpdateCustomKPI(kpiId, editValue, kpiConfig.unit as CUSTOM_KPI_UNITS)}
                        >
                          <CheckIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingKPI(null)}
                        >
                          <XIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className={getAchievementStyle(result.achievement)}>
                          {(result.achievement * 100).toFixed(1)}%
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingKPI(kpiId);
                            // 編集開始時に単位に応じた変換を行う
                            setEditValue(convertValueForEdit(result.value, kpiConfig.unit as CUSTOM_KPI_UNITS));
                          }}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>現在値: {formatValue(result.value, kpiConfig.unit)}</span>
                      <span>目標値: {formatValue(result.targetValue, kpiConfig.unit)}</span>
                    </div>
                    <Progress value={result.achievement * 100} />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>サンプル数: {result.sampleSize}</span>
                      <span>前期比: {(result.trend * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </TabsContent>
        </Tabs>

        {analysis.insights.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium mb-4">インサイト</h3>
            <div className="space-y-2">
              {analysis.insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    insight.type === 'success' ? 'bg-green-50' :
                    insight.type === 'warning' ? 'bg-yellow-50' :
                    'bg-blue-50'
                  }`}
                >
                  <p className="text-sm">{insight.message}</p>
                  <div className="flex justify-between mt-1 text-sm text-muted-foreground">
                    <span>{insight.metric}</span>
                    <span>影響度: {(insight.impact * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
