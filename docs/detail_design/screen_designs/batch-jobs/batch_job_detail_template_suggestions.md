# テンプレート最適化 AI示唆機能

## 概要
Difyを活用してテンプレートの各設定項目に対する具体的な改善提案を生成し、次回のバッチジョブの品質向上を支援する機能。

## Difyプロンプト設計

### 1. テンプレート分析プロンプト
```yaml
template_analysis:
  input_schema:
    template:
      content: string          # テンプレート本文
      custom_prompts: array    # カスタムプロンプト設定
      tone_settings: object    # トーン設定
      variables: array         # 使用変数
    performance_metrics:
      response_rate: number    # 反応率
      conversion_rate: number  # 転換率
      quality_score: number    # 品質スコア
    target_segments:
      industries: array        # 対象業界
      company_sizes: array     # 企業規模
    historical_data:
      previous_templates: array # 過去のテンプレート
      success_patterns: array   # 成功パターン

  output_schema:
    template_improvements:
      content_suggestions:
        - section: string      # 改善箇所
        - current: string      # ���在の内容
        - suggested: string    # 提案内容
        - reason: string       # 改善理由
        - expected_impact: number # 期待効果
      
    prompt_optimizations:
      - prompt_type: string    # プロンプトタイプ
      - current_prompt: string # 現在のプロンプト
      - improved_prompt: string # 改善案
      - key_changes: array     # 主な変更点
      - reasoning: string      # 改善理由
      
    tone_adjustments:
      - parameter: string      # 調整パラメータ
      - current_value: number  # 現在値
      - suggested_value: number # 推奨値
      - explanation: string    # 調整理由

    variable_suggestions:
      - variable_name: string  # 変数名
      - usage_improvement: string # 使用方法の改善
      - new_variables: array   # 新規変数提案
```

### 2. セグメント別最適化プロンプト
```yaml
segment_optimization:
  input:
    segment_data:
      industry: string
      company_size: string
      region: string
    response_patterns:
      successful_phrases: array
      weak_points: array
    industry_specific_terms: array
    
  output:
    segment_specific_adjustments:
      - key_phrases: array
      - tone_modifications: object
      - industry_terms: array
      - customization_points: array
```

## UI設計

### テンプレート改善提案セクション
```
+--------------------------------------------------+
|             テンプレート最適化提案                  |
+--------------------------------------------------+
| 【コンテンツ構造の改善】                           |
| +----------------------------------------------+ |
| | 📝 導入部の強化                       +18%    | |
| | 現在: "貴社のデジタルトランスフォーメーション..."  | |
| | 提案: "貴社の業界特有の課題に対して..."         | |
| | 理由: より具体的な課題提示により共感を獲得       | |
| | [プレビュー] [適用]                          | |
| +----------------------------------------------+ |
|                                                  |
| 【カスタムプロンプトの最適化】                     |
| +----------------------------------------------+ |
| | 🎯 業界特化プロンプト                  +25%    | |
| | 現在のプロンプト:                             | |
| | "企業の課題に対して具体的なソリューションを提案"  | |
| | 改善案:                                      | |
| | "業界固有のKPIを考慮し、ROIを明確に示しながら   | |
| |  具体的なソリューションを提案"                 | |
| | [詳���] [テスト生成] [適用]                    | |
| +----------------------------------------------+ |
|                                                  |
| 【トーン設定の調整】                             |
| +----------------------------------------------+ |
| | 🎨 コミュニケーションスタイル            +15%   | |
| | - フォーマル度: 0.8 → 0.7                    | |
| | - 専門性: 0.6 → 0.8                         | |
| | - 親近感: 0.4 → 0.5                         | |
| | [パラメータ調整] [プレビュー]                  | |
| +----------------------------------------------+ |
|                                                  |
| 【変数活用の改善】                               |
| +----------------------------------------------+ |
| | 💡 パーソナライゼーション強化           +20%   | |
| | 新規変数の提案:                               | |
| | - {industry_challenge}: 業界固有の課題         | |
| | - {competitor_trend}: 競合動向               | |
| | [変数一覧] [テンプレート更新]                  | |
| +----------------------------------------------+ |
```

### インタラクティブ機能

#### 1. プロンプト実験ラボ
- **A/Bテスト機能**:
  - 複数プロンプトバージョンの生成
  - 品質スコ��の比較
  - 実績データに基づく改善

- **プロンプトビルダー**:
  - インタラクティブな編集
  - リアルタイムフィードバック
  - 成功パターンの組み込み

#### 2. テンプレートシミュレーター
- **プレビュー生成**:
  - 異なるセグメント向けの出力確認
  - 品質スコア予測
  - 改善ポイントのハイライト

- **インパクト予測**:
  - 期待効果の数値化
  - 信頼度スコア
  - 実績との比較

## データ分析ロジック

### 1. 成功パターン分析
```typescript
interface SuccessPattern {
  pattern_type: 'phrase' | 'structure' | 'tone';
  context: {
    industry: string;
    company_size: string;
    response_rate: number;
  };
  elements: {
    key_phrases: string[];
    sentence_structures: string[];
    tone_parameters: Record<string, number>;
  };
  performance: {
    avg_response_rate: number;
    confidence_score: number;
  };
}
```

### 2. 改善提案生成ロジック
```typescript
interface ImprovementSuggestion {
  target: 'content' | 'prompt' | 'tone' | 'variable';
  current_state: any;
  suggestion: any;
  reasoning: string;
  expected_impact: {
    response_rate: number;
    confidence: number;
  };
  implementation_difficulty: 'low' | 'medium' | 'high';
  priority_score: number;
}
```

## フィードバックループ

### 1. 効果測定
- 提案適用前後の比較
- セグメント別効果分析
- 長期的な改善トレンド

### 2. モデル改善
- 成功事例のデータ蓄積
- パターン学習の強化
- 予測精度の向上

## エラーハンドリング
- 不適切な提案の検出
- 矛盾する提案の解消
- データ不足時の代替戦略

## パフォーマンス最適化
- 提案生成の非同期処理
- キャッシュ戦略
- バッチ処理の最適化 