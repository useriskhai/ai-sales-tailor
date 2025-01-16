# 通知機能の実装

## 概要
ユーザーに重要な情報をタイムリーに通知するための機能を実装します。アプリ内通知とメール通知の両方をサポートします。

## 現状
- 通知機能が未実装
- ジョブ完了時の通知機能が不足
- 通知設定機能が未実装

## タスク

### 1. 通知管理APIの実装
- `createNotification`APIの実装
  - 通知タイプの定義
  - ユーザーIDとの紐付け
  - 優先度の設定
  - 通知チャネルの選択
- `getUserNotifications`APIの実装
  - 未読/既読フィルタリング
  - ページネーション対応
  - 通知タイプによるフィルタリング
- `markNotificationAsRead`APIの実装
  - 単一通知の既読化
  - 一括既読化
  - 既読状態の同期

### 2. ジョブ完了通知の実装
- メール通知機能
  - テンプレートの作成
  - 送信処理の実装
  - 送信失敗時のリトライ
- アプリ内通知の連携
  - リアルタイム通知
  - バッチ処理結果の通知
  - エラー通知

### 3. 通知設定機能の実装
- 通知設定の管理
- チャ���ルごとの設定
- 通知タイプごとの設定

## 技術仕様

### データモデル
```typescript
interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  status: 'unread' | 'read';
  created_at: string;
  read_at?: string;
  metadata?: Record<string, unknown>;
}

interface NotificationSettings {
  user_id: string;
  email_enabled: boolean;
  app_enabled: boolean;
  notification_preferences: {
    [key in NotificationType]: {
      email: boolean;
      app: boolean;
      priority: 'high' | 'medium' | 'low';
    };
  };
}

enum NotificationType {
  JOB_COMPLETED = 'job_completed',
  JOB_FAILED = 'job_failed',
  SYSTEM_ALERT = 'system_alert',
  TASK_COMPLETED = 'task_completed',
  TASK_FAILED = 'task_failed'
}
```

### API仕様

#### createNotification
- メソッド: POST
- エンドポイント: `/notification-operations`
- リクエストボディ:
```typescript
{
  action: 'createNotification',
  data: {
    user_id: string;
    type: NotificationType;
    title: string;
    content: string;
    priority?: 'high' | 'medium' | 'low';
    metadata?: Record<string, unknown>;
  }
}
```

#### getUserNotifications
- メソッド: POST
- エンドポイント: `/notification-operations`
- リクエストボディ:
```typescript
{
  action: 'getUserNotifications',
  data: {
    user_id: string;
    status?: 'unread' | 'read' | 'all';
    type?: NotificationType[];
    pagination?: {
      page: number;
      per_page: number;
    };
    sort?: {
      field: 'created_at' | 'priority';
      order: 'asc' | 'desc';
    };
  }
}
```

#### markNotificationAsRead
- メソッド: POST
- エンドポイント: `/notification-operations`
- リクエストボディ:
```typescript
{
  action: 'markNotificationAsRead',
  data: {
    notification_ids: string[];
    user_id: string;
  }
}
```

#### updateNotificationSettings
- メソッド: POST
- エンドポイント: `/notification-operations`
- リクエストボディ:
```typescript
{
  action: 'updateNotificationSettings',
  data: {
    user_id: string;
    settings: Partial<NotificationSettings>;
  }
}
```

## 関連ファイル
- `supabase/functions/notification-operations/index.ts`
- `supabase/functions/job-notification/index.ts`
- `supabase/functions/utils/email-sender.ts`
- `supabase/functions/_shared/types.ts`

## 優先度
中

## 担当
バックエンドエンジニア

## 見積もり工数
4人日

## テスト要件
1. ユニットテスト
   - 通知作成のテスト
   - 通知取得のテスト
   - 既読��能のテスト
   - 設定管理のテスト

2. 統合テスト
   - メール送信のテスト
   - リアルタイム通知のテスト
   - 大量通知時のパフォーマンステスト

## 注意事項
- メール送信の信頼性確保
- 通知の重複防止
- パフォーマンスの最適化
- プライバシーの考慮
- 通知の優先度管理 