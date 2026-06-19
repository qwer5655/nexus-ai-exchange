-- 025: Database Reality — Missing Tables
-- Tables referenced by existing API routes but never defined

-- ===== 1. announcements (used by /api/public/news) =====
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  message TEXT,
  category TEXT DEFAULT ''Platform'',
  image_url TEXT,
  ai_summary TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all announcements" ON announcements;
CREATE POLICY "Allow all announcements" ON announcements FOR ALL USING (true);

-- ===== 2. players (used by /api/public/players) =====
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country TEXT,
  flag TEXT,
  goals INTEGER DEFAULT 0,
  market_popularity INTEGER DEFAULT 0,
  ai_score INTEGER DEFAULT 0,
  position TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all players" ON players;
CREATE POLICY "Allow all players" ON players FOR ALL USING (true);

-- ===== 3. banners (used by /api/public/banners + admin CRUD) =====
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  image_url TEXT,
  link_url TEXT,
  position TEXT DEFAULT ''home'',
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all banners" ON banners;
CREATE POLICY "Allow all banners" ON banners FOR ALL USING (true);

-- ===== 4. news (alternative to announcements, not yet used by API) =====
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  summary TEXT,
  image TEXT,
  category TEXT DEFAULT ''Platform'',
  date TEXT,
  ai_summary TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all news" ON news;
CREATE POLICY "Allow all news" ON news FOR ALL USING (true);

-- Seed data
INSERT INTO announcements (title, content, message, category, published) VALUES
  (''AI Detects Major Arbitrage Opportunity'', ''Our AI engine has identified a 4.27% yield opportunity in the upcoming World Cup clash between Brazil and Argentina.'', ''High confidence arbitrage opportunity detected in Group A match.'', ''Market'', true),
  (''Platform Expansion Complete'', ''AI market scanner now covers 127 countries, scanning 8,741 markets in real-time.'', ''Detection rate increased by 34% with expanded market coverage.'', ''Platform'', true),
  (''New VIP Tiers Available'', ''Introducing enhanced VIP benefits with lower thresholds and higher rewards.'', ''Check the VIP page for updated tier benefits and pricing.'', ''Platform'', true)
ON CONFLICT DO NOTHING;

NOTIFY pgrst, ''reload schema'';
