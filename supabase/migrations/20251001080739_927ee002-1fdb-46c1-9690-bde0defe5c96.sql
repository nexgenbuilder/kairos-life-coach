-- Add spaces module to default module permissions
-- This ensures users can access the spaces discovery page

-- Insert or update the spaces module permission for existing organizations
INSERT INTO public.module_permissions (
  organization_id,
  module_name,
  is_enabled,
  is_shared,
  can_view,
  can_edit,
  can_admin
)
SELECT 
  id as organization_id,
  'spaces' as module_name,
  true as is_enabled,
  true as is_shared,
  true as can_view,
  false as can_edit,
  false as can_admin
FROM public.organizations
WHERE NOT EXISTS (
  SELECT 1 FROM public.module_permissions 
  WHERE organization_id = organizations.id 
  AND module_name = 'spaces'
);