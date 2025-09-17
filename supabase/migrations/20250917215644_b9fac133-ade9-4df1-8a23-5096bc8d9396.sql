-- Check for any remaining security definer views and remove them
DO $$
DECLARE
    view_record RECORD;
BEGIN
    FOR view_record IN 
        SELECT schemaname, viewname 
        FROM pg_views 
        WHERE schemaname = 'public' 
          AND definition ILIKE '%security definer%'
    LOOP
        EXECUTE 'DROP VIEW IF EXISTS ' || quote_ident(view_record.schemaname) || '.' || quote_ident(view_record.viewname) || ' CASCADE';
    END LOOP;
END $$;

-- The views are already safely recreated without SECURITY DEFINER
-- Just ensure they exist with proper RLS integration
CREATE OR REPLACE VIEW public.groups AS 
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

CREATE OR REPLACE VIEW public.group_memberships AS
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

CREATE OR REPLACE VIEW public.module_settings AS
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