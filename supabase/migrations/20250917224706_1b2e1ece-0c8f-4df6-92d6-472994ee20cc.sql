-- Create invitations table for organization invites
CREATE TABLE public.organization_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'member',
  invited_by uuid NOT NULL,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  accepted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(organization_id, email)
);

-- Enable RLS on invitations
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for invitations
CREATE POLICY "Organization admins can manage invitations" 
ON organization_invitations 
FOR ALL 
TO authenticated
USING (user_is_org_admin(organization_id));

CREATE POLICY "Users can view invitations sent to them" 
ON organization_invitations 
FOR SELECT 
TO authenticated
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Update organization_memberships to include invited users
ALTER TABLE public.organization_memberships 
ADD COLUMN IF NOT EXISTS invited_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS invitation_accepted_at timestamp with time zone;

-- Create function to accept organization invitation
CREATE OR REPLACE FUNCTION public.accept_organization_invitation(invitation_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  invitation_record record;
  user_email text;
BEGIN
  -- Get user email
  SELECT email INTO user_email 
  FROM auth.users 
  WHERE id = auth.uid();
  
  -- Get invitation details
  SELECT * INTO invitation_record
  FROM organization_invitations
  WHERE id = invitation_id
    AND email = user_email
    AND expires_at > now()
    AND accepted_at IS NULL;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Create organization membership
  INSERT INTO organization_memberships (
    organization_id,
    user_id,
    role,
    invited_at,
    invitation_accepted_at
  ) VALUES (
    invitation_record.organization_id,
    auth.uid(),
    invitation_record.role,
    invitation_record.created_at,
    now()
  )
  ON CONFLICT (organization_id, user_id) 
  DO UPDATE SET 
    role = invitation_record.role,
    is_active = true,
    invitation_accepted_at = now();
  
  -- Create user context
  INSERT INTO user_contexts (
    user_id,
    group_id,
    is_active
  ) VALUES (
    auth.uid(),
    invitation_record.organization_id,
    false
  )
  ON CONFLICT (user_id, group_id) 
  DO UPDATE SET is_active = false;
  
  -- Mark invitation as accepted
  UPDATE organization_invitations
  SET accepted_at = now()
  WHERE id = invitation_id;
  
  RETURN true;
END;
$$;

-- Create function to get user's pending invitations
CREATE OR REPLACE FUNCTION public.get_user_pending_invitations(user_uuid uuid DEFAULT auth.uid())
RETURNS TABLE(
  id uuid,
  organization_id uuid,
  organization_name text,
  organization_type text,
  role text,
  invited_by_name text,
  created_at timestamp with time zone,
  expires_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    oi.id,
    oi.organization_id,
    o.name as organization_name,
    o.type as organization_type,
    oi.role,
    p.full_name as invited_by_name,
    oi.created_at,
    oi.expires_at
  FROM organization_invitations oi
  JOIN organizations o ON oi.organization_id = o.id
  LEFT JOIN profiles p ON oi.invited_by = p.user_id
  WHERE oi.email = (SELECT email FROM auth.users WHERE id = user_uuid)
    AND oi.accepted_at IS NULL
    AND oi.expires_at > now()
  ORDER BY oi.created_at DESC;
$$;

-- Update module_permissions to be more granular
ALTER TABLE public.module_permissions 
ADD COLUMN IF NOT EXISTS can_view boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS can_edit boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS can_admin boolean DEFAULT false;

-- Update the user_has_context_module_access function to be more granular
CREATE OR REPLACE FUNCTION public.user_has_context_module_access(
  module_name text, 
  permission_type text DEFAULT 'view',
  context_id uuid DEFAULT NULL::uuid, 
  user_uuid uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT 
      CASE 
        WHEN permission_type = 'view' THEN mp.is_enabled AND mp.can_view AND (mp.is_shared OR om.role IN ('admin', 'owner'))
        WHEN permission_type = 'edit' THEN mp.is_enabled AND mp.can_edit AND (mp.is_shared OR om.role IN ('admin', 'owner'))
        WHEN permission_type = 'admin' THEN mp.is_enabled AND mp.can_admin AND om.role IN ('admin', 'owner')
        ELSE false
      END
     FROM public.module_permissions mp
     JOIN public.organization_memberships om ON mp.organization_id = om.organization_id
     WHERE om.user_id = user_uuid 
       AND om.is_active = true 
       AND mp.organization_id = COALESCE(context_id, get_user_active_context(user_uuid))
       AND mp.module_name = $1),
    false
  );
$$;