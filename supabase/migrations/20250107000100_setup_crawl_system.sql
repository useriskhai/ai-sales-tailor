-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Crawl batch queue table
CREATE TABLE IF NOT EXISTS public.crawl_batch_queue (
  batch_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  processed boolean DEFAULT false
);

-- Add batch_id to crawl_queue
ALTER TABLE public.crawl_queue
ADD COLUMN IF NOT EXISTS batch_id uuid REFERENCES public.crawl_batch_queue(batch_id) ON DELETE CASCADE;

-- Create monitoring tables
CREATE TABLE IF NOT EXISTS public.monitoring_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  level text NOT NULL,
  message text NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_monitoring_logs_level ON public.monitoring_logs(level);
CREATE INDEX IF NOT EXISTS idx_monitoring_logs_created_at ON public.monitoring_logs(created_at);

-- Queue processing function
CREATE OR REPLACE FUNCTION public.process_crawl_queue()
RETURNS void AS $$
DECLARE
  edge_function_url text;
  anon_key text;
  current_batch_id uuid;
  request_id uuid;
BEGIN
  -- Get URL and key from environment
  SELECT COALESCE(current_setting('app.settings.supabase_url', true), 'http://localhost:54321')
    || '/functions/v1/crawl-company' INTO edge_function_url;
  
  SELECT COALESCE(current_setting('app.settings.anon_key', true), 'default-local-anon-key')
    INTO anon_key;

  -- Get unprocessed batch
  SELECT b.batch_id INTO current_batch_id
  FROM public.crawl_batch_queue b
  WHERE b.processed = false
  AND b.created_at <= now()
  ORDER BY b.created_at
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF current_batch_id IS NULL THEN
    -- Log no batch found
    INSERT INTO public.monitoring_logs (level, message)
    VALUES ('info', 'No unprocessed batch found');
    RETURN;
  END IF;

  -- Call edge function
  SELECT net.http_post(
    url:=edge_function_url,
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || anon_key
    ),
    body:=jsonb_build_object(
      'batch_id', current_batch_id
    )
  ) INTO request_id;

  -- Log the request
  INSERT INTO public.monitoring_logs (level, message, metadata)
  VALUES (
    'info',
    'Edge function called for batch processing',
    jsonb_build_object(
      'batch_id', current_batch_id,
      'request_id', request_id
    )
  );

  -- Mark batch as processed
  UPDATE public.crawl_batch_queue
  SET processed = true
  WHERE batch_id = current_batch_id;
END;
$$ LANGUAGE plpgsql;

-- Schedule cron job
SELECT cron.schedule(
  'process-crawl-queue',
  '*/5 * * * *',
  $$SELECT public.process_crawl_queue();$$
); 