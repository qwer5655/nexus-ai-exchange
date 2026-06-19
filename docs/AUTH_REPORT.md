# Auth Report — Phase 1 Audit

## Authentication Chain

`
Client Request
  → Next.js Middleware (rate limit only, NO auth)
  → API Route Handler
     → verifyAuth() or verifyAdmin() or verifyUser() from admin-auth.ts
        → Try JWT Bearer token via supabaseAdmin.auth.getUser()
        → FALLBACK: x-admin-email header (BACKDOOR)
     → If admin: verifyAdmin() checks profiles.role
`

## Files Using x-admin-email

| File | Line | Usage | Severity |
|---|---|---|---|
| src/lib/admin-auth.ts | 18-26 | verifyAuth fallback — no token verification | CRITICAL |
| src/lib/admin-fetch.ts | 23-27 | Client sends x-admin-email header | HIGH |
| src/middleware.ts | 12 | Rate limit tier check | LOW |
| src/middleware.ts | 33-47 | VIP check via email header | MEDIUM |
| src/app/api/auth/login-logs/route.ts | 7 | Auth via email header | HIGH |

## Auth Verification Coverage

### Routes with VERIFY AUTH:
- /api/auth/me — Bearer token (PROPER)
- /api/admin/* (all 28 routes) — verifyAdmin() 
- /api/deposits — verifyUser()
- /api/withdrawals — verifyUser()
- /api/unlocks — verifyUser()

### Routes WITHOUT AUTH:
- /api/setup/* (5 routes) — NO AUTH (CRITICAL — already being deleted)
- /api/setup-admin — NO AUTH (CRITICAL — already being deleted)
- /api/auth/login — NO AUTH (login — by design)
- /api/auth/rpc-login — NO AUTH (login — by design)
- /api/auth/register — NO AUTH (register — by design)
- /api/public/* — NO AUTH (public — by design)
- /api/health — NO AUTH (health check — acceptable)
- /api/opportunities — NO AUTH (public opportunity listing)

## Service Role Key Usage

SUPABASE_SERVICE_ROLE_KEY is used in:
1. src/lib/supabase.ts — creates supabaseAdmin client
2. src/middleware.ts — fetches profiles for VIP check
3. src/app/api/setup/verify/route.ts — HARDCODED JWT in source
4. src/app/api/setup/migrate/route.ts — HARDCODED JWT in source

The service_role key bypasses ALL RLS policies. Every API route uses it.
