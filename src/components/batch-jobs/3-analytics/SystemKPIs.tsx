"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BatchJob } from "@/types/batchJob";
import {
  MessageSquare,
  Target,
  CheckCircle2,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";

interface SystemKPIsProps {
  job?: BatchJob | null;
}

interface KPICardProps {
  title: string;
  value: number;
  target: number;
  trend: number;
  icon: any;
}

function KPICard({ title, value, target, trend, icon: Icon }: KPICardProps) {
  const progress = (value / target) * 100;
  
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <span className="font-medium">{title}</span>
        </div>
        <Badge variant={progress >= 100 ? "success" : "default"}>
          {value.toFixed(1)}
        </Badge>
      </div>
      <Progress value={progress} className="mt-2" />
      <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
        <span>目標: {target}</span>
        <div className="flex items-center gap-1">
          {trend > 0 ? <ArrowUp className="w-4 h-4 text-green-500" /> :
           trend < 0 ? <ArrowDown className="w-4 h-4 text-red-500" /> :
           <Minus className="w-4 h-4" />}
          {Math.abs(trend * 100).toFixed(1)}%
        </div>
      </div>
    </div>
  );
}

export function SystemKPIs({ job }: SystemKPIsProps) {
  if (!job) return null;

  // デバッグログを追加
  console.log('SystemKPIs - job:', job);
  console.log('SystemKPIs - kpiConfig:', job.kpiConfig);
  console.log('SystemKPIs - kpiResults:', job.kpiResults);

  const systemKPIs = job.kpiConfig?.system.targets || [];
  const systemResults = job.kpiResults?.systemResults || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle>システムKPI</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {systemKPIs.map((kpi) => {
            const result = systemResults[kpi.metric];
            if (!result) return null;

            return (
              <KPICard
                key={kpi.metric}
                title={kpi.metric === 'form_link_click' ? 'フォームリンククリック数' : 'フォームリンククリック率'}
                value={result.value}
                target={result.targetValue}
                trend={result.trend}
                icon={kpi.metric === 'form_link_click' ? Target : MessageSquare}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}