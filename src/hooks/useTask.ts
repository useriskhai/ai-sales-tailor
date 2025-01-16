import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import { mockTasks } from '@/data/mockData';
import { useMockData } from '@/utils/env';
import { TaskStatus, TaskSubStatus, TaskDetailedStatus } from '@/types/batchJob';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { isApiError } from '@/types/error';

export const useTask = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const shouldUseMockData = useMockData();
  const supabase = useSupabaseClient();

  const fetchTasks = useCallback(async () => {
    if (shouldUseMockData) {
      return mockTasks;
    }
    setIsLoading(true);
    try {
      // ... 本番環境の実装
    } catch (error: unknown) {
      console.error('タスクの取得に失敗しました:', error);
      const errorMessage = isApiError(error) 
        ? error.message 
        : error instanceof Error 
          ? error.message 
          : 'タスクの取得に失敗しました';

      toast({
        title: t('エラー'),
        description: t(errorMessage),
        variant: 'destructive',
      });
      return { tasks: [], totalCount: 0 };
    } finally {
      setIsLoading(false);
    }
  }, [shouldUseMockData, t, toast]);

  const updateTaskStatus = useCallback(async (
    taskId: string,
    mainStatus: TaskStatus,
    subStatus: TaskSubStatus,
    detailedStatus: TaskDetailedStatus
  ): Promise<void> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('task-operations', {
        body: JSON.stringify({
          action: 'updateTaskStatus',
          data: { taskId, mainStatus, subStatus, detailedStatus }
        }),
      });
      if (error) throw error;
      toast({
        title: t('成功'),
        description: t('タスクのステータスが更新されました'),
      });
    } catch (error: unknown) {
      console.error('タスクのステータス更新に失敗しました:', error);
      const errorMessage = isApiError(error) 
        ? error.message 
        : error instanceof Error 
          ? error.message 
          : 'タスクのステータス更新に失敗しました';

      toast({
        title: t('エラー'),
        description: t(errorMessage),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [t, toast, supabase]);

  const retryTask = useCallback(async (taskId: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('task-operations', {
        body: JSON.stringify({
          action: 'retryTask',
          data: { taskId }
        }),
      });
      if (error) throw error;
      toast({
        title: t('成功'),
        description: t('タスクの再試行が開始されました'),
      });
    } catch (error: unknown) {
      console.error('タスクの再試行に失敗しました:', error);
      const errorMessage = isApiError(error) 
        ? error.message 
        : error instanceof Error 
          ? error.message 
          : 'タスクの再試行に失敗しました';

      toast({
        title: t('エラー'),
        description: t(errorMessage),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [t, toast, supabase]);

  return {
    fetchTasks,
    updateTaskStatus,
    retryTask,
    isLoading,
  };
};