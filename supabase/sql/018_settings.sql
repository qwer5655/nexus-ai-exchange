-- P4 Settings tables
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name TEXT DEFAULT 'NEXUS AI Exchange',
  site_desc TEXT DEFAULT '',
  contact_email TEXT DEFAULT '',
  telegram TEXT DEFAULT '',
  twitter TEXT DEFAULT '',
  discord TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all site_settings" ON site_settings;
CREATE POLICY "Allow all site_settings" ON site_settings FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS email_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  smtp_host TEXT DEFAULT '',
  smtp_port TEXT DEFAULT '587',
  smtp_user TEXT DEFAULT '',
  smtp_password TEXT DEFAULT '',
  from_email TEXT DEFAULT '',
  enabled BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all email_settings" ON email_settings;
CREATE POLICY "Allow all email_settings" ON email_settings FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS payment_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  min_deposit DECIMAL DEFAULT 10,
  max_deposit DECIMAL DEFAULT 10000,
  allowed_coins TEXT DEFAULT 'BTC,ETH,USDT,BNB,SOL',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all payment_settings" ON payment_settings;
CREATE POLICY "Allow all payment_settings" ON payment_settings FOR ALL USING (true);

-- Seed defaults
INSERT INTO site_settings (site_name, site_desc, contact_email) VALUES ('NEXUS AI Exchange', 'AI-powered sports arbitrage platform', 'admin@proodd.com') ON CONFLICT DO NOTHING;
INSERT INTO email_settings (smtp_port, from_email) VALUES ('587', 'noreply@proodd.com') ON CONFLICT DO NOTHING;
INSERT INTO payment_settings (min_deposit, max_deposit, allowed_coins) VALUES (10, 10000, 'BTC,ETH,USDT,BNB,SOL') ON CONFLICT DO NOTHING;

NOTIFY pgrst, 'reload schema';
