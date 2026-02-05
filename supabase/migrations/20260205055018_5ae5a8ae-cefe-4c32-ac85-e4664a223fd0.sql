-- =========================================
-- SECURITY HARDENING: Disable anonymous access
-- Update all RLS policies to require auth.uid()
-- =========================================

-- 1. ACTIVITY_LOGS - Fix policies to require authentication
DROP POLICY IF EXISTS "Admins can delete logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can insert their own logs" ON public.activity_logs;

CREATE POLICY "Admins can delete logs" 
ON public.activity_logs 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all activity logs" 
ON public.activity_logs 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own logs" 
ON public.activity_logs 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. ERROR_LOGS - Fix policies to require authentication
DROP POLICY IF EXISTS "Admins can delete error logs" ON public.error_logs;
DROP POLICY IF EXISTS "Admins can update error logs" ON public.error_logs;
DROP POLICY IF EXISTS "Admins can view all error logs" ON public.error_logs;
DROP POLICY IF EXISTS "Authenticated users can insert error logs" ON public.error_logs;

CREATE POLICY "Admins can delete error logs" 
ON public.error_logs 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update error logs" 
ON public.error_logs 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all error logs" 
ON public.error_logs 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can insert error logs" 
ON public.error_logs 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 3. ADMIN_SESSIONS - Ensure only service role
DROP POLICY IF EXISTS "Service role only" ON public.admin_sessions;

CREATE POLICY "Block all access to admin sessions" 
ON public.admin_sessions 
FOR ALL 
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- 4. RATE_LIMITS - Ensure only service role
DROP POLICY IF EXISTS "Service role only for rate limits" ON public.rate_limits;

CREATE POLICY "Block all access to rate limits" 
ON public.rate_limits 
FOR ALL 
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- 5. APP_SETTINGS - Fix admin-only policies
DROP POLICY IF EXISTS "Admins can modify app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Only admins can read app settings" ON public.app_settings;

CREATE POLICY "Admins can modify app settings" 
ON public.app_settings 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read app settings" 
ON public.app_settings 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 6. FEEDBACK - Require authentication
DROP POLICY IF EXISTS "Users can submit feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can view their own feedback" ON public.feedback;

CREATE POLICY "Users can submit feedback" 
ON public.feedback 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback" 
ON public.feedback 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- 7. BILLING_PLANS - Require authentication
DROP POLICY IF EXISTS "Authenticated users can read billing plans" ON public.billing_plans;
DROP POLICY IF EXISTS "Only service role can manage billing plans" ON public.billing_plans;

CREATE POLICY "Authenticated users can read billing plans" 
ON public.billing_plans 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Block billing plans modifications" 
ON public.billing_plans 
FOR ALL 
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- 8. USER_SUBSCRIPTIONS - Require authentication
DROP POLICY IF EXISTS "Users can read own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Deny user deletes on subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Deny user inserts on subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Deny user updates on subscriptions" ON public.user_subscriptions;

CREATE POLICY "Users can read own subscription" 
ON public.user_subscriptions 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Block subscription modifications" 
ON public.user_subscriptions 
FOR INSERT 
TO authenticated, anon
WITH CHECK (false);

CREATE POLICY "Block subscription updates" 
ON public.user_subscriptions 
FOR UPDATE 
TO authenticated, anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Block subscription deletes" 
ON public.user_subscriptions 
FOR DELETE 
TO authenticated, anon
USING (false);

-- 9. USER_ROLES - Require authentication
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Service role can manage all roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Block role modifications" 
ON public.user_roles 
FOR ALL 
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- 10. PROFILES - Require authentication
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 11. NOTEBOOKS - Require authentication
DROP POLICY IF EXISTS "Users can view their own notebooks" ON public.notebooks;
DROP POLICY IF EXISTS "Users can update their own notebooks" ON public.notebooks;
DROP POLICY IF EXISTS "Users can delete their own notebooks" ON public.notebooks;
DROP POLICY IF EXISTS "Users can create notebooks" ON public.notebooks;

CREATE POLICY "Users can view their own notebooks" 
ON public.notebooks 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notebooks" 
ON public.notebooks 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notebooks" 
ON public.notebooks 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create notebooks" 
ON public.notebooks 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 12. PAGES - Require authentication
DROP POLICY IF EXISTS "Users can view their own pages" ON public.pages;
DROP POLICY IF EXISTS "Users can update their own pages" ON public.pages;
DROP POLICY IF EXISTS "Users can delete their own pages" ON public.pages;
DROP POLICY IF EXISTS "Users can create pages" ON public.pages;

CREATE POLICY "Users can view their own pages" 
ON public.pages 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own pages" 
ON public.pages 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pages" 
ON public.pages 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create pages" 
ON public.pages 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 13. HANDWRITING_MODELS - Require authentication
DROP POLICY IF EXISTS "Users can view their own models" ON public.handwriting_models;
DROP POLICY IF EXISTS "Users can update their own models" ON public.handwriting_models;
DROP POLICY IF EXISTS "Users can delete their own models" ON public.handwriting_models;
DROP POLICY IF EXISTS "Users can create their own models" ON public.handwriting_models;

CREATE POLICY "Users can view their own models" 
ON public.handwriting_models 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own models" 
ON public.handwriting_models 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own models" 
ON public.handwriting_models 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own models" 
ON public.handwriting_models 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);