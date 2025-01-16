import { useState, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useToast } from '@/components/ui/use-toast';
import { 
  TemplateTest, 
  TestStatus, 
  TestVariantResult, 
  TestExecutionContext,
  TestAnalysis 
} from '@/types/templateTest';
import { useTemplateAnalytics } from '@/hooks/useTemplateAnalytics';

interface UseTemplateTestReturn {
  createTest: (templateId: string, config: Partial<TemplateTest>) => Promise<string>;
  updateTest: (testId: string, updates: Partial<TemplateTest>) => Promise<void>;
  startTest: (testId: string) => Promise<void>;
  stopTest: (testId: string) => Promise<void>;
  deleteTest: (testId: string) => Promise<void>;
  getTestResults: (testId: string) => Promise<TestVariantResult[]>;
  analyzeTestResults: (testId: string) => Promise<TestAnalysis>;
  addVariant: (testId: string, variant: Partial<TestVariantResult>) => Promise<void>;
  removeVariant: (testId: string, variantId: string) => Promise<void>;
  analyzeResults: (testId: string) => Promise<TestAnalysis>;
  getRecommendations: (testId: string) => Promise<{
    action: string;
    reason: string;
    expectedImpact: number;
    priority: 'high' | 'medium' | 'low';
  }[]>;
  isLoading: boolean;
  error: Error | null;
}

export function useTemplateTest(): UseTemplateTestReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const supabase = useSupabaseClient();
  const { toast } = useToast();

  const getTestResults = useCallback(async (testId: string): Promise<TestVariantResult[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('template-test-operations', {
        body: {
          action: 'getTestResults',
          data: { testId }
        }
      });

      if (error) throw error;
      return data.results;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [supabase]);

  const analyzeTestResults = useCallback(async (testId: string): Promise<TestAnalysis> => {
    try {
      const { data, error } = await supabase.functions.invoke('template-test-operations', {
        body: {
          action: 'analyzeTestResults',
          data: { testId }
        }
      });

      if (error) throw error;
      return data.analysis as TestAnalysis;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [supabase]);

  const createTest = useCallback(async (templateId: string, config: Partial<TemplateTest>): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('template-test-operations', {
        body: {
          action: 'createTest',
          data: { templateId, config }
        }
      });

      if (error) throw error;
      return data.testId;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [supabase]);

  const updateTest = useCallback(async (testId: string, updates: Partial<TemplateTest>): Promise<void> => {
    try {
      const { error } = await supabase.functions.invoke('template-test-operations', {
        body: {
          action: 'updateTest',
          data: { testId, updates }
        }
      });

      if (error) throw error;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [supabase]);

  const startTest = useCallback(async (testId: string): Promise<void> => {
    try {
      const { error } = await supabase.functions.invoke('template-test-operations', {
        body: {
          action: 'startTest',
          data: { testId }
        }
      });

      if (error) throw error;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [supabase]);

  const stopTest = useCallback(async (testId: string): Promise<void> => {
    try {
      const { error } = await supabase.functions.invoke('template-test-operations', {
        body: {
          action: 'stopTest',
          data: { testId }
        }
      });

      if (error) throw error;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [supabase]);

  const deleteTest = useCallback(async (testId: string): Promise<void> => {
    try {
      const { error } = await supabase.functions.invoke('template-test-operations', {
        body: {
          action: 'deleteTest',
          data: { testId }
        }
      });

      if (error) throw error;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [supabase]);

  const getRecommendations = useCallback(async (testId: string): Promise<{
    action: string;
    reason: string;
    expectedImpact: number;
    priority: 'high' | 'medium' | 'low';
  }[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('template-test-operations', {
        body: {
          action: 'getRecommendations',
          data: { testId }
        }
      });

      if (error) throw error;
      return data.recommendations;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [supabase]);

  const addVariant = useCallback(async (testId: string, variant: Partial<TestVariantResult>): Promise<void> => {
    try {
      const { error } = await supabase.functions.invoke('template-test-operations', {
        body: {
          action: 'addVariant',
          data: { testId, variant }
        }
      });

      if (error) throw error;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [supabase]);

  const removeVariant = useCallback(async (testId: string, variantId: string): Promise<void> => {
    try {
      const { error } = await supabase.functions.invoke('template-test-operations', {
        body: {
          action: 'removeVariant',
          data: { testId, variantId }
        }
      });

      if (error) throw error;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [supabase]);

  const analyzeResults = useCallback(async (testId: string): Promise<TestAnalysis> => {
    try {
      const { data, error } = await supabase.functions.invoke('template-test-operations', {
        body: {
          action: 'analyzeResults',
          data: { testId }
        }
      });

      if (error) throw error;
      return data.analysis as TestAnalysis;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [supabase]);

  return {
    createTest,
    updateTest,
    startTest,
    stopTest,
    deleteTest,
    getTestResults,
    analyzeTestResults,
    addVariant,
    removeVariant,
    analyzeResults,
    getRecommendations,
    isLoading,
    error
  };
} 