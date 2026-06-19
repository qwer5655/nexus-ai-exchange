-- withdraw_requests table for withdrawal system
-- Run in Supabase Dashboard SQL Editor

CREATE TABLE IF NOT EXISTS public.withdraw_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  coin VARCHAR(20) NOT NULL DEFAULT 'USDT',
  network VARCHAR(20) NOT NULL DEFAULT 'trc20',
  wallet_address TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','completed','cancelled')),
  admin_id UUID REFERENCES public.profiles(id),
  admin_note TEXT,
  balance_before NUMERIC(12,2) NOT NULL DEFAULT 0,
  balance_after NUMERIC(12,2),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_withdraw_requests_user ON public.withdraw_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdraw_requests_status ON public.withdraw_requests(status);

ALTER TABLE public.withdraw_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own withdrawals" ON public.withdraw_requests;
CREATE POLICY "Users view own withdrawals" ON public.withdraw_requests FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users create own withdrawals" ON public.withdraw_requests;
CREATE POLICY "Users create own withdrawals" ON public.withdraw_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins view all withdrawals" ON public.withdraw_requests;
CREATE POLICY "Admins view all withdrawals" ON public.withdraw_requests FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin','super_admin')));

DROP POLICY IF EXISTS "Admins update withdrawals" ON public.withdraw_requests;
CREATE POLICY "Admins update withdrawals" ON public.withdraw_requests FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin','super_admin')));

NOTIFY pgrst, 'reload schema';
