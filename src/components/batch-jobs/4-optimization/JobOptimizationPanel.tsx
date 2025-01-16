"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIAnalysis } from "./AIAnalysis";
import { BatchSuggestions } from "./BatchSuggestions";
import { TemplateOptimizer } from "./TemplateOptimizer";
import { BatchJob } from "@/types/batchJob";

interface JobOptimizationPanelProps {
  job?: BatchJob | null;
}

export function JobOptimizationPanel({ job }: JobOptimizationPanelProps) {
  if (!job) return null;

  return (
    <div className="space-y-6">
      <AIAnalysis job={job} />
      <BatchSuggestions job={job} />
      <TemplateOptimizer job={job} />
    </div>
  );
} 