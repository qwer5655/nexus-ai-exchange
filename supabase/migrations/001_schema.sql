-- NEXUS AI EXCHANGE - Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT,
  country TEXT DEFAULT 'US',
  vip_level INTEGER DEFAULT 0 CHECK (vip_level >= 0 AND vip_level <= 5),
  balance DECIMAL(20,2) DEFAULT 0,
  total_profit DECIMAL(20,2) DEFAULT 0,
  total_deposit DECIMAL(20,2) DEFAULT 0,
  total_unlocks INTEGER DEFAULT 0,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES profiles(id),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  match_name TEXT NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  league TEXT NOT NULL,
  roi DECIMAL(10,4) NOT NULL,
  profit DECIMAL(10,2) DEFAULT 0,
  volume DECIMAL(10,2) DEFAULT 0,
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  risk_level TEXT CHECK (risk_level IN ('low','medium','high')),
  required_capital DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  ai_report TEXT,
  bookmaker_a TEXT,
  odds_a DECIMAL(6,2),
  bookmaker_b TEXT,
  odds_b DECIMAL(6,2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','published','hidden')),
  is_locked BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unlocks table
CREATE TABLE IF NOT EXISTS unlocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  unlock_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, opportunity_id)
);

-- Deposits table
CREATE TABLE IF NOT EXISTS deposits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coin TEXT NOT NULL,
  amount DECIMAL(20,2) NOT NULL,
  wallet_address TEXT NOT NULL,
  tx_hash TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  commission DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referred_user_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity feed table
CREATE TABLE IF NOT EXISTS activity_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_unlocks_user ON unlocks(user_id);
CREATE INDEX idx_unlocks_opportunity ON unlocks(opportunity_id);
CREATE INDEX idx_deposits_user ON deposits(user_id);
CREATE INDEX idx_deposits_status ON deposits(status);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_activity_feed_created ON activity_feed(created_at DESC);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  ref_code TEXT;
BEGIN
  ref_code := 'NEXUS' || UPPER(SUBSTRING(MD5(NEW.id::TEXT) FROM 1 FOR 8));
  INSERT INTO public.profiles (id, email, username, referral_code)
  VALUES (NEW.id, NEW.email, SPLIT_PART(NEW.email, '@', 1), ref_code);
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

-- RLS Policies: profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies: opportunities
CREATE POLICY "Anyone can read published opportunities"
  ON opportunities FOR SELECT USING (status = 'published');
CREATE POLICY "Admins can CRUD opportunities"
  ON opportunities FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies: unlocks
CREATE POLICY "Users can view own unlocks"
  ON unlocks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create unlocks"
  ON unlocks FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies: deposits
CREATE POLICY "Users can view own deposits"
  ON deposits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create deposits"
  ON deposits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all deposits"
  ON deposits FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can update deposits"
  ON deposits FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies: referrals
CREATE POLICY "Users can view own referrals"
  ON referrals FOR SELECT USING (auth.uid() = referrer_id);

-- RLS Policies: notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Seed data
INSERT INTO opportunities (title, match_name, home_team, away_team, league, roi, profit, volume, confidence, risk_level, required_capital, description, status, is_locked, bookmaker_a, odds_a, bookmaker_b, odds_b)
VALUES
('Canada vs Costa Rica - Group F', 'Canada vs Costa Rica', 'Canada', 'Costa Rica', 'World Cup Group F', 8.24, 835, 12000, 76, 'low', 10000, 'AI-detected arbitrage opportunity between Bet365 and Betfair.', 'published', true, 'Bet365', 2.50, 'Betfair', 2.45),
('Tunisia vs Algeria - Group F', 'Tunisia vs Algeria', 'Tunisia', 'Algeria', 'World Cup Group F', 7.53, 775, 11000, 74, 'low', 10000, 'Strong arbitrage signal detected across North African markets.', 'published', true, 'Bet365', 2.40, 'Betfair', 2.38),
('Brazil vs Argentina - Group A', 'Brazil vs Argentina', 'Brazil', 'Argentina', 'World Cup Group A', 4.25, 438, 45000, 93, 'medium', 10000, 'Premium match with high confidence arbitrage route.', 'published', true, 'Bet365', 2.65, 'Betfair', 2.55),
('Germany vs France - Group B', 'Germany vs France', 'Germany', 'France', 'World Cup Group B', 3.39, 379, 32000, 92, 'medium', 10000, 'European powerhouse match with stable arbitrage opportunity.', 'published', true, 'Bet365', 2.30, 'Betfair', 2.25),
('England vs Spain - Group C', 'England vs Spain', 'England', 'Spain', 'World Cup Group C', 5.13, 492, 28000, 93, 'low', 10000, 'High volume opportunity with strong AI confidence score.', 'published', true, 'Bet365', 2.45, 'Betfair', 2.40);