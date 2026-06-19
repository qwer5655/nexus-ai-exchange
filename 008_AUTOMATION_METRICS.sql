CREATE TABLE IF NOT EXISTS automation_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_name TEXT NOT NULL,
  triggered_count INT DEFAULT 0,
  affected_users INT DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  revenue_impact DECIMAL(20,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_automation_metrics_rule ON automation_metrics(rule_name);
CREATE INDEX IF NOT EXISTS idx_automation_metrics_created ON automation_metrics(created_at DESC);
ALTER TABLE automation_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all" ON automation_metrics;
CREATE POLICY "Allow all" ON automation_metrics FOR ALL USING (true);
NOTIFY pgrst, ''reload schema'';
