# メトリクス収集とログ管理機能の実装

## 概要
システムの運用状況を把握し、パフォーマンスを最適化するためのメトリクス収集とログ管理機能を実装します。

## 現状
- メトリクス収集機能が不足
- ログの自動クリーンアップ機能が未実装
- パフォーマンス分析機能が不十分

## タスク

### 1. メトリクス収集機能の実装
- `insertMetric`APIの実装
  - 実行時間の記録
  - エラー情報の収集
  - リソース使用量の記録
  - カスタムメトリクスの追加
- `getMetrics`APIの実装
  - 期間指定での集計
  - カテゴリ別の分析
  - トレンド分析
  - アラート条件の評価

### 2. ログ管理機能の実装
- `rotateJobLogs`APIの実装
  - 保持期間の設定
  - 古いログの削除処理
  - アーカイブ処理
- ログ検索・分析機能
  - 全文検索
  - フィルタリング
  - 集計・分析

### 3. パフォーマンスモニタリングの実装
- リアルタイムメトリクス
- リソース使用状況
- ボトルネック分析
- アラート���定

## 技術仕様

### データモデル
```typescript
interface Metric {
  id: string;
  timestamp: string;
  category: string;
  name: string;
  value: number;
  tags: Record<string, string>;
  metadata?: Record<string, unknown>;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  category: string;
  message: string;
  metadata: Record<string, unknown>;
  job_id?: string;
  task_id?: string;
}

interface MetricAggregation {
  period: string;
  category: string;
  name: string;
  min: number;
  max: number;
  avg: number;
  count: number;
}
```

### API仕様

#### insertMetric
- メソッド: POST
- エンドポイント: `/log-operations`
- リクエストボディ:
```typescript
{
  action: 'insertMetric',
  data: {
    category: string;
    name: string;
    value: number;
    tags?: Record<string, string>;
    metadata?: Record<string, unknown>;
  }
}
```

#### getMetrics
- メソッド: POST
- エンドポイント: `/log-operations`
- リクエストボディ:
```typescript
{
  action: 'getMetrics',
  data: {
    period: {
      start: string;
      end: string;
    };
    categories?: string[];
    names?: string[];
    aggregation?: {
      interval: string;
      functions: ('min' | 'max' | 'avg' | 'count')[];
    };
    filters?: {
      tags?: Record<string, string>;
      min_value?: number;
      max_value?: number;
    };
  }
}
```

#### rotateJobLogs
- メソッド: POST
- エンドポイント: `/log-operations`
- リクエストボディ:
```typescript
{
  action: 'rotateJobLogs',
  data: {
    retention_days: number;
    archive?: boolean;
    categories?: string[];
  }
}
```

#### searchLogs
- メソッド: POST
- エンドポイント: `/log-operations`
- リクエストボディ:
```typescript
{
  action: 'searchLogs',
  data: {
    query?: string;
    filters?: {
      level?: ('info' | 'warning' | 'error')[];
      category?: string[];
      job_id?: string;
      task_id?: string;
      date_range?: {
        start: string;
        end: string;
      };
    };
    pagination?: {
      page: number;
      per_page: number;
    };
  }
}
```

## 関連ファイル
- `supabase/functions/log-operations/index.ts`
- `supabase/functions/utils/metrics-collector.ts`
- `supabase/functions/_shared/types.ts`

## 優先度
低

## 担当
バックエンドエンジニア

## 見積もり工数
5人日

## テスト要件
1. ユニットテスト
   - メトリクス収集のテスト
   - ログローテーションのテスト
   - 集計機能のテスト
   - 検索機能のテスト

2. 統合���スト
   - 大規模データでのパフォーマンステスト
   - 長期実行時の安定性テスト
   - ストレージ使用量のテスト

## 注意事項
- ストレージ容量の管理
- パフォーマンスへの影響最小化
- データ保持期間の最適化
- セキュリティとプライバシー
- バックアップと復旧 