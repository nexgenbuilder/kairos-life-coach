-- Ensure audit triggers work properly for medications as well
-- Fix any remaining trigger issues

-- Make sure the medications table has the proper audit trigger
DROP TRIGGER IF EXISTS audit_medications_changes ON public.medications;
CREATE TRIGGER audit_medications_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.medications
    FOR EACH ROW EXECUTE FUNCTION public.audit_health_data_changes();

-- Also make sure medication_logs has the audit trigger
DROP TRIGGER IF EXISTS audit_medication_logs_changes ON public.medication_logs;
CREATE TRIGGER audit_medication_logs_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.medication_logs
    FOR EACH ROW EXECUTE FUNCTION public.audit_health_data_changes();

-- Check if there are any issues with the audit_health_data_changes function
-- This function should exist and work properly
CREATE OR REPLACE FUNCTION public.audit_health_data_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log changes to health metrics and medications
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit(TG_TABLE_NAME, 'INSERT', NULL, row_to_json(NEW)::jsonb);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_audit(TG_TABLE_NAME, 'UPDATE', row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_audit(TG_TABLE_NAME, 'DELETE', row_to_json(OLD)::jsonb, NULL);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;