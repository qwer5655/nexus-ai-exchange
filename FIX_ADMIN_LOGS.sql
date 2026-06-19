-- ==========================================
-- Fix: Create admin_logs table + Reload PostgREST schema cache
-- Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/dcfwldxwyvvotvfdnywy/sql/new
-- ==========================================

-- Step 1: Create admin_logs if not exists
CREATE TABLE IF NOT EXISTS admin_logs (
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
CREATE POLICY "Admins can view logs"
  ON admin_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Step 2: Reload PostgREST schema cache (CRITICAL)
SELECT pg_notify('pgrst', 'reload schema');

-- Verification: Check table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'admin_logs' 
ORDER BY ordinal_position;
