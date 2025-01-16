"use client";

interface PerformanceChartProps {
  data: Array<{
    date: string;
    response_rate: number;
    conversion_rate: number;
  }>;
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center">
        データがありません
      </div>
    );
  }

  // シンプルなバーチャートの実装
  return (
    <div className="h-[200px] relative">
      <div className="absolute inset-0 flex items-end justify-between px-4">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="text-xs text-muted-foreground mb-1">
              {(item.response_rate * 100).toFixed(1)}%
            </div>
            <div
              className="w-8 bg-primary/20 rounded-t"
              style={{
                height: `${item.response_rate * 100}%`,
              }}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {item.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 