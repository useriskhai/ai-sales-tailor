"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PerformanceMetricsProps {
  data: {
    response_rate: number;
    conversion_rate: number;
    trends: Array<{
      date: string;
      value: number;
    }>;
  };
}

export function PerformanceMetrics({ data }: PerformanceMetricsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>パフォーマンス指標</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* 応答率 */}
          <div className="p-4 border rounded-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">応答率</h3>
              <Badge variant={data.response_rate > 0.3 ? "success" : "default"}>
                {(data.response_rate * 100).toFixed(1)}%
              </Badge>
            </div>
          </div>

          {/* 商談化率 */}
          <div className="p-4 border rounded-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">商談化率</h3>
              <Badge variant={data.conversion_rate > 0.1 ? "success" : "default"}>
                {(data.conversion_rate * 100).toFixed(1)}%
              </Badge>
            </div>
          </div>
        </div>

        {/* トレンド表示 */}
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-4">トレンド</h3>
          <div className="relative h-[100px]">
            {data.trends.map((point, i) => (
              <div
                key={point.date}
                className="absolute bottom-0 bg-primary/20 rounded-t"
                style={{
                  left: `${(i / (data.trends.length - 1)) * 100}%`,
                  height: `${point.value * 100}%`,
                  width: '20px',
                  transform: 'translateX(-10px)'
                }}
              >
                <div 
                  className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs"
                >
                  {(point.value * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            {data.trends.map(point => (
              <div key={point.date}>{point.date}</div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 