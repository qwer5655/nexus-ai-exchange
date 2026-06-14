# NEXUS AI EXCHANGE — Monitoring Guide

## Recommended Tools

### 1. Sentry — Error Tracking
Website: https://sentry.io

Setup:
```bash
npm install @sentry/nextjs
```

Add to `sentry.client.config.ts` and `sentry.server.config.ts`:
```typescript
import * as Sentry from '@sentry/nextjs';
Sentry.init({
  dsn: 'https://your-dsn@oXXXXX.ingest.sentry.io/XXXXX',
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
```

### 2. Uptime Kuma — Uptime Monitoring
Website: https://github.com/louislam/uptime-kuma

Monitor these endpoints every 60 seconds:
- `https://your-domain.com/api/health` — Main health check
- `https://your-domain.com/` — Frontend availability

### 3. PostHog — Product Analytics
Website: https://posthog.com

Setup:
```bash
npm install posthog-js
```

### 4. PM2 Monitoring
```bash
pm2 monit           # Real-time monitoring dashboard
pm2 status          # Process status
pm2 logs nexus-ai   # Live logs
```

### 5. Supabase Monitoring
Built-in in Supabase Dashboard:
- Database health
- Auth events
- API usage
- Storage usage

## Alert Thresholds

| Metric | Warning | Critical |
|---|---|---|
| Uptime | < 99.5% | < 99% |
| Response Time | > 2s | > 5s |
| Error Rate | > 0.5% | > 2% |
| CPU Usage | > 70% | > 90% |
| Memory Usage | > 80% | > 95% |
| Disk Usage | > 80% | > 90% |
