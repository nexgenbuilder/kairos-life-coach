-- Fix organization creation policy
-- Drop and recreate the organization creation policy to be more explicit
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;

-- Create a simpler, more direct policy for organization creation
CREATE POLICY "Users can create organizations" 
ON organizations 
FOR INSERT 
TO authenticated
WITH CHECK (true);