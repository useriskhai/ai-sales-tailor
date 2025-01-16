"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BatchJob } from "@/types/batchJob";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Mail,
  MessageSquare,
  History,
  Filter,
  ArrowUpDown
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LucideIcon } from "lucide-react";

interface SendingLogsProps {
  job?: BatchJob | null;
}

interface LogDisplay {
  id: string;
  timestamp: string;
  message: string;
  type: 'error' | 'success' | 'info';
  icon: LucideIcon;
  iconColor: string;
}

export function SendingLogs({ job }: SendingLogsProps) {
  const [filter, setFilter] = useState<'all' | 'error' | 'success' | 'info'>('all');
  const [sort, setSort] = useState<'time' | 'type'>('time');

  if (!job) return null;

  const logs: LogDisplay[] = [
    ...(job.error_logs || []).map(log => ({
      ...log,
      type: 'error' as const,
      icon: AlertTriangle,
      iconColor: 'text-red-500'
    })),
    ...(job.sent_letters || []).map(letter => ({
      id: letter.id,
      timestamp: letter.sent_at,
      message: `${letter.company_name}へ送信完了`,
      type: 'success' as const,
      icon: CheckCircle2,
      iconColor: 'text-green-500'
    })),
    ...(job.delivery_queue || []).filter(item => 
      item.status === 'pending' || item.status === 'processing'
    ).map(item => ({
      id: item.id,
      timestamp: item.created_at,
      message: `${item.company?.name || ''}へ送信中`,
      type: 'info' as const,
      icon: Mail,
      iconColor: 'text-blue-500'
    }))
  ];

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    return log.type === filter;
  });

  const sortedLogs = [...filteredLogs].sort((a, b) => {
    if (sort === 'time') {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
    const typeOrder = { error: 3, info: 2, success: 1 };
    return typeOrder[b.type] - typeOrder[a.type];
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          送信ログ
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {logs.length}件
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* フィルターとソート */}
        <div className="flex items-center space-x-4 mb-4">
          <Select
            value={filter}
            onValueChange={(value: any) => setFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="種類でフィルター" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="error">エラー</SelectItem>
              <SelectItem value="success">成功</SelectItem>
              <SelectItem value="info">実行中</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sort}
            onValueChange={(value: any) => setSort(value)}
          >
            <SelectTrigger className="w-[180px]">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue placeholder="並び替え" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time">時間順</SelectItem>
              <SelectItem value="type">種類順</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ログ一覧 */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {sortedLogs.map((log) => {
              const Icon = log.icon;
              return (
                <div
                  key={log.id}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-5 h-5 ${log.iconColor}`} />
                      <div>
                        <p className="font-medium">{log.message}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        log.type === 'error' ? 'destructive' :
                        log.type === 'success' ? 'success' :
                        'default'
                      }
                    >
                      {log.type === 'error' ? 'エラー' :
                       log.type === 'success' ? '成功' :
                       '実行中'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 