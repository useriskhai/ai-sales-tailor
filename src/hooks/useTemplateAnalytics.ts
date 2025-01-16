"use client";

import { useState, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useToast } from '@/components/ui/use-toast';
import { Template, TemplateAnalysis } from '@/types/template';
import { Company } from '@/types/company';

interface UseTemplateAnalyticsReturn {
  predictPerformance: (template: Template) => Promise<TemplateAnalysis>;
  analyzeTargetCompany: (template: Template, company: Company) => Promise<TemplateAnalysis>;
  analyzeTestResults: (templateId: string) => Promise<TemplateAnalysis>;
  isLoading: boolean;
}

export function useTemplateAnalytics(): UseTemplateAnalyticsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const supabase = useSupabaseClient();
  const { toast } = useToast();

  const predictPerformance = useCallback(async (template: Template): Promise<TemplateAnalysis> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('template-analytics', {
        body: {
          action: 'predictPerformance',
          data: { templateId: template.id }
        }
      });

      if (error) throw error;
      return data.analysis;
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const analyzeTargetCompany = useCallback(async (template: Template, company: Company): Promise<TemplateAnalysis> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('template-analytics', {
        body: {
          action: 'analyzeTargetCompany',
          data: { templateId: template.id, companyId: company.id }
        }
      });

      if (error) throw error;
      return data.analysis;
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const analyzeTestResults = useCallback(async (templateId: string): Promise<TemplateAnalysis> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('template-analytics', {
        body: {
          action: 'analyzeTestResults',
          data: { templateId }
        }
      });

      if (error) throw error;
      return data.analysis;
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  return {
    predictPerformance,
    analyzeTargetCompany,
    analyzeTestResults,
    isLoading
  };
} 