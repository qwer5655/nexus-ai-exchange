-- Fix: add SECURITY DEFINER to bypass RLS
-- Run in Supabase Dashboard: https://supabase.com/dashboard/project/dcfwldxwyvvotvfdnywy/sql/new

CREATE OR REPLACE FUNCTION add_balance(
  p_user_id UUID,
  p_amount NUMERIC,
  p_type TEXT DEFAULT 'adjustment',
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL
)
RETURNS void
SECURITY DEFINER
SET search_path = public
AS
$$
BEGIN
  UPDATE profiles SET balance = COALESCE(balance, 0) + p_amount WHERE id = p_user_id;
END;
$$
LANGUAGE plpgsql;
