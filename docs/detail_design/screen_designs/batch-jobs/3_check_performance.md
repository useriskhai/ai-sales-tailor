# バッチジョブ詳細 - 実績分析タブ

## 画面概要
バッチジョブのKPI達成状況、パフォーマンス分析、業界別分析を可視化する画面。

## 画面レイアウト
```
+--------------------------------------------------+
|                    ヘッダー                        |
| < 一覧に戻る                                      |
| バッチジョブ詳細: [ジョブ名]                       |
+--------------------------------------------------+
|                                                  |
| [前提条件] [レター作成・送信] [実績分析] [改善提案] |
|                                                  |
+--------------------------------------------------+
|                 システムKPI                        |
| +------------------+  +------------------+        |
| | 📨 総到達率      | | 📬 DM開封率       |        |
| |   98.2%         | |   35.2%          |        |
| | 目標: 95%       | | 目標: 30%        |        |
| | ↑ 3.2%         | | ↑ 5.5%          |        |
| | 送信成功: 98件   | | 開封数: 35件      |        |
| +------------------+ +------------------+        |
|                                                  |
| +------------------+  +------------------+        |
| | 📋 クリック率    | | 💬 レスポンス率   |        |
| |   15.2%         | |   8.5%           |        |
| | 目標: 15%       | | 目標: 10%        |        |
| | ↑ 2.2%         | | ↓ 1.5%          |        |
| | クリック数: 152件| | 返信数: 85件      |        |
| +------------------+ +------------------+        |
+--------------------------------------------------+
|                 配信詳細                          |
| +------------------+  +------------------+        |
| | 📋 送信方法内訳   | | 📊 到達率詳細     |        |
| | DM: 45件        | | DM: 97.8%        |        |
| | フォーム: 55件   | | フォーム: 98.5%   |        |
| | 合計: 100件     | | 平均: 98.2%      |        |
| +------------------+ +------------------+        |
+--------------------------------------------------+
|              カスタムKPI                          |
| +----------------------------------------------+ |
| | ※テンプレートで設定したKPIに基づき表示         | |
| |                                              | |
| | 商談化状況                                    | |
| | +------------------------------------------+ | |
| | | 商談数: [数値入力] 件                     | | |
| | | 目標: {template.kpi.opportunities.target} | | |
| | | 達成率: 125%                             | | |
| | +------------------------------------------+ | |
| |                                              | |
| | 進捗状況                                     | |
| | +------------------------------------------+ | |
| | | {template.kpi.metrics[0].name}: [入力] 件 | | |
| | | {template.kpi.metrics[1].name}: [入力] 件 | | |
| | | {template.kpi.metrics[2].name}: [入力] 件 | | |
| | +------------------------------------------+ | |
| |                                              | |
| | [保存] [リセット]                            | |
| +----------------------------------------------+ |
+--------------------------------------------------+
|              運用データ                           |
| +----------------------------------------------+ |
| | 最適送信時間帯                               | |
| | 開封率ピーク: 10-11時, 15-16時              | |
| | クリック率ピーク: 13-14時, 16-17時          | |
| +----------------------------------------------+ |
|                                                  |
| | エラーログ概要                               | |
| | 送信エラー: 2件（フォーム未検出）             | |
| | API制限: 0件                                 | |
| +----------------------------------------------+ |
+--------------------------------------------------+

[エクスポート] [詳細分析] [ベンチマーク比較]
```

## インタラクティブ要素

### 1. KPIカード
- クリックで詳細分析モーダル表示
- ホバーで目標値との比較グラフ
- 前回比のトレンド表示

### 2. グラフ
- 期間選択（日次/週次/月次）
- ドラッグで期間絞り込み
- 指標の表示/非表示切り替え

### 3. セグメント分析
- 業界別/規模別/地域別の切り替え
- ドリルダウンで詳細表示
- ベンチマーク比較機能

### 4. メッセージング分析
- AIスコア別の実績比較
- A/Bテスト結果の詳細表示
- 返信内容のキーワード分析

