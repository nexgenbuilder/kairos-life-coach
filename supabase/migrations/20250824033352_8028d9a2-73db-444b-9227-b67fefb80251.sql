-- Fix function search path security warnings
-- Update all functions to set search_path for security

-- Fix log_audit function
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
SET search_path = public
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

-- Fix audit_health_data_changes function
CREATE OR REPLACE FUNCTION public.audit_health_data_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix check_rate_limit function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_endpoint TEXT,
  p_limit INTEGER DEFAULT 100,
  p_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix detect_unusual_access function
CREATE OR REPLACE FUNCTION public.detect_unusual_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix cleanup_security_data function
CREATE OR REPLACE FUNCTION public.cleanup_security_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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