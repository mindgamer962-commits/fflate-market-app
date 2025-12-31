-- Fix: Require authentication for click recording to prevent spam attacks
-- Drop the unrestricted policy
DROP POLICY IF EXISTS "Anyone can record clicks" ON public.product_clicks;

-- Create new policy that requires authentication
CREATE POLICY "Authenticated users can record clicks" 
ON public.product_clicks 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);