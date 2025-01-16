# Edge Function Cron移行チケット

## 目的
現在のPostgreSQL Cron実装からEdge Function Cronパターンへの移行を行い、より安定した運用を実現する。

## タスク一覧

### Phase 1: 準備フェーズ
- [x] 1.1 新しい環境変数の設定
  - [x] PROJECT_URLの設定
  - [x] SERVICE_ROLE_KEYの設定
  - [x] BATCH_SIZEの設定
  - [x] MAX_RETRIESの設定

- [x] 1.2 モニタリング用テーブルの作成
  - [x] process_metricsテーブル
  - [x] process_logsテーブル

### Phase 2: 実装フェーズ
- [x] 2.1 共通モジュールの実装
  - [x] types/queue.tsの作成
  - [x] utils/retry.tsの実装
  - [x] utils/error-handler.tsの実装
  - [x] utils/metrics.tsの実装
  - [x] utils/monitoring.tsの実装

- [ ] 2.2 Edge Function実装
  - [ ] process-crawl-batch/index.tsの実装
  - [ ] エラーハンドリングの実装
  - [ ] メトリクス収集の実装
  - [ ] ログ収集の実装

### Phase 3: テストフェーズ
- [ ] 3.1 ローカルテスト
  - [ ] 基本機能のテスト
  - [ ] エラーハンドリングのテスト
  - [ ] メトリクス収集のテスト

- [ ] 3.2 テスト環境でのテスト
  - [ ] 小規模データでのテスト
  - [ ] エラー時の挙動確認
  - [ ] モニタリングの確認

### Phase 4: 移行フェーズ
- [ ] 4.1 本番環境の準備
  - [ ] 環境変数の設定
  - [ ] モニタリングテーブルの作成
  - [ ] アラート設定

- [ ] 4.2 段階的移行
  - [ ] PostgreSQL Cronの停止
  - [ ] Edge Function Cronの開始
  - [ ] 移行状況の監視

### Phase 5: 運用フェーズ
- [ ] 5.1 モニタリング体制の確立
  - [ ] メトリクス収集の開始
  - [ ] アラート閾値の調整
  - [ ] 運用手順書の作成

## 進捗報告
- 作業開始日: 2024/01/07
- 現在のフェーズ: 実装フェーズ
- 次のマイルストーン: Edge Function本体の実装完了

## 作業ログ
### 2024/01/07
- Phase 1完了
  - 環境変数の設定完了
  - モニタリング用テーブル（process_metrics, process_logs）の作成完了
- Phase 2進行中
  - 共通モジュールの実装完了
    - types/queue.ts: キュー関連の型定義
    - utils/retry.ts: リトライ処理のユーティリティ
    - utils/error-handler.ts: エラーハンドリング
    - utils/metrics.ts: メトリクス収集
    - utils/monitoring.ts: ログ管理とSlack通知
  - Edge Function本体の実装を開始予定

## 注意事項
- 移行作業中はシステムの監視を強化
- エラー発生時は即座に報告
- 各フェーズ完了時にスーパーバイザーに報告

## 参考資料
- [Edge Function Cronトラブルシューティング](../docs/troubleshooting-edge-function-cron.md)
- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions) 