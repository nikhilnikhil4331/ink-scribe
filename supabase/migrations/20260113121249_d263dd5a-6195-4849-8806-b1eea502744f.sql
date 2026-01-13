-- User Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- Handwriting Models table - stores analyzed handwriting styles per user
CREATE TABLE public.handwriting_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'My Handwriting',
  sample_image_url TEXT,
  suggested_font TEXT NOT NULL DEFAULT 'caveat',
  font_size INTEGER NOT NULL DEFAULT 24,
  line_spacing INTEGER NOT NULL DEFAULT 32,
  word_spacing INTEGER NOT NULL DEFAULT 4,
  baseline_jitter BOOLEAN NOT NULL DEFAULT true,
  stroke_randomness BOOLEAN NOT NULL DEFAULT true,
  ink_color TEXT NOT NULL DEFAULT 'blue',
  slant NUMERIC DEFAULT 0,
  stroke_thickness NUMERIC DEFAULT 1,
  pen_pressure_feel NUMERIC DEFAULT 0.5,
  analysis_notes TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.handwriting_models ENABLE ROW LEVEL SECURITY;

-- Handwriting model policies
CREATE POLICY "Users can view their own models" 
  ON public.handwriting_models FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own models" 
  ON public.handwriting_models FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own models" 
  ON public.handwriting_models FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own models" 
  ON public.handwriting_models FOR DELETE 
  USING (auth.uid() = user_id);

-- Notebooks table - organize notes into notebooks
CREATE TABLE public.notebooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Notebook',
  description TEXT,
  cover_color TEXT NOT NULL DEFAULT '#3B82F6',
  handwriting_model_id UUID REFERENCES public.handwriting_models(id) ON DELETE SET NULL,
  page_style TEXT NOT NULL DEFAULT 'ruled',
  page_size TEXT NOT NULL DEFAULT 'a4',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notebooks ENABLE ROW LEVEL SECURITY;

-- Notebook policies
CREATE POLICY "Users can view their own notebooks" 
  ON public.notebooks FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create notebooks" 
  ON public.notebooks FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notebooks" 
  ON public.notebooks FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notebooks" 
  ON public.notebooks FOR DELETE 
  USING (auth.uid() = user_id);

-- Pages table - individual pages within notebooks
CREATE TABLE public.pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notebook_id UUID REFERENCES public.notebooks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Page',
  content JSONB NOT NULL DEFAULT '[]'::jsonb,
  page_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Page policies
CREATE POLICY "Users can view their own pages" 
  ON public.pages FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create pages" 
  ON public.pages FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pages" 
  ON public.pages FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pages" 
  ON public.pages FOR DELETE 
  USING (auth.uid() = user_id);

-- Feedback table - user feedback system
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'general',
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Feedback policies - users can only insert their own feedback
CREATE POLICY "Users can submit feedback" 
  ON public.feedback FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own feedback" 
  ON public.feedback FOR SELECT 
  USING (auth.uid() = user_id);

-- Storage bucket for handwriting samples
INSERT INTO storage.buckets (id, name, public) 
VALUES ('handwriting-samples', 'handwriting-samples', false);

-- Storage policies for handwriting samples
CREATE POLICY "Users can upload their own samples"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'handwriting-samples' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own samples"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'handwriting-samples' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own samples"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'handwriting-samples' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_handwriting_models_updated_at
  BEFORE UPDATE ON public.handwriting_models
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notebooks_updated_at
  BEFORE UPDATE ON public.notebooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();