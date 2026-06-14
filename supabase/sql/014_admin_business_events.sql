-- P3-5 Business Events — Add status columns and time-range fields
-- Run after 013_admin_backend.sql

ALTER TABLE wallets ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active','disabled','pending'));
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS start_at TIMESTAMPTZ;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS end_at TIMESTAMPTZ;

NOTIFY pgrst, 'reload schema';
