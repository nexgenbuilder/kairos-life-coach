-- Critical Security Enhancements

-- 1. Create audit log table for sensitive operations
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs - only users can see their own logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Create function for audit logging
CREATE OR REPLACE FUNCTION public.log_audit(
  p_table_name TEXT,
  p_operation TEXT,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    table_name,
    operation,
    old_data,
    new_data,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    p_table_name,
    p_operation,
    p_old_data,
    p_new_data,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$;

-- 3. Create triggers for sensitive tables (health and financial data)
CREATE OR REPLACE FUNCTION public.audit_health_data_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log changes to health metrics
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit(TG_TABLE_NAME, 'INSERT', NULL, row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_audit(TG_TABLE_NAME, 'UPDATE', row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_audit(TG_TABLE_NAME, 'DELETE', row_to_json(OLD), NULL);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_health_metrics_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.health_metrics
  FOR EACH ROW EXECUTE FUNCTION public.audit_health_data_changes();

CREATE TRIGGER audit_medications_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.medications
  FOR EACH ROW EXECUTE FUNCTION public.audit_health_data_changes();

CREATE TRIGGER audit_medication_logs_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.medication_logs
  FOR EACH ROW EXECUTE FUNCTION public.audit_health_data_changes();

CREATE TRIGGER audit_expenses_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.audit_health_data_changes();

CREATE TRIGGER audit_income_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.income
  FOR EACH ROW EXECUTE FUNCTION public.audit_health_data_changes();

CREATE TRIGGER audit_business_expenses_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.business_expenses
  FOR EACH ROW EXECUTE FUNCTION public.audit_health_data_changes();

CREATE TRIGGER audit_business_revenue_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.business_revenue
  FOR EACH ROW EXECUTE FUNCTION public.audit_health_data_changes();

-- 4. Create rate limiting table
CREATE TABLE public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  ip_address TEXT,
  endpoint TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on rate limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Rate limiting policies (only system can manage these)
CREATE POLICY "Only service role can manage rate limits" 
ON public.rate_limits 
FOR ALL 
USING (false);

-- 5. Create function for rate limiting
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_endpoint TEXT,
  p_limit INTEGER DEFAULT 100,
  p_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count INTEGER;
  window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  window_start := now() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Get current request count for this user and endpoint in the time window
  SELECT COALESCE(SUM(request_count), 0) INTO current_count
  FROM public.rate_limits
  WHERE user_id = auth.uid()
    AND endpoint = p_endpoint
    AND window_start > window_start;
  
  -- If under limit, log this request and allow
  IF current_count < p_limit THEN
    INSERT INTO public.rate_limits (user_id, endpoint, window_start)
    VALUES (auth.uid(), p_endpoint, now());
    RETURN TRUE;
  END IF;
  
  -- Over limit
  RETURN FALSE;
END;
$$;

-- 6. Enhanced RLS policies with time restrictions for sensitive data
-- Add time-based access for medications (only during reasonable hours)
CREATE POLICY "Medications accessible during reasonable hours" 
ON public.medications 
FOR SELECT 
USING (
  auth.uid() = user_id AND 
  EXTRACT(HOUR FROM NOW() AT TIME ZONE 'UTC') BETWEEN 6 AND 23
);

-- 7. Create function to detect unusual access patterns
CREATE OR REPLACE FUNCTION public.detect_unusual_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recent_access_count INTEGER;
BEGIN
  -- Count recent access to this table by this user
  SELECT COUNT(*) INTO recent_access_count
  FROM public.audit_logs
  WHERE user_id = auth.uid()
    AND table_name = TG_TABLE_NAME
    AND operation = 'SELECT'
    AND created_at > now() - INTERVAL '10 minutes';
  
  -- If more than 50 queries in 10 minutes, log as suspicious
  IF recent_access_count > 50 THEN
    PERFORM public.log_audit('SECURITY_ALERT', 'UNUSUAL_ACCESS_PATTERN', 
      NULL, 
      json_build_object('table', TG_TABLE_NAME, 'count', recent_access_count)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- 8. Create table for failed authentication attempts
CREATE TABLE public.failed_auth_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  attempt_type TEXT NOT NULL,
  attempted_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (only admins should see this)
ALTER TABLE public.failed_auth_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No access to failed auth attempts" 
ON public.failed_auth_attempts 
FOR ALL 
USING (false);

-- 9. Clean up old audit logs and rate limit data
CREATE OR REPLACE FUNCTION public.cleanup_security_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete audit logs older than 90 days
  DELETE FROM public.audit_logs 
  WHERE created_at < now() - INTERVAL '90 days';
  
  -- Delete rate limit data older than 24 hours
  DELETE FROM public.rate_limits 
  WHERE created_at < now() - INTERVAL '24 hours';
  
  -- Delete failed auth attempts older than 7 days
  DELETE FROM public.failed_auth_attempts 
  WHERE created_at < now() - INTERVAL '7 days';
END;
$$;