-- Create work schedules table
CREATE TABLE public.work_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  pay_rate_cents BIGINT NOT NULL DEFAULT 0,
  pay_type TEXT NOT NULL DEFAULT 'hourly', -- hourly, salary, daily, weekly, bi_weekly, monthly
  currency TEXT NOT NULL DEFAULT 'USD',
  is_completed BOOLEAN NOT NULL DEFAULT false,
  projected_income_cents BIGINT NOT NULL DEFAULT 0,
  actual_income_cents BIGINT DEFAULT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create PTO requests table (enhance existing or create new)
CREATE TABLE public.work_time_off (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  hours_requested NUMERIC NOT NULL DEFAULT 0,
  hours_approved NUMERIC DEFAULT NULL,
  pto_type TEXT NOT NULL DEFAULT 'vacation', -- vacation, sick, personal, holiday
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, denied
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create work settings table for pay rates and PTO balances
CREATE TABLE public.work_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  default_hourly_rate_cents BIGINT DEFAULT 0,
  default_pay_type TEXT DEFAULT 'hourly',
  currency TEXT NOT NULL DEFAULT 'USD',
  vacation_hours_total NUMERIC DEFAULT 0,
  vacation_hours_used NUMERIC DEFAULT 0,
  sick_hours_total NUMERIC DEFAULT 0,
  sick_hours_used NUMERIC DEFAULT 0,
  personal_hours_total NUMERIC DEFAULT 0,
  personal_hours_used NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.work_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_time_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for work_schedules
CREATE POLICY "Users can view their own work schedules" 
ON public.work_schedules 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own work schedules" 
ON public.work_schedules 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own work schedules" 
ON public.work_schedules 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own work schedules" 
ON public.work_schedules 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for work_time_off
CREATE POLICY "Users can view their own time off" 
ON public.work_time_off 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own time off requests" 
ON public.work_time_off 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time off requests" 
ON public.work_time_off 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own time off requests" 
ON public.work_time_off 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for work_settings
CREATE POLICY "Users can view their own work settings" 
ON public.work_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own work settings" 
ON public.work_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own work settings" 
ON public.work_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to calculate projected income
CREATE OR REPLACE FUNCTION public.calculate_projected_income(
  p_start_time TIMESTAMP WITH TIME ZONE,
  p_end_time TIMESTAMP WITH TIME ZONE,
  p_pay_rate_cents BIGINT,
  p_pay_type TEXT
) RETURNS BIGINT AS $$
DECLARE
  duration_hours NUMERIC;
  projected_income BIGINT;
BEGIN
  -- Calculate duration in hours
  duration_hours := EXTRACT(EPOCH FROM (p_end_time - p_start_time)) / 3600;
  
  CASE p_pay_type
    WHEN 'hourly' THEN
      projected_income := (duration_hours * p_pay_rate_cents)::BIGINT;
    WHEN 'daily' THEN
      projected_income := p_pay_rate_cents;
    WHEN 'weekly' THEN
      projected_income := (p_pay_rate_cents / 5)::BIGINT; -- Assuming 5 work days
    WHEN 'bi_weekly' THEN
      projected_income := (p_pay_rate_cents / 10)::BIGINT; -- Assuming 10 work days
    WHEN 'monthly' THEN
      projected_income := (p_pay_rate_cents / 22)::BIGINT; -- Assuming 22 work days
    WHEN 'salary' THEN
      projected_income := (p_pay_rate_cents / 2080 * duration_hours)::BIGINT; -- 2080 hours per year
    ELSE
      projected_income := 0;
  END CASE;
  
  RETURN projected_income;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate projected income
CREATE OR REPLACE FUNCTION public.update_projected_income()
RETURNS TRIGGER AS $$
BEGIN
  NEW.projected_income_cents := public.calculate_projected_income(
    NEW.start_time,
    NEW.end_time,
    NEW.pay_rate_cents,
    NEW.pay_type
  );
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_work_schedule_projected_income
  BEFORE INSERT OR UPDATE ON public.work_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_projected_income();