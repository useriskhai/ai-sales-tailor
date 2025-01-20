"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useBatchJob } from "@/hooks/useBatchJob";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Task, GenerationTask } from "@/types/task";
import { BatchJob, BatchJobWithProcessedMetrics, RawBatchJobMetrics } from "@/types/batchJob";

// 各フェーズのコンポーネントをインポート
import { GenerationProgress } from "@/components/batch-jobs/1-generation/GenerationProgress";
import { BatchGeneration } from "@/components/batch-jobs/1-generation/BatchGeneration";
import { JobMonitoringDashboard } from "@/components/batch-jobs/2-delivery/JobMonitoringDashboard";
import { BatchJobKPIDashboard } from "@/components/batch-jobs/3-analytics/BatchJobKPIDashboard";
import { JobOptimizationPanel } from "@/components/batch-jobs/4-optimization/JobOptimizationPanel";
import { StatusBadge } from "@/components/batch-jobs/shared/StatusBadge";

import {
  FileText, Eye, Activity, Settings, ArrowLeft, RefreshCw, PlayCircle, PauseCircle} from "lucide-react";

// 型変換用のヘルパー関数
function convertToRawMetrics(job: BatchJobWithProcessedMetrics): BatchJob {
  if (!job.metrics) return job as BatchJob;

  const rawMetrics: RawBatchJobMetrics = {
    response_rate: job.metrics.responseRate,
    conversion_rate: job.metrics.conversionRate,
    success_rate: job.metrics.successRate,
    average_processing_time: job.metrics.averageProcessingTime,
    target_processing_time: job.metrics.targetProcessingTime,
    concurrent_tasks: job.metrics.concurrentTasks,
    max_concurrent_tasks: job.metrics.maxConcurrentTasks,
    industryPerformance: job.metrics.industryPerformance ? 
      Object.entries(job.metrics.industryPerformance).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: {
          response_rate: value.responseRate,
          conversion_rate: value.conversionRate
        }
      }), {}) : undefined
  };

  return {
    ...job,
    metrics: rawMetrics
  } as BatchJob;
}

// Task[] から GenerationTask[] への変換関数
function convertToGenerationTasks(tasks: Task[]): GenerationTask[] {
  return tasks.map(task => ({
    id: task.id,
    batch_job_id: task.batch_job_id,
    company: {
      id: task.company_id,
      name: task.company_name
    },
    status: convertTaskStatus(task.status),
    content: task.content,
    quality_score: task.metrics?.quality,
    metrics: task.metrics,
    review_status: task.review_status,
    created_at: task.created_at,
    updated_at: task.updated_at
  }));
}

// タスクステータスの変換
function convertTaskStatus(status: Task['status']): GenerationTask['status'] {
  switch (status) {
    case 'waiting': return 'pending';
    case 'processing': return 'generating';
    case 'completed': return 'approved';
    case 'error': return 'rejected';
    default: return 'pending';
  }
}

export default function BatchJobDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [activeTab, setActiveTab] = useState('generation');
  const { job, tasks, isLoading, startJob, pauseJob, getJob } = useBatchJob();

  useEffect(() => {
    if (typeof id === 'string') {
      loadJobDetails();
    }
  }, [id]);

  const loadJobDetails = async () => {
    if (typeof id !== 'string') return;
    try {
      await getJob(id);
    } catch (error) {
      console.error('Failed to load job details:', error);
    }
  };

  const convertedJob = job ? convertToRawMetrics(job) : null;
  const generationTasks = tasks ? convertToGenerationTasks(tasks) : [];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="generation">
            <FileText className="w-4 h-4 mr-2" />
            レター生成
          </TabsTrigger>
          <TabsTrigger value="delivery">
            <Eye className="w-4 h-4 mr-2" />
            送信管理
          </TabsTrigger>
          <TabsTrigger value="analysis">
            <Activity className="w-4 h-4 mr-2" />
            実績分析
          </TabsTrigger>
          <TabsTrigger value="optimization">
            <Settings className="w-4 h-4 mr-2" />
            改善提案
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generation" className="space-y-6">
          <GenerationProgress job={convertedJob} tasks={generationTasks} />
          <BatchGeneration 
            job={convertedJob} 
            tasks={generationTasks}
            onApprove={(taskIds) => {
              console.log('Approve tasks:', taskIds);
            }}
          />
        </TabsContent>

        <TabsContent value="delivery">
          <JobMonitoringDashboard job={convertedJob} />
        </TabsContent>

        <TabsContent value="analysis">
          <BatchJobKPIDashboard job={convertedJob} />
        </TabsContent>

        <TabsContent value="optimization">
          <JobOptimizationPanel job={convertedJob} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
