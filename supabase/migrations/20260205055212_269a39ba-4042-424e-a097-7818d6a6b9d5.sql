-- =========================================
-- ADD ADMIN ACCESS POLICIES
-- Allows admins to view/manage content for support
-- =========================================

-- 1. FEEDBACK - Add admin policies
CREATE POLICY "Admins can view all feedback" 
ON public.feedback 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete feedback" 
ON public.feedback 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. PROFILES - Add admin read access
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. NOTEBOOKS - Add admin read access
CREATE POLICY "Admins can view all notebooks" 
ON public.notebooks 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. PAGES - Add admin read access
CREATE POLICY "Admins can view all pages" 
ON public.pages 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 5. HANDWRITING_MODELS - Add admin read access
CREATE POLICY "Admins can view all models" 
ON public.handwriting_models 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 6. USER_SUBSCRIPTIONS - Add admin access
DROP POLICY IF EXISTS "Block subscription modifications" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Block subscription updates" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Block subscription deletes" ON public.user_subscriptions;

CREATE POLICY "Admins can view all subscriptions" 
ON public.user_subscriptions 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert subscriptions" 
ON public.user_subscriptions 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update subscriptions" 
ON public.user_subscriptions 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete subscriptions" 
ON public.user_subscriptions 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 7. BILLING_PLANS - Add admin management
DROP POLICY IF EXISTS "Block billing plans modifications" ON public.billing_plans;

CREATE POLICY "Admins can manage billing plans" 
ON public.billing_plans 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 8. USER_ROLES - Add admin role management
DROP POLICY IF EXISTS "Block role modifications" ON public.user_roles;

CREATE POLICY "Admins can manage user roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));