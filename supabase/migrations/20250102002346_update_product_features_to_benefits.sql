-- Add new columns for customer-centric information
ALTER TABLE products
ADD COLUMN IF NOT EXISTS benefits text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS solutions text[] DEFAULT '{}';

-- Migrate existing feature data to benefits (temporary migration)
UPDATE products 
SET benefits = features,
    solutions = '{}'
WHERE benefits = '{}' AND features != '{}';

-- Add comment for better documentation
COMMENT ON COLUMN products.benefits IS '導入による具体的な効果（例：営業の成約率が30%向上）';
COMMENT ON COLUMN products.solutions IS '顧客の課題に対する解決策（例：属人化した営業ノウハウを組織の資産に）';

-- We'll keep the features column for now and remove it later after confirming the migration 