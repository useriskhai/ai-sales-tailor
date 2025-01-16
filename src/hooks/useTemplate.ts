"use client";

import { useCallback, useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useAuth } from '@/contexts/AuthContext';
import { Template } from '@/types/template';
import { toast } from "@/components/ui/use-toast";

interface TemplateError extends Error {
  code?: string;
  details?: string;
}

interface UseTemplateReturn {
  template: Template | null;
  isLoading: boolean;
  error: Error | null;
  mutate: () => Promise<void>;
  fetchTemplate: (id: string) => Promise<Template>;
  fetchTemplates: () => Promise<Template[]>;
}

export function useTemplate(templateId?: string): UseTemplateReturn {
  const supabase = useSupabaseClient();
  const { session, loading } = useAuth();
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTemplate = useCallback(async (id: string): Promise<Template> => {
    setIsLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) throw new Error('認証セッションが見つかりません');

      const { data, error } = await supabase.functions.invoke('template-operations', {
        body: {
          action: 'fetchTemplate',
          data: {
            id,
            userId: session.user.id
          }
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;
      const templateData = data.data;
      setTemplate(templateData);
      return templateData;
    } catch (err) {
      console.error('Template fetch error:', err);
      setError(err as Error);
      toast({
        title: "エラー",
        description: "テンプレートの取得に失敗しました",
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const fetchTemplates = useCallback(async (): Promise<Template[]> => {
    setIsLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) throw new Error('認証セッションが見つかりません');

      const { data, error } = await supabase.functions.invoke('template-operations', {
        body: {
          action: 'fetchTemplates',
          data: {
            userId: session.user.id
          }
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;
      return data.data;
    } catch (err) {
      console.error('Templates fetch error:', err);
      setError(err as Error);
      toast({
        title: "エラー",
        description: "テンプレート一覧の取得に失敗しました",
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const mutate = useCallback(async () => {
    try {
      if (!templateId) {
        throw new Error('テンプレートIDが指定されていません');
      }
      await fetchTemplate(templateId);
    } catch (error) {
      console.error('テンプレート再取得エラー:', error);
    }
  }, [fetchTemplate, templateId]);

  useEffect(() => {
    if (!templateId) {
      return;
    }
    fetchTemplate(templateId).catch(console.error);
  }, [fetchTemplate, templateId]);

  return {
    template,
    isLoading,
    error,
    mutate,
    fetchTemplate,
    fetchTemplates
  };
} 