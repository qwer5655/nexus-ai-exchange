@echo off
set SK=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZndsZHh3eXZ2b3R2ZmRueXd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDg1MDcyNiwiZXhwIjoyMDk2NDI2NzI2fQ.dATPuFYs8YF0esN0tk7dATxTEIo_dZambcYJkJ3gEU0
set REF=dcfwldxwyvvotvfdnywy

echo TRYING Management API v1...
call curl.exe -s -X POST "https://api.supabase.com/v1/projects/%REF%/sql" -H "Authorization: Bearer %SK%" -H "Content-Type: application/json" -d "{\"query\":\"SELECT 1\"}" 2>&1
if %errorlevel% equ 0 (
  echo Management API v1: SUCCESS
) else (
  echo Management API v1: FAILED
)

echo.
echo TRYING Management API v0...
call curl.exe -s -X POST "https://api.supabase.com/v0/projects/%REF%/sql" -H "Authorization: Bearer %SK%" -H "Content-Type: application/json" -d "{\"query\":\"SELECT 1\"}" 2>&1
if %errorlevel% equ 0 (
  echo Management API v0: SUCCESS
) else (
  echo Management API v0: FAILED
)
