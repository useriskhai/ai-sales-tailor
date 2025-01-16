-- Add pdfPath column to products table
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS file_path TEXT;

-- Add file_path and updated_at columns to uploaded_files table
DO $$ 
BEGIN 
  -- Add file_path if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'uploaded_files' AND column_name = 'file_path') THEN
    ALTER TABLE uploaded_files ADD COLUMN file_path TEXT;
  END IF;

  -- Add updated_at if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'uploaded_files' AND column_name = 'updated_at') THEN
    ALTER TABLE uploaded_files ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
  END IF;
END $$;

-- Add trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_uploaded_files_updated_at ON uploaded_files;
CREATE TRIGGER update_uploaded_files_updated_at
    BEFORE UPDATE ON uploaded_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();