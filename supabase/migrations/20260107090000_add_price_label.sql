-- Add price_label column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price_label TEXT;

-- Make price column nullable
ALTER TABLE public.products ALTER COLUMN price DROP NOT NULL;
