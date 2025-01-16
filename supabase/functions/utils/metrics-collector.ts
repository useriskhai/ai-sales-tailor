import { supabase } from '../_shared/supabase-client.ts'

interface Metric {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp?: Date;
}

export async function collectMetric(metric: Metric) {
  const { name, value, tags = {}, timestamp = new Date() } = metric;

  try {
    const { error } = await supabase.functions.invoke('log-operations', {
      body: JSON.stringify({
        action: 'insertMetric',
        data: {
          name,
          value,
          tags: JSON.stringify(tags),
          timestamp: timestamp.toISOString()
        }
      })
    });

    if (error) throw error;
    console.log(`メトリクス記録成功: ${name} = ${value}`);
  } catch (error) {
    console.error('メトリクス記録エラー:', error.message);
  }
}

export async function getMetrics(metricName: string, startTime: Date, endTime: Date) {
  try {
    const { data, error } = await supabase.functions.invoke('log-operations', {
      body: JSON.stringify({
        action: 'getMetrics',
        data: {
          metricName,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString()
        }
      })
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('メトリクス取得エラー:', error.message);
    return [];
  }
}

export function recordTaskExecutionTime(taskId: string, executionTime: number) {
  collectMetric({
    name: 'task_execution_time',
    value: executionTime,
    tags: { task_id: taskId }
  });
}

export function recordJobCompletionTime(jobId: string, completionTime: number) {
  collectMetric({
    name: 'job_completion_time',
    value: completionTime,
    tags: { job_id: jobId }
  });
}

export function recordErrorCount(jobId: string) {
  collectMetric({
    name: 'error_count',
    value: 1,
    tags: { job_id: jobId }
  });
}

export function recordMetrics(metric: Metric) {
  collectMetric(metric);
}