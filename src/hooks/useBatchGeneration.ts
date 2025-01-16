"use client";

import { useState } from "react";
import { Company } from "@/types/company";
import { Template } from "@/types/template";
import { isApiError } from "@/types/error";

interface BatchGenerationStatus {
  progress: number;
  completedCount: number;
  processingCount: number;
  pendingCount: number;
  errors: { message: string }[];
}

export function useBatchGeneration() {
  const [status, setStatus] = useState<BatchGenerationStatus>({
    progress: 0,
    completedCount: 0,
    processingCount: 0,
    pendingCount: 0,
    errors: []
  });

  const generateBatch = async (
    template: Template,
    companies: Company[],
  ): Promise<void> => {
    const total = companies.length;
    setStatus(prev => ({
      ...prev,
      pendingCount: total,
      progress: 0
    }));

    for (let i = 0; i < total; i++) {
      try {
        setStatus(prev => ({
          ...prev,
          processingCount: prev.processingCount + 1,
          pendingCount: prev.pendingCount - 1
        }));

        // 実際のAPI呼び出しをここで実装
        await new Promise(resolve => setTimeout(resolve, 1000));

        setStatus(prev => ({
          ...prev,
          completedCount: prev.completedCount + 1,
          processingCount: prev.processingCount - 1,
          progress: ((i + 1) / total) * 100
        }));
      } catch (error: unknown) {
        const errorMessage = isApiError(error) 
          ? error.message 
          : error instanceof Error 
            ? error.message 
            : '不明なエラーが発生しました';

        setStatus(prev => ({
          ...prev,
          errors: [...prev.errors, { message: errorMessage }],
          processingCount: prev.processingCount - 1,
          progress: ((i + 1) / total) * 100
        }));
      }
    }
  };

  return {
    status,
    generateBatch
  };
} 