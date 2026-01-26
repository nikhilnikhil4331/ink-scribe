-- Create activity_logs table for full audit trail
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT,
  session_id TEXT,
  page_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_category ON public.activity_logs(category);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all logs
CREATE POLICY "Admins can view all activity logs"
ON public.activity_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow inserts from authenticated users (their own logs)
CREATE POLICY "Users can insert their own logs"
ON public.activity_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Admins can delete logs
CREATE POLICY "Admins can delete logs"
ON public.activity_logs
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create error_logs table for system health monitoring
CREATE TABLE public.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  component TEXT,
  page_url TEXT,
  user_agent TEXT,
  device_type TEXT,
  severity TEXT DEFAULT 'error',
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_error_logs_created_at ON public.error_logs(created_at DESC);
CREATE INDEX idx_error_logs_error_type ON public.error_logs(error_type);
CREATE INDEX idx_error_logs_severity ON public.error_logs(severity);
CREATE INDEX idx_error_logs_resolved ON public.error_logs(resolved);

-- Enable RLS
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all errors
CREATE POLICY "Admins can view all error logs"
ON public.error_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow inserts from anyone (for error tracking)
CREATE POLICY "Anyone can insert error logs"
ON public.error_logs
FOR INSERT
WITH CHECK (true);

-- Admins can update (mark as resolved)
CREATE POLICY "Admins can update error logs"
ON public.error_logs
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete error logs
CREATE POLICY "Admins can delete error logs"
ON public.error_logs
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create app_settings table for admin controls
CREATE TABLE public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can read app settings"
ON public.app_settings
FOR SELECT
USING (true);

-- Only admins can modify settings
CREATE POLICY "Admins can modify app settings"
ON public.app_settings
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default settings
INSERT INTO public.app_settings (key, value, description) VALUES
('premium_enabled', 'true', 'Enable/disable premium subscription system'),
('signup_enabled', 'true', 'Enable/disable new user signups'),
('dev_mode', 'true', 'Development mode - all features unlocked'),
('maintenance_mode', 'false', 'Put app in maintenance mode'),
('upi_id', '"nikhiljatav@upi"', 'UPI ID for payments'),
('weekly_price', '49', 'Weekly premium price in INR'),
('monthly_price', '99', 'Monthly premium price in INR');