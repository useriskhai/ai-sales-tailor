-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP FUNCTION IF EXISTS update_products_updated_at();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Modify products table
ALTER TABLE products
    ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
    ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS features text[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS price_range text;

-- Create trigger for updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_products_updated_at();

-- Update existing rows to have default values
UPDATE products 
SET 
    features = COALESCE(features, '{}'),
    price_range = COALESCE(price_range, '未設定'),
    created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
    updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP);

-- Add NOT NULL constraints after setting default values
ALTER TABLE products
    ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN updated_at SET NOT NULL;
