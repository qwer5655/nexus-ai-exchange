-- VIP Purchase System
-- Adds vip_plans table, vip_orders table, and purchase_vip RPC

CREATE TABLE IF NOT EXISTS vip_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  vip_level INTEGER NOT NULL CHECK (vip_level >= 1 AND vip_level <= 5),
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration_days INTEGER DEFAULT 30,
  description TEXT DEFAULT '',
  features JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vip_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES vip_plans(id),
  amount DECIMAL(10,2) NOT NULL,
  vip_level INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vip_orders_user ON vip_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_vip_orders_created ON vip_orders(created_at DESC);

ALTER TABLE vip_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vip_plans_read_all" ON vip_plans;
CREATE POLICY "vip_plans_read_all" ON vip_plans FOR SELECT USING (true);

DROP POLICY IF EXISTS "vip_orders_self" ON vip_orders;
CREATE POLICY "vip_orders_self" ON vip_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "vip_orders_admin" ON vip_orders FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- purchase_vip RPC: atomic balance deduction + VIP upgrade + expiry management
CREATE OR REPLACE FUNCTION purchase_vip(
  p_user_id UUID,
  p_plan_id UUID
) RETURNS JSONB AS $
DECLARE
  v_plan RECORD;
  v_current_balance DECIMAL;
  v_current_vip_level INTEGER;
  v_current_expiry TIMESTAMPTZ;
  v_new_expiry TIMESTAMPTZ;
  v_plan_duration INTERVAL;
BEGIN
  SELECT * INTO v_plan FROM vip_plans WHERE id = p_plan_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'Plan not found'); END IF;

  SELECT balance, vip_level, vip_expires_at INTO v_current_balance, v_current_vip_level, v_current_expiry
  FROM profiles WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'User not found'); END IF;

  -- SCENARIO C: Cannot downgrade
  IF v_plan.vip_level < v_current_vip_level THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot downgrade VIP level');
  END IF;

  IF v_current_balance < v_plan.price THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance', 'balance', v_current_balance, 'required', v_plan.price);
  END IF;

  v_plan_duration := (v_plan.duration_days || ' days')::INTERVAL;

  -- SCENARIO A: Same level → extend expiry
  -- SCENARIO B: Higher level → upgrade + reset expiry
  v_new_expiry := GREATEST(COALESCE(v_current_expiry, NOW()), NOW()) + v_plan_duration;

  PERFORM add_balance(p_user_id, -v_plan.price, 'vip_purchase', 'vip_plan', p_plan_id::TEXT, 'VIP ' || v_plan.vip_level || ' purchase: ' || v_plan.name);

  UPDATE profiles
  SET vip_level = v_plan.vip_level, vip_expires_at = v_new_expiry, vip_src = 'purchase', updated_at = NOW()
  WHERE id = p_user_id;

  INSERT INTO vip_orders (user_id, plan_id, amount, vip_level, status)
  VALUES (p_user_id, p_plan_id, v_plan.price, v_plan.vip_level, 'completed');

  RETURN jsonb_build_object('success', true, 'new_vip_level', v_plan.vip_level, 'new_expiry', v_new_expiry, 'amount', v_plan.price, 'balance_after', v_current_balance - v_plan.price);
END;
$ LANGUAGE plpgsql;

NOTIFY pgrst, 'reload schema';
