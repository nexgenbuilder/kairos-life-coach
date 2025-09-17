-- Add organization_id to data tables to enable context separation
ALTER TABLE public.deals ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.people ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.tasks ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.content_catalog ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.expenses ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.income ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.fitness_workouts ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.health_metrics ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.events ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

-- Create people table if it doesn't exist (for contacts)
CREATE TABLE IF NOT EXISTS public.people (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  position TEXT,
  birthday DATE,
  address TEXT,
  notes TEXT,
  tags TEXT[],
  social_media_links JSONB DEFAULT '{}',
  type TEXT DEFAULT 'contact',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on people table
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

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

-- Update RLS policies for deals to consider organization context
DROP POLICY IF EXISTS "Users can view deals in shared contexts" ON public.deals;
DROP POLICY IF EXISTS "Users can update deals in shared contexts" ON public.deals;
DROP POLICY IF EXISTS "Users can delete deals in shared contexts" ON public.deals;

CREATE POLICY "Users can view their own deals or organization deals" ON public.deals
FOR SELECT USING (
  auth.uid() = user_id OR (
    organization_id IS NOT NULL AND 
    user_can_access_organization(organization_id) AND
    user_has_context_module_access('professional', 'view', organization_id)
  )
);

CREATE POLICY "Users can update their own deals or organization deals" ON public.deals
FOR UPDATE USING (
  auth.uid() = user_id OR (
    organization_id IS NOT NULL AND 
    user_can_access_organization(organization_id) AND
    user_has_context_module_access('professional', 'edit', organization_id)
  )
);

CREATE POLICY "Users can delete their own deals or organization deals" ON public.deals
FOR DELETE USING (
  auth.uid() = user_id OR (
    organization_id IS NOT NULL AND 
    user_can_access_organization(organization_id) AND
    user_has_context_module_access('professional', 'admin', organization_id)
  )
);

-- RLS policies for people table
CREATE POLICY "Users can create their own people" ON public.people
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own people or organization people" ON public.people
FOR SELECT USING (
  auth.uid() = user_id OR (
    organization_id IS NOT NULL AND 
    user_can_access_organization(organization_id) AND
    user_has_context_module_access('professional', 'view', organization_id)
  )
);

CREATE POLICY "Users can update their own people or organization people" ON public.people
FOR UPDATE USING (
  auth.uid() = user_id OR (
    organization_id IS NOT NULL AND 
    user_can_access_organization(organization_id) AND
    user_has_context_module_access('professional', 'edit', organization_id)
  )
);

CREATE POLICY "Users can delete their own people or organization people" ON public.people
FOR DELETE USING (
  auth.uid() = user_id OR (
    organization_id IS NOT NULL AND 
    user_can_access_organization(organization_id) AND
    user_has_context_module_access('professional', 'admin', organization_id)
  )
);

-- RLS policies for income table
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

-- Update tasks RLS policies
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;

CREATE POLICY "Users can view their own tasks or organization tasks" ON public.tasks
FOR SELECT USING (
  auth.uid() = user_id OR (
    organization_id IS NOT NULL AND 
    user_can_access_organization(organization_id) AND
    user_has_context_module_access('tasks', 'view', organization_id)
  )
);

CREATE POLICY "Users can update their own tasks or organization tasks" ON public.tasks
FOR UPDATE USING (
  auth.uid() = user_id OR (
    organization_id IS NOT NULL AND 
    user_can_access_organization(organization_id) AND
    user_has_context_module_access('tasks', 'edit', organization_id)
  )
);

CREATE POLICY "Users can delete their own tasks or organization tasks" ON public.tasks
FOR DELETE USING (
  auth.uid() = user_id OR (
    organization_id IS NOT NULL AND 
    user_can_access_organization(organization_id) AND
    user_has_context_module_access('tasks', 'admin', organization_id)
  )
);

-- Add updated_at trigger for people table
CREATE TRIGGER update_people_updated_at
  BEFORE UPDATE ON public.people
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();