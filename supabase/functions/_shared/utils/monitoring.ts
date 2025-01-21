import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.1';
import { ProcessLog } from '../types/queue.ts';
import { Database } from '../database.types.ts';

/**
 * ログレベル
 */
export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

/**
 * Slack通知設定
 */
interface SlackConfig {
  webhookUrl: string;
  channel: string;
}

/**
 * プロセスログを記録
 * @param supabase Supabaseクライアント
 * @param log ログ情報
 */
export async function logProcess(
  supabase: ReturnType<typeof createClient<Database>>,
  log: ProcessLog
): Promise<void> {
  const { error } = await supabase
    .from('process_logs')
    .insert([{
      timestamp: log.timestamp.toISOString(),
      level: log.level,
      message: log.message,
      metadata: log.metadata
    }]);

  if (error) {
    console.error('Failed to record log:', error);
  }
}

/**
 * Slack通知を送信
 * @param config Slack設定
 * @param message 通知メッセージ
 */
export async function notifySlack(
  config: SlackConfig,
  message: string
): Promise<void> {
  try {
    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        channel: config.channel,
        text: message
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to send Slack notification: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Slack notification error:', error);
  }
}

/**
 * エラーログを記録してSlack通知を送信
 * @param supabase Supabaseクライアント
 * @param slackConfig Slack設定
 * @param error エラー情報
 * @param context 追加のコンテキスト情報
 */
export async function logAndNotifyError(
  supabase: ReturnType<typeof createClient<Database>>,
  slackConfig: SlackConfig,
  error: Error,
  context?: Record<string, unknown>
): Promise<void> {
  const timestamp = new Date();
  const message = `Error: ${error.message}`;
  
  // ログを記録
  await logProcess(supabase, {
    timestamp,
    level: LogLevel.ERROR,
    message,
    metadata: {
      error: {
        name: error.name,
        stack: error.stack
      },
      context
    }
  });
  
  // Slack通知
  const slackMessage = [
    `🚨 *Error Alert*`,
    `*Time:* ${timestamp.toISOString()}`,
    `*Error:* ${error.message}`,
    `*Type:* ${error.name}`,
    context ? `*Context:* ${JSON.stringify(context, null, 2)}` : ''
  ].join('\n');
  
  await notifySlack(slackConfig, slackMessage);
}

/**
 * 処理の開始をログに記録
 * @param supabase Supabaseクライアント
 * @param processName プロセス名
 * @param metadata メタデータ
 */
export async function logProcessStart(
  supabase: ReturnType<typeof createClient<Database>>,
  processName: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logProcess(supabase, {
    timestamp: new Date(),
    level: LogLevel.INFO,
    message: `Process started: ${processName}`,
    metadata
  });
}

/**
 * 処理の完了をログに記録
 * @param supabase Supabaseクライアント
 * @param processName プロセス名
 * @param metadata メタデータ
 */
export async function logProcessComplete(
  supabase: ReturnType<typeof createClient<Database>>,
  processName: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logProcess(supabase, {
    timestamp: new Date(),
    level: LogLevel.INFO,
    message: `Process completed: ${processName}`,
    metadata
  });
} 
