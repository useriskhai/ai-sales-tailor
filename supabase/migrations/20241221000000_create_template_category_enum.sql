-- Drop existing enum type if exists
DROP TYPE IF EXISTS template_category CASCADE;

-- Create template_category enum type
CREATE TYPE template_category AS ENUM (
    'sales',
    'marketing',
    'support',
    'other'
);

-- Add category column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'job_templates' 
        AND column_name = 'category'
    ) THEN
        ALTER TABLE job_templates ADD COLUMN category text;
    END IF;
END $$;

-- Update existing data to ensure it matches the enum values
UPDATE job_templates
SET category = LOWER(category)::text
WHERE category IS NOT NULL;

-- Alter job_templates table to use the enum
ALTER TABLE job_templates
ALTER COLUMN category TYPE template_category USING category::template_category; 