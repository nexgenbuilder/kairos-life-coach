-- Add organization_id columns to existing tables
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.people ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);