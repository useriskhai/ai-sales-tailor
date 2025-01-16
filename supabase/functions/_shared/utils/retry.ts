import { QueueItem } from '../types/queue.ts';

/**
 * 指数バックオフを使用して次回の再試行時刻を計算
 * @param retryCount 現在の再試行回数
 * @returns 次回の再試行時刻
 */
export function calculateNextRetry(retryCount: number): Date {
  const backoffMinutes = Math.pow(2, retryCount); // 指数バックオフ: 1, 2, 4, 8, 16...分
  const nextRetry = new Date();
  nextRetry.setMinutes(nextRetry.getMinutes() + backoffMinutes);
  return nextRetry;
}

/**
 * 再試行可能かどうかを判定
 * @param item キューアイテム
 * @param maxRetries 最大再試行回数
 * @returns 再試行可能な場合はtrue
 */
export function canRetry(item: QueueItem, maxRetries: number): boolean {
  return item.retry_count < maxRetries;
}

/**
 * 再試行情報を更新
 * @param item キューアイテム
 * @param maxRetries 最大再試行回数
 * @returns 更新されたキューアイテム
 */
export function updateRetryInfo(item: QueueItem, maxRetries: number): QueueItem {
  const updatedItem = { ...item };
  
  if (canRetry(item, maxRetries)) {
    updatedItem.retry_count += 1;
    updatedItem.next_retry_at = calculateNextRetry(updatedItem.retry_count);
    updatedItem.status = 'pending';
  } else {
    updatedItem.status = 'failed';
    updatedItem.next_retry_at = null;
  }
  
  return updatedItem;
}

/**
 * 再試行待ち時間が経過したかどうかを判定
 * @param item キューアイテム
 * @returns 再試行可能な場合はtrue
 */
export function isRetryDue(item: QueueItem): boolean {
  if (!item.next_retry_at) return false;
  return new Date() >= item.next_retry_at;
} 