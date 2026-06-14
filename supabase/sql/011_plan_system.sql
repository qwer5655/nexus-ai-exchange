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
