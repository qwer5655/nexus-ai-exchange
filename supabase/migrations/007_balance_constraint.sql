-- Phase 6: Balance Hardening
-- Add CHECK constraint to prevent negative balances
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS balance_non_negative;
ALTER TABLE profiles ADD CONSTRAINT balance_non_negative CHECK (balance >= 0);

-- Refresh schema cache
NOTIFY pgrst, ''reload schema'';
