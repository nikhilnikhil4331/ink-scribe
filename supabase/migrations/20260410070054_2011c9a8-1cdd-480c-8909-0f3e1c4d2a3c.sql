ALTER TABLE public.notebooks 
ADD COLUMN IF NOT EXISTS folder text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_notebooks_folder ON public.notebooks(folder);
CREATE INDEX IF NOT EXISTS idx_notebooks_tags ON public.notebooks USING GIN(tags);
