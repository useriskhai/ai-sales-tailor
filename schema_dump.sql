

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."content_focus" AS ENUM (
    'benefit',
    'technical',
    'case-study',
    'roi',
    'relationship'
);


ALTER TYPE "public"."content_focus" OWNER TO "postgres";


CREATE TYPE "public"."execution_priority" AS ENUM (
    'speed',
    'balanced',
    'quality'
);


ALTER TYPE "public"."execution_priority" OWNER TO "postgres";


CREATE TYPE "public"."form_submission_status_type" AS ENUM (
    'pending',
    'success',
    'form_not_found',
    'submission_failed'
);


ALTER TYPE "public"."form_submission_status_type" OWNER TO "postgres";


CREATE TYPE "public"."metric_type" AS ENUM (
    'system',
    'custom'
);


ALTER TYPE "public"."metric_type" OWNER TO "postgres";


CREATE TYPE "public"."template_category" AS ENUM (
    'new-client-acquisition',
    'existing-client',
    'proposal',
    'follow-up',
    'event-announcement'
);


ALTER TYPE "public"."template_category" OWNER TO "postgres";


CREATE TYPE "public"."template_mode" AS ENUM (
    'ai_auto',
    'manual'
);


ALTER TYPE "public"."template_mode" OWNER TO "postgres";


CREATE TYPE "public"."template_parallelism" AS ENUM (
    '低',
    '中',
    '高'
);


ALTER TYPE "public"."template_parallelism" OWNER TO "postgres";


CREATE TYPE "public"."template_reliability" AS ENUM (
    '安定重視',
    'バランス',
    'スピード重視'
);


ALTER TYPE "public"."template_reliability" OWNER TO "postgres";


CREATE TYPE "public"."template_retry_strategy" AS ENUM (
    '最小限',
    '標準',
    '粘り強い'
);


ALTER TYPE "public"."template_retry_strategy" OWNER TO "postgres";


CREATE TYPE "public"."template_speed" AS ENUM (
    '高速',
    '標準',
    '慎重'
);


ALTER TYPE "public"."template_speed" OWNER TO "postgres";


CREATE TYPE "public"."template_strategy" AS ENUM (
    'benefit-first',
    'problem-solution',
    'story-telling',
    'direct-offer'
);


ALTER TYPE "public"."template_strategy" OWNER TO "postgres";


CREATE TYPE "public"."template_tone" AS ENUM (
    'formal',
    'professional',
    'friendly',
    'casual'
);


ALTER TYPE "public"."template_tone" OWNER TO "postgres";


CREATE TYPE "public"."tone_of_voice" AS ENUM (
    'formal',
    'professional',
    'friendly',
    'casual'
);


ALTER TYPE "public"."tone_of_voice" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_company_crawl"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  current_batch_id uuid;
BEGIN
  -- crawl_queueにエントリを追加
  INSERT INTO public.crawl_queue (company_id, status, retry_count)
  VALUES (NEW.id, 'pending', 0);

  -- 現在のバッチを取得または新規作成
  SELECT batch_id INTO current_batch_id
  FROM public.crawl_batch_queue
  WHERE processed = false
  AND created_at > now() - interval '1 minute'
  ORDER BY created_at DESC
  LIMIT 1;

  IF current_batch_id IS NULL THEN
    INSERT INTO public.crawl_batch_queue DEFAULT VALUES
    RETURNING batch_id INTO current_batch_id;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_company_crawl"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, name, company)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'company'
  );
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."process_crawl_queue"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  current_batch_id uuid;
  updated_count int;
BEGIN
  -- デバッグログ: 関数開始
  RAISE NOTICE 'process_crawl_queue: 開始';

  -- 未処理のバッチを取得
  SELECT b.batch_id INTO current_batch_id
  FROM public.crawl_batch_queue b
  WHERE b.processed = false
  AND b.created_at <= now()
  ORDER BY b.created_at
  LIMIT 1
  FOR UPDATE SKIP LOCKED;
  
  RAISE NOTICE 'バッチID: %', current_batch_id;

  -- バッチが存在する場合のみ処理を実行
  IF current_batch_id IS NOT NULL THEN
    RAISE NOTICE 'バッチ処理開始: %', current_batch_id;

    -- 保留中のキューアイテムをバッチに関連付け
    WITH updated_rows AS (
      UPDATE public.crawl_queue
      SET batch_id = current_batch_id
      WHERE status = 'pending'
      AND batch_id IS NULL
      AND retry_count = 0
      AND id IN (
        SELECT id
        FROM public.crawl_queue
        WHERE status = 'pending'
        AND batch_id IS NULL
        AND retry_count = 0
        LIMIT 10
      )
      RETURNING id
    )
    SELECT COUNT(*) INTO updated_count FROM updated_rows;
    
    RAISE NOTICE '関連付けられたキューアイテム数: %', updated_count;
    
    -- Edge Functionの呼び出し
    IF updated_count > 0 THEN
      RAISE NOTICE 'Edge Function呼び出し開始';
      
      -- バッチを処理済みにマーク
      UPDATE public.crawl_batch_queue
      SET processed = true
      WHERE batch_id = current_batch_id;
      RAISE NOTICE 'バッチを処理済みにマーク: %', current_batch_id;
    ELSE
      RAISE NOTICE 'バッチに関連付けられたキューアイテムがないため、Edge Function呼び出しをスキップ';
    END IF;
  ELSE
    RAISE NOTICE '処理対象のバッチが見つかりませんでした';
  END IF;

  RAISE NOTICE 'process_crawl_queue: 終了';
END;
$$;


ALTER FUNCTION "public"."process_crawl_queue"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_corporate_info_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_corporate_info_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_generated_content_attempt"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.attempt_count = OLD.attempt_count + 1;
    NEW.last_attempt_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_generated_content_attempt"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_generated_content_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_generated_content_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_product_files_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_product_files_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_products_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_products_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_metrics"("metrics" "jsonb") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- 配列であることを確認
  IF NOT jsonb_typeof(metrics) = 'array' THEN
    RETURN false;
  END IF;

  -- 各メトリクスの構造を確認
  RETURN (
    SELECT bool_and(
      metric ? 'id' AND
      metric ? 'name' AND
      metric ? 'type' AND
      metric ? 'unit' AND
      metric ? 'target' AND
      metric ? 'weight' AND
      (metric->>'type')::text IN ('system', 'custom') AND
      (metric->>'target')::numeric IS NOT NULL AND
      (metric->>'weight')::numeric BETWEEN 0 AND 1
    )
    FROM jsonb_array_elements(metrics) AS metric
  );
