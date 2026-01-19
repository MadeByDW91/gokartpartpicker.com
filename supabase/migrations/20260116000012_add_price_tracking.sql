-- ============================================================================
-- Add Price Tracking and Alerts
-- Created: 2026-01-16
-- Description: Track price history and enable price drop alerts
-- Owner: Agent A3 (UI)
-- ============================================================================

-- ============================================================================
-- PRICE_HISTORY TABLE
-- ============================================================================

CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  engine_id UUID REFERENCES engines(id) ON DELETE CASCADE,
  part_id UUID REFERENCES parts(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
  source TEXT, -- 'harbor_freight', 'amazon', 'direct', etc.
  checked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_price_history_engine ON price_history(engine_id, checked_at DESC);
CREATE INDEX idx_price_history_part ON price_history(part_id, checked_at DESC);
CREATE INDEX idx_price_history_checked ON price_history(checked_at DESC);

COMMENT ON TABLE price_history IS 'Historical price tracking for engines and parts';
COMMENT ON COLUMN price_history.source IS 'Price source (harbor_freight, amazon, direct, etc.)';

-- ============================================================================
-- PRICE_ALERTS TABLE
-- ============================================================================

CREATE TABLE price_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  engine_id UUID REFERENCES engines(id) ON DELETE CASCADE,
  part_id UUID REFERENCES parts(id) ON DELETE CASCADE,
  target_price DECIMAL(10,2) NOT NULL, -- Alert when price drops below this
  current_price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  email_notifications BOOLEAN DEFAULT true NOT NULL,
  in_app_notifications BOOLEAN DEFAULT true NOT NULL,
  last_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT check_item CHECK (
    (engine_id IS NOT NULL AND part_id IS NULL) OR
    (engine_id IS NULL AND part_id IS NOT NULL)
  )
);

CREATE INDEX idx_price_alerts_user ON price_alerts(user_id, is_active);
CREATE INDEX idx_price_alerts_engine ON price_alerts(engine_id);
CREATE INDEX idx_price_alerts_part ON price_alerts(part_id);
CREATE INDEX idx_price_alerts_active ON price_alerts(is_active) WHERE is_active = true;

COMMENT ON TABLE price_alerts IS 'User price drop alerts for engines and parts';

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

CREATE TRIGGER update_price_alerts_updated_at
  BEFORE UPDATE ON price_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Price history is viewable by everyone
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Price history is viewable by everyone"
  ON price_history
  FOR SELECT
  USING (true);

-- Only admins can insert price history
CREATE POLICY "Only admins can insert price history"
  ON price_history
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Price alerts are private to users
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own alerts"
  ON price_alerts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own alerts"
  ON price_alerts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
  ON price_alerts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
  ON price_alerts
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTION: Get price change percentage
-- ============================================================================

CREATE OR REPLACE FUNCTION get_price_change(
  p_engine_id UUID DEFAULT NULL,
  p_part_id UUID DEFAULT NULL,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  current_price DECIMAL,
  previous_price DECIMAL,
  change_amount DECIMAL,
  change_percentage DECIMAL,
  days_ago INTEGER
) AS $$
BEGIN
  IF p_engine_id IS NOT NULL THEN
    RETURN QUERY
    WITH current AS (
      SELECT price, checked_at
      FROM price_history
      WHERE engine_id = p_engine_id
      ORDER BY checked_at DESC
      LIMIT 1
    ),
    previous AS (
      SELECT price, checked_at, 
             EXTRACT(DAY FROM (SELECT checked_at FROM current) - checked_at)::INTEGER AS days_diff
      FROM price_history
      WHERE engine_id = p_engine_id
        AND checked_at < (SELECT checked_at FROM current)
      ORDER BY checked_at DESC
      LIMIT 1
    )
    SELECT
      c.price AS current_price,
      p.price AS previous_price,
      (c.price - p.price) AS change_amount,
      CASE WHEN p.price > 0 THEN ((c.price - p.price) / p.price * 100) ELSE 0 END AS change_percentage,
      p.days_diff AS days_ago
    FROM current c
    CROSS JOIN previous p
    WHERE p.days_diff <= p_days;
  ELSIF p_part_id IS NOT NULL THEN
    RETURN QUERY
    WITH current AS (
      SELECT price, checked_at
      FROM price_history
      WHERE part_id = p_part_id
      ORDER BY checked_at DESC
      LIMIT 1
    ),
    previous AS (
      SELECT price, checked_at,
             EXTRACT(DAY FROM (SELECT checked_at FROM current) - checked_at)::INTEGER AS days_diff
      FROM price_history
      WHERE part_id = p_part_id
        AND checked_at < (SELECT checked_at FROM current)
      ORDER BY checked_at DESC
      LIMIT 1
    )
    SELECT
      c.price AS current_price,
      p.price AS previous_price,
      (c.price - p.price) AS change_amount,
      CASE WHEN p.price > 0 THEN ((c.price - p.price) / p.price * 100) ELSE 0 END AS change_percentage,
      p.days_diff AS days_ago
    FROM current c
    CROSS JOIN previous p
    WHERE p.days_diff <= p_days;
  END IF;
END;
$$ LANGUAGE plpgsql;
