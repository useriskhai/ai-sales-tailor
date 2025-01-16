"use client";

import { useState } from 'react';
import { BatchJob } from '@/types/batchJob';
import { mockBatchJobs } from '@/data/mockData/batchJobs';

export function useBatchJob() {
  const [job, setJob] = useState<BatchJob | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getJob = async (id: string) => {
    setIsLoading(true);
    try {
      // モックデータを使用
      const mockJob = mockBatchJobs.find(job => job.id === id);
      setJob(mockJob || null);
    } catch (error) {
      console.error('Failed to fetch job:', error);
      setJob(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshJob = async () => {
    if (job) {
      await getJob(job.id);
    }
  };

  return {
    job,
    isLoading,
    getJob,
    refreshJob
  };
}