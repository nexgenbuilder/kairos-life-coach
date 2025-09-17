-- Fix RLS policy for organization creation
-- The current policy might be too restrictive

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;

-- Create a more permissive policy for organization creation
CREATE POLICY "Users can create organizations" 
ON organizations 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Ensure the policy for viewing organizations works correctly
DROP POLICY IF EXISTS "Users can view accessible organizations" ON organizations;
CREATE POLICY "Users can view accessible organizations" 
ON organizations 
FOR SELECT 
TO authenticated
USING (user_can_access_organization(id));

-- Fix update policy too
DROP POLICY IF EXISTS "Organization admins can update their organization" ON organizations;
CREATE POLICY "Organization admins can update their organization" 
ON organizations 
FOR UPDATE 
TO authenticated
USING (user_is_org_admin(id));