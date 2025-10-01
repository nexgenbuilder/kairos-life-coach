-- Add file attachment support to user messages
ALTER TABLE public.user_messages 
ADD COLUMN attached_files uuid[] DEFAULT '{}';

-- Add individual user sharing to file metadata
ALTER TABLE public.file_metadata 
ADD COLUMN shared_with_users uuid[] DEFAULT '{}';

-- Update RLS policy for file_metadata to include shared files
DROP POLICY IF EXISTS "Users can view files in their organization" ON public.file_metadata;

CREATE POLICY "Users can view files in their organization or shared with them" 
ON public.file_metadata 
FOR SELECT 
USING (
  user_can_access_organization(organization_id) 
  OR auth.uid() = ANY(shared_with_users)
);

-- Add policy for users to view their own uploads across organizations
CREATE POLICY "Users can view their own uploads" 
ON public.file_metadata 
FOR SELECT 
USING (uploaded_by = auth.uid());

-- Update storage policy to allow access to shared files
DROP POLICY IF EXISTS "Users can view files in their organization" ON storage.objects;

CREATE POLICY "Users can view organization and shared files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'organization-files' 
  AND (
    EXISTS (
      SELECT 1 FROM public.file_metadata fm
      WHERE fm.file_path = name 
      AND (
        user_can_access_organization(fm.organization_id)
        OR auth.uid() = ANY(fm.shared_with_users)
        OR fm.uploaded_by = auth.uid()
      )
    )
  )
);