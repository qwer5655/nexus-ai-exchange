ssh root@149.28.23.92 "apt install -y postgresql-client && PGPASSWORD=postgres psql -h localhost -U postgres -d postgres -c \"UPDATE profiles SET role='admin' WHERE email!=''\"" 2>&1
if ( -eq 0) { Write-Host "Admin set successfully! Go to https://proodd.com/admin" -ForegroundColor Green }
else { Write-Host "Failed. Trying Supabase approach..." -ForegroundColor Yellow }
