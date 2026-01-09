-- Add is_big_discount and is_highlighted columns to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_big_discount BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_highlighted BOOLEAN DEFAULT false;
