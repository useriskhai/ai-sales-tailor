"use client";

import { useState } from 'react';
import { BatchJob, BatchJobWithProcessedMetrics } from '@/types/batchJob';
import { mockBatchJobs } from '@/data/mockData/batchJobs';
import { Task } from '@/types/task';

interface UseBatchJobReturn {
  job: BatchJob | null;
  tasks: Task[];
  isLoading: boolean;
  startJob: (id: string) => Promise<void>;
  pauseJob: (id: string) => Promise<void>;
  getJob: (id: string) => Promise<void>;
  refreshJob: () => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  jobs: BatchJob[];
}

export function useBatchJob() {
  const [jobs, setJobs] = useState<BatchJob[]>(mockBatchJobs); // Initialize with mock data
  const [job, setJob] = useState<BatchJob | BatchJobWithProcessedMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch a single job by ID
  const getJob = async (id: string) => {
    setIsLoading(true);
    try {
      const mockJob = jobs.find(job => job.id === id);
      setJob(mockJob || null);
    } catch (error) {
      console.error('Failed to fetch job:', error);
      setJob(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh a specific job's data
  const refreshJob = async () => {
    if (job) {
      await getJob(job.id);
    }
  };

  // Delete a job by ID
  const deleteJob = async (id: string) => {
    setIsLoading(true);
    try {
      const updatedJobs = jobs.filter(job => job.id !== id);
      setJobs(updatedJobs);
      if (job?.id === id) {
        setJob(null); // Clear the selected job if it was deleted
      }
    } catch (error) {
      console.error('Failed to delete job:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    jobs,         // List of all jobs
    job,          // Selected job
    isLoading,    // Loading state
    getJob,       // Fetch a job
    refreshJob,   // Refresh a job
    deleteJob     // Delete a job
  } as UseBatchJobReturn;
}
