# Dead Code Report — Phase 1 Audit

## Directories to Delete

### outputs/ (entire directory)
- outputs/DJANGO_DELETION_CHECKLIST.md
- outputs/DJANGO_REMOVAL_REPORT.md
- outputs/screenshot_home.png
- outputs/SYSTEM_WITHOUT_DJANGO_REPORT.md
- outputs/uat_dashboard.png
These are Django migration artifacts — no longer relevant.

### scripts/ (entire directory — 21 files)
All are development/test/verification scripts:
- acceptance-report.json, check_schema.mjs, check_withdraw_table.mjs
- create_test_user.mjs, fix_deposits.js, fix_emails.js, fix_logs.js
- fix_script.cjs, fix_test.js, full-flow-acceptance.ts, migration-check.ts
- p2-final-lock-report.md, p3-2-stripe-production-test.ts, p3-3-plan-test.ts
- p3-4-enterprise-test.ts, p3-subscription-test.ts, runner.mjs
- setup_test_data.mjs, try_passwords.cjs, uat_test.mjs, wallet-crud-verify.mjs

### docs/verification/ (entire directory — 6 files)
- cohort.md, event.md, export.md, growth.md, retention.md, stats.md
These are analytics verification docs — development artifacts.

## Files to Delete

### Backup files
- src/components/opportunities/OpportunityTable.tsx.bak (11KB)

### Root-level SQL fix scripts (13 files — not part of migration chain)
- 005_LOGIN_LOGS_FIX.sql
- 006_BALANCE_TRANSACTIONS.sql
- 007_IDEMPOTENCY_KEYS.sql
- 008_AUTOMATION_METRICS.sql
- create_admin.sql
- CREATE_ADMIN_LOGS_TABLE.sql
- FIX_ADMIN_AUTH.sql
- FIX_ADMIN_LOGS.sql
- FIX_LOGIN_LOGS_FINAL.sql
- FIX_SCHEMA_CACHE.sql
- SUPABASE_ADD_BALANCE_RPC.sql
- SUPABASE_REGISTER_RPC.sql

### Root-level batch/launch/test scripts (24 files)
- check_rpc.bat, run_all.bat, start-server.bat, start_dev.bat, start_prod.bat
- start_prod_bg.bat, start_prod_bg2.bat, try_mgmt_api.bat
- reg_admin.ps1, run_final.ps1, set_admin.ps1
- launch_server.vbs, start_3000.vbs, start_3005.vbs, start_prod.vbs
- start_prod_v2.vbs, start_server.vbs
- start_dev.js, start_prod.js, start_dev.mjs
- test_playwright.mjs, test_uat_full.mjs
- run-npm-install.cmd

### Root-level MD reports (5 files)
- BACKUP.md, DEPLOYMENT.md, DEPLOY_QUICKSTART.md
- FINAL_DEPLOYMENT_REPORT.md, GROWTH_REPORT.md, MONITORING.md
- POST_LAUNCH_ANALYTICS_REPORT.md, REAL_ACCOUNT_PARITY_AUDIT.md
- REGISTER_FIX_REPORT.md, RELEASE_GATE_FINAL.md, UAT_FIX_REPORT.md

## Files to KEEP
- deploy/ (VPS deployment scripts — still needed for production)
- supabase/migrations/ (formal migrations — keep)
- supabase/sql/ (extension SQL scripts — keep)
- docs/*.md (audit reports generated in this session — keep)
- .env, .env.local, .env.production, .env.production.example (config — keep)
- next.config.ts, tsconfig.json, package.json, postcss.config.mjs (config — keep)
- 前端后端.txt (notes — keep)