### 5. 運用データ
- 時間帯別ヒートマップ
- エラーログの詳細展開
- レスポンスタイム分析

## データ表示

### 1. 基本KPI
- 総到達率（全体の配信成功率）
  - DM到達率：DMが正しく送信できた率
  - フォーム到達率：フォームが正しく送信できた率
- DM開封率（DMで送信した件数のうち、開封された率）
  - ※フォームの確認率は計測不可のため非表示
- クリック率・クリック数
- レスポンス率・返信数

### 2. 到達率の計算方法
```typescript
interface DeliveryMetrics {
  // DM送信成功数
  dmDelivered: number;
  // DM送信試行数
  dmAttempted: number;
  // フォーム送信成功数
  formDelivered: number;
  // フォーム送信試行数
  formAttempted: number;
}

function calculateDeliveryRates(metrics: DeliveryMetrics): {
  dmDeliveryRate: number;
  formDeliveryRate: number;
  totalDeliveryRate: number;
} {
  const dmRate = (metrics.dmDelivered / metrics.dmAttempted) * 100;
  const formRate = (metrics.formDelivered / metrics.formAttempted) * 100;
  const totalRate = ((metrics.dmDelivered + metrics.formDelivered) / 
                    (metrics.dmAttempted + metrics.formAttempted)) * 100;
  
  return {
    dmDeliveryRate: dmRate,
    formDeliveryRate: formRate,
    totalDeliveryRate: totalRate
  };
}

interface OpenRateMetrics {
  // DM開封数
  dmOpens: number;
  // DM送信成功数
  dmDelivered: number;
}

function calculateDMOpenRate(metrics: OpenRateMetrics): number {
  return (metrics.dmOpens / metrics.dmDelivered) * 100;
}

### 3. 表示ルール
- システムKPI:
  - テンプレートで定義された目標値に基づいて表示
  - 送信方法に応じて開封率の表示/非表示を制御
  - 実績値との差分を計算して表示
- カスタムKPI:
  - テンプレートで定義されたメトリクスを動的に表示
  - 各メトリクスの入力フォームを自動生成
  - 目標値との達成率を計算

### 4. コスタムKPI（手動入力）
- 商談化状況の手動入力機能
  - 商談数の入力
  - 目標値との比較
  - 達成率の自動計算
- 進捗状況の手動入力機能
  - 各段階の件数を入力
  - 前回値との比較表示
  - 入力値の履歴保持

### 5. カスタムKPIの計算方法
```typescript
interface CustomKPIInput {
  opportunities: number;
  target: number;
  replies: number;
  meetings: number;
  deals: number;
}

interface CustomKPIMetrics {
  achievementRate: number;
  progressRates: {
    replyRate: number;
    meetingRate: number;
    dealRate: number;
  };
}

function calculateCustomKPIMetrics(input: CustomKPIInput): CustomKPIMetrics {
  const achievementRate = (input.opportunities / input.target) * 100;
  
  return {
    achievementRate,
    progressRates: {
      replyRate: input.replies ? (input.replies / input.opportunities) * 100 : 0,
      meetingRate: input.meetings ? (input.meetings / input.replies) * 100 : 0,
      dealRate: input.deals ? (input.deals / input.meetings) * 100 : 0
    }
  };
}

### 6. 入力値の検証ルール
- 数値のみ許可（負数不可）
- 前段階の数値を超える入力は警告
- 過去の入力値と大きく異なる場合は確認ダイアログ
- 保存前に値の整合性をチェック

### 6. 時系列データ
- 日次/週次トレンド
- 目標達成推移
- 前年同期比較

### 7. セグメント別実績
- 業界別分析
- 企業規模別分析
- 地域別分析

### 8. 品質指標
- AIスコア別実績
- テンプレート別比較
- エラー率推移

## エクスポート機能
- PDF/Excel出力
- カスタムレポート作成
- 定期レポート設定

## レスポンシブ対応
- デスクトップ: フル表示
- タブレット: スクロール可能なカード形式
- モバイル: 重要KPI優先表示 