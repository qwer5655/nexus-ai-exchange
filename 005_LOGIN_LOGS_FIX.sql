-- Run this SQL in Supabase Dashboard: https://supabase.com/dashboard/project/dcfwldxwyvvotvfdnywy/sql/new
-- Creates a function to insert login logs that bypasses PostgREST schema cache

CREATE OR REPLACE FUNCTION log_admin_action(
  p_admin_id UUID,
  p_action TEXT,
  p_target_type TEXT DEFAULT NULL,
  p_target_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, ip_address)
  VALUES (p_admin_id, p_action, p_target_type, p_target_id, p_details, (p_details->>''ip_address''))
  RETURNING id INTO log_id;
  RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Refresh PostgREST schema cache so both table and function are visible
SELECT pg_notify(''pgrst'', ''reload schema'');

-- Verify
SELECT proname FROM pg_proc WHERE proname = ''log_admin_action'';
