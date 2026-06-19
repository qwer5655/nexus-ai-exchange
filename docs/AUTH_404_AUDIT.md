# AUTH 404 AUDIT

## 1. Frontend API Calls (Auth Related)

Frontend exclusively uses these auth endpoints:

| Source | URL | Method |
|--------|-----|--------|
| authStore.ts:login() | /api/auth/rpc-login | POST |
| authStore.ts:register() | /api/auth/register | POST |
| authStore.ts:register() (after) | /api/auth/rpc-login | POST |
| authStore.ts:refreshProfile() | /api/auth/me | GET |
| use-auth-user.tsx | /api/auth/me | GET |
| profile/page.tsx | /api/auth/login-logs | GET |

All modals defer to authStore (LoginModal, RegisterModal).

## 2. Backend API Routes (Auth)

src/app/api/auth/ structure:

  login/route.ts          -> POST
  rpc-login/route.ts      -> POST
  register/route.ts       -> POST
  me/route.ts             -> GET
  login-logs/route.ts     -> GET

## 3. Path Mismatch Analysis

All frontend auth calls map to existing backend routes.

ONE EXCEPTION: POST /api/auth/login is NEVER called by any frontend component.
The frontend exclusively uses /api/auth/rpc-login for all login operations.

## 4. pages/api Directory

Not found. Project uses App Router (src/app/api/) exclusively.

## 5. Middleware Rules (src/middleware.ts)

Rate-limit (60 req/min) applied to:
  /api/auth/*
  /api/unlocks
  /api/deposits
  /api/admin/*
  /api/billing/*

No rewrite rules. No auth session middleware.

## 6. next.config.ts

Only images.remotePatterns configured.
No rewrite or redirect rules.

## 7. Summary

POST /api/auth/rpc-login -> ACTIVE (used by authStore)
POST /api/auth/register  -> ACTIVE (used by authStore)
GET  /api/auth/me        -> ACTIVE (used by authStore + useAuthUser)
GET  /api/auth/login-logs -> ACTIVE (used by profile page)
POST /api/auth/login     -> ORPHAN (exists but never called)

## 8. Conclusion

No 404 path mismatches found.
POST /api/auth/login is dead code - frontend uses rpc-login instead.
