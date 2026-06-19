-- Phase X: Ledger System
-- Immutable audit trail for all financial transactions

-- USER WALLETS (single source of truth for balance)
CREATE TABLE IF NOT EXISTS user_wallets (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  balance DECIMAL(20,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LEDGER ENTRIES (immutable audit trail)
CREATE TABLE IF NOT EXISTS ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit','withdraw','profit','commission','adjustment','unlock','bonus','fee')),
  amount DECIMAL(20,2) NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('credit','debit')),
  balance_before DECIMAL(20,2) NOT NULL,
  balance_after DECIMAL(20,2) NOT NULL,
  reference_type TEXT,
  reference_id TEXT,
  description TEXT,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ledger_user ON ledger_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_type ON ledger_entries(type);
CREATE INDEX IF NOT EXISTS idx_ledger_created ON ledger_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_ref ON ledger_entries(reference_type, reference_id);

-- Enable RLS
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;

-- RLS: users can read own wallet
CREATE POLICY "Users can read own wallet"
  ON user_wallets FOR SELECT USING (auth.uid() = user_id);

-- RLS: users can read own ledger entries
CREATE POLICY "Users can read own ledger"
  ON ledger_entries FOR SELECT USING (auth.uid() = user_id);

-- RLS: admins can read all
CREATE POLICY "Admins can read all wallets"
  ON user_wallets FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
  );

CREATE POLICY "Admins can read all ledger"
  ON ledger_entries FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
  );

-- ATOMIC LEDGER RPC: credit (add money)
CREATE OR REPLACE FUNCTION ledger_credit(
  p_user_id UUID,
  p_amount DECIMAL,
  p_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL,
  p_meta JSONB DEFAULT '{}'::jsonb
) RETURNS JSONB AS 
DECLARE
  v_balance DECIMAL;
  v_new_balance DECIMAL;
  v_entry_id UUID;
BEGIN
  -- Ensure wallet exists
  INSERT INTO user_wallets (user_id, balance)
  VALUES (p_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Lock and read
  SELECT balance INTO v_balance FROM user_wallets WHERE user_id = p_user_id FOR UPDATE;
  v_new_balance := v_balance + p_amount;

  -- Update wallet
  UPDATE user_wallets SET balance = v_new_balance, updated_at = NOW() WHERE user_id = p_user_id;

  -- Write ledger entry
  INSERT INTO ledger_entries (user_id, type, amount, direction, balance_before, balance_after, reference_type, reference_id, description, meta)
  VALUES (p_user_id, p_type, p_amount, 'credit', v_balance, v_new_balance, p_reference_type, p_reference_id, p_description, p_meta)
  RETURNING id INTO v_entry_id;

  -- Also update profiles.balance for backward compatibility
  UPDATE profiles SET balance = v_new_balance WHERE id = p_user_id;

  RETURN jsonb_build_object('entry_id', v_entry_id, 'balance_before', v_balance, 'balance_after', v_new_balance);
END;
 LANGUAGE plpgsql SECURITY DEFINER;

-- ATOMIC LEDGER RPC: debit (subtract money)
CREATE OR REPLACE FUNCTION ledger_debit(
  p_user_id UUID,
  p_amount DECIMAL,
  p_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL,
  p_meta JSONB DEFAULT '{}'::jsonb
) RETURNS JSONB AS 
DECLARE
  v_balance DECIMAL;
  v_new_balance DECIMAL;
  v_entry_id UUID;
BEGIN
  -- Ensure wallet exists
  INSERT INTO user_wallets (user_id, balance)
  VALUES (p_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Lock and read
  SELECT balance INTO v_balance FROM user_wallets WHERE user_id = p_user_id FOR UPDATE;
  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance: have %, need %', v_balance, p_amount;
  END IF;
  v_new_balance := v_balance - p_amount;

  -- Update wallet
  UPDATE user_wallets SET balance = v_new_balance, updated_at = NOW() WHERE user_id = p_user_id;

  -- Write ledger entry
  INSERT INTO ledger_entries (user_id, type, amount, direction, balance_before, balance_after, reference_type, reference_id, description, meta)
  VALUES (p_user_id, p_type, p_amount, 'debit', v_balance, v_new_balance, p_reference_type, p_reference_id, p_description, p_meta)
  RETURNING id INTO v_entry_id;

  -- Also update profiles.balance for backward compatibility
  UPDATE profiles SET balance = v_new_balance WHERE id = p_user_id;

  RETURN jsonb_build_object('entry_id', v_entry_id, 'balance_before', v_balance, 'balance_after', v_new_balance);
END;
 LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: get wallet balance
CREATE OR REPLACE FUNCTION get_wallet_balance(p_user_id UUID)
RETURNS DECIMAL AS 
DECLARE
  v_balance DECIMAL;
BEGIN
  SELECT balance INTO v_balance FROM user_wallets WHERE user_id = p_user_id;
  RETURN COALESCE(v_balance, 0);
END;
 LANGUAGE plpgsql SECURITY DEFINER;

-- Migrate existing balances from profiles to user_wallets
INSERT INTO user_wallets (user_id, balance)
SELECT id, COALESCE(balance, 0) FROM profiles
ON CONFLICT (user_id) DO UPDATE SET balance = EXCLUDED.balance;
