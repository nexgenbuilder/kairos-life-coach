-- Add income tracking table
CREATE TABLE public.income (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurring_frequency TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add recurring expenses functionality
ALTER TABLE public.expenses 
ADD COLUMN is_recurring BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN recurring_frequency TEXT;

-- Update tasks table for status tracking and analytics
ALTER TABLE public.tasks 
ALTER COLUMN status SET DEFAULT 'inactive',
ADD COLUMN activated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS for income table
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for income
CREATE POLICY "Users can view their own income" 
ON public.income 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own income" 
ON public.income 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income" 
ON public.income 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income" 
ON public.income 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for income timestamps
CREATE TRIGGER update_income_updated_at
BEFORE UPDATE ON public.income
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();