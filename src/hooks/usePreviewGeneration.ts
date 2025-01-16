"use client";

import { useState } from "react";
import { Company } from "@/types/company";
import { Template } from "@/types/template";

interface PreviewContent {
  id: string;
  content: string;
  metrics: {
    quality: number;
    risk: "low" | "medium" | "high";
  };
}

export function usePreviewGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generatePreviews = async (
    template: Template,
    targets: Company[]
  ): Promise<PreviewContent[]> => {
    setIsGenerating(true);
    try {
      // サンプルプレビューの生成（最初の数件のみ）
      const previewCompanies = targets.slice(0, 3);
      const previews: PreviewContent[] = [];

      for (const company of previewCompanies) {
        setProgress((previews.length / 3) * 100);
        
        // 実際のAPI呼び出しをここで実装
        const preview = await generateSinglePreview(template, company);
        previews.push(preview);
      }

      return previews;
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return {
    generatePreviews,
    isGenerating,
    progress,
  };
}

// ヘルパー関数
async function generateSinglePreview(
  template: Template,
  company: Company
): Promise<PreviewContent> {
  // モック実装
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    id: `preview-${company.id}`,
    content: `${company.name}様へのセールスレター...`,
    metrics: {
      quality: Math.random() * 100,
      risk: Math.random() > 0.7 ? "high" : Math.random() > 0.3 ? "medium" : "low"
    }
  };
} 