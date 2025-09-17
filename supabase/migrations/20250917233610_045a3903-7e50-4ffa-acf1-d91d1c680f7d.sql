-- Add organization_id columns to existing tables
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.people ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.content_catalog ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.fitness_workouts ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.health_metrics ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- Create income table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.income (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  amount NUMERIC NOT NULL,
  source TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  category TEXT NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurring_frequency TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on income table
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for income table
CREATE POLICY "Users can create their own income" ON public.income
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own income or organization income" ON public.income
FOR SELECT USING (
  auth.uid() = user_id OR (
    organization_id IS NOT NULL AND 
    user_can_access_organization(organization_id) AND
    user_has_context_module_access('money', 'view', organization_id)
  )
);

CREATE POLICY "Users can update their own income or organization income" ON public.income
FOR UPDATE USING (
  auth.uid() = user_id OR (
    organization_id IS NOT NULL AND 
    user_can_access_organization(organization_id) AND
    user_has_context_module_access('money', 'edit', organization_id)
  )
);

CREATE POLICY "Users can delete their own income or organization income" ON public.income
FOR DELETE USING (
  auth.uid() = user_id OR (
    organization_id IS NOT NULL AND 
    user_can_access_organization(organization_id) AND
    user_has_context_module_access('money', 'admin', organization_id)
  )
);