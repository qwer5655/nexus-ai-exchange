# Security Findings Report — Phase 1 Audit

## CRITICAL ISSUES

### C-1: Withdrawal Double Deduction
**Files:** src/app/api/withdrawals/route.ts, src/app/api/admin/withdrawals/route.ts
**Severity:** CRITICAL — Users lose real money
**Evidence:** 
- POST /api/withdrawals: inserts balance_transactions with mount: -amount, computes alance_after: profile.balance - amount
- PUT /api/admin/withdrawals (approved): calls dd_balance(p_amount: -withdrawalAmount) AGAIN, where withdrawalAmount = Math.abs(tx.amount)
- Result: user is charged TWICE for every approved withdrawal

### C-2: Setup/Admin Backdoor (Unauthenticated)
**Files:** src/app/api/setup/make-admin/route.ts, src/app/api/setup/migrate/route.ts, src/app/api/setup/sql/route.ts, src/app/api/setup-admin/route.ts, src/app/api/setup/verify/route.ts
**Severity:** CRITICAL — Full database compromise
**Evidence:**
- setup/make-admin: Creates admin users with balance=10000 — NO AUTH required
- setup-admin: Promotes first user to admin — NO AUTH required  
- setup/migrate: Contains HARDCODED service_role key, attempts Supabase Management API calls
- setup/sql: Reads SQL schema from filesystem
- setup/verify: Contains HARDCODED service_role JWT in source code

### C-3: Email Header Auth Backdoor (x-admin-email)
**Files:** src/lib/admin-auth.ts, src/lib/admin-fetch.ts, src/middleware.ts, src/app/api/auth/login-logs/route.ts
**Severity:** CRITICAL — Anyone with a valid email can authenticate as admin
**Evidence:**
- dmin-auth.ts:20-27: verifyAuth() falls back to x-admin-email header with NO token verification
- dmin-fetch.ts:23-27: Client sends x-admin-email header as fallback
- middleware.ts:12: Uses x-admin-email for rate limit tier
- middleware.ts:35: Uses x-admin-email for VIP check

## HIGH ISSUES

### H-1: No Balance >= 0 Constraint
**File:** supabase/migrations/001_schema.sql
**Severity:** HIGH — Users can go negative
**Evidence:** alance DECIMAL(20,2) DEFAULT 0 — no CHECK(balance >= 0)
Multiple code paths bypass add_balance RPC and update directly.

### H-2: balance_transactions Type Mismatch
**Files:** supabase/migrations/002_production_security.sql vs all withdrawal/deposit code
**Severity:** HIGH — Financial transactions fail at runtime
**Evidence:** 
Migration allows: 'unlock','deposit','admin_adjustment','bonus','withdrawal'
Code uses: 'adjustment','commission','topup' — CHECK violation on INSERT

### H-3: Arbitrage Engine is Static Seed Data
**File:** supabase/migrations/001_schema.sql
**Severity:** HIGH — Platform misrepresentation
**Evidence:** 5 opportunities are hardcoded INSERT statements. No real-time calculation.

### H-4: Service Role Key Hardcoded in Source
**File:** src/app/api/setup/verify/route.ts, src/app/api/setup/migrate/route.ts
**Severity:** HIGH — Full database key exposed in source code
**Evidence:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... JWT hardcoded

## MEDIUM ISSUES

### M-1: Direct Balance Updates (bypassing add_balance RPC)
**Files:** src/app/api/admin/users/route.ts, src/app/api/unlocks/route.ts, src/app/api/admin/withdrawals/route.ts, src/lib/payment-engine.ts
**Evidence:** Multiple files update profiles.balance directly via .update({ balance: newValue }) instead of calling add_balance RPC

### M-2: Silent catch {} blocks (20 instances)
**Evidence:** Empty catch blocks throughout the codebase swallow errors silently

### M-3: TypeScript strict mode disabled
**File:** 	sconfig.json
**Evidence:** noImplicitAny: false, strictNullChecks: false — 29 ny usages

### M-4: Supabase Service Role bypasses all RLS
**Evidence:** All API routes use supabaseAdmin (service_role). RLS provides zero real protection.
