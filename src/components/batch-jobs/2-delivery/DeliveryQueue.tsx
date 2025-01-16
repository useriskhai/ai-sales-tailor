"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BatchJob } from "@/types/batchJob";
import { DeliveryQueueItem } from "@/types/delivery";
import { Clock, Send, CheckCircle2, AlertTriangle } from "lucide-react";

interface DeliveryQueueProps {
  job?: BatchJob | null;
}

export function DeliveryQueue({ job }: DeliveryQueueProps) {
  if (!job) return null;

  const queueItems = job.delivery_queue || [];
  const pendingItems = queueItems.filter(item => item.status === 'pending');
  const inProgressItems = queueItems.filter(item => item.status === 'processing');
  const completedItems = queueItems.filter(item => item.status === 'sent');
  const failedItems = queueItems.filter(item => item.status === 'failed');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          送信キュー
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {pendingItems.length + inProgressItems.length}件 待機中
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 進捗バー */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>送信進捗</span>
              <span>
                {completedItems.length}/{queueItems.length}
              </span>
            </div>
            <Progress 
              value={
                (completedItems.length / queueItems.length) * 100
              } 
            />
          </div>

          {/* キュー一覧 */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {/* 送信中 */}
              {inProgressItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border rounded-lg bg-blue-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Send className="w-4 h-4 text-blue-500 animate-pulse" />
                      <span className="font-medium">{item.company?.name}</span>
                    </div>
                    <Badge>送信中</Badge>
                  </div>
                  {item.status_message && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {item.status_message}
                    </p>
                  )}
                </div>
              ))}

              {/* 待機中 */}
              {pendingItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{item.company?.name}</span>
                    </div>
                    <Badge variant="outline">待機中</Badge>
                  </div>
                </div>
              ))}

              {/* 完了 */}
              {completedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border rounded-lg bg-green-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>{item.company?.name}</span>
                    </div>
                    <Badge variant="success">完了</Badge>
                  </div>
                  {item.completed_at && (
                    <p className="text-sm text-muted-foreground mt-2">
                      送信日時: {new Date(item.completed_at).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}

              {/* 失敗 */}
              {failedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border rounded-lg bg-red-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span>{item.company?.name}</span>
                    </div>
                    <Badge variant="destructive">失敗</Badge>
                  </div>
                  {item.error_message && (
                    <p className="text-sm text-red-600 mt-2">
                      {item.error_message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
} 