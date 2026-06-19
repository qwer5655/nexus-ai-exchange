@echo off
cd /d C:\Users\benjo\Documents\Codex\2026-06-07\codex-claude-code-cursor-devin-50\fifa-arbitrage

echo SERVER: Starting...
start /B npm.cmd run start -- -p 3000 > server_bg_log.txt 2>&1

echo SERVER: Waiting 9s...
ping -n 10 127.0.0.1 >nul

echo SERVER: Checking...
curl.exe -s http://localhost:3000/api/health >nul 2>&1
if errorlevel 1 (
  echo SERVER_NOT_RUNNING
  exit /b 1
)
echo SERVER: Running OK

echo RPC_CHECK: Checking add_balance...
REM Try calling add_balance RPC via Supabase REST API
curl.exe -s -X POST "https://dcfwldxwyvvotvfdnywy.supabase.co/rest/v1/rpc/add_balance" -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZndsZHh3eXZ2b3R2ZmRueXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NTA3MjYsImV4cCI6MjA5NjQyNjcyNn0.hoVRtNWXr0nzYLaQlR3yTlnOXUOlgBTYPMM1WdFBXjk" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZndsZHh3eXZ2b3R2ZmRueXd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDg1MDcyNiwiZXhwIjoyMDk2NDI2NzI2fQ.dATPuFYs8YF0esN0tk7dATxTEIo_dZambcYJkJ3gEU0" -H "Content-Type: application/json" -d "{}" >nul 2>&1
if errorlevel 1 (
  echo ADD_BALANCE_RPC_MISSING
) else (
  echo RPC_FOUND=true
)

echo TEST: Running acceptance test...
node --experimental-strip-types scripts/full-flow-acceptance.ts

echo DONE
