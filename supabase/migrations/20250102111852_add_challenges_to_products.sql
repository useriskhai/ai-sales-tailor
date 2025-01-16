-- Add challenges column to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS challenges text;

-- Update existing rows to have default value
UPDATE products 
SET challenges = COALESCE(challenges, description)
WHERE challenges IS NULL;

-- Add NOT NULL constraint
ALTER TABLE products
ALTER COLUMN challenges SET NOT NULL;

-- Add comment
COMMENT ON COLUMN products.challenges IS '製品が解決する顧客の課題';
