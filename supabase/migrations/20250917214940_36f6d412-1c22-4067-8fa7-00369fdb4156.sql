-- Create organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Create organization memberships table
CREATE TABLE public.organization_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'sales_agent',
  is_active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Enable RLS
ALTER TABLE public.organization_memberships ENABLE ROW LEVEL SECURITY;

-- Create module permissions table
CREATE TABLE public.module_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, module_name)
);

-- Enable RLS
ALTER TABLE public.module_permissions ENABLE ROW LEVEL SECURITY;

-- Add organization_id to profiles table
ALTER TABLE public.profiles ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

-- Create updated_at triggers
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organization_memberships_updated_at
  BEFORE UPDATE ON public.organization_memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_module_permissions_updated_at
  BEFORE UPDATE ON public.module_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for organizations
CREATE POLICY "Users can view their organization" 
ON public.organizations 
FOR SELECT 
USING (id IN (
  SELECT organization_id 
  FROM public.organization_memberships 
  WHERE user_id = auth.uid() AND is_active = true
));

CREATE POLICY "Organization admins can update their organization" 
ON public.organizations 
FOR UPDATE 
USING (id IN (
  SELECT organization_id 
  FROM public.organization_memberships 
  WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
));

-- RLS Policies for organization_memberships
CREATE POLICY "Users can view memberships in their organization" 
ON public.organization_memberships 
FOR SELECT 
USING (organization_id IN (
  SELECT organization_id 
  FROM public.organization_memberships 
  WHERE user_id = auth.uid() AND is_active = true
));

CREATE POLICY "Organization admins can manage memberships" 
ON public.organization_memberships 
FOR ALL 
USING (organization_id IN (
  SELECT organization_id 
  FROM public.organization_memberships 
  WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
));

CREATE POLICY "Users can insert their own membership during signup" 
ON public.organization_memberships 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- RLS Policies for module_permissions
CREATE POLICY "Users can view module permissions for their organization" 
ON public.module_permissions 
FOR SELECT 
USING (organization_id IN (
  SELECT organization_id 
  FROM public.organization_memberships 
  WHERE user_id = auth.uid() AND is_active = true
));

CREATE POLICY "Organization admins can manage module permissions" 
ON public.module_permissions 
FOR ALL 
USING (organization_id IN (
  SELECT organization_id 
  FROM public.organization_memberships 
  WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
));

-- Create helper functions
CREATE OR REPLACE FUNCTION public.get_user_organization_id(user_uuid uuid DEFAULT auth.uid())
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT organization_id 
  FROM public.organization_memberships 
  WHERE user_id = user_uuid AND is_active = true 
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_organization_role(user_uuid uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT role 
  FROM public.organization_memberships 
  WHERE user_id = user_uuid AND is_active = true 
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.user_has_module_access(module_name text, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT COALESCE(
    (SELECT is_enabled 
     FROM public.module_permissions mp
     JOIN public.organization_memberships om ON mp.organization_id = om.organization_id
     WHERE om.user_id = user_uuid 
       AND om.is_active = true 
       AND mp.module_name = $1),
    false
  );
$function$;

-- Update existing RLS policies to use organization context
-- Update deals policies
DROP POLICY IF EXISTS "Users can view their own deals or admin can view all" ON public.deals;
DROP POLICY IF EXISTS "Users can update their own deals or admin can update all" ON public.deals;
DROP POLICY IF EXISTS "Users can delete their own deals or admin can delete all" ON public.deals;

CREATE POLICY "Users can view deals in their organization" 
ON public.deals 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  (get_user_organization_role() = 'admin' AND 
   user_id IN (
     SELECT om.user_id 
     FROM public.organization_memberships om 
     WHERE om.organization_id = get_user_organization_id() AND om.is_active = true
   ))
);

CREATE POLICY "Users can update their own deals or org admin can update all" 
ON public.deals 
FOR UPDATE 
USING (
  user_id = auth.uid() OR 
  (get_user_organization_role() = 'admin' AND 
   user_id IN (
     SELECT om.user_id 
     FROM public.organization_memberships om 
     WHERE om.organization_id = get_user_organization_id() AND om.is_active = true
   ))
);

CREATE POLICY "Users can delete their own deals or org admin can delete all" 
ON public.deals 
FOR DELETE 
USING (
  user_id = auth.uid() OR 
  (get_user_organization_role() = 'admin' AND 
   user_id IN (
     SELECT om.user_id 
     FROM public.organization_memberships om 
     WHERE om.organization_id = get_user_organization_id() AND om.is_active = true
   ))
);

-- Update people policies
DROP POLICY IF EXISTS "Users can view their own people or admin can view all" ON public.people;
DROP POLICY IF EXISTS "Users can update their own people or admin can update all" ON public.people;
DROP POLICY IF EXISTS "Users can delete their own people or admin can delete all" ON public.people;

CREATE POLICY "Users can view people in their organization" 
ON public.people 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  (get_user_organization_role() = 'admin' AND 
   user_id IN (
     SELECT om.user_id 
     FROM public.organization_memberships om 
     WHERE om.organization_id = get_user_organization_id() AND om.is_active = true
   ))
);

CREATE POLICY "Users can update their own people or org admin can update all" 
ON public.people 
FOR UPDATE 
USING (
  user_id = auth.uid() OR 
  (get_user_organization_role() = 'admin' AND 
   user_id IN (
     SELECT om.user_id 
     FROM public.organization_memberships om 
     WHERE om.organization_id = get_user_organization_id() AND om.is_active = true
   ))
);

CREATE POLICY "Users can delete their own people or org admin can delete all" 
ON public.people 
FOR DELETE 
USING (
  user_id = auth.uid() OR 
  (get_user_organization_role() = 'admin' AND 
   user_id IN (
     SELECT om.user_id 
     FROM public.organization_memberships om 
     WHERE om.organization_id = get_user_organization_id() AND om.is_active = true
   ))
);