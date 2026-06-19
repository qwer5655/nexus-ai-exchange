-- =============================================
-- FIX: PostgREST schema cache refresh
-- =============================================
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/dcfwldxwyvvotvfdnywy/sql/new

-- 1. Drop and recreate admin_logs to ensure full schema in cache
DROP TABLE IF EXISTS admin_logs CASCADE;

CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_logs(created_at DESC);

ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view logs" ON admin_logs;
CREATE POLICY "Admins can view logs" ON admin_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN (''admin'', ''super_admin''))
);
DROP POLICY IF EXISTS "Allow insert for admin_logs" ON admin_logs;
CREATE POLICY "Allow insert for admin_logs" ON admin_logs FOR INSERT WITH CHECK (true);

-- 2. Create helper function for login recording
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

-- 3. Force schema cache refresh
NOTIFY pgrst, ''reload schema'';

-- 4. Verify
SELECT table_name, column_name FROM information_schema.columns WHERE table_name = ''admin_logs'' ORDER BY ordinal_position;
SELECT proname FROM pg_proc WHERE proname = ''log_admin_action'';
