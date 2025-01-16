# ✅ テンプレート設定UIの改善

## 概要
テンプレート設定UIの改善を行い、より直感的で使いやすい入力フローを実現する。

## 変更内容

### 1. 入力ステップの再構成
#### BasicInfoStep（基本情報）
- テンプレート名（name）
- 説明（description）
- カテゴリ（category）
- タグ（tags）
- ターゲット業界（target_industry）

#### MessageStrategyStep（メッセージ戦略）
- 設定モード（mode）
  - AIおまかせモード
  - カスタマイズモード
- 基本設定（両モード共通）
  - 戦略（strategy）
  - トーン（toneOfVoice）
  - 最大文字数（maxLength）
    - 300文字（簡潔なフォーム向け）
    - 400文字（標準的なメール向け）
    - 500文字（詳細な説明向け）
    - 600文字（提案書形式向け）
    - 800文字（詳細な提案向け）
  - 絵文字使用（useEmoji）
- 詳細設定（カスタマイズモード）
  - コンテンツフォーカス（contentFocus）
  - カスタム指示（customInstructions）
  - メッセージテンプレート（messageTemplate）
    - 定義済み変数
      - 会社情報: company_name, company_description, company_url, industry
      - ユーザー情報: user_name, user_company, user_profile
      - 製品情報: product_name, product_description
      - メタデータ: created_at, updated_at, category

#### ExecutionSettingsStep（実行設定）
- 実行優先度（execution_priority）
  - 品質重視
  - バランス型
  - スピード重視

#### KPISettingsStep（KPI設定）
- システムKPI
  - フォームリンククリック数
  - フォームリンククリック率
- カスタムKPI
  - 商談獲得数
  - 商談成約率
  - 返信品質スコア
  - 商談設定までの日数
  - 営業生産性
- 評価期間

### 2. インターフェースの変更
```typescript
export interface MessageSettingsData {
  mode: 'ai_auto' | 'custom';
  // 基本設定（両モード共通）
  strategy: 'benefit-first' | 'problem-solution' | 'story-telling' | 'direct-offer';
  toneOfVoice: 'formal' | 'professional' | 'friendly' | 'casual';
  maxLength: 300 | 400 | 500 | 600 | 800;
  useEmoji: boolean;
  
  // 詳細設定（カスタマイズモード）
  contentFocus?: 'benefit' | 'technical' | 'case-study' | 'roi' | 'relationship';
  customInstructions?: string;
  
  // メッセージテンプレート
  messageTemplate?: string;
  
  // 実行設定
  execution_priority: 'quality' | 'balanced' | 'speed';
}
```

### 3. UIの改善点
- モード選択をより視覚的に分かりやすく
- 基本設定と詳細設定の明確な区分け
- 変数の挿入をドラッグ&ドロップでも可能に
- プレビュー機能の追加
- リアルタイムバリデーション

### 4. DB側の変更
- 実行設定関連のENUM型を単純化
```sql
CREATE TYPE execution_priority AS ENUM (
  'quality',   -- 品質重視
  'balanced',  -- バランス型
  'speed'      -- スピード重視
);

-- template_attributesテーブルの変更
ALTER TABLE template_attributes
DROP COLUMN speed,
DROP COLUMN reliability,
DROP COLUMN parallelism,
DROP COLUMN retry_strategy,
ADD COLUMN execution_priority execution_priority NOT NULL DEFAULT 'balanced';
```

## 技術仕様

### コンポーネント構成
- `TemplateSettingsMode.tsx`: モード選択コンポーネント
- `BasicSettingsForm.tsx`: 基本設定フォーム（両モード共通）
- `CustomSettingsForm.tsx`: 詳細設定フォーム（カスタマイズモード用）
- `MessageTemplateEditor.tsx`: メッセージテンプレートエディタ
- `ExecutionSettingsForm.tsx`: 実行設定フォーム
- `KPISettingsForm.tsx`: KPI設定フォーム

## 優先度
高

## 担当
フロントエンドエンジニア

## 見積もり工数
5人日

## テスト要件
1. ユニットテスト
   - 各フォームコンポーネントのバリデーション
   - モード切り替え時の状態管理
   - 変数の挿入機能

2. UIテスト
   - モード切り替えの動作確認
   - フォーム入力と送信
   - バリデーションメッセージ
   - ヘルプテキストの表示
   - プレビュー機能

## 注意事項
- ユーザーフレンドリーなUI/UXの実現
- 適切なエラーメッセージとヘルプテキスト
- レスポンシブデザインの対応
- アクセシビリティへの配慮