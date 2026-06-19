# ISSUE VERIFICATION REPORT

## ISSUE-1: Withdrawal Double Deduction ⚠️ CONFIRMED

### Call Chain:

1. **User POST /api/withdrawals** (src/app/api/withdrawals/route.ts)
   - verifyUser(req, userId) — auth check
   - Check balance >= amount
   - INSERT into balance_transactions:
     - type: 'adjustment'
     - amount: -amount (negative = deduction)
     - balance_before: current balance
     - balance_after: balance_before - amount
   - DEDUCTION HAPPENS HERE: balance_after < balance_before

2. **Admin PUT /api/admin/withdrawals** (src/app/api/admin/withdrawals/route.ts)
   - No verifyAdmin() call! Only checks txId, action, adminId
   - If action=approved:
     - Gets currentBalance from profiles
     - Computes withdrawalAmount = Math.abs(tx.amount) — since amount is already negative
     - Calls add_balance(p_amount: -withdrawalAmount) — DEDUCTION #2
     - FALLBACK: profiles.update({ balance: currentBalance - withdrawalAmount })
   - Updates description JSON with status='approved'

### Root Cause:
- POST deducts balance immediately when user submits (Deduction #1)
- PUT on approval deducts again (Deduction #2)
- Approval also bypasses verifyAdmin() — no admin auth check!

## ISSUE-2: x-admin-email Backdoor ⚠️ CONFIRMED

### All files using x-admin-email:
1. src/lib/admin-auth.ts:20-26 — verifyAuth fallback (CRITICAL)
2. src/lib/admin-fetch.ts:23-27 — client sends email header (HIGH)
3. src/middleware.ts:12 — rate limit tier via email header (MEDIUM)
4. src/middleware.ts:33-47 — VIP check via email header (MEDIUM)
5. src/app/api/auth/login-logs/route.ts:7 — auth via email param (MEDIUM)

### Bypass Method:
Set HTTP header: 'x-admin-email: known_user@example.com'
→ verifyAuth() falls back to: profiles.select('id,role').eq('email', adminEmail)
→ If email exists in profiles table, authentication SUCCEEDS with NO token

## ISSUE-3: Setup Backdoor ⚠️ CONFIRMED

### Routes found (ALREADY DELETED from previous session):
- src/app/api/setup/make-admin/route.ts — Create admin users, balance=10000, NO AUTH
- src/app/api/setup-admin/route.ts — Promote first user to admin, NO AUTH
- src/app/api/setup/migrate/route.ts — Contains HARDCODED service_role JWT key
- src/app/api/setup/sql/route.ts — Reads filesystem SQL schema
- src/app/api/setup/verify/route.ts — Contains HARDCODED service_role JWT key
- src/app/api/setup/route.ts — Lists table existence, NO AUTH

### Status: routes appear to have been removed already. Confirming...

## ISSUE-4: No CHECK(balance >= 0) ⚠️ CONFIRMED

### Evidence (src/app/api/setup/verify/route.ts not found, checking migration):
- profiles.balance DECIMAL(20,2) DEFAULT 0 — no CHECK constraint
- add_balance RPC in 002_production_security.sql checks IF new_balance < 0
- But multiple code paths bypass RPC (direct profiles.update)

## ISSUE-5: Transaction Type Conflict ⚠️ CONFIRMED

### Migration 002 allows:
'unlock', 'deposit', 'admin_adjustment', 'bonus', 'withdrawal'

### Code uses:
- 'adjustment' — withdrawals (src/app/api/withdrawals/route.ts)
- 'commission' — referral commission (src/app/api/admin/deposits/route.ts)
- 'topup' — admin topup (src/app/api/admin/users/route.ts)

### Risk: ALL balance_transactions INSERTs using these types will FAIL with CHECK violation

## ISSUE-6: Arbitrage Engine ⚠️ CONFIRMED FAKE

### Data Source: C — Seed data only
- 001_schema.sql: 5 hardcoded INSERT INTO opportunities
- Fixed values for ROI (3.39-8.24%), profit (379-835), confidence (74-93)
- No real-time odds scanner, no market API integration
- matches API: generates Math.floor(Math.random()*4) scores — completely fabricated
- No scheduled jobs, no calculation engine, no external data source
