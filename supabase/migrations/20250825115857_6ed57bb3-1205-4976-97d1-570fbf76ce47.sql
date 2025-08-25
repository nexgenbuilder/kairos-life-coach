-- Fix the log_audit function that's causing health metrics logging to fail
-- The function exists but has a parameter mismatch

-- First, let's check what triggers are calling this function and fix the function signature
CREATE OR REPLACE FUNCTION public.log_audit(
  p_table_name text, 
  p_operation text, 
  p_old_data jsonb DEFAULT NULL, 
  p_new_data jsonb DEFAULT NULL, 
  p_ip_address text DEFAULT NULL, 
  p_user_agent text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- Create the missing audit trigger for health metrics if it doesn't exist
DROP TRIGGER IF EXISTS audit_health_metrics_changes ON public.health_metrics;
CREATE TRIGGER audit_health_metrics_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.health_metrics
    FOR EACH ROW EXECUTE FUNCTION public.audit_health_data_changes();