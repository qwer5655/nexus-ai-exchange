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
