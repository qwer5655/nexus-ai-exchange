-- Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/dcfwldxwyvvotvfdnywy/sql/new

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
  VALUES (p_admin_id, p_action, p_target_type, p_target_id, p_details, (p_details->>'ip_address'))
  RETURNING id INTO log_id;
  RETURN log_id;
END;
$$ LANGUAGE plpgsql;

SELECT pg_notify('pgrst', 'reload schema');
SELECT proname FROM pg_proc WHERE proname = 'log_admin_action';