END;
$$;


ALTER FUNCTION "public"."validate_metrics"("metrics" "jsonb") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."batch_job_companies" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "batch_job_id" "uuid",
    "company_id" "uuid"
);


ALTER TABLE "public"."batch_job_companies" OWNER TO "postgres";


COMMENT ON TABLE "public"."batch_job_companies" IS 'バッチジョブと送信対象企業の関連を格納するテーブル';



COMMENT ON COLUMN "public"."batch_job_companies"."batch_job_id" IS '関連するバッチジョブのID';



COMMENT ON COLUMN "public"."batch_job_companies"."company_id" IS '送信対象企業のID';



CREATE TABLE IF NOT EXISTS "public"."batch_jobs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "status" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "total_tasks" integer NOT NULL,
    "completed_tasks" integer DEFAULT 0,
    "error_message" "text",
    "preferred_method" "text",
    "content_directives" "text",
    "sending_group_id" "uuid",
    "product_id" "uuid",
    "parallel_tasks" integer DEFAULT 1,
    "retry_attempts" integer DEFAULT 0
);


ALTER TABLE "public"."batch_jobs" OWNER TO "postgres";


COMMENT ON COLUMN "public"."batch_jobs"."content_directives" IS 'バッチジョブ固有のコンテンツ生成指示や注意事項';



COMMENT ON COLUMN "public"."batch_jobs"."product_id" IS '関連する製品のID';



COMMENT ON COLUMN "public"."batch_jobs"."parallel_tasks" IS '同時に実行可能なタスクの数';



COMMENT ON COLUMN "public"."batch_jobs"."retry_attempts" IS 'タスクの再試行回数';



CREATE TABLE IF NOT EXISTS "public"."companies" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "url" "text",
    "description" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "user_id" "uuid",
    "industry" "text",
    "contact_email" "text",
    "contact_form_url" "text",
    "notes" "text",
    "website_content" "text",
    "last_crawled_at" timestamp with time zone,
    "business_description" "text",
    "phone" "text",
    "address" "text",
    "employee_count" integer,
    "founded_year" integer
);


ALTER TABLE "public"."companies" OWNER TO "postgres";


COMMENT ON COLUMN "public"."companies"."user_id" IS '企業を所有するユーザーのID';



COMMENT ON COLUMN "public"."companies"."industry" IS '企業の業種';



COMMENT ON COLUMN "public"."companies"."contact_email" IS '企業の連絡先メールアドレス';



COMMENT ON COLUMN "public"."companies"."contact_form_url" IS '企業のコンタクトフォームURL';



COMMENT ON COLUMN "public"."companies"."notes" IS '企業に関するメモ';



CREATE TABLE IF NOT EXISTS "public"."corporate_info" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "corporate_number" "text" NOT NULL,
    "corporate_name" "text" NOT NULL,
    "corporate_name_kana" "text",
    "corporate_name_en" "text",
    "postal_code" "text",
    "headquarters_address" "text",
    "status" "text",
    "closure_date" "date",
    "closure_reason" "text",
    "representative_name" "text",
    "representative_title" "text",
    "capital" "text",
    "employee_count" "text",
    "male_employee_details" "text",
    "female_employee_details" "text",
    "business_items" "text",
    "business_overview" "text",
    "company_website" "text",
    "establishment_date" "date",
    "founding_year" integer,
    "last_update" timestamp with time zone,
    "qualification_grade" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."corporate_info" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."crawl_batch_queue" (
    "batch_id" "uuid" DEFAULT "gen_random_uuid"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "processed" boolean DEFAULT false
);


ALTER TABLE "public"."crawl_batch_queue" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."crawl_queue" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "status" "text" NOT NULL,
    "retry_count" integer DEFAULT 0,
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "next_retry_at" timestamp with time zone,
    "processing_started_at" timestamp with time zone,
    "processing_duration" interval,
    CONSTRAINT "crawl_queue_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."crawl_queue" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."error_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "error_message" "text" NOT NULL,
    "error_stack" "text",
    "context" "jsonb",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."error_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."generated_content" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "content" "text" NOT NULL,
    "product" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "company_id" "uuid" NOT NULL,
    "status" "public"."form_submission_status_type",
    "attempt_count" integer DEFAULT 0,
    "last_attempt_at" timestamp with time zone,
    "error_message" "text",
    "batch_job_id" "uuid",
    "result" "jsonb",
    "form_url" "text",
    "subject" "text",
    "fallback_status" "text"
);


ALTER TABLE "public"."generated_content" OWNER TO "postgres";


COMMENT ON COLUMN "public"."generated_content"."error_message" IS 'エラーメッセージを格納するカラム。フォーム送信プロセスで発生したエラーの詳細情報を保存します。';



COMMENT ON COLUMN "public"."generated_content"."subject" IS '生成されたコンテンツの主題';



COMMENT ON COLUMN "public"."generated_content"."fallback_status" IS 'フォールバック状態';



CREATE TABLE IF NOT EXISTS "public"."job_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "job_id" "uuid" NOT NULL,
    "message" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "log_level" "text",
    "task_id" "uuid"
);


ALTER TABLE "public"."job_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."job_logs" IS 'バッチジョブの実行ログを保存するテーブル';



COMMENT ON COLUMN "public"."job_logs"."job_id" IS '関連するバッチジョブのID';



COMMENT ON COLUMN "public"."job_logs"."message" IS 'ログメッセージ';



COMMENT ON COLUMN "public"."job_logs"."log_level" IS 'ログレベル（例：INFO, WARNING, ERROR）';



