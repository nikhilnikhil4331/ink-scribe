-- Add a SELECT policy for authenticated users to read billing plans
-- (They need to see pricing options, but shouldn't modify them)
CREATE POLICY "Authenticated users can read billing plans"
ON public.billing_plans
FOR SELECT
TO authenticated
USING (true);