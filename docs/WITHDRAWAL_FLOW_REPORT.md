# WITHDRAWAL FLOW REPORT

## Before Fix (DOUBLE DEDUCTION BUG)

### User POST /api/withdrawals
- CHECK: balance >= amount
- INSERT: balance_transactions(type="adjustment", amount=-amount)
- Computes: balance_after = profile.balance - amount
- RESULT: BALANCE DEDUCTED (user can see reduced balance)

### Admin PUT /api/admin/withdrawals (approve)
- NO verifyAdmin() check!
- READS: current balance from profiles
- CALCULATES: withdrawalAmount = Math.abs(tx.amount)
- CALLS: add_balance(p_amount=-withdrawalAmount) — DEDUCTION #2
- FALLBACK: profiles.update({ balance: currentBalance - withdrawalAmount })
- UPDATES: description JSON with status="approved"
- RESULT: DOUBLE DEDUCTION — user charged twice

## After Fix (SINGLE DEDUCTION)

### User POST /api/withdrawals
- CHECK: balance >= amount (still validates)
- INSERT: balance_transactions(type="withdrawal", amount=0)
  - balance_before = balance_after = current balance (NO CHANGE)
  - description: { amount, coin, network, walletAddress, status="pending" }
- RESULT: Pending record created, NO balance modification

### Admin PUT /api/admin/withdrawals (approve)
- NOW CALLS: verifyAdmin() — admin auth required
- READS: description.amount (the real amount from pending record)
- CALLS: add_balance(p_amount=-withdrawalAmount) — SINGLE deduction
- NO FALLBACK to direct profiles.update()
- UPDATES: balance_transactions with real -amount and correct balance_after
- UPDATES: description JSON with status="approved"
- RESULT: ONE deduction, properly recorded

### Admin PUT /api/admin/withdrawals (reject)
- NOW CALLS: verifyAdmin() — admin auth required
- UPDATES: description JSON with status="rejected"
- NO balance modification
- RESULT: Clean rejection, user balance untouched

## Key Changes
1. POST no longer deducts balance
2. PUT now requires verifyAdmin() 
3. PUT has no fallback to unsafe profiles.update()
4. PUT uses add_balance RPC for safe, atomic deduction
5. Admin GET now queries both "withdrawal" and "adjustment" types
6. Admin GET properly calculates amount from pending records
