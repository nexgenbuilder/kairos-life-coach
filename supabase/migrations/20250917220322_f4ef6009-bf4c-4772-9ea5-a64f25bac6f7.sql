-- Fix infinite recursion in RLS policies by using security definer functions
-- First, drop the problematic policies
DROP POLICY IF EXISTS "Users can view memberships in their organization" ON public.organization_memberships;
DROP POLICY IF EXISTS "Organization admins can manage memberships" ON public.organization_memberships;
DROP POLICY IF EXISTS "Users can view module permissions for their organization" ON public.module_permissions;
DROP POLICY IF EXISTS "Organization admins can manage module permissions" ON public.module_permissions;

-- Create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.user_can_access_organization(org_id uuid, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_memberships 
    WHERE organization_id = org_id 
      AND user_id = user_uuid 
      AND is_active = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.user_is_org_admin(org_id uuid, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_memberships 
    WHERE organization_id = org_id 
      AND user_id = user_uuid 
      AND role IN ('admin', 'owner')
      AND is_active = true
  );
$function$;

-- Recreate safe RLS policies using the security definer functions
CREATE POLICY "Users can view their own memberships" 
ON public.organization_memberships 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own memberships" 
ON public.organization_memberships 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Organization admins can manage all memberships in their org" 
ON public.organization_memberships 
FOR ALL 
USING (user_is_org_admin(organization_id));

-- Fix module permissions policies
CREATE POLICY "Users can view module permissions for accessible organizations" 
ON public.module_permissions 
FOR SELECT 
USING (user_can_access_organization(organization_id));

CREATE POLICY "Organization admins can manage module permissions" 
ON public.module_permissions 
FOR ALL 
USING (user_is_org_admin(organization_id));

-- Fix organizations policies to use the new functions
DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;
DROP POLICY IF EXISTS "Organization admins can update their organization" ON public.organizations;

CREATE POLICY "Users can view accessible organizations" 
ON public.organizations 
FOR SELECT 
USING (user_can_access_organization(id));

CREATE POLICY "Organization admins can update their organization" 
ON public.organizations 
FOR UPDATE 
USING (user_is_org_admin(id));

CREATE POLICY "Users can create organizations" 
ON public.organizations 
FOR INSERT 
WITH CHECK (created_by = auth.uid());