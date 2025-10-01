-- Drop existing permissive payroll policies
DROP POLICY IF EXISTS "Users can create their own payroll" ON public.payroll;
DROP POLICY IF EXISTS "Users can delete their own payroll" ON public.payroll;
DROP POLICY IF EXISTS "Users can update their own payroll" ON public.payroll;
DROP POLICY IF EXISTS "Users can view their own payroll" ON public.payroll;

-- SELECT: Employees can view their own records OR admins can view all records in their org
CREATE POLICY "Employees can view own payroll, admins can view all org payroll"
ON public.payroll
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR 
  (organization_id IS NOT NULL AND user_is_org_admin(organization_id))
);

-- INSERT: Only organization admins can create payroll records
CREATE POLICY "Only org admins can create payroll records"
ON public.payroll
FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IS NOT NULL 
  AND user_is_org_admin(organization_id)
);

-- UPDATE: Only organization admins can update payroll records
CREATE POLICY "Only org admins can update payroll records"
ON public.payroll
FOR UPDATE
TO authenticated
USING (
  organization_id IS NOT NULL 
  AND user_is_org_admin(organization_id)
);

-- DELETE: Only organization admins can delete payroll records
CREATE POLICY "Only org admins can delete payroll records"
ON public.payroll
FOR DELETE
TO authenticated
USING (
  organization_id IS NOT NULL 
  AND user_is_org_admin(organization_id)
);