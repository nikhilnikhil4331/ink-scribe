-- Remove the razorpay_plan_id column since we switched to UPI payments
ALTER TABLE public.billing_plans DROP COLUMN IF EXISTS razorpay_plan_id;

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Authenticated can read billing plans" ON public.billing_plans;

-- Create a restrictive policy - only service role can access billing_plans
-- Regular users don't need direct table access since pricing is shown in the UI
CREATE POLICY "Only service role can manage billing plans"
ON public.billing_plans
FOR ALL
USING (false)
WITH CHECK (false);

-- Also clean up user_subscriptions - remove Razorpay-specific columns
ALTER TABLE public.user_subscriptions DROP COLUMN IF EXISTS razorpay_customer_id;
ALTER TABLE public.user_subscriptions DROP COLUMN IF EXISTS razorpay_subscription_id;