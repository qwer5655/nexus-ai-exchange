Write-Host 'STEP 1: 检查 psql...'
try { Get-Command psql -ErrorAction Stop; Write-Host 'psql available' } catch { Write-Host 'psql not installed - using Supabase Dashboard instead' }

Write-Host ''
Write-Host 'RPC SQL to execute in Supabase Dashboard:'
Write-Host 'https://supabase.com/dashboard/project/dcfwldxwyvvotvfdnywy/sql/new'
Write-Host @'
-- add_balance RPC
CREATE OR REPLACE FUNCTION add_balance(p_user_id UUID, p_amount NUMERIC, p_type TEXT DEFAULT 'adjustment', p_reference_type TEXT DEFAULT NULL, p_reference_id UUID DEFAULT NULL)
RETURNS void AS 
BEGIN
  UPDATE profiles SET balance = COALESCE(balance, 0) + p_amount WHERE id = p_user_id;
END;
 LANGUAGE plpgsql;

-- register_user RPC
CREATE OR REPLACE FUNCTION register_user(p_email TEXT, p_password TEXT, p_username TEXT, p_country TEXT DEFAULT 'USA')
RETURNS UUID AS 
DECLARE new_id UUID;
BEGIN
  INSERT INTO profiles (email, username, country)
  VALUES (p_email, p_username, p_country)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
 LANGUAGE plpgsql;
'@

Write-Host ''
Write-Host 'STEP 2: 重启服务器...'
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Use cmd /c to avoid Start-Process PATH bug
cmd /c start /B npm.cmd run start -- -p 3000
Start-Sleep -Seconds 8

Write-Host 'STEP 3: 运行验收...'
Write-Host 'Executing from correct path:'
node --experimental-strip-types "C:\Users\benjo\Documents\Codex\2026-06-07\codex-claude-code-cursor-devin-50\fifa-arbitrage\scripts\full-flow-acceptance.ts"
