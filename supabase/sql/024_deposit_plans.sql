-- deposit_plans table for admin-manageable deposit options
CREATE TABLE IF NOT EXISTS deposit_plans (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  amount NUMERIC(10,2) NOT NULL,
  bonus TEXT NOT NULL DEFAULT ''No bonus'',
  popular BOOLEAN DEFAULT false,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE deposit_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ''Allow all deposit_plans'' ON deposit_plans;
CREATE POLICY "Allow all deposit_plans" ON deposit_plans FOR ALL USING (true);

-- Seed data
INSERT INTO deposit_plans (amount, bonus, popular) VALUES
  (20, ''No bonus'', false),
  (50, ''+$5 Bonus'', false),
  (100, ''+$15 Bonus'', true),
  (200, ''+$35 Bonus'', false),
  (500, ''+$100 Bonus'', false),
  (1000, ''+$250 Bonus'', false)
ON CONFLICT DO NOTHING;

NOTIFY pgrst, ''reload schema'';
