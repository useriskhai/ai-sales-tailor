-- 使用されていないメトリクステーブルの削除

-- process_metricsテーブルの削除
DROP TABLE IF EXISTS public.process_metrics;

-- processing_metricsテーブルの削除
DROP TABLE IF EXISTS public.processing_metrics;

-- template_metricsテーブルの削除
DROP TABLE IF EXISTS public.template_metrics;

-- 関連するシーケンスの削除
DROP SEQUENCE IF EXISTS public.process_metrics_id_seq; 