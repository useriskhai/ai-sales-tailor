# メール開封率・リンククリック検知機能 詳細設計

## 1. 概要

### 1.1 目的
- メール開封率を正確に計測し、営業活動の効果測定を行う
- バッチジョブのKPI分析に開封率データを活用する
- より精度の高いAIによる改善提案を実現する

### 1.2 機能要件
- 送信メールごとの開封状況トラッキング
- バッチジョブ単位での開封率集計
- 業界別・テンプレート別の開封率分析
- プライバシーに配慮した実装

## 2. システム設計

### 2.1 データベース設計

#### generated_contents テーブル拡張
```sql
ALTER TABLE generated_contents
ADD COLUMN tracking_id UUID DEFAULT gen_random_uuid(),
ADD COLUMN first_opened_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN opened_count INTEGER DEFAULT 0,
ADD COLUMN last_opened_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN opened_ip TEXT[];
```

#### email_tracking_logs テーブル（新規作成）
```sql
CREATE TABLE email_tracking_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_id UUID REFERENCES generated_contents(tracking_id),
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT,
    batch_job_id UUID REFERENCES batch_jobs(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tracking_logs_tracking_id ON email_tracking_logs(tracking_id);
CREATE INDEX idx_tracking_logs_batch_job_id ON email_tracking_logs(batch_job_id);
```

### 2.2 APIエンドポイント

#### トラッキングピクセル取得API
```typescript
// supabase/functions/track-open/index.ts

export const onRequest = async (context: Context) => {
  const { searchParams } = new URL(context.request.url);
  const trackingId = searchParams.get('tid');
  
  if (!trackingId) {
    return new Response(null, { status: 404 });
  }

  // 開封ログを記録
  await supabase.from('email_tracking_logs').insert({
    tracking_id: trackingId,
    ip_address: context.request.headers.get('cf-connecting-ip'),
    user_agent: context.request.headers.get('user-agent')
  });

  // generated_contentsの更新
  await supabase.rpc('update_email_tracking_stats', { p_tracking_id: trackingId });

  // 1x1透明GIF画像を返す
  return new Response(
    Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
    {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    }
  );
};
```

#### 開封統計更新関数（PostgreSQL）
```sql
CREATE OR REPLACE FUNCTION update_email_tracking_stats(p_tracking_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE generated_contents
  SET 
    opened_count = opened_count + 1,
    last_opened_at = NOW(),
    first_opened_at = COALESCE(first_opened_at, NOW())
  WHERE tracking_id = p_tracking_id;
END;
$$ LANGUAGE plpgsql;
```

### 2.3 メール生成処理の拡張

#### トラッキングピクセル挿入
```typescript
// src/services/email/generator.ts

function insertTrackingPixel(htmlContent: string, trackingId: string): string {
  const trackingUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/track-open?tid=${trackingId}`;
  const pixelTag = `<img src="${trackingUrl}" width="1" height="1" style="display:none" alt="" />`;
  
  return htmlContent.replace('</body>', `${pixelTag}</body>`);
}
```

## 3. バッチジョブKPI拡張

### 3.1 metrics_results テーブル拡張
```sql
ALTER TABLE batch_jobs.metrics_results
ADD COLUMN total_opens INTEGER DEFAULT 0,
ADD COLUMN unique_opens INTEGER DEFAULT 0,
ADD COLUMN open_rate DECIMAL(5,2);
```

### 3.2 KPI集計バッチ処理
```typescript
// src/batch/calculate-kpis.ts

async function calculateOpenRateMetrics(batchJobId: string) {
  const { data: stats } = await supabase
    .rpc('get_batch_open_stats', { p_batch_job_id: batchJobId });
    
  await supabase
    .from('batch_jobs.metrics_results')
    .update({
      total_opens: stats.total_opens,
      unique_opens: stats.unique_opens,
      open_rate: (stats.unique_opens / stats.total_sent) * 100
    })
    .eq('batch_job_id', batchJobId);
}
```

## 4. プライバシー対応

### 4.1 トラッキング設定
- バッチジョブ作成時にトラッキングの有効/無効を選択可能
- デフォルトはトラッキング有効

### 4.2 オプトアウト対応
- メールフッターにトラッキング解除リンクを設置
- 解除後は該当ユーザーの開封追跡を停止

### 4.3 データ保持ポリシー
- トラッキングログは90日間保持
- 集計データは永続保持

## 5. UI拡張

### 5.1 バッチジョブ詳細画面
- 実績分析タブに開封率グラフを追加
- 時系列での開封状況表示
- 業界別開封率比較

### 5.2 テンプレート分析
- テンプレート別の平均開封率表示
- A/Bテスト結果への開封率データ追加

## 6. エラー処理

### 6.1 トラッキングエラー
- 無効なトラッキングIDの場合は404を返す
- ログ記録失敗時もピクセルは正常応答

### 6.2 データ整合性
- 重複カウント防止のためのレートリミット
- 異常値検知と通知の実装

## 7. パフォーマンス対策

### 7.1 スケーリング
- トラッキングピクセルのCDN配信
- ログテーブルのパーティショニング

### 7.2 キャッシュ戦略
- 集計結果のキャッシュ
- バッチ処理の最適化

## 8. 監視・アラート

### 8.1 監視項目
- トラッキングピクセルのレスポンスタイム
- ログ記録の成功率
- 異常な開封パターンの検知

### 8.2 アラート条件
- トラッキングエンドポイントの障害
- 開封率の急激な低下
- データ不整合の検知 

## 9. リンククリック検知機能

### 9.1 データベース設計

#### links テーブル（新規作成）
```sql
CREATE TABLE links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_job_id UUID REFERENCES batch_jobs(id),
    task_id UUID REFERENCES tasks(id),
    original_url TEXT NOT NULL,
    link_index INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(batch_job_id, task_id, link_index)
);

