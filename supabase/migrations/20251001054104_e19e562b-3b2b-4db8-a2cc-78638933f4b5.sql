-- Add visibility controls to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private')),
ADD COLUMN IF NOT EXISTS join_approval_required boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS discoverable boolean NOT NULL DEFAULT false;

-- Create space join requests table
CREATE TABLE IF NOT EXISTS public.space_join_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  UNIQUE(space_id, user_id)
);

-- Create connection categories table
CREATE TABLE IF NOT EXISTS public.connection_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  connection_user_id uuid NOT NULL,
  space_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('social', 'community', 'groups', 'work_business')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, connection_user_id, space_id)
);

-- Enable RLS
ALTER TABLE public.space_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connection_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for space_join_requests
CREATE POLICY "Users can create their own join requests"
ON public.space_join_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own join requests"
ON public.space_join_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Space admins can view join requests for their spaces"
ON public.space_join_requests
FOR SELECT
TO authenticated
USING (user_is_org_admin(space_id));

CREATE POLICY "Space admins can update join requests for their spaces"
ON public.space_join_requests
FOR UPDATE
TO authenticated
USING (user_is_org_admin(space_id));

-- RLS Policies for connection_categories
CREATE POLICY "Users can manage their own connection categories"
ON public.connection_categories
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Update organizations RLS to allow viewing public discoverable spaces
CREATE POLICY "Anyone can view public discoverable spaces"
ON public.organizations
FOR SELECT
TO authenticated
USING (visibility = 'public' AND discoverable = true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_space_join_requests_space_id ON public.space_join_requests(space_id);
CREATE INDEX IF NOT EXISTS idx_space_join_requests_user_id ON public.space_join_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_space_join_requests_status ON public.space_join_requests(status);
CREATE INDEX IF NOT EXISTS idx_connection_categories_user_id ON public.connection_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_connection_categories_space_id ON public.connection_categories(space_id);
CREATE INDEX IF NOT EXISTS idx_organizations_visibility ON public.organizations(visibility, discoverable);

-- Add trigger for updated_at
CREATE TRIGGER update_space_join_requests_updated_at
BEFORE UPDATE ON public.space_join_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_connection_categories_updated_at
BEFORE UPDATE ON public.connection_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get user connections count
CREATE OR REPLACE FUNCTION public.get_user_connections_count(user_uuid uuid DEFAULT auth.uid())
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(DISTINCT om.user_id)::integer
  FROM public.organization_memberships om
  WHERE om.organization_id IN (
    SELECT organization_id 
    FROM public.organization_memberships 
    WHERE user_id = user_uuid AND is_active = true
  )
  AND om.user_id != user_uuid
  AND om.is_active = true;
$$;

-- Function to get user connections by category
CREATE OR REPLACE FUNCTION public.get_user_connections_by_category(user_uuid uuid DEFAULT auth.uid())
RETURNS TABLE(category text, count bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    cc.category,
    COUNT(DISTINCT cc.connection_user_id) as count
  FROM public.connection_categories cc
  WHERE cc.user_id = user_uuid
  GROUP BY cc.category;
$$;

-- Function to auto-approve join requests
CREATE OR REPLACE FUNCTION public.process_join_request(request_id uuid, approve boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_record record;
BEGIN
  -- Get request details
  SELECT * INTO request_record
  FROM space_join_requests
  WHERE id = request_id
    AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check if current user is admin of the space
  IF NOT user_is_org_admin(request_record.space_id) THEN
    RETURN false;
  END IF;
  
  IF approve THEN
    -- Create organization membership
    INSERT INTO organization_memberships (
      organization_id,
      user_id,
      role,
      is_active
    ) VALUES (
      request_record.space_id,
      request_record.user_id,
      'member',
      true
    )
    ON CONFLICT (organization_id, user_id) 
    DO UPDATE SET is_active = true;
    
    -- Create user context
    INSERT INTO user_contexts (
      user_id,
      group_id,
      is_active
    ) VALUES (
      request_record.user_id,
      request_record.space_id,
      false
    )
    ON CONFLICT (user_id, group_id) 
    DO UPDATE SET is_active = false;
    
    -- Update request status
    UPDATE space_join_requests
    SET 
      status = 'approved',
      reviewed_by = auth.uid(),
      reviewed_at = now()
    WHERE id = request_id;
  ELSE
    -- Reject request
    UPDATE space_join_requests
    SET 
      status = 'rejected',
      reviewed_by = auth.uid(),
      reviewed_at = now()
    WHERE id = request_id;
  END IF;
  
  RETURN true;
END;
$$;