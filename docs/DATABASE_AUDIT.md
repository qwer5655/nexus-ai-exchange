# Database & RLS Audit

## Table Coverage

| Table | Migration | RLS Enabled | RLS Policies | Service Role Bypass |
|---|---|---|---|---|
| profiles | 001 | Yes | SELECT own, UPDATE own | Yes |
| opportunities | 001 | Yes | SELECT published, admin CRUD | Yes |
| unlocks | 001 | Yes | SELECT own, INSERT own | Yes |
| deposits | 001 | Yes | SELECT own, INSERT own, admin SELECT/UPDATE | Yes |
| referrals | 001 | Yes | SELECT own | Yes |
| notifications | 001 | Yes | SELECT own, UPDATE own | Yes |
| activity_feed | 001 | Yes | None defined | Yes |
| balance_transactions | 002 | Yes | SELECT own, admin SELECT | Yes |
| admin_logs | 002 | Yes | admin SELECT | Yes |
| idempotency_keys | 900/007 | Yes | Allow all | Yes |
| subscription_plans | 900/011 | Yes | Allow all read | Yes |
| user_credits | 005 | **NO** | — | — |
| system_events | 005 | **NO** | — | — |
| stripe_events | 900/010 | Yes | Allow all | Yes |
| user_usage | 900/011 | Yes | Allow all | Yes |
| enterprise_* | 900/012 | Yes | Allow all | Yes |
| payment_recharges | 021 | Yes | Allow all | Yes |
| user_balances | 021 | Yes | Allow all | Yes |

## RLS Assessment

### Effectively Disabled by Design
ALL tables have `Allow all` policies or narrow policies that are bypassed by the service_role key used in every API route. RLS provides **zero real protection** in this architecture.

### Tables Without RLS
- `user_credits` — no RLS at all
- `system_events` — no RLS at all

### No UPDATE/INSERT RLS on Key Tables
- `profiles` — only SELECT and UPDATE for own profile, no INSERT policy (needed for handle_new_user trigger)
- `balance_transactions` — no INSERT RLS policy (so only service_role can insert)

## Schema Issues

### Missing Constraints
```sql
-- profiles.balance: NO check constraint for >= 0
balance DECIMAL(20,2) DEFAULT 0,
-- CRITICAL: should be CHECK (balance >= 0)
```

### Type Mismatch: balance_transactions.type
```
Migration 002 allows:  'unlock', 'deposit', 'admin_adjustment', 'bonus', 'withdrawal'
Code uses:            'adjustment', 'commission', 'topup'
Root 006 redefines:   'deposit', 'unlock', 'topup', 'adjustment', 'refund', 'commission'
-- but 006 has DOUBLE-QUOTED literals (''deposit'' not 'deposit') — syntax error risk
```

### add_balance RPC — the only real protection
```sql
IF new_balance < 0 THEN RAISE EXCEPTION 'Insufficient balance';
```
This is the ONLY safe path. But many code paths bypass it.
