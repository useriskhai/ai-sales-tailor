# テンプレート操作のデータ構造整合性修正

## 概要
Edge Function（`template-operations`）のデータ構造が、新しいデータベース構造および型定義と一致していないため、テンプレートの作成・更新・取得時にデータの不整合が発生している。

## 現状の問題
1. データ構造の不一致
   ```typescript
   // Edge Function側の現在の構造
   settings: {
     strategy: string;
     tone_of_voice: string;
     content_focus: string;
     max_length: number;
     custom_instructions?: string;
     output_format: string;
   }

   // DB側の期待する構造（マイグレーション後）
   settings: {
     mode: 'ai_auto' | 'manual';
     strategy: Strategy;
     tone_of_voice: ToneOfVoice;
     max_length: number;
     use_emoji: boolean;
     execution_priority: 'speed' | 'balanced' | 'quality';
     metrics: Array<{...}>;
     evaluation_period: string;
     parallel_tasks: number;
     retry_attempts: number;
     preferred_method: PreferredMethod;
   }
   ```

2. データ変換の問題
   - `fetchTemplate`関数での変換が不完���
   - フロントエンドが期待するデータ形式と不一致
   - 必須フィールドの欠落

3. 型チェックの不足
   - 値の検証が不十分
   - enumの値チェックがない

## 修正内容

### 1. Edge Function側の修正

#### `template-operations/index.ts`の変更
- データ構造の更新
- 型チェックの追加
- バリデーション関数の実装
- エラーハンドリングの強化

```typescript
// 新しい型定義
interface TemplateSettings {
  mode: 'ai_auto' | 'manual';
  strategy: Strategy;
  tone_of_voice: ToneOfVoice;
  max_length: number;
  use_emoji: boolean;
  execution_priority: 'speed' | 'balanced' | 'quality';
  metrics: Array<{
    id: string;
    name: string;
    type: 'system' | 'custom';
    unit: string;
    target: number;
    weight: number;
  }>;
  evaluation_period: '24h' | '7d' | '30d' | '90d';
  parallel_tasks: number;
  retry_attempts: number;
  preferred_method: 'FORM' | 'EMAIL' | 'HYBRID';
}

// バリデーション関数
function validateTemplateSettings(settings: TemplateSettings) {
  // 各フィールドの型と値の検証
  if (!['ai_auto', 'manual'].includes(settings.mode)) {
    throw new Error('無効なモード値です');
  }
  // ... 他のフィールドの検証
}

// createTemplate関数の修正
async function createTemplate(data: TemplateData) {
  // 新しい構造でのデータ作成とバリデーション
}

// updateTemplate関数の修正
async function updateTemplate(data: UpdateTemplateData) {
  // 新しい構造でのデータ更新とバリデーション
}

// fetchTemplate関数の修正
async function fetchTemplate(id: string, userId: string) {
  // 新しい構造でのデータ取得と変換
}
```

### 2. フロントエンド側の確認

#### `useTemplate.ts`の確認
- 型定義の整合性確認
- エラーハンドリングの確認
- データ変換の確認

#### `TemplateDetails.tsx`の確認
- 表示データの整合性確認
- 必須フィールドの表示確認
- エラー状態の処理確認

## テスト項目

### 1. Edge Function
- [x] テンプレート作成
  - 全フィールドあり
  - 必須フィールドのみ
  - 無効な値
- [x] テンプレート更新
  - 部分更新
  - 全フィールド更新
  - 無効な値
- [x] テンプレート取得
  - 正常系
  - エラー系

### 2. フロントエンド
- [x] テンプレート詳細表示
  - 全フィールド表示
  - 必須フィールドのみ
  - エラー表示
- [x] データ更新
  - 部分更新
  - 全フィールド更新
  - エラー処理

## 完了条件
1. Edge Function
   - [x] データ構造が新しいDB構造と一致
   - [x] 全ての必須フィールドが正しく処理される
   - [x] 値の検証が適切に行われる

2. フロントエンド
   - [x] テンプレート詳細が正しく表示される
   - [x] エラー状態が適切に処理される
   - [x] データの整合性が保たれる

## 関連チケット
- #16 テンプレート作成機能の実装完了
- #17 テンプレート詳細表示の調整 