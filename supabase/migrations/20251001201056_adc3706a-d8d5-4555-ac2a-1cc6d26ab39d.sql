-- Create locations table for bookmarking and categorizing places
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID,
  name TEXT NOT NULL,
  address TEXT,
  category TEXT NOT NULL,
  notes TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own locations"
ON public.locations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own locations"
ON public.locations FOR SELECT
USING (
  user_id = auth.uid() 
  OR (organization_id IS NOT NULL AND user_has_context_module_access('locations', 'view', organization_id))
);

CREATE POLICY "Users can update their own locations"
ON public.locations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own locations"
ON public.locations FOR DELETE
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_locations_user_id ON public.locations(user_id);
CREATE INDEX IF NOT EXISTS idx_locations_category ON public.locations(category);

-- Add trigger for updated_at
CREATE TRIGGER update_locations_updated_at
BEFORE UPDATE ON public.locations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();