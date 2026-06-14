# NEXUS AI EXCHANGE — Backup & Recovery Guide

## Database (Supabase Managed)

Supabase provides automatic daily backups for Pro plans and above.

### Manual Backup

Via Supabase Dashboard:
1. Go to Supabase Dashboard → Database → Backups
2. Click "Create backup"
3. Download the backup file

Via CLI (requires supabase CLI):
```bash
supabase db dump -f backup_$(date +%Y%m%d).sql
```

### Restore from Backup

Via Supabase Dashboard:
1. Go to Database → Backups
2. Select backup → Restore
3. Confirm restoration

Via CLI:
```bash
supabase db restore backup_20240101.sql
```

## Application Code

Source code is managed via Git. To backup:
```bash
git push origin main
```

## Environment Variables

Store securely (never commit to Git):
```bash
cp .env.production ~/secure-backup/.env.production.$(date +%Y%m%d)
```

## Recovery Procedure

### Full Disaster Recovery
1. Provision new VPS
2. Install Node.js 22+
3. Clone repository: `git clone <url>`
4. Restore `.env.production`
5. Run `npm install`
6. Restore database from Supabase backup
7. Run `npm run build && npm start`
8. Verify health endpoint returns OK
