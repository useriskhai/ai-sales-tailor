-- Add indices for better query performance
CREATE INDEX IF NOT EXISTS idx_job_logs_job_id ON job_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_batch_job_id ON generated_content(batch_job_id);

-- Add down migration for rollback
---- Drop indices if needed
-- DROP INDEX IF EXISTS idx_job_logs_job_id;
-- DROP INDEX IF EXISTS idx_generated_content_batch_job_id; 