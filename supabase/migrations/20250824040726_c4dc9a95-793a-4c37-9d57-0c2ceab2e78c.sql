-- Create beta signups table
CREATE TABLE public.beta_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending'
);

-- Enable RLS
ALTER TABLE public.beta_signups ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting (anyone can request beta access)
CREATE POLICY "Anyone can request beta access" 
ON public.beta_signups 
FOR INSERT 
WITH CHECK (true);

-- Create policy for viewing (no one can view except service role)
CREATE POLICY "Only service role can view beta signups" 
ON public.beta_signups 
FOR SELECT 
USING (false);