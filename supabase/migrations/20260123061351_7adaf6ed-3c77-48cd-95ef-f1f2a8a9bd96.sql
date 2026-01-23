-- Add explicit RESTRICTIVE policies for user_subscriptions
-- Users should ONLY be able to READ their own subscriptions
-- All writes must happen through service role (edge functions)

-- First, drop any existing write policies that might exist
DROP POLICY IF EXISTS "Users can insert subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update subscription" ON public.user_subscriptions;

-- Create explicit DENY policies for INSERT/UPDATE/DELETE to ensure users cannot write
CREATE POLICY "Deny user inserts on subscriptions"
ON public.user_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "Deny user updates on subscriptions"
ON public.user_subscriptions
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny user deletes on subscriptions"
ON public.user_subscriptions
FOR DELETE
TO authenticated
USING (false);