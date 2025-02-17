# タスク詳細画面

## 画面概要
個別のタスクの詳細情報とセールスレターの編集・確認を行う画面。レビュー・承認プロセスを通じて品質を管理する。

## 画面レイアウト
```
+--------------------------------------------------+
|                    ヘッダー                        |
| < 一覧に戻る                                      |
| タスク詳細                                        |
| タスクID: task-2                                 |
+--------------------------------------------------+
|                アクションボタン                     |
| [承認(Enter)]  [要修正(Esc)]                     |
| [AI修正(A)]    [手動編集(E)]                     |
+--------------------------------------------------+
|                                    +-------------+
|      セールスレター                | 会社情報      |
| +--------------------------------+ |             |
| | [編集可能なリッチテキストエリア]  | | 会社名      |
| |                                | | 従業員数     |
| | ※マークダウン記法対応           | | メール      |
| | ※自動保存機能付き              | | 電話番号     |
| |                                | | 住所        |
| | ※インデント、箇条書き等の        | |             |
| |   書式設定ツールバー付き         | | 事業内容     |
| |                                | |             |
| |                                | | [サイトを開く] |
| +--------------------------------+ +-------------+
|                                    |             |
| レビューコメント                    | タスク情報    |
| +--------------------------------+ | ステータス    |
| | [コメント入力エリア]             | | 品質スコア   |
| |                                | | 作成日時     |
| | ※レビュー時の指摘事項や         | | 更新日時     |
| |   修正依頼を記録                | | レビュー日時  |
| +--------------------------------+ +-------------+
+--------------------------------------------------+
```

## インタラクティブ要素

### 1. アクションボタン
- **承認 (Enter)**
  - ホットキー: Enter
  - 確認ダイアログ表示
  - 承認後のステータス更新（承認済みに変更）
  - 品質スコアの確定

- **要修正 (Esc)**
  - ホットキー: Esc
  - レビューコメント必須
  - ステータスを要修正に変更
  - 担当者への通知

- **AI修正 (A)**
  - ホットキー: A
  - AIによる文章改善
  - 変更箇所のハイライト表示
  - 変更履歴の保存
  - 品質スコアの再計算

- **手動編集 (E)**
  - ホットキー: E
  - エディタモード切り替え
  - 変更履歴の記録
  - 編集後の品質スコア再計算

### 2. セールスレターエディタ
- **機能**:
  - リッチテキストエディタ
  - マークダウン記法対応
  - 自動保存（3秒間隔）
  - 変更履歴
  - 元に戻す/やり直し

- **書式設定ツールバー**:
  - 太字/斜体/下線
  - 箇条書き/番号付きリスト
  - インデント調整
  - 見出しレベル
  - リンク挿入
  - テキスト整形

- **プレビュー機能**:
  - メールプレビュー
  - モバイル表示確認
  - 印刷プレビュー

### 3. 会社情報パネル
- **表示項目**:
  - 会社名
  - 従業員数
  - 連絡先情報
  - 事業内容
  - Webサイトリンク

- **インタラクション**:
  - 情報のコピー機能
  - サイトを新タブで開く
  - 地図表示（住所クリック）

### 4. タスク情報パネル
- **表示項目**:
  - ステータス（生成中/レビュー待ち/承認済み/要修正）
  - 品質スコア（0-100点）
  - 作成日時
  - 更新日時
  - レビュー日時

### 5. レビューコメント
- **機能**:
  - コメント履歴の表示
  - 新規コメント追加
  - コメントへの返信
  - 修正箇所の指摘（テキスト範囲の選択可能）

## 品質管理機能

### 1. 品質スコアの算出
- 文章の完成度
- 業界適合性
- 文法・表現の正確性
- キーメッセージの明確さ
- カスタマイズ度

### 2. レビュー履歴
- レビュー担当者
- レビュー日時
- 指摘事項
- 修正履歴

## エラーハンドリング
- 未保存変更の警告
- 自動保存失敗時の通知
- 編集競合の検出と解決
- ネットワークエラー時の復旧

## レスポンシブ対応
- デスクトップ:
  - 2カラムレイアウト
  - フルサイズエディタ

- タブレット:
  - スクロール可能なパネル
  - 最適化されたツールバー

- モバイル:
  - シングルカラム
  - 簡略化されたツールバー
  - タッチ操作最適化 