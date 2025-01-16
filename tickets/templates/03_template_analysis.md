# テンプレート分析APIの実装

## 概要
テンプレートの使用状況や効果を分析するための機能を実装し、より効果的なテンプレート管理を可能にします。

## 現状
- メトリクス更新機能は実装済み
- 分析機能が未実装
- 類似テンプレート検索機能が未実装

## タスク

### 1. `analyzePerformance`APIの実装
- 使用回数、成功率、平均応答時間の分析
- 時系列での傾向分析
- ユーザーセグメント別の分析
- レポート生成機能

### 2. `findSimilarTemplates`APIの実装
- 類似テンプレートの検索
- 類似度スコアの計算
- コンテンツベースの推薦
- 使用パターンベースの推薦

### 3. `getIndustryInsights`APIの実装
- 業界別の効果分析
- ベストプラクティスの抽出
- トレンド分析
- 改善提案の生成

## 技術仕様

### API仕様

#### analyzePerformance
- メソッド: POST
- エンドポイント: `/template-operations`
- リクエストボディ:
```typescript
{
  action: 'analyzePerformance',
  data: {
    templateId: string;
    period?: {
      start: string;
      end: string;
    };
    metrics?: ('usage' | 'success' | 'response_time' | 'engagement')[];
    segmentation?: {
      byIndustry?: boolean;
      byUserType?: boolean;
      byTimeOfDay?: boolean;
    };
  }
}
```

#### findSimilarTemplates
- メソッド: POST
- エンドポイント: `/template-operations`
- リクエストボディ:
```typescript
{
  action: 'findSimilarTemplates',
  data: {
    templateId: string;
    limit?: number;
    minSimilarity?: number;
    considerMetrics?: boolean;
    considerTags?: boolean;
  }
}
```

#### getIndustryInsights
- メソッド: POST
- エンドポイント: `/template-operations`
- リクエストボディ:
```typescript
{
  action: 'getIndustryInsights',
  data: {
    industry: string;
    period?: {
      start: string;
      end: string;
    };
    includeRecommendations?: boolean;
    includeTrends?: boolean;
  }
}
```

## 関連ファイル
- `supabase/functions/template-operations/index.ts`
- `supabase/functions/_shared/types.ts`
- `supabase/functions/utils/metrics-collector.ts`

## 優先度
中

## 担当
バックエンドエンジニア

## 見積もり工数
5人日

## テスト要件
1. ユニットテスト
   - メトリクス計算のテスト
   - 類似度計算のテスト
   - レポート生成のテスト
   - エラーハンドリングのテスト

2. 統合テスト
   - データ集計の正確性テスト
   - パフォーマンステスト
   - 大規模データでのテスト

## 注意事項
- 計算処理の最適化
- キャッシュの活用
- バッチ処理の検討
- データの正規化と前処理
- プライバシーとデータ保護 