ALTER TABLE public.handwriting_models 
ADD COLUMN IF NOT EXISTS letter_spacing_variation numeric DEFAULT 0;