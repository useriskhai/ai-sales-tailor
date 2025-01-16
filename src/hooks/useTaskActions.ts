import { useState } from 'react';
import { useRouter } from 'next/router';
import { Task } from '@/types/task';
import { TASK_STATUS } from '@/types/batchJob';
import { mockTasks } from '@/data/mockData/tasks';

interface UseTaskActionsProps {
  task: Task;
  batchJobId: string;
}

export const useTaskActions = ({ task, batchJobId }: UseTaskActionsProps) => {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  // 送信承認
  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      // TODO: API実装後に実際の承認処理を追加
      console.log('承認処理:', task.id);
      
      // モック: タスクのステータスを更新
      task.status = TASK_STATUS.COMPLETED;
      
      // 次のタスクへ自動的に移動
      const nextTask = mockTasks.find(t => 
        t.batch_job_id === batchJobId && 
        t.id > task.id && 
        t.status !== TASK_STATUS.COMPLETED
      );
      
      if (nextTask) {
        router.push(`/batch-jobs/${batchJobId}/tasks/${nextTask.id}`);
      } else {
        router.push(`/batch-jobs/${batchJobId}`);
      }
    } catch (error) {
      console.error('承認処理エラー:', error);
      // TODO: エラー通知の実装
    } finally {
      setIsProcessing(false);
    }
  };

  // 送信否認（キャンセル）
  const handleReject = async () => {
    try {
      setIsProcessing(true);
      // TODO: API実装後に実際のキャンセル処理を追加
      console.log('否認処理:', task.id);
      
      // モック: タスクのステータスを更新
      task.status = TASK_STATUS.CANCELLED;
      
      // 次のタスクへ自動的に移動
      const nextTask = mockTasks.find(t => 
        t.batch_job_id === batchJobId && 
        t.id > task.id && 
        t.status !== TASK_STATUS.COMPLETED
      );
      
      if (nextTask) {
        router.push(`/batch-jobs/${batchJobId}/tasks/${nextTask.id}`);
      } else {
        router.push(`/batch-jobs/${batchJobId}`);
      }
    } catch (error) {
      console.error('否認処理エラー:', error);
      // TODO: エラー通知の実装
    } finally {
      setIsProcessing(false);
    }
  };

  // AI修正リクエスト
  const handleAIEdit = async (instructions: string) => {
    try {
      setIsProcessing(true);
      // TODO: API実装後に実際の修正処理を追加
      console.log('AI修正リクエスト:', task.id, instructions);
      
      // モック: タスクのステータスを更新
      task.status = TASK_STATUS.PROCESSING;
      
      // 同じページにとどまり、更新を待つ
      router.reload();
    } catch (error) {
      console.error('AI修正リクエストエラー:', error);
      // TODO: エラー通知の実装
    } finally {
      setIsProcessing(false);
    }
  };

  // 手動編集
  const handleManualEdit = () => {
    router.push(`/batch-jobs/${batchJobId}/tasks/${task.id}/edit`);
  };

  // 次のタスクへ
  const handleNextTask = () => {
    const currentIndex = mockTasks.findIndex(t => t.id === task.id);
    if (currentIndex < mockTasks.length - 1) {
      router.push(`/batch-jobs/${batchJobId}/tasks/${mockTasks[currentIndex + 1].id}`);
    }
  };

  // 前のタスクへ
  const handlePreviousTask = () => {
    const currentIndex = mockTasks.findIndex(t => t.id === task.id);
    if (currentIndex > 0) {
      router.push(`/batch-jobs/${batchJobId}/tasks/${mockTasks[currentIndex - 1].id}`);
    }
  };

  return {
    isProcessing,
    handleApprove,
    handleReject,
    handleAIEdit,
    handleManualEdit,
    handleNextTask,
    handlePreviousTask
  };
}; 