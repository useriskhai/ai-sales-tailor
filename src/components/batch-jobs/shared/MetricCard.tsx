"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: number;
  total?: number;
  icon?: React.ElementType;
  variant?: 'default' | 'success' | 'error' | 'warning';
  className?: string;
}

export function MetricCard({
  title,
  value,
  total,
  icon: Icon,
  variant = 'default',
  className
}: MetricCardProps) {
  const variantStyles = {
    default: 'text-foreground',
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600'
  };

  return (
    <div className={cn("p-4 border rounded-lg", className)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
      </div>
      <div className="flex items-center justify-between">
        <p className={`text-2xl font-bold ${variantStyles[variant]}`}>
          {total ? `${value}/${total}` : value}
        </p>
        {total && (
          <Badge variant="outline">
            {((value / total) * 100).toFixed(1)}%
          </Badge>
        )}
      </div>
    </div>
  );
} 