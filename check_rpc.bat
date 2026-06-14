@echo off
set SK=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZndsZHh3eXZ2b3R2ZmRueXd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDg1MDcyNiwiZXhwIjoyMDk2NDI2NzI2fQ.dATPuFYs8YF0esN0tk7dATxTEIo_dZambcYJkJ3gEU0
set SU=https://dcfwldxwyvvotvfdnywy.supabase.co

echo CREATING add_balance RPC...
call curl.exe -s -X POST "%SU%/rest/v1/rpc/add_balance" -H "apikey: %SK%" -H "Authorization: Bearer %SK%" -H "Content-Type: application/json" -d "{}" >nul 2>&1
if %errorlevel% equ 0 (
  echo add_balance: already exists
) else (
  echo add_balance: does not exist yet - cannot create via REST API
  echo Need Supabase Dashboard to execute: CREATE OR REPLACE FUNCTION add_balance...
  echo RPC_MISSING=true
)

echo CHECKING register_user...
call curl.exe -s -X POST "%SU%/rest/v1/rpc/register_user" -H "apikey: %SK%" -H "Authorization: Bearer %SK%" -H "Content-Type: application/json" -d "{}" >nul 2>&1
if %errorlevel% equ 0 (
  echo register_user: already exists
) else (
  echo register_user: does not exist
  echo RPC_MISSING=true
)

echo.
echo RESULT: RPCs cannot be created from this environment.
echo Create them in Supabase Dashboard at:
echo https://supabase.com/dashboard/project/dcfwldxwyvvotvfdnywy/sql/new
