ALTER TABLE wallets ADD COLUMN IF NOT EXISTS icon_url TEXT DEFAULT '';
NOTIFY pgrst, 'reload schema';
