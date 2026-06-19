-- Phase 7: Transaction Type Standardization
-- Align balance_transactions.type CHECK constraint with actual code usage
-- Allowed types: deposit, withdrawal, commission, bonus, adjustment, topup, unlock

ALTER TABLE balance_transactions DROP CONSTRAINT IF EXISTS balance_transactions_type_check;
ALTER TABLE balance_transactions ADD CONSTRAINT balance_transactions_type_check
  CHECK (type IN (''deposit'', ''withdrawal'', ''commission'', ''bonus'', ''adjustment'', ''topup'', ''unlock''));

NOTIFY pgrst, ''reload schema'';
