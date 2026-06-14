-- Growth Analytics & User Retention
ALTER TABLE IF EXISTS analytics_events ADD COLUMN IF NOT EXISTS session_id TEXT;
ALTER TABLE IF EXISTS analytics_events ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE IF EXISTS analytics_events ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE IF EXISTS analytics_events ADD COLUMN IF NOT EXISTS referrer TEXT;
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_date ON analytics_events(user_id, created_at);