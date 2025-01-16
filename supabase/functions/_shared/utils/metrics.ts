import { createClient } from 'npm:@supabase/supabase-js@2';
import { ProcessMetrics } from '../types/queue.ts';
import { Database } from '../database.types.ts';

/**
 * メトリクスを記録
 * @param supabase Supabaseクライアント
 * @param metrics 記録するメトリクス
 */
export async function recordMetrics(
  supabase: ReturnType<typeof createClient<Database>>,
  metrics: ProcessMetrics
): Promise<void> {
  const { error } = await supabase
    .from('process_metrics')
    .insert([{
      timestamp: metrics.timestamp.toISOString(),
      batch_size: metrics.batch_size,
      success_count: metrics.success_count,
      failure_count: metrics.failure_count,
      processing_time: metrics.processing_time
    }]);

  if (error) {
    console.error('Failed to record metrics:', error);
  }
}

/**
 * エラー率を計算
 * @param metrics メトリクス
 * @returns エラー率（0-1の範囲）
 */
export function calculateErrorRate(metrics: ProcessMetrics): number {
  if (metrics.batch_size === 0) return 0;
  return metrics.failure_count / metrics.batch_size;
}

/**
 * 処理時間の平均を計算
 * @param metrics メトリクス配列
 * @returns 平均処理時間（ミリ秒）
 */
export function calculateAverageProcessingTime(metrics: ProcessMetrics[]): number {
  if (metrics.length === 0) return 0;
  
  const total = metrics.reduce((sum, m) => sum + m.processing_time, 0);
  return total / metrics.length;
}

/**
 * メトリクスのアラートチェック
 * @param metrics メトリクス
 * @returns アラートが必要な場合はtrue
 */
export function shouldAlert(metrics: ProcessMetrics): boolean {
  const errorRate = calculateErrorRate(metrics);
  const ERROR_RATE_THRESHOLD = 0.2; // 20%以上でアラート
  
  return errorRate >= ERROR_RATE_THRESHOLD;
}

/**
 * 最適なバッチサイズを計算
 * @param metrics 過去のメトリクス配列
 * @param targetProcessingTime 目標処理時間（ミリ秒）
 * @returns 推奨バッチサイズ
 */
export function calculateOptimalBatchSize(
  metrics: ProcessMetrics[],
  targetProcessingTime: number
): number {
  if (metrics.length === 0) return 10; // デフォルト値
  
  const avgTimePerItem = calculateAverageProcessingTime(metrics) / metrics[0].batch_size;
  const optimalSize = Math.floor(targetProcessingTime / avgTimePerItem);
  
  // 最小・最大の制限
  return Math.min(Math.max(optimalSize, 1), 50);
} 