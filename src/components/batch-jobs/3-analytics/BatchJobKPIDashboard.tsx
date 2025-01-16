"use client";

import { SystemKPIs } from "./SystemKPIs";
import { CustomKPIs } from "./CustomKPIs";
import { InsightPanel } from "./InsightPanel";
import { BatchJob } from "@/types/batchJob";

interface BatchJobKPIDashboardProps {
  job?: BatchJob | null;
}

export function BatchJobKPIDashboard({ job }: BatchJobKPIDashboardProps) {
  if (!job) return null;

  console.log('BatchJobKPIDashboard - job:', job);
  console.log('BatchJobKPIDashboard - kpiConfig:', job.kpiConfig);
  console.log('BatchJobKPIDashboard - kpiResults:', job.kpiResults);

  return (
    <div className="space-y-6">
      <SystemKPIs job={job} />
      <CustomKPIs job={job} />
      <InsightPanel job={job} />
    </div>
  );
} 