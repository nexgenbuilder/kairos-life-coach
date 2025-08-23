-- Add contact fields to people table
ALTER TABLE public.people 
ADD COLUMN IF NOT EXISTS social_media_links JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS position TEXT,
ADD COLUMN IF NOT EXISTS address TEXT;

-- Create notes table for cross-system notes
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  person_id UUID REFERENCES public.people(id) ON DELETE CASCADE,
  module TEXT NOT NULL CHECK (module IN ('social', 'love', 'business', 'professional')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory table for business module
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_price_cents BIGINT,
  category TEXT,
  supplier TEXT,
  sku TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create work schedules table
CREATE TABLE IF NOT EXISTS public.work_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Work',
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_pattern TEXT, -- 'daily', 'weekly', 'monthly'
  hourly_rate_cents BIGINT,
  daily_rate_cents BIGINT,
  salary_weekly_cents BIGINT,
  work_type TEXT CHECK (work_type IN ('hourly', 'daily', 'salary')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create PTO/vacation tracking table
CREATE TABLE IF NOT EXISTS public.pto_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  hours_requested DECIMAL(5,2),
  pto_type TEXT NOT NULL CHECK (pto_type IN ('vacation', 'sick', 'personal', 'other')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business expenses table (separate from personal expenses)
CREATE TABLE IF NOT EXISTS public.business_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount_cents BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurring_frequency TEXT,
  vendor TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business revenue table
CREATE TABLE IF NOT EXISTS public.business_revenue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount_cents BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  description TEXT NOT NULL,
  source TEXT NOT NULL,
  date DATE NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurring_frequency TEXT,
  client_id UUID REFERENCES public.people(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pto_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_revenue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notes
CREATE POLICY "Users can view their own notes" ON public.notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own notes" ON public.notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON public.notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON public.notes FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for inventory
CREATE POLICY "Users can view their own inventory" ON public.inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own inventory" ON public.inventory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own inventory" ON public.inventory FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own inventory" ON public.inventory FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for work schedules
CREATE POLICY "Users can view their own work schedules" ON public.work_schedules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own work schedules" ON public.work_schedules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own work schedules" ON public.work_schedules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own work schedules" ON public.work_schedules FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for PTO requests
CREATE POLICY "Users can view their own PTO requests" ON public.pto_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own PTO requests" ON public.pto_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own PTO requests" ON public.pto_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own PTO requests" ON public.pto_requests FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for business expenses
CREATE POLICY "Users can view their own business expenses" ON public.business_expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own business expenses" ON public.business_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own business expenses" ON public.business_expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own business expenses" ON public.business_expenses FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for business revenue
CREATE POLICY "Users can view their own business revenue" ON public.business_revenue FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own business revenue" ON public.business_revenue FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own business revenue" ON public.business_revenue FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own business revenue" ON public.business_revenue FOR DELETE USING (auth.uid() = user_id);

-- Create update triggers for updated_at fields
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_work_schedules_updated_at
  BEFORE UPDATE ON public.work_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pto_requests_updated_at
  BEFORE UPDATE ON public.pto_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_expenses_updated_at
  BEFORE UPDATE ON public.business_expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_revenue_updated_at
  BEFORE UPDATE ON public.business_revenue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();