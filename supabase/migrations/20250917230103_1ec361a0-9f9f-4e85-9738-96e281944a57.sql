-- Fix the RLS policy properly this time
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;

CREATE POLICY "Users can create organizations" 
ON organizations 
FOR INSERT 
TO authenticated
WITH CHECK (created_by = auth.uid());