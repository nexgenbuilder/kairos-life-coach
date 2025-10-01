-- Create space_assets table for managing brand assets
CREATE TABLE IF NOT EXISTS public.space_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('logo', 'background', 'icon', 'other')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on space_assets
ALTER TABLE public.space_assets ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage space assets
CREATE POLICY "Space admins can manage assets"
ON public.space_assets
FOR ALL
USING (user_is_org_admin(organization_id))
WITH CHECK (user_is_org_admin(organization_id));

-- Allow members to view assets
CREATE POLICY "Space members can view assets"
ON public.space_assets
FOR SELECT
USING (user_can_access_organization(organization_id));

-- Create index for better performance
CREATE INDEX idx_space_assets_organization_id ON public.space_assets(organization_id);
CREATE INDEX idx_space_assets_asset_type ON public.space_assets(asset_type);

-- Add trigger for updated_at
CREATE TRIGGER update_space_assets_updated_at
  BEFORE UPDATE ON public.space_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();