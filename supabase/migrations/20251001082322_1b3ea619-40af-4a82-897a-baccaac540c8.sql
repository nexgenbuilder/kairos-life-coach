-- Make organization-files bucket public so images can be accessed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'organization-files';

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view organization files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to their organization" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their uploads or admins can delete org files" ON storage.objects;

-- Allow users to view files in organizations they're part of
CREATE POLICY "Users can view organization files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'organization-files' 
  AND (
    -- File path starts with an organization ID the user has access to
    EXISTS (
      SELECT 1 FROM public.organization_memberships om
      WHERE om.user_id = auth.uid()
        AND om.is_active = true
        AND (storage.foldername(name))[1] = om.organization_id::text
    )
  )
);

-- Allow authenticated users to upload files to their organization folders
CREATE POLICY "Users can upload to their organization"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'organization-files'
  AND EXISTS (
    SELECT 1 FROM public.organization_memberships om
    WHERE om.user_id = auth.uid()
      AND om.is_active = true
      AND (storage.foldername(name))[1] = om.organization_id::text
  )
);

-- Allow users to delete their own uploads or admins to delete any files in their org
CREATE POLICY "Users can delete their uploads or admins can delete org files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'organization-files'
  AND (
    owner = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.organization_memberships om
      WHERE om.user_id = auth.uid()
        AND om.is_active = true
        AND om.role IN ('admin', 'owner')
        AND (storage.foldername(name))[1] = om.organization_id::text
    )
  )
);