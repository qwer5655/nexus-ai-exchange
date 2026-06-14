-- P4-1 Payment System — Recharges & User Balances
-- Run in Supabase Dashboard SQL Editor

-- Recharges table (extends deposits with more fields)
CREATE TABLE IF NOT EXISTS payment_recharges (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID NOT NULL,
    wallet_id UUID REFERENCES wallets(id),
    amount NUMERIC(20, 8) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USDT',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed','cancelled')),
    transaction_id TEXT,
    admin_id UUID REFERENCES profiles(id),
    notes TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recharges_user ON payment_recharges(user_id);
CREATE INDEX IF NOT EXISTS idx_recharges_status ON payment_recharges(status);

-- User balances table
CREATE TABLE IF NOT EXISTS user_balances (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    balances JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add balance column to profiles if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS balance DECIMAL(20,8) DEFAULT 0;

-- Enable RLS
ALTER TABLE payment_recharges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all recharges" ON payment_recharges;
CREATE POLICY "Allow all recharges" ON payment_recharges FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all user_balances" ON user_balances;
CREATE POLICY "Allow all user_balances" ON user_balances FOR ALL USING (true);

NOTIFY pgrst, 'reload schema';