CREATE TABLE IF NOT EXISTS "public"."job_templates" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "recommended" boolean DEFAULT false,
    "success_rate" integer,
    "average_time" integer,
    "usage_count" integer DEFAULT 0,
    "average_response_rate" double precision,
    "is_public" boolean DEFAULT false,
    "settings" "jsonb" DEFAULT "jsonb_build_object"('mode', 'manual', 'strategy', 'benefit-first', 'tone_of_voice', 'professional', 'max_length', 500, 'use_emoji', false, 'execution_priority', 'balanced', 'metrics', "jsonb_build_array"(), 'evaluation_period', '30d', 'parallel_tasks', 5, 'retry_attempts', 3, 'preferred_method', 'FORM') NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "content" "text" DEFAULT ''::"text" NOT NULL,
    "deleted_at" timestamp with time zone,
    "category" "public"."template_category" NOT NULL,
    CONSTRAINT "job_templates_settings_check" CHECK ((("settings" ? 'mode'::"text") AND ("settings" ? 'strategy'::"text") AND ("settings" ? 'tone_of_voice'::"text") AND ("settings" ? 'max_length'::"text") AND ("settings" ? 'use_emoji'::"text") AND ("settings" ? 'execution_priority'::"text") AND ("settings" ? 'metrics'::"text") AND ("settings" ? 'evaluation_period'::"text") AND ("settings" ? 'parallel_tasks'::"text") AND ("settings" ? 'retry_attempts'::"text") AND ("settings" ? 'preferred_method'::"text"))),
    CONSTRAINT "job_templates_settings_values_check" CHECK (((("settings" ->> 'mode'::"text") = ANY (ARRAY['ai_auto'::"text", 'manual'::"text"])) AND (("settings" ->> 'strategy'::"text") = ANY (ARRAY['benefit-first'::"text", 'problem-solution'::"text", 'story-telling'::"text", 'direct-offer'::"text"])) AND (("settings" ->> 'tone_of_voice'::"text") = ANY (ARRAY['formal'::"text", 'professional'::"text", 'friendly'::"text", 'casual'::"text"])) AND (((("settings" ->> 'max_length'::"text"))::integer >= 1) AND ((("settings" ->> 'max_length'::"text"))::integer <= 10000)) AND ((("settings" ->> 'use_emoji'::"text"))::boolean IS NOT NULL) AND (("settings" ->> 'execution_priority'::"text") = ANY (ARRAY['speed'::"text", 'balanced'::"text", 'quality'::"text"])) AND (((("settings" ->> 'parallel_tasks'::"text"))::integer >= 1) AND ((("settings" ->> 'parallel_tasks'::"text"))::integer <= 100)) AND (((("settings" ->> 'retry_attempts'::"text"))::integer >= 0) AND ((("settings" ->> 'retry_attempts'::"text"))::integer <= 10)) AND (("settings" ->> 'preferred_method'::"text") = ANY (ARRAY['FORM'::"text", 'EMAIL'::"text", 'HYBRID'::"text"])) AND "public"."validate_metrics"(("settings" -> 'metrics'::"text")) AND (("settings" ->> 'evaluation_period'::"text") = ANY (ARRAY['24h'::"text", '7d'::"text", '30d'::"text", '90d'::"text"])))),
    CONSTRAINT "job_templates_success_rate_check" CHECK ((("success_rate" >= 0) AND ("success_rate" <= 100)))
);


ALTER TABLE "public"."job_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_templates_backup" (
    "id" "uuid",
    "user_id" "uuid",
    "name" "text",
    "description" "text",
    "recommended" boolean,
    "success_rate" integer,
    "average_time" integer,
    "usage_count" integer,
    "average_response_rate" double precision,
    "is_public" boolean,
    "settings" "jsonb",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "content" "text",
    "deleted_at" timestamp with time zone,
    "category" "public"."template_category"
);


ALTER TABLE "public"."job_templates_backup" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."llm_models" (
    "id" integer NOT NULL,
    "model_name" "text" NOT NULL,
    "api_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "llm_models_api_type_check" CHECK (("api_type" = ANY (ARRAY['anthropic'::"text", 'openai'::"text", 'google'::"text"])))
);


ALTER TABLE "public"."llm_models" OWNER TO "postgres";


COMMENT ON TABLE "public"."llm_models" IS 'LLMモデル情報を格納するテーブル';



COMMENT ON COLUMN "public"."llm_models"."model_name" IS 'モデル名';



COMMENT ON COLUMN "public"."llm_models"."api_type" IS 'APIタイプ（anthropic, openai, google）';



CREATE SEQUENCE IF NOT EXISTS "public"."llm_models_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."llm_models_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."llm_models_id_seq" OWNED BY "public"."llm_models"."id";



CREATE TABLE IF NOT EXISTS "public"."process_logs" (
    "id" bigint NOT NULL,
    "timestamp" timestamp with time zone DEFAULT "now"() NOT NULL,
    "level" "text" NOT NULL,
    "message" "text" NOT NULL,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "process_logs_level_check" CHECK (("level" = ANY (ARRAY['info'::"text", 'warn'::"text", 'error'::"text"])))
);


ALTER TABLE "public"."process_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."process_logs" IS 'Edge Function実行のログを記録するテーブル';



ALTER TABLE "public"."process_logs" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."process_logs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."process_metrics" (
    "id" bigint NOT NULL,
    "timestamp" timestamp with time zone DEFAULT "now"() NOT NULL,
    "batch_size" integer NOT NULL,
    "success_count" integer DEFAULT 0 NOT NULL,
    "failure_count" integer DEFAULT 0 NOT NULL,
    "processing_time" numeric NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."process_metrics" OWNER TO "postgres";


COMMENT ON TABLE "public"."process_metrics" IS 'Edge Function実行のメトリクスを記録するテーブル';



ALTER TABLE "public"."process_metrics" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."process_metrics_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."processing_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "total_processed" integer NOT NULL,
    "successful" integer NOT NULL,
    "failed" integer NOT NULL,
    "processing_time" interval NOT NULL,
    "errors" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."processing_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_files" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid",
    "user_id" "uuid" NOT NULL,
    "file_path" "text" NOT NULL,
    "file_name" "text" NOT NULL,
    "file_type" "text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."product_files" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "price_range" "text",
    "case_studies" "jsonb" DEFAULT '[]'::"jsonb",
    "usp" "text",
    "benefits" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "solutions" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "file_name" "text",
    "file_url" "text",
    "file_size" integer,
    "uploaded_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "challenges" "text" NOT NULL
);


ALTER TABLE "public"."products" OWNER TO "postgres";


COMMENT ON TABLE "public"."products" IS 'ユーザーが管理するプロダクト情報を格納するテーブル';



