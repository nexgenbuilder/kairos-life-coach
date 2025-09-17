-- Rename organizations to groups and add type field
ALTER TABLE public.organizations ADD COLUMN type TEXT DEFAULT 'organization';
ALTER TABLE public.organizations ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- Update existing organizations to have created_by from first admin member
UPDATE public.organizations 
SET created_by = (
  SELECT user_id 
  FROM public.organization_memberships 
  WHERE organization_id = public.organizations.id 
    AND role = 'admin' 
  ORDER BY created_at ASC 
  LIMIT 1
);

-- Add individual context support
INSERT INTO public.organizations (name, type, created_by)
SELECT 
  COALESCE(p.full_name, 'My Personal Space') as name,
  'individual' as type,
  p.user_id as created_by
FROM public.profiles p
WHERE p.organization_id IS NULL OR p.organization_id NOT IN (
  SELECT id FROM public.organizations
);

-- Create individual memberships for users without organizations
INSERT INTO public.organization_memberships (organization_id, user_id, role)
SELECT 
  o.id as organization_id,
  o.created_by as user_id,
  'owner' as role
FROM public.organizations o
WHERE o.type = 'individual'
  AND NOT EXISTS (
    SELECT 1 FROM public.organization_memberships om 
    WHERE om.organization_id = o.id AND om.user_id = o.created_by
  );

-- Update profiles to link to individual spaces
UPDATE public.profiles 
SET organization_id = (
  SELECT o.id 
  FROM public.organizations o 
  WHERE o.created_by = profiles.user_id AND o.type = 'individual'
)
WHERE organization_id IS NULL;

-- Create groups table as alias to organizations (for future migration)
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
FROM public.organizations;

-- Create group_memberships as alias
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
FROM public.organization_memberships;

-- Rename module_permissions to module_settings and add sharing controls
ALTER TABLE public.module_permissions ADD COLUMN visibility TEXT DEFAULT 'all_members';
ALTER TABLE public.module_permissions ADD COLUMN is_shared BOOLEAN DEFAULT true;

-- Create module_settings view
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
FROM public.module_permissions;

-- Add context switching support
CREATE TABLE public.user_contexts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, group_id)
);

-- Enable RLS on user_contexts
ALTER TABLE public.user_contexts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_contexts
CREATE POLICY "Users can manage their own contexts" 
ON public.user_contexts 
FOR ALL 
USING (auth.uid() = user_id);

-- Populate user_contexts with existing memberships
INSERT INTO public.user_contexts (user_id, group_id, is_active)
SELECT 
  user_id,
  organization_id as group_id,
  true as is_active
FROM public.organization_memberships
WHERE is_active = true;

-- Update helper functions for multi-context support
CREATE OR REPLACE FUNCTION public.get_user_active_context(user_uuid uuid DEFAULT auth.uid())
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT group_id 
  FROM public.user_contexts 
  WHERE user_id = user_uuid AND is_active = true 
  ORDER BY last_accessed DESC 
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_contexts(user_uuid uuid DEFAULT auth.uid())
RETURNS TABLE(group_id uuid, group_name text, group_type text, role text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT 
    uc.group_id,
    o.name as group_name,
    o.type as group_type,
    om.role
  FROM public.user_contexts uc
  JOIN public.organizations o ON uc.group_id = o.id
  JOIN public.organization_memberships om ON om.organization_id = uc.group_id AND om.user_id = uc.user_id
  WHERE uc.user_id = user_uuid
  ORDER BY uc.last_accessed DESC;
$function$;

CREATE OR REPLACE FUNCTION public.switch_user_context(new_context_id uuid, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Check if user has access to this context
  IF NOT EXISTS (
    SELECT 1 FROM public.user_contexts 
    WHERE user_id = user_uuid AND group_id = new_context_id
  ) THEN
    RETURN false;
  END IF;
  
  -- Deactivate all contexts for user
  UPDATE public.user_contexts 
  SET is_active = false 
  WHERE user_id = user_uuid;
  
  -- Activate new context
  UPDATE public.user_contexts 
  SET is_active = true, last_accessed = now() 
  WHERE user_id = user_uuid AND group_id = new_context_id;
  
  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.user_has_context_module_access(module_name text, context_id uuid DEFAULT null, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT COALESCE(
    (SELECT mp.is_enabled AND (mp.is_shared OR om.role IN ('admin', 'owner'))
     FROM public.module_permissions mp
     JOIN public.organization_memberships om ON mp.organization_id = om.organization_id
     WHERE om.user_id = user_uuid 
       AND om.is_active = true 
       AND mp.organization_id = COALESCE(context_id, get_user_active_context(user_uuid))
       AND mp.module_name = $1),
    false
  );
$function$;

-- Update RLS policies for shared data access
DROP POLICY IF EXISTS "Users can view deals in their organization" ON public.deals;
DROP POLICY IF EXISTS "Users can update their own deals or org admin can update all" ON public.deals;
DROP POLICY IF EXISTS "Users can delete their own deals or org admin can delete all" ON public.deals;

CREATE POLICY "Users can view deals in shared contexts" 
ON public.deals 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.user_contexts uc
    JOIN public.organization_memberships om ON uc.group_id = om.organization_id
    JOIN public.module_permissions mp ON om.organization_id = mp.organization_id
    WHERE uc.user_id = auth.uid() 
      AND mp.module_name = 'professional'
      AND mp.is_shared = true
      AND mp.is_enabled = true
      AND deals.user_id = om.user_id
  )
);

CREATE POLICY "Users can update deals in shared contexts" 
ON public.deals 
FOR UPDATE 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.user_contexts uc
    JOIN public.organization_memberships om ON uc.group_id = om.organization_id
    WHERE uc.user_id = auth.uid() 
      AND om.role IN ('admin', 'owner')
      AND deals.user_id = om.user_id
  )
);

CREATE POLICY "Users can delete deals in shared contexts" 
ON public.deals 
FOR DELETE 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.user_contexts uc
    JOIN public.organization_memberships om ON uc.group_id = om.organization_id
    WHERE uc.user_id = auth.uid() 
      AND om.role IN ('admin', 'owner')
      AND deals.user_id = om.user_id
  )
);

-- Similar updates for people table
DROP POLICY IF EXISTS "Users can view people in their organization" ON public.people;
DROP POLICY IF EXISTS "Users can update their own people or org admin can update all" ON public.people;
DROP POLICY IF EXISTS "Users can delete their own people or org admin can delete all" ON public.people;

CREATE POLICY "Users can view people in shared contexts" 
ON public.people 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.user_contexts uc
    JOIN public.organization_memberships om ON uc.group_id = om.organization_id
    JOIN public.module_permissions mp ON om.organization_id = mp.organization_id
    WHERE uc.user_id = auth.uid() 
      AND mp.module_name = 'professional'
      AND mp.is_shared = true
      AND mp.is_enabled = true
      AND people.user_id = om.user_id
  )
);

CREATE POLICY "Users can update people in shared contexts" 
ON public.people 
FOR UPDATE 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.user_contexts uc
    JOIN public.organization_memberships om ON uc.group_id = om.organization_id
    WHERE uc.user_id = auth.uid() 
      AND om.role IN ('admin', 'owner')
      AND people.user_id = om.user_id
  )
);

CREATE POLICY "Users can delete people in shared contexts" 
ON public.people 
FOR DELETE 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.user_contexts uc
    JOIN public.organization_memberships om ON uc.group_id = om.organization_id
    WHERE uc.user_id = auth.uid() 
      AND om.role IN ('admin', 'owner')
      AND people.user_id = om.user_id
  )
);