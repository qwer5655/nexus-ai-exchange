# Authentication & Permissions Audit

## Middleware Analysis

### File: `src/middleware.ts`

| Aspect | Assessment |
|---|---|
| Coverage | Only applies to `/api/:path*` — admin pages are NOT protected by middleware |
| Method | Rate limiting + VIP check only — NO auth enforcement |
| VIP Check | Fetches profile on every analytics request — performance concern |
| Variable style | Uses `var` keyword exclusively (poor practice) |

### Route protection is entirely in the API layer, not middleware.

## Auth Chain

```
Request → Middleware (rate limit, VIP check) → API Route → verifyAdmin/verifyUser → supabaseAdmin
```

## Critical Auth Issues

### 1. Service Role Key Bypasses RLS (CRITICAL DESIGN)
All API routes use `supabaseAdmin` (service_role key). This means:
- **RLS policies are effectively bypassed** for all API requests
- The ONLY protection between a user and another user's data is the `verifyAuth()`/`verifyUser()` function
- If any API route forgets to call verifyAuth, data is exposed

### 2. verifyAuth Falls Back to Email Header (HIGH)
```typescript
// admin-auth.ts:20-27
// If bearer token fails, checks x-admin-email header
// With no token verification at all
```
Anyone who knows a valid user email can set `x-admin-email: user@example.com` and be authenticated.

### 3. No Session Token Rotation
- Login responses include `access_token` but no refresh token management
- No token revocation mechanism
- No session timeout enforcement

### 4. Admin Page Access Control (MEDIUM)
Admin pages (`/admin/*`) are protected only by:
- `AdminComponents.tsx` which checks profile.role client-side
- A user could potentially see the HTML/JS of the admin panel even if the UI hides it

### 5. Admin Page in Main Route Group (LOW)
Two admin route groups exist:
- `/admin/` — primary
- `/(main)/admin/` — overlap with 4 routes (deposits, notifications, opportunities, users)
