-- Add blood_sugar to health_metrics types
ALTER TABLE fitness_workouts DROP CONSTRAINT IF EXISTS fitness_workouts_exercise_type_check;

-- Create health_metrics table for tracking various health indicators
CREATE TABLE public.health_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('weight', 'blood_pressure', 'heart_rate', 'temperature', 'blood_sugar')),
  value TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for health_metrics
CREATE POLICY "Users can view their own health metrics" 
ON public.health_metrics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own health metrics" 
ON public.health_metrics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health metrics" 
ON public.health_metrics 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health metrics" 
ON public.health_metrics 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create medications table
CREATE TABLE public.medications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT NOT NULL,
  medication_type TEXT NOT NULL CHECK (medication_type IN ('prescription', 'supplement', 'over_counter')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

-- Create policies for medications
CREATE POLICY "Users can view their own medications" 
ON public.medications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own medications" 
ON public.medications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medications" 
ON public.medications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medications" 
ON public.medications 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create medication_logs table for tracking when medications are taken
CREATE TABLE public.medication_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  medication_id UUID NOT NULL,
  taken_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  dosage_taken TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for medication_logs
CREATE POLICY "Users can view their own medication logs" 
ON public.medication_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own medication logs" 
ON public.medication_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medication logs" 
ON public.medication_logs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medication logs" 
ON public.medication_logs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add foreign key constraint
ALTER TABLE public.medication_logs 
ADD CONSTRAINT medication_logs_medication_id_fkey 
FOREIGN KEY (medication_id) REFERENCES public.medications(id) ON DELETE CASCADE;

-- Create update trigger for health_metrics
CREATE TRIGGER update_health_metrics_updated_at
BEFORE UPDATE ON public.health_metrics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create update trigger for medications
CREATE TRIGGER update_medications_updated_at
BEFORE UPDATE ON public.medications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();