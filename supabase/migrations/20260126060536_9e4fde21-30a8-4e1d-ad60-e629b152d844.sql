-- Fix the overly permissive error_logs INSERT policy
-- Drop the existing policy and create a more restrictive one
DROP POLICY IF EXISTS "Anyone can insert error logs" ON public.error_logs;

-- Allow authenticated users to insert error logs
CREATE POLICY "Authenticated users can insert error logs"
ON public.error_logs
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);