ALTER TABLE wallets ADD COLUMN IF NOT EXISTS name TEXT DEFAULT '';
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS qr_code_url TEXT DEFAULT '';
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'crypto' CHECK (provider IN ('crypto','manual','stripe','other'));
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS vendor TEXT DEFAULT '';

-- Update seed data
UPDATE wallets SET name = coin || ' Wallet', vendor = coin WHERE name = '' OR vendor = '';

NOTIFY pgrst, 'reload schema';
