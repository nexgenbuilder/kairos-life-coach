-- Add organization_id columns to existing tables (only if they don't exist)
DO $$
BEGIN
    -- Add organization_id to deals table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'organization_id') THEN
        ALTER TABLE public.deals ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
    END IF;
    
    -- Add organization_id to people table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'people' AND column_name = 'organization_id') THEN
        ALTER TABLE public.people ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
    END IF;
    
    -- Add organization_id to tasks table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'organization_id') THEN
        ALTER TABLE public.tasks ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
    END IF;
    
    -- Add organization_id to content_catalog table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_catalog' AND column_name = 'organization_id') THEN
        ALTER TABLE public.content_catalog ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
    END IF;
    
    -- Add organization_id to expenses table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'organization_id') THEN
        ALTER TABLE public.expenses ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
    END IF;
    
    -- Add organization_id to fitness_workouts table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fitness_workouts' AND column_name = 'organization_id') THEN
        ALTER TABLE public.fitness_workouts ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
    END IF;
    
    -- Add organization_id to health_metrics table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'health_metrics' AND column_name = 'organization_id') THEN
        ALTER TABLE public.health_metrics ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
    END IF;
    
    -- Add organization_id to events table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'organization_id') THEN
        ALTER TABLE public.events ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
    END IF;
END
$$;