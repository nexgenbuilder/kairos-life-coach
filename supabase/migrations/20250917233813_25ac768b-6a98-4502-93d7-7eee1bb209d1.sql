-- Enable RLS on income table if it exists but doesn't have RLS enabled
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;