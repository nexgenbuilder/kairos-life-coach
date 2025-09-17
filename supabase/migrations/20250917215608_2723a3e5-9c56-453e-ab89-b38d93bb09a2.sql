-- Fix security definer views by dropping and recreating without SECURITY DEFINER
DROP VIEW IF EXISTS public.groups;
DROP VIEW IF EXISTS public.group_memberships; 
DROP VIEW IF EXISTS public.module_settings;

-- Create safe views without SECURITY DEFINER
CREATE VIEW public.groups AS 
SELECT 
  id,
  name,
  description,
  type,
  logo_url,
  settings,
  created_by,
  created_at,
  updated_at
FROM public.organizations
WHERE EXISTS (
  SELECT 1 FROM public.organization_memberships om 
  WHERE om.organization_id = organizations.id 
    AND om.user_id = auth.uid() 
    AND om.is_active = true
);

CREATE VIEW public.group_memberships AS
SELECT 
  id,
  organization_id as group_id,
  user_id,
  role,
  is_active,
  joined_at,
  created_at,
  updated_at
FROM public.organization_memberships
WHERE organization_id IN (
  SELECT organization_id 
  FROM public.organization_memberships 
  WHERE user_id = auth.uid() AND is_active = true
);

CREATE VIEW public.module_settings AS
SELECT 
  id,
  organization_id as group_id,
  module_name,
  is_enabled,
  is_shared,
  visibility,
  settings,
  created_at,
  updated_at
FROM public.module_permissions
WHERE organization_id IN (
  SELECT organization_id 
  FROM public.organization_memberships 
  WHERE user_id = auth.uid() AND is_active = true
);