"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useBatchJob } from "@/hooks/useBatchJob";
import { useTemplateAnalytics } from "@/hooks/useTemplateAnalytics";

// 3-analytics フォルダからインポート
import { SystemKPIs } from "@/components/batch-jobs/3-analytics/SystemKPIs";
import { CustomKPIs } from "@/components/batch-jobs/3-analytics/CustomKPIs";
import { TrendAnalysis } from "@/components/batch-jobs/3-analytics/TrendAnalysis";
import { InsightPanel } from "@/components/batch-jobs/3-analytics/InsightPanel";

// shared フォルダからインポート
import { StatusBadge } from "@/components/batch-jobs/shared/StatusBadge";
import { MetricCard } from "@/components/batch-jobs/shared/MetricCard";

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
  AlertTriangle,
  Calendar,
  RefreshCw,
  Target,
  Settings,
  Loader2
} from "lucide-react";

export default function BatchJobsAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);
  const { jobs } = useBatchJob();
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      // 分析データの読み込み処理
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast({
        title: "エラー",
        description: "分析データの読み込みに失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">バッチジョブ分析</h1>
          <p className="text-muted-foreground">
            全体のパフォーマンスとトレンド分析
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select
            value={selectedPeriod}
            onValueChange={setSelectedPeriod}
          >
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="期間を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24時間</SelectItem>
              <SelectItem value="7d">7日間</SelectItem>
              <SelectItem value="30d">30日間</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={loadAnalytics}
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            更新
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p className="text-muted-foreground">データを読み込み中...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <SystemKPIs />
          <CustomKPIs />
          <TrendAnalysis />
          <InsightPanel />
        </div>
      )}
    </div>
  );
} 