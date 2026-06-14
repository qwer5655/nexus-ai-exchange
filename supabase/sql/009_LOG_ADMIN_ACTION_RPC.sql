-- log_admin_action RPC function with SECURITY DEFINER
-- Records admin actions for audit trail
-- Used by src/lib/admin-auth.ts
-- Run in Supabase Dashboard SQL Editor

CREATE OR REPLACE FUNCTION log_admin_action(
  p_admin_id UUID,
  p_action TEXT,
  p_target_type TEXT DEFAULT NULL,
  p_target_id TEXT DEFAULT NULL,
  p_details TEXT DEFAULT NULL
)
RETURNS void
SECURITY DEFINER
SET search_path = public
AS
$$
BEGIN
  INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
  VALUES (p_admin_id, p_action, p_target_type, p_target_id, p_details);
END;
$$ LANGUAGE plpgsql;
