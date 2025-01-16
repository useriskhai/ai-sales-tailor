-- Add USP column to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS usp text;

-- Update existing rows to have default value
UPDATE products 
SET usp = COALESCE(usp, description)
WHERE usp IS NULL; 