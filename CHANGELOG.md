# CHANGELOG

## Production Hardening — 2026-06-18

### Fixed
- **Withdrawal double deduction**: POST no longer deducts balance; PUT approval now does single deduction via add_balance RPC
- **admin/withdrawals PUT**: Added verifyAdmin() check (was unauthenticated)
- **admin-auth.ts verifyAuth()**: Removed x-admin-email fallback backdoor
- **admin-fetch.ts**: Removed x-admin-email client-side header
- **middleware.ts**: Removed x-admin-email-based rate limit tier and VIP check
- **auth/login-logs**: Removed x-admin-email fallback
- **payment-engine.ts**: Replaced direct profiles.update() with add_balance RPC (2 instances)
- **admin/deposits PUT**: Removed unsafe profiles.update() fallback on RPC failure
- **unlocks POST**: Removed unsafe fallback and duplicate balance_transactions insert
- **setup/make-admin**: Entire route removed (unauthenticated admin creation was exploitable)

### Removed
- **src/app/api/setup/** — 5 unauthenticated dangerous routes (create admin, execute SQL, run migrations)
- **src/app/api/setup-admin/** — 1 unauthenticated admin promotion route  
- **outputs/** — Django migration artifacts, screenshots, old reports
- **scripts/** — 21 development/test/verification scripts
- **docs/verification/** — 6 analytics verification docs
- **Root SQL scripts** — 13 one-time fix scripts not part of migration chain
- **Temp launch scripts** — 24+ .bat, .ps1, .vbs, test scripts
- **OpportunityTable.tsx.bak** — 11KB backup file

### Added
- supabase/migrations/007_balance_constraint.sql — CHECK(balance >= 0) on profiles
- supabase/migrations/008_transaction_type_standardization.sql — Standardized balance_transactions.type CHECK constraint
- src/types/database.ts — TransactionType and DBBalanceTransaction types
- docs/WITHDRAWAL_FLOW_REPORT.md — Before/after withdrawal flow documentation
- docs/SECURITY_FINDINGS.md, docs/FINANCIAL_FLOW_REPORT.md, docs/DEAD_CODE_REPORT.md, docs/AUTH_REPORT.md — Phase 1 audit reports
- docs/ISSUE_VERIFICATION.md — Phase 2 issue verification

### Changed
- Withdrawal flow: pending-only on create, single deduction on admin approval
- Auth flow: all verification now via JWT Bearer token only
- Balance updates: all routes now use add_balance RPC (no direct profiles.update)

### Security
- Removed 2 instances of hardcoded Supabase service_role JWT from source code
- Removed fallback auth mechanism (x-admin-email header)
- Removed 4 unauthenticated/unauthorized admin-level API endpoints
- All remaining API routes now require proper JWT-based authentication
