# Deployment Audit

## Build Result

| Step | Status |
|---|---|
| npm install | 99 packages, 3 vulnerabilities (2 moderate, 1 critical) |
| npm run build | **SUCCESS** ✅ — 134 pages, 0 errors |

## Environment Variables

| Variable | Status | Notes |
|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Set | Production Supabase URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Set | |
| SUPABASE_SERVICE_ROLE_KEY | Set | CRITICAL: exposed in .env files |
| NEXT_PUBLIC_APP_URL | Set | http://localhost:4200 |
| NEXT_PUBLIC_SITE_NAME | Set in .env | UNUSED in code |
| STRIPE_SECRET_KEY | **EMPTY** | Billing will crash at runtime |
| STRIPE_WEBHOOK_SECRET | **EMPTY** | Webhook verification will fail |
| STRIPE_PRICE_ID | Placeholder | price_xxxxxxxxx |
| STRIPE_MODE | dev | Safe |

## Deployment Config Issues

### 1. Service Role Secret in .env Files
`SUPABASE_SERVICE_ROLE_KEY` is in BOTH `.env` and `.env.local`. If `.env` is committed, this powerful key is exposed.

### 2. Incomplete Stripe Configuration
`STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are empty. The billing API routes will fail.

### 3. Middleware Size Warning
Middleware is 34.5 KB — large for an edge function.

### 4. Weak next.config.ts
Missing from config:
- `output: 'standalone'` for Docker/container deployment
- Compression configuration
- Security headers (CSP, HSTS, X-Frame-Options)
- HTTP-to-HTTPS redirects

### 5. Missing Production Infrastructure
- No error monitoring (Sentry, etc.)
- No logging infrastructure
- Rate limiting is in-memory (lost on server restart)
- No health check automation

## npm Dependencies

### Critical vulnerability in next package
1 critical, 2 moderate. Run `npm audit fix` or update next.

### Unused Dependencies
- `pg` (PostgreSQL driver) — NOT used anywhere in source
- `iconv-lite` — NOT used anywhere in source
