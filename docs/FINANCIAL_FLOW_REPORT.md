# Financial Flow Report — Phase 1 Audit

## Withdrawal Flow

### CURRENT (Broken)
`
User POST /api/withdrawals
  → verifyUser() auth check
  → Check balance >= amount
  → INSERT balance_transactions (type='adjustment', amount=-amount, balance_before=X, balance_after=X-amount)
  → BALANCE DEDUCTED (writing computed balance_after but NOT updating profiles.balance directly)

Admin PUT /api/admin/withdrawals (approve)
  → Parse status from description JSON
  → Check current balance >= withdrawalAmount
  → DEDUCT AGAIN: add_balance(p_amount=-withdrawalAmount) OR profiles.update()
  → Update description with status='approved'
  → DOUBLE DEDUCTION COMPLETE
`

### TARGET
`
User POST /api/withdrawals
  → verifyUser() auth check
  → Check balance >= amount
  → INSERT withdrawal_requests (user_id, amount, coin, network, walletAddress, status='pending')
  → NO balance modification

Admin PUT /api/admin/withdrawals (approve)
  → verifyAdmin() auth check
  → BEGIN TRANSACTION
  → add_balance(p_amount=-amount)  ← single deduction here
  → Update status='approved'
  → COMMIT

Admin PUT /api/admin/withdrawals (reject)
  → verifyAdmin() auth check
  → Update status='rejected'
  → NO balance modification
`

## Deposit Flow

### CURRENT (Functional but fragile)
`
User POST /api/deposits
  → INSERT deposits (user_id, coin, amount, status='pending')
  → No idempotency check

Admin PUT /api/admin/deposits (approve)
  → verifyAdmin() auth check
  → add_balance(p_amount=amount)  OR profiles.update({ balance: newBalance })
  → UPDATE deposits status='approved'
  → Commission distribution (5% to referrer) — wrapped in try/catch with empty body
  → Insert notification
`

### Issues:
1. No idempotency key on deposit creation
2. Commission distribution errors silently swallowed
3. add_balance RPC has a fallback to direct update (bypasses negative check)

## Balance Update Map

### Code paths that modify balances:
1. add_balance RPC — SAFE (has negative check, is atomic)
2. profiles.update({ balance: X }) — UNSAFE (no negative check)
3. profiles.update({ balance: newBalance }) in payment-engine.ts — UNSAFE
4. profiles.update({ balance: targetBalance }) in unlocks/route.ts — UNSAFE
5. profiles.update({ balance: newBalance }) in admin/withdrawals — UNSAFE
6. profiles.update({ balance: X }) in admin/users PATCH — UNSAFE (admin can set any value)
