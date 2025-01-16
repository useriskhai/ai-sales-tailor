# メッセージ戦略の型定義と日本語訳の一元管理

## 進捗状況

### フロントエンド
- [x] `src/types/template.ts`の更新
  - [x] MessageStrategyConfigの追加
  - [x] 型定義の整理
  - [x] バリデーション関数の追加
- [x] コンポーネントの修正
  - [x] `src/components/templates/TemplateSettings.tsx`
  - [x] `src/components/templates/pages/TemplateDetails.tsx`
  - [x] `src/components/templates/TemplateSettingsModal.tsx`
  - [x] `src/components/templates/forms/settings/BasicSettingsForm.tsx`

### バックエンド
- [x] `supabase/functions/_shared/types.ts`の作成
  - [x] 型定義の追加
  - [x] バリデーション関数の実装
- [x] `supabase/functions/template-operations/index.ts`の更新
  - [x] 型のインポート
  - [x] バリデーション関数の使用

### データベース
- [x] マイグレーションファイルの作成
  - [x] ENUMの更新クエリ
  - [x] 既存データの変換確認
- [x] マイグレーションの実行と検証

### テスト
- [ ] 型定義の更新に伴うテストの修正
- [ ] E2Eテストでの動作確認
- [ ] 各コンポーネントの表示確認

## 概要
メッセージ戦略に関する型定義と日本語訳が複数のファイルに散在しており、整合性が取れていない状態を解消する。

## 現状の問題点
1. 型定義の重複
   - `Strategy`, `ToneOfVoice`, `ContentFocus`の定義が複数箇所に存在
   - 一部の型定義に不一致がある

2. 日本語訳の不一致
   - 同じ値に対して異なる日本語訳が使用されている
   例: `benefit-first`
   - `TemplateSettings.tsx`: "利点重視"
   - `TemplateDetails.tsx`: "メリット訴求"
   - `TemplateSettingsModal.tsx`: "メリット訴求型"

3. バリデーションロジックの重複
   - 各コンポーネントで個別にバリデーションを実装

## 修正内容

### 1. 型定義の一元化
```typescript
// src/types/template.ts

// メッセージ戦略の設定値と日本語訳の定義
export const MessageStrategyConfig = {
  strategy: {
    'benefit-first': 'メリット訴求型',
    'problem-solution': '課題解決型',
    'story-telling': 'ストーリー型',
    'direct-offer': '直接提案型'
  },
  tone: {
    'formal': 'フォーマル',
    'professional': 'ビジネス',
    'friendly': 'フレンドリー',
    'casual': 'カジュアル'
  },
  focus: {
    'benefit': '利点',
    'technical': '技術的詳細',
    'case-study': '事例',
    'roi': 'ROI',
    'relationship': '関係構築'
  }
} as const;

// 既存の型定義を更新
export type Strategy = keyof typeof MessageStrategyConfig.strategy;
export type ToneOfVoice = keyof typeof MessageStrategyConfig.tone;
export type ContentFocus = keyof typeof MessageStrategyConfig.focus;

// バリデーション関数
export const isValidStrategy = (strategy: string): strategy is Strategy => {
  return strategy in MessageStrategyConfig.strategy;
};

export const isValidTone = (tone: string): tone is ToneOfVoice => {
  return tone in MessageStrategyConfig.tone;
};

export const isValidFocus = (focus: string): focus is ContentFocus => {
  return focus in MessageStrategyConfig.focus;
};
```

### 2. バックエンド用の型定義
```typescript
// supabase/functions/_shared/types.ts
export type Strategy = 'benefit-first' | 'problem-solution' | 'story-telling' | 'direct-offer';
export type ToneOfVoice = 'formal' | 'professional' | 'friendly' | 'casual';
export type ContentFocus = 'benefit' | 'technical' | 'case-study' | 'roi' | 'relationship';

export const isValidStrategy = (strategy: string): strategy is Strategy => {
  return ['benefit-first', 'problem-solution', 'story-telling', 'direct-offer'].includes(strategy);
};

export const isValidTone = (tone: string): tone is ToneOfVoice => {
  return ['formal', 'professional', 'friendly', 'casual'].includes(tone);
};

export const isValidFocus = (focus: string): focus is ContentFocus => {
  return ['benefit', 'technical', 'case-study', 'roi', 'relationship'].includes(focus);
};
```

### 3. データベースのマイグレーション
```sql
-- supabase/migrations/20240125000000_update_template_strategy_enum.sql
-- 既存のENUM型を更新
ALTER TYPE template_strategy RENAME TO template_strategy_old;
CREATE TYPE template_strategy AS ENUM (
  'benefit-first',
  'problem-solution',
  'story-telling',
  'direct-offer'
);

-- 既存のデータを新しい型に変換
ALTER TABLE job_templates
  ALTER COLUMN strategy TYPE template_strategy
  USING strategy::text::template_strategy;

DROP TYPE template_strategy_old;

-- トーンのENUM型を更新
ALTER TYPE tone_of_voice RENAME TO tone_of_voice_old;
CREATE TYPE tone_of_voice AS ENUM (
  'formal',
  'professional',
  'friendly',
  'casual'
);

-- 既存のデータを新しい型に変換
ALTER TABLE job_templates
  ALTER COLUMN tone_of_voice TYPE tone_of_voice
  USING tone_of_voice::text::tone_of_voice;

DROP TYPE tone_of_voice_old;

-- コンテンツフォーカスのENUM型を更新
ALTER TYPE content_focus RENAME TO content_focus_old;
CREATE TYPE content_focus AS ENUM (
  'benefit',
  'technical',
  'case-study',
  'roi',
  'relationship'
);

-- 既存のデータを新しい型に変換
ALTER TABLE job_templates
  ALTER COLUMN content_focus TYPE content_focus
  USING content_focus::text::content_focus;

DROP TYPE content_focus_old;
```

## 期待される効果
1. 型定義の一元管理による保守性の向上
2. 日本語訳の統一による一貫性の確保
3. バリデーションロジックの共通化による信頼性の向上
4. コードの重複削減

## 注意事項
- 既存の機能に影響を与えないよう、慎重に修正を行う
- 型の変更による影響範囲を十分に確認
- マイグレーション実行時のダウンタイムに注意 