CREATE INDEX idx_links_batch_job ON links(batch_job_id);
CREATE INDEX idx_links_task ON links(task_id);
```

#### click_logs テーブル（新規作成）
```sql
CREATE TABLE click_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    link_id UUID REFERENCES links(id),
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_click_logs_link ON click_logs(link_id);
CREATE INDEX idx_click_logs_clicked_at ON click_logs(clicked_at);
```

### 9.2 APIエンドポイント

#### クリックトラッキングAPI
```typescript
// supabase/functions/track-click/index.ts

export const onRequest = async (context: Context) => {
  const { searchParams } = new URL(context.request.url);
  const linkId = searchParams.get('lid');
  
  if (!linkId) {
    return new Response('Missing linkId', { status: 400 });
  }

  try {
    // リンク情報の取得
    const { data: link, error: linkError } = await supabase
      .from('links')
      .select('original_url')
      .eq('id', linkId)
      .single();

    if (linkError || !link) {
      return new Response('Link not found', { status: 404 });
    }

    // クリックログの記録
    await supabase.from('click_logs').insert({
      link_id: linkId,
      ip_address: context.request.headers.get('cf-connecting-ip'),
      user_agent: context.request.headers.get('user-agent'),
      referrer: context.request.headers.get('referer')
    });

    // 元のURLへリダイレクト
    return Response.redirect(link.original_url, 302);
  } catch (error) {
    console.error('Click tracking error:', error);
    return new Response('Server error', { status: 500 });
  }
};
```

### 9.3 メール生成処理の拡張

#### リンク変換処理
```typescript
// src/services/email/generator.ts

interface TrackingLink {
  id: string;
  originalUrl: string;
  trackingUrl: string;
}

async function convertToTrackingLinks(
  content: string,
  batchJobId: string,
  taskId: string
): Promise<string> {
  const linkPattern = /<a[^>]+href=["']([^"']+)["'][^>]*>/g;
  let linkIndex = 0;
  const links: TrackingLink[] = [];

  // リンクの抽出と変換
  const newContent = content.replace(linkPattern, (match, url) => {
    const trackingLink = generateTrackingLink(url, batchJobId, taskId, linkIndex++);
    links.push(trackingLink);
    return match.replace(url, trackingLink.trackingUrl);
  });

  // リンク情報をDBに保存
  await saveLinks(links, batchJobId, taskId);

  return newContent;
}

function generateTrackingLink(
  originalUrl: string,
  batchJobId: string,
  taskId: string,
  linkIndex: number
): TrackingLink {
  const id = uuidv4();
  const trackingUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/track-click?lid=${id}`;
  
  return {
    id,
    originalUrl,
    trackingUrl
  };
}

async function saveLinks(
  links: TrackingLink[],
  batchJobId: string,
  taskId: string
): Promise<void> {
  const linkRecords = links.map((link, index) => ({
    id: link.id,
    batch_job_id: batchJobId,
    task_id: taskId,
    original_url: link.originalUrl,
    link_index: index
  }));

  await supabase.from('links').insert(linkRecords);
}
```

### 9.4 KPI拡張

#### metrics_results テーブル拡張
```sql
ALTER TABLE batch_jobs.metrics_results
ADD COLUMN total_clicks INTEGER DEFAULT 0,
ADD COLUMN unique_clicks INTEGER DEFAULT 0,
ADD COLUMN click_through_rate DECIMAL(5,2);
```

#### KPI集計関数
```sql
CREATE OR REPLACE FUNCTION calculate_click_metrics(p_batch_job_id UUID)
RETURNS TABLE (
    total_clicks INTEGER,
    unique_clicks INTEGER,
    click_through_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH click_stats AS (
        SELECT
            COUNT(cl.id) as total_clicks,
            COUNT(DISTINCT l.task_id) as unique_clicks,
            (SELECT COUNT(DISTINCT task_id) FROM tasks WHERE batch_job_id = p_batch_job_id) as total_tasks
        FROM links l
        LEFT JOIN click_logs cl ON l.id = cl.link_id
        WHERE l.batch_job_id = p_batch_job_id
    )
    SELECT
        total_clicks,
        unique_clicks,
        CASE
            WHEN total_tasks > 0 THEN
                ROUND((unique_clicks::DECIMAL / total_tasks::DECIMAL) * 100, 2)
            ELSE 0
        END as click_through_rate
    FROM click_stats;
END;
$$ LANGUAGE plpgsql;
```

### 9.5 セキュリティ対策

#### リンク有効期限
- リンクの有効期限を設定（例：90日）
- 期限切れリンクへのアクセスは適切なエラーページにリダイレクト

#### アクセス制限
- 同一IPからの連続アクセスを制限
- 不正なリファラーからのアクセスをブロック

#### プライバシー保護
- クリックログの保持期間を制限
- IPアドレスの匿名化オプション

### 9.6 パフォーマンス最適化

#### キャッシュ戦略
- リンク情報のキャッシュ
- 高頻度アクセスパターンの最適化

#### スケーリング対策
- リンクテーブルのパーティショニング
- クリックログのシャーディング

### 9.7 分析機能

#### クリック分析レポート
- 時間帯別クリック数
- デバイス別クリック率
- リンク位置による反応率の違い

#### セグメント分析
- 業種別クリック傾向
- 企業規模別の反応率
- リピートクリックの分析 