import { Notification } from '@/types/notification';

export const mockNotifications: Notification[] = [
  {
    id: 'notification-1',
    type: 'info',
    title: 'バッチジョブ完了',
    message: 'バッチジョブの処理が完了しました',
    timestamp: new Date('2024-02-15T10:00:00Z'),
    isRead: false
  },
  {
    id: 'notification-2',
    type: 'error',
    title: 'エラー発生',
    message: 'タスクの処理中にエラーが発生しました',
    timestamp: new Date('2024-02-15T10:05:00Z'),
    isRead: false
  }
]; 