COMMENT ON COLUMN "public"."products"."id" IS 'プロダクトの一意識別子';



COMMENT ON COLUMN "public"."products"."user_id" IS 'プロダクトを所有するユーザーのID';



COMMENT ON COLUMN "public"."products"."name" IS 'プロダクト名';



COMMENT ON COLUMN "public"."products"."description" IS 'プロダクトの説明';



COMMENT ON COLUMN "public"."products"."benefits" IS '導入による具体的な効果（例：営業の成約率が30%向上）';



COMMENT ON COLUMN "public"."products"."solutions" IS '顧客の課題に対する解決策（例：属人化した営業ノウハウを組織の資産に）';



COMMENT ON COLUMN "public"."products"."file_name" IS 'アップロードされたPDFのオリジナルファイル名';



COMMENT ON COLUMN "public"."products"."file_url" IS 'PDFファイルの公開URL';



COMMENT ON COLUMN "public"."products"."file_size" IS 'PDFファイルのサイズ（バイト）';



COMMENT ON COLUMN "public"."products"."uploaded_at" IS 'ファイルのアップロード日時';



COMMENT ON COLUMN "public"."products"."challenges" IS '製品が解決する顧客の課題';



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "name" "text",
    "company" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "phone" "text",
    "gender" "text",
    "name_kana" "text",
    "email" "text",
    "address" "text",
    "birth_date" "date",
    "postal_code" "text",
    "prefecture" "text",
    "city" "text",
    "company_description" "text",
    "department" "text",
    "job_title" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."phone" IS 'ユーザーの電話番号';



COMMENT ON COLUMN "public"."profiles"."gender" IS 'ユーザーの性別';



COMMENT ON COLUMN "public"."profiles"."name_kana" IS 'ユーザー名のフリガナ';



COMMENT ON COLUMN "public"."profiles"."email" IS 'ユーザーのメールアドレス';



COMMENT ON COLUMN "public"."profiles"."address" IS 'ユーザーの住所';



COMMENT ON COLUMN "public"."profiles"."birth_date" IS 'ユーザーの生年月日';



COMMENT ON COLUMN "public"."profiles"."postal_code" IS 'ユーザーの郵便番号';



COMMENT ON COLUMN "public"."profiles"."prefecture" IS 'ユーザーの都道府県';



COMMENT ON COLUMN "public"."profiles"."city" IS 'ユーザーの市区町村';



COMMENT ON COLUMN "public"."profiles"."company_description" IS 'ユーザーの会社概要';



COMMENT ON COLUMN "public"."profiles"."department" IS 'ユーザーの事業部';



COMMENT ON COLUMN "public"."profiles"."job_title" IS 'ユーザーの肩書き';



CREATE TABLE IF NOT EXISTS "public"."search_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "company_id" "uuid",
    "query" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."search_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sending_group_companies" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "sending_group_id" "uuid" NOT NULL,
    "company_id" "uuid" NOT NULL
);


ALTER TABLE "public"."sending_group_companies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sending_groups" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."sending_groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tags" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "color" "text",
    "description" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."template_attributes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "template_id" "uuid",
    "speed" "public"."template_speed" NOT NULL,
    "reliability" "public"."template_reliability" NOT NULL,
    "parallelism" "public"."template_parallelism" NOT NULL,
    "retry_strategy" "public"."template_retry_strategy" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."template_attributes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."template_metrics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "template_id" "uuid",
    "total_uses" integer DEFAULT 0,
    "successful_uses" integer DEFAULT 0,
    "average_completion_time" double precision,
    "response_rate" double precision,
    "performance_data" "jsonb",
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."template_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."template_tags" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "template_id" "uuid",
    "tag_id" "uuid",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."template_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."templates" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "category" "text",
    "content" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."templates" OWNER TO "postgres";


ALTER TABLE "public"."templates" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."templates_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_settings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "anthropic_api_key" "text",
    "selected_model" "text",
    "domain_restriction" "text",
    "custom_prompt" "text",
    "company_limit" integer DEFAULT 5,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "footer_text" "text",
    "use_footer" boolean DEFAULT false,
    "openai_api_key" "text",
    "preferred_method" "text"
);


ALTER TABLE "public"."user_settings" OWNER TO "postgres";


COMMENT ON COLUMN "public"."user_settings"."anthropic_api_key" IS 'Anthropic API key for the user';



COMMENT ON COLUMN "public"."user_settings"."footer_text" IS 'ユーザーのカスタムフッターテキスト';



COMMENT ON COLUMN "public"."user_settings"."use_footer" IS 'フッターを使用するかどうかのフラグ';



COMMENT ON COLUMN "public"."user_settings"."openai_api_key" IS 'OpenAI API key for the user';



COMMENT ON COLUMN "public"."user_settings"."preferred_method" IS 'デフォルトの優先送信方法 (form または dm)';



ALTER TABLE ONLY "public"."llm_models" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."llm_models_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."batch_job_companies"
    ADD CONSTRAINT "batch_job_companies_batch_job_id_company_id_key" UNIQUE ("batch_job_id", "company_id");



ALTER TABLE ONLY "public"."batch_job_companies"
    ADD CONSTRAINT "batch_job_companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."batch_jobs"
    ADD CONSTRAINT "batch_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_url_key" UNIQUE ("url");



ALTER TABLE ONLY "public"."corporate_info"
    ADD CONSTRAINT "corporate_info_corporate_number_key" UNIQUE ("corporate_number");



ALTER TABLE ONLY "public"."corporate_info"
    ADD CONSTRAINT "corporate_info_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."crawl_queue"
    ADD CONSTRAINT "crawl_queue_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."error_logs"
    ADD CONSTRAINT "error_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."generated_content"
    ADD CONSTRAINT "generated_content_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_logs"
    ADD CONSTRAINT "job_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_templates"
    ADD CONSTRAINT "job_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."llm_models"
    ADD CONSTRAINT "llm_models_model_name_key" UNIQUE ("model_name");



ALTER TABLE ONLY "public"."llm_models"
    ADD CONSTRAINT "llm_models_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."process_logs"
    ADD CONSTRAINT "process_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."process_metrics"
    ADD CONSTRAINT "process_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."processing_metrics"
    ADD CONSTRAINT "processing_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_files"
    ADD CONSTRAINT "product_files_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."search_logs"
    ADD CONSTRAINT "search_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."search_logs"
    ADD CONSTRAINT "search_logs_user_id_company_id_key" UNIQUE ("user_id", "company_id");



