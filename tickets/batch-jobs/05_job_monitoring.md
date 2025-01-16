# ジョブ監視機能の強化

## 概要
ジョブの実行状況をより詳細に監視し、問題の早期発見と効率的な運用を可能にします。

## 現状
- 基本的なステータス管理は実装済み
- 詳細な監視機能が不足
- パフォーマンスメトリクスが不十分

## タスク

### 1. `getJobInfo`APIの拡張
- 詳細なステータス情報の提供
  - 現在のフェーズ
  - 進捗率
  - アクティブタスク数
  - エラー発生数
- パフォーマンスメトリクスの追加
  - CPU使用率
  - メモリ使用量
  - 実行時間
  - スループット
- リアルタイムモニタリング機能

### 2. `fetchJobHistory`APIの改良
- フィルタリング機能の強化
  - ステータスによるフィルタリング
  - 日時範囲によるフィルタリング
  - エラータイプによるフィルタリング
- ページネーション対応
- 集計機能の追加
  - 成功率の集計
  - 平均実行時間の集計
  - エラー発生率の集計

### 3. ジョブ監視ダッシュボード用APIの実装
- リアルタイムメトリクスの��供
- 統計情報の集計
- アラート条件の設定と監視

## 技術仕様

### API仕様

#### getJobInfo（拡張版）
- メソッド: POST
- エンドポイント: `/job-operations`
- リクエストボディ:
```typescript
{
  action: 'getJobInfo',
  data: {
    job_id: string;
    include_metrics?: boolean;
    include_task_details?: boolean;
    include_logs?: boolean;
    real_time?: boolean;
  }
}
```

#### fetchJobHistory（改良版）
- メソッド: POST
- エンドポイント: `/job-operations`
- リクエストボディ:
```typescript
{
  action: 'fetchJobHistory',
  data: {
    filters?: {
      status?: BatchJobStatus[];
      date_range?: {
        start: string;
        end: string;
      };
      error_types?: string[];
      user_id?: string;
    };
    pagination?: {
      page: number;
      per_page: number;
    };
    sort?: {
      field: string;
      order: 'asc' | 'desc';
    };
    aggregations?: {
      success_rate?: boolean;
      avg_duration?: boolean;
      error_rate?: boolean;
    };
  }
}
```

#### getJobMetrics
- メソッド: POST
- エンドポイント: `/job-operations`
- リクエストボディ:
```typescript
{
  action: 'getJobMetrics',
  data: {
    job_ids: string[];
    metrics: ('cpu' | 'memory' | 'duration' | 'throughput')[];
    interval?: string;
    start_time?: string;
    end_time?: string;
  }
}
```

## 関連ファイル
- `supabase/functions/job-operations/index.ts`
- `supabase/functions/_shared/types.ts`
- `supabase/functions/utils/metrics-collector.ts`

## 優先度
高

## 担当
バックエンドエンジニア

## 見積もり工数
3人日

## テスト要件
1. ユニットテスト
   - メトリクス収集のテスト
   - フィルタリング機能のテスト
   - 集計機能のテスト
   - リアルタイム監視のテスト

2. 統合テスト
   - 大量データでのパフォーマンステスト
   - リアルタイムデータの正確性テスト
   - フロントエンド連携テスト

## 注意事項
- メトリクス収集のオーバーヘッド最小化
- データ保持期間の設定
- アラートの適切な閾値設定
- モニタリングデータの圧縮
- セキュリティとアクセス制御 