"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BatchJob } from "@/types/batchJob";
import { StatusBadge } from "./StatusBadge";
import { Progress } from "@/components/ui/progress";

interface BatchJobListProps {
  jobs: BatchJob[];
  onSelect: (job: BatchJob) => void;
}

export function BatchJobList({ jobs, onSelect }: BatchJobListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>バッチジョブ一覧</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-4 border rounded-lg hover:bg-accent cursor-pointer"
                onClick={() => onSelect(job)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{job.template_name || 'Untitled'}</h3>
                    <p className="text-sm text-muted-foreground">
                      作成日時: {new Date(job.created_at).toLocaleString()}
                    </p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>進捗</span>
                    <span>{job.completed_tasks}/{job.total_tasks}</span>
                  </div>
                  <Progress value={(job.completed_tasks / job.total_tasks) * 100} />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 