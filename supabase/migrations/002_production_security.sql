-- Production Security Upgrade
-- Adds balance_transactions, admin_logs, role update, concurrency protection

-- Balance Transactions table (tracks all balance changes)
CREATE TABLE IF NOT EXISTS balance_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('unlock', 'deposit', 'admin_adjustment', 'bonus', 'withdrawal')),
  amount DECIMAL(20,2) NOT NULL,
  balance_before DECIMAL(20,2) NOT NULL,
  balance_after DECIMAL(20,2) NOT NULL,
  reference_type TEXT,
  reference_id TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_balance_tx_user ON balance_transactions(user_id);
CREATE INDEX idx_balance_tx_type ON balance_transactions(type);
CREATE INDEX idx_balance_tx_created ON balance_transactions(created_at DESC);

-- Admin Logs table
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
CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_action ON admin_logs(action);
CREATE INDEX idx_admin_logs_created ON admin_logs(created_at DESC);

-- Update role CHECK to support super_admin
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin', 'super_admin'));

-- add_balance function with transaction logging
CREATE OR REPLACE FUNCTION add_balance(
  p_user_id UUID,
  p_amount DECIMAL,
  p_type TEXT DEFAULT 'admin_adjustment',
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL
) RETURNS DECIMAL AS $$
DECLARE
  current_balance DECIMAL;
  new_balance DECIMAL;
BEGIN
  SELECT balance INTO current_balance FROM profiles WHERE id = p_user_id FOR UPDATE;
  IF current_balance IS NULL THEN RAISE EXCEPTION 'User not found'; END IF;
  new_balance := current_balance + p_amount;
  IF new_balance < 0 THEN RAISE EXCEPTION 'Insufficient balance'; END IF;
  UPDATE profiles SET balance = new_balance WHERE id = p_user_id;
  INSERT INTO balance_transactions (user_id, type, amount, balance_before, balance_after, reference_type, reference_id, description)
  VALUES (p_user_id, p_type, p_amount, current_balance, new_balance, p_reference_type, p_reference_id, p_description);
  RETURN new_balance;
END;
$$ LANGUAGE plpgsql;

-- Add admin_log entry function
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
  INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
  VALUES (p_admin_id, p_action, p_target_type, p_target_id, p_details)
  RETURNING id INTO log_id;
  RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- RLS for new tables
ALTER TABLE balance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON balance_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions"
  ON balance_transactions FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can view logs"
  ON admin_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );