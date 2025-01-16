"use client";

import { useState, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useToast } from '@/components/ui/use-toast';
import { Template, PromptConfig, OptimizationRules, PerformanceMetrics } from '@/types/template';
import { TestAnalysis } from '@/types/templateTest';

interface UsetemplateReturn {
  // 基本CRUD操作
  createTemplate: (template: Partial<Template>) => Promise<string>;
  updateTemplate: (id: string, updates: Partial<Template>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  fetchTemplate: (id: string) => Promise<Template>;
  fetchTemplates: (filters?: {
    category?: string;
    industry?: string;
    searchTerm?: string;
  }) => Promise<Template[]>;

  // 分析と最適化
  analyzePerformance: (id: string) => Promise<{
    performance: PerformanceMetrics;
    recommendations: string[];
  }>;
  findSimilarTemplates: (id: string) => Promise<Template[]>;
  getIndustryInsights: (industry: string) => Promise<{
    topTemplates: Template[];
    averageMetrics: Record<string, number>;
    recommendations: string[];
  }>;

  // テンプレート最適化
  optimizePromptConfig: (
    id: string,
    currentConfig: PromptConfig,
    performanceData: TestAnalysis
  ) => Promise<PromptConfig>;
  
  updateOptimizationRules: (
    id: string,
    rules: Partial<OptimizationRules>
  ) => Promise<void>;

  // 状態
  isLoading: boolean;
  error: Error | null;
}

export function usetemplate(): UsetemplateReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const supabase = useSupabaseClient();
  const { toast } = useToast();

  const createTemplate = useCallback(async (template: Partial<Template>): Promise<string> => {
    setIsLoading(true);
    try {
      // セッションの取得を確実に行う
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('認証セッションの取得に失敗しました');
      }
      if (!session) {
        throw new Error('認証セッションが見つかりません');
      }

      console.log('Sending request with token:', session.access_token);

      const { data, error } = await supabase.functions.invoke('template-operations', {
        body: {
          action: 'createTemplate',
          data: {
            ...template,
            userId: session.user.id
          }
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Function error:', error);
        throw error;
      }

      toast({
        title: "テンプレート作成成功",
        description: "新しいテンプレートが作成されました",
      });

      return data.id;
    } catch (err) {
      console.error('Template creation error:', err);
      setError(err as Error);
      toast({
        title: "エラー",
        description: err instanceof Error ? err.message : "テンプレートの作成に失敗しました",
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, toast]);

  const analyzePerformance = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('template-operations', {
        body: {
          action: 'analyzePerformance',
          data: { templateId: id }
        }
      });

      if (error) throw error;

      return {
        performance: data.performance,
        recommendations: data.recommendations
      };
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [supabase]);

  const findSimilarTemplates = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('template-operations', {
        body: {
          action: 'findSimilarTemplates',
          data: { templateId: id }
        }
      });

      if (error) throw error;

      return data.templates;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [supabase]);

  const getIndustryInsights = useCallback(async (industry: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('template-operations', {
        body: {
          action: 'getIndustryInsights',
          data: { industry }
        }
      });

      if (error) throw error;

      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [supabase]);

  const optimizePromptConfig = useCallback(async (
    id: string,
    currentConfig: PromptConfig,
    performanceData: TestAnalysis
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('template-operations', {
        body: {
          action: 'optimizePromptConfig',
          data: {
            templateId: id,
            currentConfig,
            performanceData
          }
        }
      });

      if (error) throw error;

      return data.optimizedConfig;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [supabase]);

  const updateOptimizationRules = useCallback(async (
    id: string,
    rules: Partial<OptimizationRules>
  ) => {
    try {
      const { error } = await supabase.functions.invoke('template-operations', {
        body: {
          action: 'updateOptimizationRules',
          data: {
            templateId: id,
            rules
          }
        }
      });

      if (error) throw error;

      toast({
        title: "最適化ルール更新",
        description: "最適化ルールが更新されました",
      });
    } catch (err) {
      setError(err as Error);
      toast({
        title: "エラー",
        description: "最適化ルールの更新に失敗しました",
        variant: "destructive",
      });
      throw err;
    }
  }, [supabase, toast]);

  return {
    createTemplate,
    updateTemplate: async () => {}, // TODO: 実装
    deleteTemplate: async () => {}, // TODO: 実装
    fetchTemplate: async () => ({ } as Template), // TODO: 実装
    fetchTemplates: async (filters?: {
      category?: string;
      industry?: string;
      searchTerm?: string;
    }) => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session) throw new Error('認証セッションが見つかりません');

        const { data, error } = await supabase.functions.invoke('template-operations', {
          body: {
            action: 'fetchTemplates',
            data: {
              userId: session.user.id,
              ...filters
            }
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        if (error) throw error;
        return data.data || [];
      } catch (err) {
        console.error('Template fetch error:', err);
        setError(err as Error);
        toast({
          title: "エラー",
          description: "テンプレートの取得に失敗しました",
          variant: "destructive",
        });
        return [];
      }
    },
    analyzePerformance,
    findSimilarTemplates,
    getIndustryInsights,
    optimizePromptConfig,
    updateOptimizationRules,
    isLoading,
    error
  };
} 