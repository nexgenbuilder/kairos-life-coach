-- Fix critical RLS policies for exposed sensitive data

-- 1. Fix people table RLS (contains PII - email, phone)
DROP POLICY IF EXISTS "Users can view their own people" ON public.people;
CREATE POLICY "Users can view their own people" 
ON public.people 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own people" ON public.people;
CREATE POLICY "Users can create their own people" 
ON public.people 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own people" ON public.people;
CREATE POLICY "Users can update their own people" 
ON public.people 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own people" ON public.people;
CREATE POLICY "Users can delete their own people" 
ON public.people 
FOR DELETE 
USING (auth.uid() = user_id);

-- 2. Fix profiles table RLS (contains PII)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 3. Fix user_google_tokens RLS (contains OAuth tokens)
DROP POLICY IF EXISTS "Users can view their own tokens" ON public.user_google_tokens;
CREATE POLICY "Users can view their own tokens" 
ON public.user_google_tokens 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own tokens" ON public.user_google_tokens;
CREATE POLICY "Users can create their own tokens" 
ON public.user_google_tokens 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tokens" ON public.user_google_tokens;
CREATE POLICY "Users can update their own tokens" 
ON public.user_google_tokens 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own tokens" ON public.user_google_tokens;
CREATE POLICY "Users can delete their own tokens" 
ON public.user_google_tokens 
FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Fix medications RLS (contains health data)
DROP POLICY IF EXISTS "Users can view their own medications" ON public.medications;
CREATE POLICY "Users can view their own medications" 
ON public.medications 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own medications" ON public.medications;
CREATE POLICY "Users can create their own medications" 
ON public.medications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own medications" ON public.medications;
CREATE POLICY "Users can update their own medications" 
ON public.medications 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own medications" ON public.medications;
CREATE POLICY "Users can delete their own medications" 
ON public.medications 
FOR DELETE 
USING (auth.uid() = user_id);

-- 5. Fix medication_logs RLS (contains health data)
DROP POLICY IF EXISTS "Users can view their own medication logs" ON public.medication_logs;
CREATE POLICY "Users can view their own medication logs" 
ON public.medication_logs 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own medication logs" ON public.medication_logs;
CREATE POLICY "Users can create their own medication logs" 
ON public.medication_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own medication logs" ON public.medication_logs;
CREATE POLICY "Users can update their own medication logs" 
ON public.medication_logs 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own medication logs" ON public.medication_logs;
CREATE POLICY "Users can delete their own medication logs" 
ON public.medication_logs 
FOR DELETE 
USING (auth.uid() = user_id);

-- 6. Fix health_metrics RLS (contains health data)
DROP POLICY IF EXISTS "Users can view their own health metrics" ON public.health_metrics;
CREATE POLICY "Users can view their own health metrics" 
ON public.health_metrics 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own health metrics" ON public.health_metrics;
CREATE POLICY "Users can create their own health metrics" 
ON public.health_metrics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own health metrics" ON public.health_metrics;
CREATE POLICY "Users can update their own health metrics" 
ON public.health_metrics 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own health metrics" ON public.health_metrics;
CREATE POLICY "Users can delete their own health metrics" 
ON public.health_metrics 
FOR DELETE 
USING (auth.uid() = user_id);

-- 7. Fix function search paths for security
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;