ALTER TABLE ONLY "public"."sending_group_companies"
    ADD CONSTRAINT "sending_group_companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sending_groups"
    ADD CONSTRAINT "sending_groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."template_attributes"
    ADD CONSTRAINT "template_attributes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."template_attributes"
    ADD CONSTRAINT "template_attributes_template_id_key" UNIQUE ("template_id");



ALTER TABLE ONLY "public"."template_metrics"
    ADD CONSTRAINT "template_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."template_metrics"
    ADD CONSTRAINT "template_metrics_template_id_key" UNIQUE ("template_id");



ALTER TABLE ONLY "public"."template_tags"
    ADD CONSTRAINT "template_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."template_tags"
    ADD CONSTRAINT "template_tags_template_id_tag_id_key" UNIQUE ("template_id", "tag_id");



ALTER TABLE ONLY "public"."templates"
    ADD CONSTRAINT "templates_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."templates"
    ADD CONSTRAINT "templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sending_group_companies"
    ADD CONSTRAINT "unique_group_company" UNIQUE ("sending_group_id", "company_id");



ALTER TABLE ONLY "public"."sending_groups"
    ADD CONSTRAINT "unique_user_group_name" UNIQUE ("user_id", "name");



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_user_id_key" UNIQUE ("user_id");



CREATE INDEX "idx_batch_jobs_sending_group_id" ON "public"."batch_jobs" USING "btree" ("sending_group_id");



CREATE INDEX "idx_batch_jobs_status" ON "public"."batch_jobs" USING "btree" ("status");



CREATE INDEX "idx_batch_jobs_user_id" ON "public"."batch_jobs" USING "btree" ("user_id");



CREATE INDEX "idx_batch_jobs_user_id_product_id_status" ON "public"."batch_jobs" USING "btree" ("user_id", "product_id", "status");



CREATE INDEX "idx_companies_employee_count" ON "public"."companies" USING "btree" ("employee_count");



CREATE INDEX "idx_companies_founded_year" ON "public"."companies" USING "btree" ("founded_year");



CREATE INDEX "idx_companies_industry" ON "public"."companies" USING "btree" ("industry");



CREATE INDEX "idx_companies_user_id" ON "public"."companies" USING "btree" ("user_id");



CREATE INDEX "idx_companies_user_id_name" ON "public"."companies" USING "btree" ("user_id", "name");



CREATE INDEX "idx_corporate_info_corporate_name" ON "public"."corporate_info" USING "btree" ("corporate_name");



CREATE INDEX "idx_corporate_info_corporate_number" ON "public"."corporate_info" USING "btree" ("corporate_number");



CREATE INDEX "idx_corporate_info_postal_code" ON "public"."corporate_info" USING "btree" ("postal_code");



CREATE INDEX "idx_crawl_queue_company_id" ON "public"."crawl_queue" USING "btree" ("company_id");



CREATE INDEX "idx_crawl_queue_next_retry" ON "public"."crawl_queue" USING "btree" ("next_retry_at") WHERE ("next_retry_at" IS NOT NULL);



CREATE INDEX "idx_crawl_queue_status" ON "public"."crawl_queue" USING "btree" ("status");



CREATE INDEX "idx_crawl_queue_status_retry" ON "public"."crawl_queue" USING "btree" ("status", "retry_count") WHERE ("status" = 'pending'::"text");



CREATE INDEX "idx_generated_content_batch_job_id" ON "public"."generated_content" USING "btree" ("batch_job_id");



CREATE INDEX "idx_generated_content_company_id" ON "public"."generated_content" USING "btree" ("company_id");



CREATE INDEX "idx_generated_content_product" ON "public"."generated_content" USING "btree" ("product");



CREATE INDEX "idx_generated_content_status" ON "public"."generated_content" USING "btree" ("status");



CREATE INDEX "idx_generated_content_user_id" ON "public"."generated_content" USING "btree" ("user_id");



CREATE INDEX "idx_job_logs_created_at" ON "public"."job_logs" USING "btree" ("created_at");



CREATE INDEX "idx_job_logs_job_id" ON "public"."job_logs" USING "btree" ("job_id");



CREATE INDEX "idx_job_templates_recommended" ON "public"."job_templates" USING "btree" ("recommended") WHERE ("recommended" = true);



CREATE INDEX "idx_job_templates_success_rate" ON "public"."job_templates" USING "btree" ("success_rate" DESC);



CREATE INDEX "idx_process_logs_level" ON "public"."process_logs" USING "btree" ("level");



CREATE INDEX "idx_process_logs_timestamp" ON "public"."process_logs" USING "btree" ("timestamp");



CREATE INDEX "idx_process_metrics_timestamp" ON "public"."process_metrics" USING "btree" ("timestamp");



CREATE INDEX "idx_products_case_studies" ON "public"."products" USING "gin" ("case_studies");



CREATE INDEX "idx_products_user_id" ON "public"."products" USING "btree" ("user_id");



CREATE UNIQUE INDEX "idx_products_user_id_name" ON "public"."products" USING "btree" ("user_id", "name");



CREATE INDEX "idx_profiles_department" ON "public"."profiles" USING "btree" ("department");



CREATE INDEX "idx_profiles_email" ON "public"."profiles" USING "btree" ("email");



CREATE INDEX "idx_profiles_gender" ON "public"."profiles" USING "btree" ("gender");



CREATE INDEX "idx_profiles_job_title" ON "public"."profiles" USING "btree" ("job_title");



CREATE INDEX "idx_profiles_name_kana" ON "public"."profiles" USING "btree" ("name_kana");



CREATE INDEX "idx_profiles_phone" ON "public"."profiles" USING "btree" ("phone");



CREATE INDEX "idx_profiles_postal_code" ON "public"."profiles" USING "btree" ("postal_code");



CREATE INDEX "idx_profiles_prefecture" ON "public"."profiles" USING "btree" ("prefecture");



CREATE INDEX "idx_search_logs_company_id" ON "public"."search_logs" USING "btree" ("company_id");



