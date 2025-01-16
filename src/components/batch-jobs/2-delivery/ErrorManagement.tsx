"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BatchJob } from "@/types/batchJob";
import { ErrorLog } from "@/types/delivery";
import {
  AlertTriangle,
  AlertOctagon,
  XCircle,
  Clock,
  RefreshCw,
  Filter,
  ArrowUpDown,
  Settings
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ErrorManagementProps {
  job?: BatchJob | null;
}

export function ErrorManagement({ job }: ErrorManagementProps) {
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [sort, setSort] = useState<'time' | 'severity'>('time');
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);

  if (!job) return null;

  const errors = job.error_logs || [];

  const filteredErrors = errors.filter(error => {
    if (filter === 'all') return true;
    return error.severity === filter;
  });

  const sortedErrors = [...filteredErrors].sort((a, b) => {
    if (sort === 'time') {
      return new Date(b.timestamp || b.created_at).getTime() - new Date(a.timestamp || a.created_at).getTime();
    }
    const severityOrder = { high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          エラー管理
          <div className="flex items-center space-x-2">
            <Badge variant="destructive">
              {errors.length}件のエラー
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
              <SelectValue placeholder="重要度でフィルター" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="high">高</SelectItem>
              <SelectItem value="medium">中</SelectItem>
              <SelectItem value="low">低</SelectItem>
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
              <SelectItem value="severity">重要度順</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* エラー一覧 */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {sortedErrors.map((error) => (
              <div
                key={error.id}
                className="p-4 border rounded-lg cursor-pointer hover:bg-accent"
                onClick={() => setSelectedError(error)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {error.severity === 'high' ? (
                      <AlertOctagon className="w-5 h-5 text-red-500" />
                    ) : error.severity === 'medium' ? (
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-500" />
                    )}
                    <div>
                      <p className="font-medium">{error.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {error.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge
                      variant={
                        error.severity === 'high' ? 'destructive' :
                        error.severity === 'medium' ? 'warning' :
                        'default'
                      }
                    >
                      {error.severity}
                    </Badge>
                    <div className="flex flex-col items-end text-sm text-muted-foreground">
                      <span>{new Date(error.timestamp).toLocaleTimeString()}</span>
                      <span>{new Date(error.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>

      {/* エラー詳細モーダル */}
      <Dialog
        open={!!selectedError}
        onOpenChange={() => setSelectedError(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>エラー詳細</DialogTitle>
          </DialogHeader>
          {selectedError && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">エラータイプ</h4>
                <p>{selectedError.type}</p>
              </div>
              <div>
                <h4 className="font-medium">メッセージ</h4>
                <p className="text-muted-foreground">{selectedError.message}</p>
              </div>
              {selectedError.stackTrace && (
                <div>
                  <h4 className="font-medium">スタックトレース</h4>
                  <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                    {selectedError.stackTrace}
                  </pre>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">タイムスタンプ</h4>
                  <p className="text-muted-foreground">
                    {new Date(selectedError.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">重要度</h4>
                  <p className="text-muted-foreground">{selectedError.severity}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
} 