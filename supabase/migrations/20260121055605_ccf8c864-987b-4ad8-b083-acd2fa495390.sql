-- Premium billing tables for Razorpay subscriptions

CREATE TABLE IF NOT EXISTS public.billing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  price_inr INTEGER NOT NULL,
  interval_unit TEXT NOT NULL, -- 'weekly' | 'monthly'
  interval_count INTEGER NOT NULL DEFAULT 1,
  razorpay_plan_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  plan_code TEXT NOT NULL,
  razorpay_customer_id TEXT,
  razorpay_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.billing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies: users can only read their own subscription; no client-side writes
DO $$ BEGIN
  CREATE POLICY "Users can read own subscription"
  ON public.user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Optional: allow authenticated users to read plan catalog (not secrets)
DO $$ BEGIN
  CREATE POLICY "Authenticated can read billing plans"
  ON public.billing_plans
  FOR SELECT
  TO authenticated
  USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- updated_at triggers
DROP TRIGGER IF EXISTS trg_billing_plans_updated_at ON public.billing_plans;
CREATE TRIGGER trg_billing_plans_updated_at
BEFORE UPDATE ON public.billing_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_user_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER trg_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
