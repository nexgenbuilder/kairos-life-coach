-- Fix RLS policies for organization data sharing
-- Drop existing restrictive policies and create organization-aware ones

-- Tasks: Allow viewing shared tasks in organization context
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
CREATE POLICY "Users can view their own tasks" ON public.tasks
FOR SELECT USING (
  user_id = auth.uid() 
  OR (
    organization_id IS NOT NULL 
    AND user_has_context_module_access('tasks', 'view', organization_id)
  )
);

-- Expenses: Allow viewing shared expenses in organization context
DROP POLICY IF EXISTS "Users can view their own expenses" ON public.expenses;
CREATE POLICY "Users can view their own expenses" ON public.expenses
FOR SELECT USING (
  user_id = auth.uid()
  OR (
    organization_id IS NOT NULL 
    AND user_has_context_module_access('money', 'view', organization_id)
  )
);

-- Events: Allow viewing shared events in organization context
DROP POLICY IF EXISTS "Users can view their own events" ON public.events;
CREATE POLICY "Users can view their own events" ON public.events
FOR SELECT USING (
  user_id = auth.uid()
  OR (
    organization_id IS NOT NULL 
    AND user_has_context_module_access('calendar', 'view', organization_id)
  )
);

-- Deals: Policy already exists, but let's ensure it's correct
-- (The existing policy already checks for shared contexts)

-- Health Metrics: Allow viewing shared health data in organization context
DROP POLICY IF EXISTS "Users can view their own health metrics" ON public.health_metrics;
CREATE POLICY "Users can view their own health metrics" ON public.health_metrics
FOR SELECT USING (
  user_id = auth.uid()
  OR (
    organization_id IS NOT NULL 
    AND user_has_context_module_access('health', 'view', organization_id)
  )
);

-- Fitness Workouts: Allow viewing shared fitness data
DROP POLICY IF EXISTS "Users can view their own workouts" ON public.fitness_workouts;
CREATE POLICY "Users can view their own workouts" ON public.fitness_workouts
FOR SELECT USING (
  user_id = auth.uid()
  OR (
    organization_id IS NOT NULL 
    AND user_has_context_module_access('fitness', 'view', organization_id)
  )
);

-- Content Catalog: Allow viewing shared content
DROP POLICY IF EXISTS "Users can view their own content" ON public.content_catalog;
CREATE POLICY "Users can view their own content" ON public.content_catalog
FOR SELECT USING (
  user_id = auth.uid()
  OR (
    organization_id IS NOT NULL 
    AND user_has_context_module_access('creators', 'view', organization_id)
  )
);

-- Create Cloud Storage infrastructure
-- Create storage bucket for organization files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'organization-files',
  'organization-files',
  false,
  52428800, -- 50MB limit
  ARRAY['image/*', 'video/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/*']
)
ON CONFLICT (id) DO NOTHING;

-- Create file metadata table
CREATE TABLE IF NOT EXISTS public.file_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, file_path)
);

-- Enable RLS on file_metadata
ALTER TABLE public.file_metadata ENABLE ROW LEVEL SECURITY;

-- File metadata policies
CREATE POLICY "Users can view files in their organization"
ON public.file_metadata FOR SELECT
USING (user_can_access_organization(organization_id));

CREATE POLICY "Users can upload files to their organization"
ON public.file_metadata FOR INSERT
WITH CHECK (
  user_can_access_organization(organization_id)
  AND uploaded_by = auth.uid()
);

CREATE POLICY "Users can delete their own uploaded files"
ON public.file_metadata FOR DELETE
USING (uploaded_by = auth.uid());

CREATE POLICY "Admins can delete any organization files"
ON public.file_metadata FOR DELETE
USING (user_is_org_admin(organization_id));

-- Storage policies for organization files
CREATE POLICY "Users can view organization files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'organization-files'
  AND EXISTS (
    SELECT 1 FROM public.file_metadata fm
    WHERE fm.file_path = storage.objects.name
    AND user_can_access_organization(fm.organization_id)
  )
);

CREATE POLICY "Users can upload to their organization"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'organization-files'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'organization-files'
  AND owner = auth.uid()
);

-- Add trigger for updated_at
CREATE TRIGGER update_file_metadata_updated_at
BEFORE UPDATE ON public.file_metadata
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create organization invitations table (if not exists)
CREATE TABLE IF NOT EXISTS public.organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org admins can manage invitations"
ON public.organization_invitations FOR ALL
USING (user_is_org_admin(organization_id));

CREATE POLICY "Users can view their own invitations"
ON public.organization_invitations FOR SELECT
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
  AND accepted_at IS NULL
  AND expires_at > now()
);