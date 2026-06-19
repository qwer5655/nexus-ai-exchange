# Financial Security Audit — CRITICAL FINDINGS

## Risk Level: CRITICAL — Cannot deploy without fixes

---

## FINDING 1: Withdrawal Double Deduction (CRITICAL)

### Location
- `src/app/api/withdrawals/route.ts` — POST handler
- `src/app/api/admin/withdrawals/route.ts` — PUT handler (approval)

### Flow
1. **User POST /api/withdrawals**: Deducts `-amount` from balance immediately via balance_transactions type='adjustment'
2. **Admin PUT /api/admin/withdrawals (approve)**: Deducts `-withdrawalAmount` AGAIN via `add_balance()`

### Impact
Approved withdrawals charge the user **TWICE**. The second deduction happens because:
- POST already computes `balance_after = profile.balance - amount`
- PUT approval recalculates `currentBalance - withdrawalAmount` and deducts again

### Proof
```typescript
// POST /api/withdrawals (immediately deducts):
balance_after: profile.balance - amount  // DEDUCTION #1

// PUT /api/admin/withdrawals (on approval, deducts AGAIN):
add_balance(p_amount: -withdrawalAmount)  // DEDUCTION #2
```

---

## FINDING 2: No Balance >= 0 Constraint (CRITICAL)

### Location
`supabase/migrations/001_schema.sql`:
```sql
balance DECIMAL(20,2) DEFAULT 0,
-- NO CHECK (balance >= 0)!!!
```

### Impact
- The `add_balance` RPC function checks `IF new_balance < 0 THEN RAISE EXCEPTION`
- But **multiple code paths bypass** the RPC and update `profiles.balance` directly:
  - `admin/users` PATCH: direct `profiles.update({ balance: newValue })`
  - `unlocks` POST fallback: `profiles.update({ balance: targetBalance })`
  - `admin/withdrawals` PUT fallback: `profiles.update({ balance: newBalance })`
  - `payment-engine.ts` commission distribution: direct `profiles.update()`
- A bug in any bypass path can create **negative balances**

---

## FINDING 3: balance_transactions Type Mismatch (CRITICAL)

### The Problem
Two competing CHECK constraints exist for `balance_transactions.type`:

**Migration 002** (safe path):
```sql
CHECK (type IN ('unlock', 'deposit', 'admin_adjustment', 'bonus', 'withdrawal'))
```

**Root SQL 006** (intended replacement — but `CREATE TABLE IF NOT EXISTS` is a no-op):
```sql
CHECK (type IN ('deposit', 'unlock', 'topup', 'adjustment', 'refund', 'commission'))
-- NOTE: uses ''double'' quotes — syntax error in standard SQL context
```

**Code expects**: `adjustment`, `commission`, `topup`
**Migration allows**: `admin_adjustment`, `withdrawal`, `bonus`

### Impact
- Fresh migration will have **002's constraints**
- Code will fail at runtime with CHECK violation:
  - Withdrawals → INSERT with type='adjustment' → FAIL
  - Commission distribution → INSERT with type='commission' → FAIL
  - Admin topup → INSERT with type='topup' → FAIL

---

## FINDING 4: No Withdrawal Request Workflow (HIGH)

### Issues
1. No dedicated `withdrawal_requests` table
2. Withdrawal approval status is stored inside `description` JSON field (not a real status column)
3. No proper state machine: pending → approved/rejected is metadata in free-text JSON
4. `reference_id` = `userId + '_' + Date.now()` — not a proper idempotency key

---

## FINDING 5: Admin Balance Manipulation (HIGH)

### Location
`src/app/api/admin/users/route.ts` — PATCH handler

### Issue
Admin can set ANY balance value with no limits:
```typescript
var allowedFields = ['balance', 'vip_level', 'role', 'username', 'country']
safeUpdates.balance = updates.balance  // No max limit, no audit threshold
```

No approval workflow for large balance changes.

---

## FINDING 6: Silent Error Swallowing (HIGH)

20 instances of `catch {}` or `catch(e) {}` with empty bodies in the codebase. In financial code specifically:

| File | Line | Context |
|---|---|---|
| payment-engine.ts | 60 | Commission auto-distribution — errors silently ignored |
| payment-engine.ts | 77 | VIP evaluation after recharge — errors ignored |
| credits.ts | 34,36,55,57 | Credit operations — errors ignored |
| abuse-control.ts | 92,103 | Abuse control — errors ignored |

### Impact
Financial errors that should fail loudly (commission distribution failure, recharge processing failure) are silently absorbed. Users or admins never know a financial operation partially failed.

---

## FINDING 7: Missing Idempotency Key on Deposits (MEDIUM)

Deposit POST does NOT check for idempotency:
```typescript
POST /api/deposits: No idempotency_key check
```

Client retry could create duplicate deposit records.
