-- Drop the existing public read policy
DROP POLICY IF EXISTS "Anyone can read app settings" ON public.app_settings;

-- Create a new policy that restricts reads to admins only
CREATE POLICY "Only admins can read app settings" 
ON public.app_settings 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));