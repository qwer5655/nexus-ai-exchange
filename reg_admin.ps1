# 一键设置管理员 - 在 PowerShell 中运行
 = @{email=""password="Admin1234!"username="admin"country="US"} | ConvertTo-Json
Invoke-RestMethod -Uri "https://proodd.com/api/auth/register" -Method Post -ContentType "application/json" -Body 

# 然后查一下刚注册的用户 ID，设为 admin
 = Invoke-RestMethod -Uri "https://proodd.com/api/auth/register" -Method Post -ContentType "application/json" -Body (@{email=""password="Admin1234!"username="admin"country="US"} | ConvertTo-Json)
Write-Host "========================================"
Write-Host "注册成功！用户ID: "
Write-Host "========================================"
Write-Host ""
Write-Host "现在把这个链接在浏览器打开："
Write-Host "https://supabase.com/dashboard/project/dcfwldxwyvvotvfdnywy"
Write-Host ""
Write-Host "进去后: Table Editor -> profiles -> 找到 admin -> 把 role 改成 admin"
