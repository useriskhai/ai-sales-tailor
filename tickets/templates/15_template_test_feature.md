# テンプレートテスト機能の改善

## 概要
テンプレートの設定に基づいてセールスレターを生成するテスト機能を改善します。
現在の実装から不要な機能を削除し、必要最小限の機能に絞り込みます。

## 現状の実装
1. 実装済みの機能
   - テンプレート詳細画面からのテスト画面遷移
   - 企業・プロダクト選択機能
   - メッセージ生成機能
   - テスト結果の保存機能
   - フィードバック機能

2. 既存のコンポーネント
   - `TemplateTestingPanel`: テスト実行の主要コンポーネント
   - `TemplateSettingsMode`: 設定モード切り替え
   - 各種設定フォームコンポーネント

3. 問題点
   - 不要な機能（テスト結果保存、フィードバック）が実装されている
   - 設定の表示と一時的な変更機能が不足
   - テスト実行時の設定反映が不完全

## 改善タスク

1. 不要機能の削除
   - [ ] テスト結果保存機能の削除
   - [ ] フィードバック機能の削除
   - [ ] 関連するUIコンポーネントの削除

2. 設定表示機能の実装
   - [ ] 現在のテンプレート設定の表示
     - メッセージ戦略（モード、戦略、トーン等）
     - 実行設定（優先度）
   - [ ] 設定表示用コンポーネントの作成

3. 設定の一時的な変更機能
   - [ ] 設定変更モーダルの実装
   - [ ] 一時的な設定の状態管理
   - [ ] 変更した設定でのテスト実行機能

4. エラーハンドリングの改善
   - [ ] メッセージ生成時のエラー処理
   - [ ] 設定変更時のバリデーション
   - [ ] エラーメッセージの改善

## 技術仕様

### コンポーネント構成
```typescript
// TemplateTestingPanel
interface Props {
  template: Template;
}

// 一時的な設定の型定義
interface TemporarySettings {
  messageStrategy: {
    mode: 'ai_auto' | 'manual';
    strategy: Strategy;
    toneOfVoice: ToneOfVoice;
    maxLength: number;
    useEmoji: boolean;
  };
  executionSettings: {
    execution_priority: 'speed' | 'balanced' | 'quality';
  };
}
```

### 設定変更の処理フロー
1. 現在の設定を表示
2. 設定変更モーダルで一時的な設定を編集
3. 変更した設定でテスト実行
4. テスト完了後に設定を元に戻す

### エラーハンドリング
- API接続エラー時の適切なメッセージ表示
- 設定値の検証と適切なフィードバック
- タイムアウト時の処理

## 影響範囲
- `src/components/templates/pages/TemplateTestingPanel.tsx`
- `src/utils/generate-message.ts`
- `src/types/template.ts`

## 期待される結果
- シンプルで使いやすいテスト機能の実現
- 設定の確認と一時的な変更が容易に
- 不要な機能の削除によるコードの簡素化