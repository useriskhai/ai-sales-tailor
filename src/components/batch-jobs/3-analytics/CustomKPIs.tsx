"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BatchJob } from "@/types/batchJob";
import {
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";

interface CustomKPIsProps {
  job?: BatchJob | null;
}

interface KPICardProps {
  title: string;
  description: string;
  value: number;
  target: number;
  trend: number;
  unit: string;
}

function KPICard({ title, description, value, target, trend, unit }: KPICardProps) {
  const progress = (value / target) * 100;
  const formattedValue = unit === 'percentage' ? `${(value * 100).toFixed(1)}%` : value.toFixed(0);
  const formattedTarget = unit === 'percentage' ? `${(target * 100).toFixed(1)}%` : target.toFixed(0);
  
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>
        <Badge variant={progress >= 100 ? "success" : "default"}>
          {formattedValue}
        </Badge>
      </div>
      <Progress value={progress} className="mt-2" />
      <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
        <span>目標: {formattedTarget}</span>
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

export function CustomKPIs({ job }: CustomKPIsProps) {
  if (!job) return null;

  // デバッグログを追加
  console.log('CustomKPIs - job:', job);
  console.log('CustomKPIs - kpiConfig:', job.kpiConfig);
  console.log('CustomKPIs - kpiResults:', job.kpiResults);

  const customKPIs = job.kpiConfig?.custom.targets || [];
  const customResults = job.kpiResults?.customResults || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle>カスタムKPI</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {customKPIs.map((kpi) => {
            const result = customResults[kpi.id];
            if (!result) return null;

            return (
              <KPICard
                key={kpi.id}
                title={kpi.name}
                description={kpi.description}
                value={result.value}
                target={result.targetValue}
                trend={result.trend}
                unit={kpi.unit}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 