CREATE INDEX "idx_search_logs_query" ON "public"."search_logs" USING "btree" ("query");



CREATE INDEX "idx_search_logs_user_id" ON "public"."search_logs" USING "btree" ("user_id");



CREATE INDEX "idx_sending_group_companies_company_id" ON "public"."sending_group_companies" USING "btree" ("company_id");



CREATE INDEX "idx_sending_group_companies_sending_group_id" ON "public"."sending_group_companies" USING "btree" ("sending_group_id");



CREATE INDEX "idx_sending_groups_user_id" ON "public"."sending_groups" USING "btree" ("user_id");



CREATE INDEX "idx_template_tags_tag_id" ON "public"."template_tags" USING "btree" ("tag_id");



CREATE INDEX "idx_template_tags_template_id" ON "public"."template_tags" USING "btree" ("template_id");



CREATE INDEX "idx_user_settings_anthropic_api_key" ON "public"."user_settings" USING "btree" ("anthropic_api_key");



CREATE INDEX "idx_user_settings_openai_api_key" ON "public"."user_settings" USING "btree" ("openai_api_key");



CREATE INDEX "product_files_product_id_idx" ON "public"."product_files" USING "btree" ("product_id");



CREATE INDEX "product_files_user_id_idx" ON "public"."product_files" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_company_crawl" AFTER INSERT ON "public"."companies" FOR EACH ROW WHEN (("new"."url" IS NOT NULL)) EXECUTE FUNCTION "public"."handle_company_crawl"();



CREATE OR REPLACE TRIGGER "trigger_company_url_update" AFTER UPDATE OF "url" ON "public"."companies" FOR EACH ROW WHEN ((("new"."url" IS NOT NULL) AND (("old"."url" IS NULL) OR ("new"."url" <> "old"."url")))) EXECUTE FUNCTION "public"."handle_company_crawl"();



CREATE OR REPLACE TRIGGER "update_companies_updated_at" BEFORE UPDATE ON "public"."companies" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_corporate_info_updated_at" BEFORE UPDATE ON "public"."corporate_info" FOR EACH ROW EXECUTE FUNCTION "public"."update_corporate_info_updated_at"();



CREATE OR REPLACE TRIGGER "update_generated_content_attempt" BEFORE UPDATE ON "public"."generated_content" FOR EACH ROW WHEN (("old"."status" IS DISTINCT FROM "new"."status")) EXECUTE FUNCTION "public"."update_generated_content_attempt"();



CREATE OR REPLACE TRIGGER "update_generated_content_updated_at" BEFORE UPDATE ON "public"."generated_content" FOR EACH ROW EXECUTE FUNCTION "public"."update_generated_content_updated_at"();



CREATE OR REPLACE TRIGGER "update_job_templates_updated_at" BEFORE UPDATE ON "public"."job_templates" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_product_files_updated_at" BEFORE UPDATE ON "public"."product_files" FOR EACH ROW EXECUTE FUNCTION "public"."update_product_files_updated_at"();



CREATE OR REPLACE TRIGGER "update_products_updated_at" BEFORE UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."update_products_updated_at"();



CREATE OR REPLACE TRIGGER "update_user_settings_updated_at" BEFORE UPDATE ON "public"."user_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."batch_job_companies"
    ADD CONSTRAINT "batch_job_companies_batch_job_id_fkey" FOREIGN KEY ("batch_job_id") REFERENCES "public"."batch_jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."batch_job_companies"
    ADD CONSTRAINT "batch_job_companies_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."batch_jobs"
    ADD CONSTRAINT "batch_jobs_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."batch_jobs"
    ADD CONSTRAINT "batch_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."crawl_queue"
    ADD CONSTRAINT "crawl_queue_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE DEFERRABLE;



COMMENT ON CONSTRAINT "crawl_queue_company_id_fkey" ON "public"."crawl_queue" IS 'companies テーブルのレコードが削除された時、関連する crawl_queue のレコードも自動的に削除されます';



ALTER TABLE ONLY "public"."sending_group_companies"
    ADD CONSTRAINT "fk_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."generated_content"
    ADD CONSTRAINT "fk_generated_content_company" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."generated_content"
    ADD CONSTRAINT "fk_generated_content_user" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sending_group_companies"
    ADD CONSTRAINT "fk_sending_group" FOREIGN KEY ("sending_group_id") REFERENCES "public"."sending_groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."batch_jobs"
    ADD CONSTRAINT "fk_sending_group" FOREIGN KEY ("sending_group_id") REFERENCES "public"."sending_groups"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."sending_groups"
    ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."generated_content"
    ADD CONSTRAINT "generated_content_batch_job_id_fkey" FOREIGN KEY ("batch_job_id") REFERENCES "public"."batch_jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."generated_content"
    ADD CONSTRAINT "generated_content_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id");



ALTER TABLE ONLY "public"."job_logs"
    ADD CONSTRAINT "job_logs_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."batch_jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_templates"
    ADD CONSTRAINT "job_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."product_files"
    ADD CONSTRAINT "product_files_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."search_logs"
    ADD CONSTRAINT "search_logs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."search_logs"
    ADD CONSTRAINT "search_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."template_attributes"
    ADD CONSTRAINT "template_attributes_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."job_templates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."template_metrics"
    ADD CONSTRAINT "template_metrics_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."job_templates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."template_tags"
    ADD CONSTRAINT "template_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."template_tags"
    ADD CONSTRAINT "template_tags_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."job_templates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Enable delete for authenticated users only" ON "public"."templates" FOR DELETE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."templates" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable read access for all users" ON "public"."templates" FOR SELECT USING (true);



CREATE POLICY "Enable update for authenticated users only" ON "public"."templates" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Public templates are viewable by all users" ON "public"."job_templates" FOR SELECT USING ((("is_public" = true) OR ("user_id" = "auth"."uid"())));



