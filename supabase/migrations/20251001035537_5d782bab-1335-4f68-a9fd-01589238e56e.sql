-- Update log_audit function to accept optional user_id parameter
CREATE OR REPLACE FUNCTION public.log_audit(
  p_table_name text,
  p_operation text,
  p_old_data jsonb DEFAULT NULL,
  p_new_data jsonb DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_user_id uuid DEFAULT NULL  -- New optional parameter
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  audit_id UUID;
  resolved_user_id UUID;
BEGIN
  -- Use provided user_id if available, otherwise fall back to auth.uid()
  resolved_user_id := COALESCE(p_user_id, auth.uid());
  
  -- Only insert if we have a valid user_id
  IF resolved_user_id IS NOT NULL THEN
    INSERT INTO public.audit_logs (
      user_id,
      table_name,
      operation,
      old_data,
      new_data,
      ip_address,
      user_agent
    ) VALUES (
      resolved_user_id,
      p_table_name,
      p_operation,
      p_old_data,
      p_new_data,
      p_ip_address,
      p_user_agent
    ) RETURNING id INTO audit_id;
  END IF;
  
  RETURN audit_id;
END;
$$;

-- Update audit_health_data_changes function to pass user_id from records
CREATE OR REPLACE FUNCTION public.audit_health_data_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  record_user_id UUID;
BEGIN
  -- Log changes to health metrics and medications
  IF TG_OP = 'INSERT' THEN
    -- Extract user_id from the NEW record
    record_user_id := (NEW.user_id)::uuid;
    PERFORM public.log_audit(TG_TABLE_NAME, 'INSERT', NULL, row_to_json(NEW)::jsonb, NULL, NULL, record_user_id);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Extract user_id from the NEW record
    record_user_id := (NEW.user_id)::uuid;
    PERFORM public.log_audit(TG_TABLE_NAME, 'UPDATE', row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, NULL, NULL, record_user_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Extract user_id from the OLD record
    record_user_id := (OLD.user_id)::uuid;
    PERFORM public.log_audit(TG_TABLE_NAME, 'DELETE', row_to_json(OLD)::jsonb, NULL, NULL, NULL, record_user_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;