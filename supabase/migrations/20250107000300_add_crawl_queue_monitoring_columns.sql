-- クロール処理の監視用カラムを追加
ALTER TABLE public.crawl_queue
ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS processing_duration INTEGER;

-- 説明を追加
COMMENT ON COLUMN public.crawl_queue.next_retry_at IS 'リトライ予定時刻。指数バックオフで設定される';
COMMENT ON COLUMN public.crawl_queue.processing_started_at IS 'クロール処理の開始時刻';
COMMENT ON COLUMN public.crawl_queue.processing_duration IS 'クロール処理にかかった時間（ミリ秒）';

-- インデックスを追加（リトライ時刻での検索を最適化）
CREATE INDEX IF NOT EXISTS idx_crawl_queue_next_retry_at ON public.crawl_queue(next_retry_at)
WHERE next_retry_at IS NOT NULL; 