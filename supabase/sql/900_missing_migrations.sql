-- ===== 007: Idempotency Keys =====

-- Idempotency keys table for preventing duplicate balance-changing operations
-- Run in Supabase Dashboard SQL Editor

CREATE TABLE IF NOT EXISTS idempotency_keys (
  key TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  response JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_idempotency_keys_created ON idempotency_keys(created_at DESC);

ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for idempotency_keys" ON idempotency_keys;
CREATE POLICY "Allow all for idempotency_keys" ON idempotency_keys FOR ALL USING (true);

NOTIFY pgrst, 'reload schema';


-- ===== 010: Stripe Customer + stripe_events =====

-- Add Stripe customer fields to profiles table
-- Run in Supabase Dashboard SQL Editor

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Stripe events dedup table
CREATE TABLE IF NOT EXISTS stripe_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stripe_events_event_id ON stripe_events(event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_events_created ON stripe_events(created_at DESC);

ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for stripe_events" ON stripe_events;
CREATE POLICY "Allow all for stripe_events" ON stripe_events FOR ALL USING (true);

NOTIFY pgrst, 'reload schema';


-- ===== 011: Plan System =====

-- P3-3 Plan System — Subscription plans + usage tracking tables
-- Run in Supabase Dashboard SQL Editor

CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  credits INTEGER NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '{}',
  limits JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_usage_user ON user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_feature ON user_usage(feature);
CREATE INDEX IF NOT EXISTS idx_user_usage_period ON user_usage(user_id, feature, period_start);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read subscription_plans" ON subscription_plans;
CREATE POLICY "Allow read subscription_plans" ON subscription_plans FOR SELECT USING (true);

ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all user_usage" ON user_usage;
CREATE POLICY "Allow all user_usage" ON user_usage FOR ALL USING (true);

-- Seed default plans
INSERT INTO subscription_plans (name, price, credits, features, limits) VALUES
  ('free', 0, 100, '{"analytics":false,"automation":false,"bulk_action":false,"api_access":false}', '{"api_calls":100,"concurrent_jobs":1,"team_members":1}'),
  ('pro', 29, 5000, '{"analytics":true,"automation":true,"bulk_action":false,"api_access":true}', '{"api_calls":5000,"concurrent_jobs":5,"team_members":5}'),
  ('enterprise', 199, 50000, '{"analytics":true,"automation":true,"bulk_action":true,"api_access":true}', '{"api_calls":100000,"concurrent_jobs":50,"team_members":100}')
ON CONFLICT (name) DO NOTHING;

NOTIFY pgrst, 'reload schema';


-- ===== 012: Enterprise =====

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