CREATE POLICY "Template owners can view metrics" ON "public"."template_metrics" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."job_templates"
  WHERE (("job_templates"."id" = "template_metrics"."template_id") AND ("job_templates"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can delete their own product files" ON "public"."product_files" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own product files" ON "public"."product_files" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own templates" ON "public"."job_templates" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own product files" ON "public"."product_files" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own product files" ON "public"."product_files" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."batch_jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."companies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."corporate_info" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."generated_content" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."job_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."job_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."process_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."process_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_files" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."search_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."template_attributes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."template_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."template_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_settings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "サービスロールは全操作可能" ON "public"."process_logs" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "サービスロールは全操作可能" ON "public"."process_metrics" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "ユーザーは自分のコンテンツのみ削除可能" ON "public"."generated_content" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "ユーザーは自分のコンテンツのみ参照可能" ON "public"."generated_content" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "ユーザーは自分のコンテンツのみ挿入可能" ON "public"."generated_content" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "ユーザーは自分のコンテンツのみ更新可能" ON "public"."generated_content" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "ユーザーは自分のジョブのログのみ参照可能" ON "public"."job_logs" FOR SELECT USING (("auth"."uid"() IN ( SELECT "batch_jobs"."user_id"
   FROM "public"."batch_jobs"
  WHERE ("batch_jobs"."id" = "job_logs"."job_id"))));



CREATE POLICY "ユーザーは自分のバッチジョブのみ参照可能" ON "public"."batch_jobs" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "ユーザーは自分のバッチジョブのみ挿入可能" ON "public"."batch_jobs" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "ユーザーは自分のバッチジョブのみ更新可能" ON "public"."batch_jobs" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "ユーザーは自分のプロフィールを更新可能" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "ユーザーは自分の企業のみ削除可能" ON "public"."companies" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "ユーザーは自分の企業のみ参照可能" ON "public"."companies" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "ユーザーは自分の企業のみ挿入可能" ON "public"."companies" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "ユーザーは自分の企業のみ更新可能" ON "public"."companies" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "ユーザーは自分の検索履歴のみ参照可能" ON "public"."search_logs" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "ユーザーは自分の製品のみ削除可能" ON "public"."products" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "ユーザーは自分の製品のみ参照可能" ON "public"."products" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "ユーザーは自分の製品のみ挿入可能" ON "public"."products" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "ユーザーは自分の製品のみ更新可能" ON "public"."products" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "ユーザーは自分の設定のみ参照可能" ON "public"."user_settings" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "ユーザーは自分の設定を管理可能" ON "public"."user_settings" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "全てのユーザーがプロフィールを閲覧可能" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "全てのユーザーが会社情報を挿入可能" ON "public"."companies" FOR INSERT WITH CHECK (true);



CREATE POLICY "全てのユーザーが会社情報を更新可能" ON "public"."companies" FOR UPDATE USING (true);



CREATE POLICY "全てのユーザーが会社情報を閲覧可能" ON "public"."companies" FOR SELECT USING (true);



CREATE POLICY "管理者のみが法人情報を挿入・更新・削除可能" ON "public"."corporate_info" USING (("auth"."role"() = 'admin'::"text")) WITH CHECK (("auth"."role"() = 'admin'::"text"));



CREATE POLICY "認証されたユーザーが法人情報を閲覧可能" ON "public"."corporate_info" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "認証されたユーザーは検索履歴を挿入可能" ON "public"."search_logs" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "認証済みユーザーはメトリクスを閲覧可能" ON "public"."process_metrics" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "認証済みユーザーはログを閲覧可能" ON "public"."process_logs" FOR SELECT TO "authenticated" USING (true);





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






























































































































































































































GRANT ALL ON FUNCTION "public"."handle_company_crawl"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_company_crawl"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_company_crawl"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."http"("request" "public"."http_request") TO "postgres";
GRANT ALL ON FUNCTION "public"."http"("request" "public"."http_request") TO "anon";
GRANT ALL ON FUNCTION "public"."http"("request" "public"."http_request") TO "authenticated";
GRANT ALL ON FUNCTION "public"."http"("request" "public"."http_request") TO "service_role";



GRANT ALL ON FUNCTION "public"."http_delete"("uri" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_delete"("uri" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_delete"("uri" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_delete"("uri" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."http_delete"("uri" character varying, "content" character varying, "content_type" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_delete"("uri" character varying, "content" character varying, "content_type" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_delete"("uri" character varying, "content" character varying, "content_type" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_delete"("uri" character varying, "content" character varying, "content_type" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."http_get"("uri" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_get"("uri" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_get"("uri" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_get"("uri" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."http_get"("uri" character varying, "data" "jsonb") TO "postgres";
GRANT ALL ON FUNCTION "public"."http_get"("uri" character varying, "data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."http_get"("uri" character varying, "data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_get"("uri" character varying, "data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."http_head"("uri" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_head"("uri" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_head"("uri" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_head"("uri" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."http_header"("field" character varying, "value" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_header"("field" character varying, "value" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_header"("field" character varying, "value" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_header"("field" character varying, "value" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."http_list_curlopt"() TO "postgres";
GRANT ALL ON FUNCTION "public"."http_list_curlopt"() TO "anon";
GRANT ALL ON FUNCTION "public"."http_list_curlopt"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_list_curlopt"() TO "service_role";



GRANT ALL ON FUNCTION "public"."http_patch"("uri" character varying, "content" character varying, "content_type" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_patch"("uri" character varying, "content" character varying, "content_type" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_patch"("uri" character varying, "content" character varying, "content_type" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_patch"("uri" character varying, "content" character varying, "content_type" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."http_post"("uri" character varying, "data" "jsonb") TO "postgres";
GRANT ALL ON FUNCTION "public"."http_post"("uri" character varying, "data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."http_post"("uri" character varying, "data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_post"("uri" character varying, "data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."http_post"("uri" character varying, "content" character varying, "content_type" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_post"("uri" character varying, "content" character varying, "content_type" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_post"("uri" character varying, "content" character varying, "content_type" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_post"("uri" character varying, "content" character varying, "content_type" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."http_put"("uri" character varying, "content" character varying, "content_type" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_put"("uri" character varying, "content" character varying, "content_type" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_put"("uri" character varying, "content" character varying, "content_type" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_put"("uri" character varying, "content" character varying, "content_type" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."http_reset_curlopt"() TO "postgres";
GRANT ALL ON FUNCTION "public"."http_reset_curlopt"() TO "anon";
GRANT ALL ON FUNCTION "public"."http_reset_curlopt"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_reset_curlopt"() TO "service_role";



GRANT ALL ON FUNCTION "public"."http_set_curlopt"("curlopt" character varying, "value" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."http_set_curlopt"("curlopt" character varying, "value" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."http_set_curlopt"("curlopt" character varying, "value" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."http_set_curlopt"("curlopt" character varying, "value" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."process_crawl_queue"() TO "anon";
GRANT ALL ON FUNCTION "public"."process_crawl_queue"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."process_crawl_queue"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_corporate_info_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_corporate_info_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_corporate_info_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_generated_content_attempt"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_generated_content_attempt"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_generated_content_attempt"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_generated_content_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_generated_content_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_generated_content_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_product_files_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_product_files_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_product_files_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_products_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_products_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_products_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."urlencode"("string" "bytea") TO "postgres";
GRANT ALL ON FUNCTION "public"."urlencode"("string" "bytea") TO "anon";
GRANT ALL ON FUNCTION "public"."urlencode"("string" "bytea") TO "authenticated";
GRANT ALL ON FUNCTION "public"."urlencode"("string" "bytea") TO "service_role";



GRANT ALL ON FUNCTION "public"."urlencode"("data" "jsonb") TO "postgres";
GRANT ALL ON FUNCTION "public"."urlencode"("data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."urlencode"("data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."urlencode"("data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."urlencode"("string" character varying) TO "postgres";
GRANT ALL ON FUNCTION "public"."urlencode"("string" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."urlencode"("string" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."urlencode"("string" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_metrics"("metrics" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_metrics"("metrics" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_metrics"("metrics" "jsonb") TO "service_role";



























GRANT ALL ON TABLE "public"."batch_job_companies" TO "anon";
GRANT ALL ON TABLE "public"."batch_job_companies" TO "authenticated";
GRANT ALL ON TABLE "public"."batch_job_companies" TO "service_role";



GRANT ALL ON TABLE "public"."batch_jobs" TO "anon";
GRANT ALL ON TABLE "public"."batch_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."batch_jobs" TO "service_role";



GRANT ALL ON TABLE "public"."companies" TO "anon";
GRANT ALL ON TABLE "public"."companies" TO "authenticated";
GRANT ALL ON TABLE "public"."companies" TO "service_role";



GRANT ALL ON TABLE "public"."corporate_info" TO "anon";
GRANT ALL ON TABLE "public"."corporate_info" TO "authenticated";
GRANT ALL ON TABLE "public"."corporate_info" TO "service_role";



GRANT ALL ON TABLE "public"."crawl_batch_queue" TO "anon";
GRANT ALL ON TABLE "public"."crawl_batch_queue" TO "authenticated";
GRANT ALL ON TABLE "public"."crawl_batch_queue" TO "service_role";



GRANT ALL ON TABLE "public"."crawl_queue" TO "anon";
GRANT ALL ON TABLE "public"."crawl_queue" TO "authenticated";
GRANT ALL ON TABLE "public"."crawl_queue" TO "service_role";



GRANT ALL ON TABLE "public"."error_logs" TO "anon";
GRANT ALL ON TABLE "public"."error_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."error_logs" TO "service_role";



GRANT ALL ON TABLE "public"."generated_content" TO "anon";
GRANT ALL ON TABLE "public"."generated_content" TO "authenticated";
GRANT ALL ON TABLE "public"."generated_content" TO "service_role";



GRANT ALL ON TABLE "public"."job_logs" TO "anon";
GRANT ALL ON TABLE "public"."job_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."job_logs" TO "service_role";



GRANT ALL ON TABLE "public"."job_templates" TO "anon";
GRANT ALL ON TABLE "public"."job_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."job_templates" TO "service_role";



GRANT ALL ON TABLE "public"."job_templates_backup" TO "anon";
GRANT ALL ON TABLE "public"."job_templates_backup" TO "authenticated";
GRANT ALL ON TABLE "public"."job_templates_backup" TO "service_role";



GRANT ALL ON TABLE "public"."llm_models" TO "anon";
GRANT ALL ON TABLE "public"."llm_models" TO "authenticated";
GRANT ALL ON TABLE "public"."llm_models" TO "service_role";



GRANT ALL ON SEQUENCE "public"."llm_models_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."llm_models_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."llm_models_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."process_logs" TO "anon";
GRANT ALL ON TABLE "public"."process_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."process_logs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."process_logs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."process_logs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."process_logs_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."process_metrics" TO "anon";
GRANT ALL ON TABLE "public"."process_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."process_metrics" TO "service_role";



GRANT ALL ON SEQUENCE "public"."process_metrics_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."process_metrics_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."process_metrics_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."processing_metrics" TO "anon";
GRANT ALL ON TABLE "public"."processing_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."processing_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."product_files" TO "anon";
GRANT ALL ON TABLE "public"."product_files" TO "authenticated";
GRANT ALL ON TABLE "public"."product_files" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."search_logs" TO "anon";
GRANT ALL ON TABLE "public"."search_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."search_logs" TO "service_role";



GRANT ALL ON TABLE "public"."sending_group_companies" TO "anon";
GRANT ALL ON TABLE "public"."sending_group_companies" TO "authenticated";
GRANT ALL ON TABLE "public"."sending_group_companies" TO "service_role";



GRANT ALL ON TABLE "public"."sending_groups" TO "anon";
GRANT ALL ON TABLE "public"."sending_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."sending_groups" TO "service_role";



GRANT ALL ON TABLE "public"."tags" TO "anon";
GRANT ALL ON TABLE "public"."tags" TO "authenticated";
GRANT ALL ON TABLE "public"."tags" TO "service_role";



GRANT ALL ON TABLE "public"."template_attributes" TO "anon";
GRANT ALL ON TABLE "public"."template_attributes" TO "authenticated";
GRANT ALL ON TABLE "public"."template_attributes" TO "service_role";



GRANT ALL ON TABLE "public"."template_metrics" TO "anon";
GRANT ALL ON TABLE "public"."template_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."template_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."template_tags" TO "anon";
GRANT ALL ON TABLE "public"."template_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."template_tags" TO "service_role";



GRANT ALL ON TABLE "public"."templates" TO "anon";
GRANT ALL ON TABLE "public"."templates" TO "authenticated";
GRANT ALL ON TABLE "public"."templates" TO "service_role";



GRANT ALL ON SEQUENCE "public"."templates_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."templates_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."templates_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_settings" TO "anon";
GRANT ALL ON TABLE "public"."user_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."user_settings" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
