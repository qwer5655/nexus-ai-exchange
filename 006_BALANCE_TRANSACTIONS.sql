-- Create balance_transactions table for unified fund flow tracking
CREATE TABLE IF NOT EXISTS balance_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (''deposit'', ''unlock'', ''topup'', ''adjustment'', ''refund'', ''commission'')),
  amount DECIMAL(20,2) NOT NULL,
  balance_before DECIMAL(20,2) NOT NULL,
  balance_after DECIMAL(20,2) NOT NULL,
  reference_type TEXT,
  reference_id TEXT,
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bt_user ON balance_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_bt_type ON balance_transactions(type);
CREATE INDEX IF NOT EXISTS idx_bt_created ON balance_transactions(created_at DESC);

ALTER TABLE balance_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view all transactions" ON balance_transactions;
CREATE POLICY "Admins can view all transactions" ON balance_transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN (''admin'', ''super_admin''))
);
DROP POLICY IF EXISTS "Users can view own transactions" ON balance_transactions;
CREATE POLICY "Users can view own transactions" ON balance_transactions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow insert" ON balance_transactions;
CREATE POLICY "Allow insert" ON balance_transactions FOR INSERT WITH CHECK (true);

-- Refresh schema cache
NOTIFY pgrst, ''reload schema'';
