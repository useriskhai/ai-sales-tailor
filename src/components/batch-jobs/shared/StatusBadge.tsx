"use client";

import React from 'react';
import { Badge } from "@/components/ui/badge";
import {
  PlayCircle,
  PauseCircle,
  StopCircle,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle
} from "lucide-react";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'running':
        return {
          label: '実行中',
          variant: 'default',
          icon: PlayCircle,
          color: 'text-green-500'
        };
      case 'paused':
        return {
          label: '一時停止',
          variant: 'secondary',
          icon: PauseCircle,
          color: 'text-yellow-500'
        };
      case 'completed':
        return {
          label: '完了',
          variant: 'success',
          icon: CheckCircle2,
          color: 'text-green-500'
        };
      case 'error':
        return {
          label: 'エラー',
          variant: 'destructive',
          icon: XCircle,
          color: 'text-red-500'
        };
      case 'pending':
        return {
          label: '待機中',
          variant: 'outline',
          icon: Clock,
          color: 'text-gray-500'
        };
      case 'warning':
        return {
          label: '警告',
          variant: 'warning',
          icon: AlertTriangle,
          color: 'text-yellow-500'
        };
      case 'stopped':
        return {
          label: '停止',
          variant: 'secondary',
          icon: StopCircle,
          color: 'text-gray-500'
        };
      default:
        return {
          label: status,
          variant: 'outline',
          icon: Clock,
          color: 'text-gray-500'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant as any}
      className={className}
    >
      <Icon className={`w-4 h-4 mr-1 ${config.color}`} />
      {config.label}
    </Badge>
  );
} 