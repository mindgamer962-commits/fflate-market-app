-- Add search_keywords column to products table
ALTER TABLE public.products ADD COLUMN search_keywords TEXT;

-- Update existing products to have an empty string instead of NULL if preferred, 
-- but NULL is fine for ilike.
COMMENT ON COLUMN public.products.search_keywords IS 'Keywords and synonyms for better search matching (e.g. "footwear, sneakers" for shoes)';
