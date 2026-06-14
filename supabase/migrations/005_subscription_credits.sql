-- Subscription & Credits System
-- Add vip subscription fields to profiles
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS vip_expires_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS vip_src TEXT DEFAULT 'manual';

-- Create user_credits table  
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 100,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create system_events table for billing events
CREATE TABLE IF NOT EXISTS system_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  event_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_events_user_type ON system_events(user_id, event_type);
CREATE INDEX IF NOT EXISTS idx_system_events_created ON system_events(created_at);
