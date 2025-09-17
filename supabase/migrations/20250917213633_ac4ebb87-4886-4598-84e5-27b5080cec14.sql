-- Add role column to profiles table
ALTER TABLE public.profiles ADD COLUMN role text DEFAULT 'user';

-- Create constraint for valid roles
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role = ANY (ARRAY['admin'::text, 'sales_agent'::text, 'user'::text]));

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$;

-- Update RLS policies for deals to allow admin access
DROP POLICY IF EXISTS "Users can view their own deals" ON public.deals;
CREATE POLICY "Users can view their own deals or admin can view all" 
ON public.deals 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  public.get_user_role(auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Users can update their own deals" ON public.deals;
CREATE POLICY "Users can update their own deals or admin can update all" 
ON public.deals 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  public.get_user_role(auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Users can delete their own deals" ON public.deals;
CREATE POLICY "Users can delete their own deals or admin can delete all" 
ON public.deals 
FOR DELETE 
USING (
  auth.uid() = user_id OR 
  public.get_user_role(auth.uid()) = 'admin'
);

-- Update RLS policies for people to allow admin access
DROP POLICY IF EXISTS "Users can view their own people" ON public.people;
CREATE POLICY "Users can view their own people or admin can view all" 
ON public.people 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  public.get_user_role(auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Users can update their own people" ON public.people;
CREATE POLICY "Users can update their own people or admin can update all" 
ON public.people 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  public.get_user_role(auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Users can delete their own people" ON public.people;
CREATE POLICY "Users can delete their own people or admin can delete all" 
ON public.people 
FOR DELETE 
USING (
  auth.uid() = user_id OR 
  public.get_user_role(auth.uid()) = 'admin'
);