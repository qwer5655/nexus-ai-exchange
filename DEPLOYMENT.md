# NEXUS AI EXCHANGE — Deployment Guide

## Prerequisites
- Node.js 22+ (included in `.node/` directory)
- PostgreSQL (via Supabase — managed)
- Domain name (configured DNS)
- Cloudflare account (recommended for CDN + SSL)

## Environment Variables

Copy `.env.production.example` to `.env.production` and fill in:

```bash
cp .env.production.example .env.production
# Edit .env.production with your values
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service_role key (server-side only)
- `NEXT_PUBLIC_APP_URL` — https://your-domain.com

## VPS Deployment with PM2

### 1. Install Node.js (if not using bundled)
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Clone and install
```bash
git clone <repo-url> /var/www/nexus-ai
cd /var/www/nexus-ai
npm install
```

### 3. Install PM2
```bash
npm install -g pm2
```

### 4. Build and start
```bash
npm run build
pm2 start npm --name "nexus-ai" -- start -- --port 3000
pm2 save
pm2 startup
```

### 5. PM2 commands
```bash
pm2 status           # Check status
pm2 logs nexus-ai    # View logs
pm2 restart nexus-ai # Restart
pm2 stop nexus-ai    # Stop
```

## Nginx Reverse Proxy

Create `/etc/nginx/sites-available/nexus-ai`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## SSL with Let's Encrypt
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Cloudflare Setup
1. Add your domain to Cloudflare
2. Update nameservers at your domain registrar
3. Set SSL/TLS to Full (Strict)
4. Enable Auto Minify (HTML, CSS, JS)
5. Configure caching rules for static assets
6. Enable Bot Fight Mode (optional)

## Health Check

After deployment, verify:
```bash
curl https://your-domain.com/api/health
# Expected: { "status": "ok", ... }
```

## Database Migrations

Run the security migration in Supabase Dashboard SQL Editor:
```sql
-- Copy contents of supabase/migrations/002_production_security.sql
-- Execute in Supabase Dashboard → SQL Editor
```

Also expose the `auth` schema:
1. Supabase Dashboard → Settings → API
2. Add `auth` to the exposed schemas list
