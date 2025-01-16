# メール送信機能の実装

## 概要
営業メールの送信機能を実装する。

## 詳細
### 実装する機能
1. メール送信
   - DMメール送信
   - フォームメール送信
   - テンプレート適用

2. 送信管理
   - 送信キュー管理
   - 送信状態追跡
   - エラー再試行
   - 送信制限管理

3. 分析・レポート
   - 送信統計
   - 開封率追跡
   - クリック率分析
   - バウンス管理

### 技術仕様
- SMTPサーバー連携
- メールキュー実装
- トラッキング機能

### データモデル
```sql
-- mail_queue
CREATE TABLE mail_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  content_id UUID REFERENCES contents(id),
  recipient_email TEXT NOT NULL,
  status TEXT NOT NULL,
  retry_count INTEGER DEFAULT 0,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- mail_tracking
CREATE TABLE mail_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mail_id UUID REFERENCES mail_queue(id),
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### エラーハンドリング
- 送信失敗
- バウンス処理
- レート制限超過
- 無効なメールアドレス

## 受け入れ基準
- [ ] メール送信が正常に機能
- [ ] 送信制限が適切に管理される
- [ ] トラッキングが正確に動作
- [ ] エラー時の再試行が機能
- [ ] レポートが正確に生成される

## 関連リソース
- SMTPサーバー設定
- メールテンプレート仕様
- トラッキングシステム設計 