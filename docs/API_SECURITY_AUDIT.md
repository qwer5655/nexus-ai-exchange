# API Security Audit

## API Route Census

| Category | Count | Auth Required | Admin Required | Input Validation |
|---|---|---|---|---|
| Auth (login, register, etc.) | 5 | N/A (auth routes) | No | Minimal |
| User (deposits, withdrawals) | 2 | Yes (verifyUser) | No | Minimal |
| Public (matches, news, etc.) | 7 | No | No | None |
| Billing (subscribe, webhook, etc.) | 6 | Varies | No | Minimal |
| Admin API routes | 28 | N/A | Yes (verifyAdmin) | Minimal |
| Setup/Migration | 5 | No (!!!) | No | None |
| Health/Diag | 2 | No | No | None |

## Findings

### Finding 1: Setup APIs are Open (HIGH)
`/api/setup/*`, `/api/setup-admin/*` have NO authentication. Anyone can:
- Create admin users (`/api/setup/make-admin`)
- Run arbitrary SQL (`/api/setup/sql`)
- Run database migrations (`/api/setup/migrate`)

### Finding 2: Rate Limiting is Basic (MEDIUM)
Middleware rate limits by IP, but:
- No per-user rate limits
- Admin rate limits are only slightly higher (200 vs 60 req/min)
- No distributed rate limiting (in-memory store, lost on restart)

### Finding 3: SQL Injection via ILIKE (LOW)
Several API routes use `ilike.%${search}%` — while Supabase JS client parameterizes, the raw ILIKE pattern could leak data through timing attacks.

### Finding 4: No Input Validation Library (MEDIUM)
Zod is a dependency but never used. All validation is manual:
```typescript
if (!userId || !amount || !walletAddress) {  // Manual checks only
```

### Finding 5: verifyAuth Admin Email Fallback (MEDIUM)
```typescript
// admin-auth.ts line ~23
// Fallback: check x-admin-email (used when GoTrue is unavailable)
```
The `x-admin-email` header fallback lets ANY user with a valid profile email obtain authentication — no token verification.

## Auth Routes Details

| Route | Auth | Notes |
|---|---|---|
| POST /api/auth/login | None | Uses supabaseAdmin signInWithPassword |
| POST /api/auth/rpc-login | None | Custom RPC + GoTrue password grant — three silent error strategies for logging |
| POST /api/auth/register | None | Two fallback methods, both send passwords in cleartext |
| GET /api/auth/me | Bearer token | Proper token verification |
| GET /api/auth/login-logs | x-admin-email | Authenticated via email header only |
