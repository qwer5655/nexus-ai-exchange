-- P3-4 Enterprise User Management + Audit
-- Run in Supabase Dashboard SQL Editor

CREATE TABLE IF NOT EXISTS enterprise_customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  admin_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ec_admin ON enterprise_customers(admin_user_id);

ALTER TABLE enterprise_customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all enterprise_customers" ON enterprise_customers;
CREATE POLICY "Allow all enterprise_customers" ON enterprise_customers FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS enterprise_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'read' CHECK (level IN ('read','write','admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, feature)
);

CREATE INDEX IF NOT EXISTS idx_ep_user ON enterprise_permissions(user_id);

ALTER TABLE enterprise_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all enterprise_permissions" ON enterprise_permissions;
CREATE POLICY "Allow all enterprise_permissions" ON enterprise_permissions FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS enterprise_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eal_user ON enterprise_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_eal_action ON enterprise_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_eal_created ON enterprise_audit_log(created_at DESC);

ALTER TABLE enterprise_audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all enterprise_audit_log" ON enterprise_audit_log;
CREATE POLICY "Allow all enterprise_audit_log" ON enterprise_audit_log FOR ALL USING (true);

NOTIFY pgrst, 'reload schema';
