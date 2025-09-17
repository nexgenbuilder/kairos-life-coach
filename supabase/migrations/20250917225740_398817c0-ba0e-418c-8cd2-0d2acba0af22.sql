-- Debug and fix organization creation
-- Check current policy and fix it

-- Let's see what's in the organizations table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'organizations' 
AND table_schema = 'public';

-- Also check the current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'organizations';

-- Fix the organization creation policy to be more explicit
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;

CREATE POLICY "Users can create organizations" 
ON organizations 
FOR INSERT 
TO authenticated
WITH CHECK (created_by = auth.uid());