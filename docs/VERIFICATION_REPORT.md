# VERIFICATION REPORT

**Based on actual filesystem scan — not derived from historical reports**
**Audit Date:** 2026-06-18

---

## 1. Admin Bypass Paths — CLEAN 🟢

### x-admin-email (Former Backdoor)
Search across all `src/*.ts` and `src/*.tsx`: **ZERO occurrences found**

| File | Status |
|---|---|
| `src/lib/admin-auth.ts` | CLEAN — `verifyAuth()` only accepts Bearer JWT → `supabaseAdmin.auth.getUser(token)` (line 18) |
| `src/lib/admin-fetch.ts` | CLEAN — Only sends `Authorization: Bearer` header, no email fallback |
| `src/middleware.ts` | CLEAN — No VIP check, no email header usage. Rate limit uses uniform 60 req/min |
| `src/app/api/auth/login-logs/route.ts` | CLEAN — Accepts `email` as query parameter only (not header-based) |

### Auth Call Chain (verified)
``` 
Request → middleware.ts (rate limit only)
  → API Route Handler
    → verifyAuth(req): Bearer token → supabaseAdmin.auth.getUser(token) — NO OTHERSource
    → verifyAdmin(req): verifyAuth() + profiles.role check
    → verifyUser(req, userId): verifyAuth() + ownership or admin role check
```

### Setup Routes
**Both deleted directories confirmed missing:**
- `src/app/api/setup/` — does not exist
- `src/app/api/setup-admin/` — does not exist

**No imports or references** to setup routes found in any source file.

---

## 2. Direct Balance Updates — REMAINING ISSUE 🔴

### Payment Engine (main path)
Search for `profiles.*\.update` with `balance` filter: **Only RPC calls found**

| File | Line | Code | Status |
|---|---|---|---|
| `payment-engine.ts` | 46-48 | `.rpc('add_balance', { p_user_id: userId, p_amount: recharge.amount, ... })` | FIXED ✅ |
| `payment-engine.ts` | 70-71 | `.rpc('add_balance', { p_user_id: refBy.referred_by, p_amount: commAmt, ... })` | FIXED ✅ |

### Admin Deposits — Commission Path (MISSED) 🔴
| File | Line | Code | Status |
|---|---|---|---|
| `src/app/api/admin/deposits/route.ts` | ~67 | `await supabaseAdmin.from(''profiles'').update({ balance: refBal + commAmt }).eq(''id'', refBy.referred_by)` | **UNFIXED 🔴** |

**Impact:** Commission distribution for deposits bypasses the `add_balance` RPC, meaning:
- No `CHECK(balance >= 0)` validation
- No audit record created by the RPC (audit record is manually inserted instead)
- If a bug causes the referrer balance to go negative, it will succeed without warning

**Call chain:**
```
PUT /api/admin/deposits (approve)
  → add_balance RPC (main deposit — FIXED)
  → profiles.update({ balance: refBal + commAmt }) (commission — DIRECT, UNSAFE)
  → balance_transactions.insert (manual audit record)
```

### Other Files
| File | Line | Column | Table | Status |
|---|---|---|---|---|
| `credits.ts` | 26 | `credits` | `user_credits` | Not profiles balance — OK ✅ |

---

## 3. Withdrawal Double Deduction — CLEAN 🟢

### POST /api/withdrawals (User creates withdrawal)
| Aspect | Code | Status |
|---|---|---|
| Balance deducted? | `amount: 0`, `balance_after: profile.balance` (no change) | NO — CORRECT ✅ |
| Balance check? | `if (profile.balance < amount) return error` | YES — CORRECT ✅ |
| Auth required? | `verifyUser(req, userId)` | YES — CORRECT ✅ |

### PUT /api/admin/withdrawals (Admin processes)
| Action | Balance Change | Code | Status |
|---|---|---|---|
| `approved` | Single deduction via RPC | `add_balance(p_amount: -withdrawalAmount)` | CORRECT ✅ |
| `approved` | Fallback to direct update? | None — RPC error returns 500 | REMOVED ✅ |
| `rejected` | None | Only updates description JSON | CORRECT ✅ |
| Auth required? | `verifyAdmin(req)` | YES | CORRECT ✅ |

**No double deduction path exists.** POST creates a pending record. PUT (approve) performs the single and only deduction.

---

## 4. Service Role Key Usage — CAUTION 🟡

### All References (Exactly 2)
| File | Line | Usage | Risk |
|---|---|---|---|
| `src/lib/supabase.ts` | 5 | `var key = process.env.SUPABASE_SERVICE_ROLE_KEY` | Normal — creates supabaseAdmin client |
| `src/middleware.ts` | 6 | `var SK = process.env.SUPABASE_SERVICE_ROLE_KEY` | **Actually unused** — was for now-deleted VIP check |

### Hardcoded Keys
| Location | Status |
|---|---|
| `src/app/api/setup/verify/route.ts` | Deleted ✅ |
| `src/app/api/setup/migrate/route.ts` | Deleted ✅ |

### Remaining Concern (Architectural)
All API routes use `supabaseAdmin` (service_role) which bypasses RLS. Security relies entirely on API route code. While all routes now properly verify auth, this is a fragile architecture.

---

## 5. Setup Routes — CLEAN 🟢

| Check | Result |
|---|---|
| `src/app/api/setup/` exists? | No — deleted |
| `src/app/api/setup-admin/` exists? | No — deleted |
| Any file containing `setup/` in import path? | None found |

### Side Finding: Orphaned Frontend Page 🔶
`src/app/(main)/setup/page.tsx` references the deleted API routes:
```javascript
fetch(''/api/setup'')  // returns 404 — no longer exists
fetch(''/api/setup/sql'')  // returns 404 — no longer exists
```

This page will show errors if a user navigates to `/setup`. Non-security issue but causes broken UX.

---

## Summary

| # | Check | Result | Details |
|---|---|---|---|
| 1 | Admin bypass paths | 🟢 CLEAN | No x-admin-email, no setup routes, all JWT-only |
| 2 | Direct balance updates | 🔴 **1 REMAINING** | Commission path in admin/deposits route (line ~67) |
| 3 | Withdrawal double deduction | 🟢 CLEAN | POST no deduction, PUT single RPC deduction |
| 4 | Service role abuse | 🟡 CAUTION | No hardcoded keys, but architectural RLS bypass remains |
| 5 | Setup routes | 🟢 CLEAN | Both API directories confirmed deleted |
