-- Tier System & Abuse Control
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free';
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON profiles(tier);
