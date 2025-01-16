# テンプレートコンポーネント構成

## フォルダ構造

```
src/components/templates/
├── pages/                    # ページレベルのコンポーネント
│   ├── TemplateManager.tsx      # テンプレート一覧・管理
│   ├── TemplateDetails.tsx      # テンプレート詳細表示
│   └── TemplateTestingPanel.tsx # テンプレートテスト機能
│
├── wizard/                   # テンプレート作成ウィザード関連
│   ├── CreateTemplateWizard.tsx    # ウィザードのメインコンポーネント
│   ├── CreateTemplateDialog.tsx    # 作成ダイアログ
│   └── steps/                      # ウィザードのステップコンポーネント
│       ├── BasicInfoStep.tsx           # 基本情報入力ステップ
│       ├── MessageStrategyStep.tsx     # メッセージ戦略設定ステップ
│       ├── ExecutionSettingsStep.tsx   # 実行設定ステップ
│       └── KPISettingsStep.tsx         # KPI設定ステップ
│
├── forms/                    # 再利用可能なフォームコンポーネント
│   ├── settings/                   # 設定関連のフォーム
│   │   ├── BasicSettingsForm.tsx      # 基本設定フォーム
│   │   ├── CustomSettingsForm.tsx     # カスタム設定フォーム
│   │   ├── ExecutionSettingsForm.tsx  # 実行設定フォーム
│   │   └── KPISettingsForm.tsx        # KPI設定フォーム
│   └── editor/                     # エディター関連のフォーム
│       └── MessageTemplateEditor.tsx   # メッセージテンプレートエディター
│
└── shared/                   # 共有コンポーネント
    └── TemplateSettingsMode.tsx    # 設定モード切り替え
```

## コンポーネントの責務

### ページコンポーネント (`pages/`)
- ルーティングのエンドポイントとして機能
- ページレベルのレイアウトとナビゲーションを管理
- 子コンポーネントの状態管理とデータフローの制御

### ウィザードコンポーネント (`wizard/`)
- テンプレート作成フローの管理
- ステップ間のナビゲーション制御
- 入力データの収集と検証

### フォームコンポーネント (`forms/`)
- ユーザー入力の受付とバリデーション
- フォームの状態管理
- UIの表示と更新

### 共有コンポーネント (`shared/`)
- 複数のコンポーネントで共有される機能
- 設定や表示モードの切り替え
- 共通のUIパターン

## 命名規則

### コンポーネント
- ページコンポーネント: `Template〇〇.tsx`
- ウィザードステップ: `〇〇Step.tsx`
- フォーム: `〇〇Form.tsx`
- エディター: `〇〇Editor.tsx`

### インポートパス
- 絶対パスを使用: `@/components/templates/...`
- 相対パスは避ける

## 開発ガイドライン

### 新規コンポーネントの追加
1. 適切なディレクトリを選択
2. 命名規則に従う
3. 責務の分離を意識
4. 必要なテストを作成

### コンポーネントの修正
1. 単一責任の原則を守る
2. 再利用性を考慮
3. 型の整合性を確認
4. テストの更新を忘れない

### テスト
- ユニットテスト: 各コンポーネントの機能テスト
- 統合テスト: コンポーネント間の連携テスト
- E2Eテスト: ユーザーフローのテスト 