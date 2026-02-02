-- ============================================================================
-- Add RLS Policies for Electric Motors
-- Created: 2026-01-20
-- Description: Row Level Security policies for electric_motors table
-- Owner: A13 - EV Implementation Agent
-- ============================================================================

-- Enable RLS on electric_motors table
ALTER TABLE electric_motors ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Public can read active electric motors" ON electric_motors;
DROP POLICY IF EXISTS "Admins can read all electric motors" ON electric_motors;
DROP POLICY IF EXISTS "Admins can insert electric motors" ON electric_motors;
DROP POLICY IF EXISTS "Admins can update electric motors" ON electric_motors;
DROP POLICY IF EXISTS "Admins can delete electric motors" ON electric_motors;

-- Public read access for active motors
CREATE POLICY "Public can read active electric motors"
ON electric_motors
FOR SELECT
USING (is_active = TRUE);

-- Admins can read all motors (including inactive)
CREATE POLICY "Admins can read all electric motors"
ON electric_motors
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- Admins can insert motors
CREATE POLICY "Admins can insert electric motors"
ON electric_motors
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- Admins can update motors
CREATE POLICY "Admins can update electric motors"
ON electric_motors
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- Admins can delete motors
CREATE POLICY "Admins can delete electric motors"
ON electric_motors
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

COMMENT ON POLICY "Public can read active electric motors" ON electric_motors IS 'All users can view active electric motors';
COMMENT ON POLICY "Admins can read all electric motors" ON electric_motors IS 'Admins can view all motors including inactive ones';
COMMENT ON POLICY "Admins can insert electric motors" ON electric_motors IS 'Only admins can create new motors';
COMMENT ON POLICY "Admins can update electric motors" ON electric_motors IS 'Only admins can modify motors';
COMMENT ON POLICY "Admins can delete electric motors" ON electric_motors IS 'Only admins can delete motors';
