-- Add user space tags table for personal categorization
CREATE TABLE IF NOT EXISTS public.user_space_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, organization_id, tag)
);

-- Enable RLS
ALTER TABLE public.user_space_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_space_tags
CREATE POLICY "Users can manage their own space tags"
ON public.user_space_tags
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add connection source tracking to connection_categories
ALTER TABLE public.connection_categories
ADD COLUMN IF NOT EXISTS source_organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS discovered_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create index for faster connection queries
CREATE INDEX IF NOT EXISTS idx_connection_categories_source ON public.connection_categories(source_organization_id);
CREATE INDEX IF NOT EXISTS idx_user_space_tags_user_org ON public.user_space_tags(user_id, organization_id);

-- Function to automatically add connections when joining a space
CREATE OR REPLACE FUNCTION public.auto_add_space_connections()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a user joins an organization, add all other members as connections
  INSERT INTO public.connection_categories (user_id, connection_user_id, category, source_organization_id, discovered_at)
  SELECT 
    NEW.user_id,
    om.user_id as connection_user_id,
    'colleague' as category,
    NEW.organization_id as source_organization_id,
    now() as discovered_at
  FROM public.organization_memberships om
  WHERE om.organization_id = NEW.organization_id
    AND om.user_id != NEW.user_id
    AND om.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM public.connection_categories cc
      WHERE cc.user_id = NEW.user_id 
        AND cc.connection_user_id = om.user_id
    )
  ON CONFLICT (user_id, connection_user_id) DO NOTHING;
  
  -- Also add the reverse connection
  INSERT INTO public.connection_categories (user_id, connection_user_id, category, source_organization_id, discovered_at)
  SELECT 
    om.user_id as user_id,
    NEW.user_id as connection_user_id,
    'colleague' as category,
    NEW.organization_id as source_organization_id,
    now() as discovered_at
  FROM public.organization_memberships om
  WHERE om.organization_id = NEW.organization_id
    AND om.user_id != NEW.user_id
    AND om.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM public.connection_categories cc
      WHERE cc.user_id = om.user_id 
        AND cc.connection_user_id = NEW.user_id
    )
  ON CONFLICT (user_id, connection_user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic connection discovery
DROP TRIGGER IF EXISTS trigger_auto_add_connections ON public.organization_memberships;
CREATE TRIGGER trigger_auto_add_connections
AFTER INSERT ON public.organization_memberships
FOR EACH ROW
WHEN (NEW.is_active = true)
EXECUTE FUNCTION public.auto_add_space_connections();

-- Update module permissions to consolidate social/feed into connections
UPDATE public.module_permissions 
SET module_name = 'connections'
WHERE module_name IN ('social', 'feed');

-- Add updated_at trigger for user_space_tags
CREATE TRIGGER update_user_space_tags_updated_at
BEFORE UPDATE ON public.user_space_tags
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();