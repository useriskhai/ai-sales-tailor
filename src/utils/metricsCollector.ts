import { SupabaseClient } from '@supabase/supabase-js';
import { Template } from '@/types/template';
import { TestAnalysis, TestResult } from '@/types/templateTest';
import { MetricsData, Alert } from '@/types/metrics';

export class MetricsCollector {
  private supabase: SupabaseClient;
  private alerts: Alert[] = [];

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async checkMetrics(metrics: MetricsData): Promise<void> {
    // エラー率のチェック
    if (metrics.metrics.errorRate > 0.1) {
      this.alerts.push({
        type: 'error_rate',
        severity: 'high',
        message: `エラー率が高くなっています (${(metrics.metrics.errorRate * 100).toFixed(1)}%)`
      });
    }

    // 応答率のチェック
    if (metrics.metrics.responseRate < 0.2) {
      this.alerts.push({
        type: 'response_rate',
        severity: 'medium',
        message: `応答率が低くなっています (${(metrics.metrics.responseRate * 100).toFixed(1)}%)`
      });
    }

    // 品質スコアのチェック
    if (metrics.metrics.qualityScore < 0.7) {
      this.alerts.push({
        type: 'quality_score',
        severity: 'medium',
        message: `品質スコアが低下しています (${(metrics.metrics.qualityScore * 100).toFixed(1)})`
      });
    }

    // アラートの送信
    if (this.alerts.length > 0) {
      await this.sendAlerts(this.alerts);
    }
  }

  private async sendAlerts(alerts: Alert[]): Promise<void> {
    try {
      const { error } = await this.supabase.functions.invoke('alert-notifications', {
        body: { alerts }
      });

      if (error) throw error;
    } catch (err) {
      console.error('Failed to send alerts:', err);
      throw err;
    }
  }

  async collectTemplateMetrics(template: Template): Promise<void> {
    // テンプレートのメトリクス収集ロジック
    const metrics = {
      usage_count: template.usage_count,
      success_rate: template.metrics?.successRate ?? 0,
      average_response_rate: template.metrics?.responseRate ?? 0,
      average_time: template.metrics?.averageProcessingTime ?? 0
    };

    try {
      const { error } = await this.supabase.functions.invoke('metrics-collection', {
        body: {
          action: 'updateTemplateMetrics',
          data: {
            templateId: template.id,
            metrics
          }
        }
      });

      if (error) throw error;
    } catch (err) {
      console.error('Failed to collect template metrics:', err);
      throw err;
    }
  }

  async collectTestResults(analysis: TestAnalysis): Promise<void> {
    // テスト結果のメトリクス収集ロジック
    try {
      const { error } = await this.supabase.functions.invoke('metrics-collection', {
        body: {
          action: 'recordTestResults',
          data: { analysis }
        }
      });

      if (error) throw error;
    } catch (err) {
      console.error('Failed to collect test results:', err);
      throw err;
    }
  }
} 