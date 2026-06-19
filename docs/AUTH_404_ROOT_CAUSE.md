# AUTH 404 ROOT CAUSE REPORT

## 1. Test Results

| URL | Status | HTTP Status | Type |
|-----|--------|-------------|------|
| GET /login | NOT FOUND | 404 | HTML (Next.js default 404 page) |
| GET /register | NOT FOUND | 404 | HTML (Next.js default 404 page) |
| GET / | OK | 200 | HTML (Home page with AuthModalManager) |
| GET /admin | OK | 200 | HTML (Admin page, client-side redirects to /) |
| POST /api/auth/rpc-login | SERVER ERROR | **500** | **HTML (crash - should return JSON)** |
| POST /api/auth/login | VALID | 401 | **JSON (correct format)** |
| GET /api/auth/me | VALID | 401 | JSON (correct format) |

## 2. Root Cause

### Problem: POST /api/auth/rpc-login returns 500

The frontend authStore.login() calls:
`
POST /api/auth/rpc-login
`

This route (src/app/api/auth/rpc-login/route.ts) calls:
`
supabaseAdmin.rpc("verify_login", { p_email, p_password })
`

The verify_login RPC function does NOT exist in the Supabase database.
The call crashes with an unhandled exception.
Next.js returns a 500 HTML error page instead of a JSON error.

### Why this happens

The route has TWO auth mechanisms:

1. supabaseAdmin.rpc("verify_login", ...) - CUSTOM RPC function
   - This RPC function must exist in the Supabase database
   - If it doesn't exist, the call throws an error

2. fallback: fetch(SUPABASE_URL + "/auth/v1/token?grant_type=password")
   - This is the standard Supabase Auth REST API
   - Works correctly but requires email confirmation

The CURRENT flow:
- RPC login route calls verify_login first (CRASHES → 500)
- The fallback never executes because the crash happens first

### Why other routes work

| Route | Path | Result |
|-------|------|--------|
| POST /api/auth/login | src/app/api/auth/login/route.ts | WORKS (returns JSON 401) |
| POST /api/auth/register | src/app/api/auth/register/route.ts | WORKS (returns JSON 201) |
| GET /api/auth/me | src/app/api/auth/me/route.ts | WORKS (returns JSON 401) |

These routes use supabaseAdmin.auth.signInWithPassword() or direct DB calls,
NOT the verify_login RPC function.

### 404 on /login and /register

These are NOT bugs. The system uses modal-based authentication:
- AuthModalManager is rendered in page.tsx (line 84)
- LoginModal and RegisterModal appear as overlays
- No dedicated /login or /register page routes exist

## 3. File Locations

| File | Role |
|------|------|
| src/app/api/auth/rpc-login/route.ts | The BROKEN route (calls verify_login RPC) |
| src/app/api/auth/login/route.ts | The WORKING route (uses signInWithPassword) |
| src/app/page.tsx | Renders AuthModalManager at line 84 |
| src/store/authStore.ts | Frontend login() calls /api/auth/rpc-login |
| src/lib/admin-auth.ts | verifyAuth() uses Bearer token NOT RPC |

## 4. Fix Options (not implemented - audit only)

Option A: Make frontend call /api/auth/login instead of /api/auth/rpc-login
Option B: Create the verify_login RPC function in Supabase
Option C: Fix rpc-login route to catch the RPC error and fall back gracefully

## 5. Conclusion

The 404 on /login and /register is BY DESIGN (modal-based auth).
The REAL login failure is a 500 error on POST /api/auth/rpc-login caused by
a missing verify_login RPC function in the Supabase database.
