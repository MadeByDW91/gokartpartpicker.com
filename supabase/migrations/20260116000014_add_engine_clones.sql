-- ============================================================================
-- Add Engine Clones/Compatibility Table
-- Created: 2026-01-16
-- Description: Links engines that are clones or compatible with the same parts
-- Owner: Database Architect
-- ============================================================================

-- ============================================================================
-- ENGINE_CLONES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS engine_clones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  engine_id UUID NOT NULL REFERENCES engines(id) ON DELETE CASCADE,
  clone_engine_id UUID NOT NULL REFERENCES engines(id) ON DELETE CASCADE,
  relationship_type TEXT DEFAULT 'clone' CHECK (relationship_type IN ('clone', 'compatible', 'similar')),
  notes TEXT, -- e.g., "Same parts compatibility as Honda GX200"
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES profiles(id),
  
  -- Prevent duplicate relationships
  CONSTRAINT unique_engine_clone UNIQUE (engine_id, clone_engine_id),
  -- Prevent self-references
  CONSTRAINT no_self_reference CHECK (engine_id != clone_engine_id)
);

CREATE INDEX IF NOT EXISTS idx_engine_clones_engine ON engine_clones(engine_id);
CREATE INDEX IF NOT EXISTS idx_engine_clones_clone ON engine_clones(clone_engine_id);
CREATE INDEX IF NOT EXISTS idx_engine_clones_active ON engine_clones(is_active) WHERE is_active = TRUE;

COMMENT ON TABLE engine_clones IS 'Links engines that are clones or compatible with the same parts. Many engines are clones of Honda GX series (e.g., Predator 212 is a clone of Honda GX200).';
COMMENT ON COLUMN engine_clones.relationship_type IS 'clone=exact clone, compatible=same parts fit, similar=mostly compatible';
COMMENT ON COLUMN engine_clones.notes IS 'Optional notes about the relationship (e.g., "Shares all parts with Honda GX200")';

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

DROP TRIGGER IF EXISTS update_engine_clones_updated_at ON engine_clones;
CREATE TRIGGER update_engine_clones_updated_at
  BEFORE UPDATE ON engine_clones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE engine_clones ENABLE ROW LEVEL SECURITY;

-- Anyone can view active clone relationships
DROP POLICY IF EXISTS "Engine clones are publicly readable" ON engine_clones;
CREATE POLICY "Engine clones are publicly readable"
  ON engine_clones FOR SELECT
  USING (is_active = TRUE);

-- Admins can view all relationships
DROP POLICY IF EXISTS "Admins can view all engine clones" ON engine_clones;
CREATE POLICY "Admins can view all engine clones"
  ON engine_clones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Only admins can manage clone relationships
DROP POLICY IF EXISTS "Admins can insert engine clones" ON engine_clones;
CREATE POLICY "Admins can insert engine clones"
  ON engine_clones FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Admins can update engine clones" ON engine_clones;
CREATE POLICY "Admins can update engine clones"
  ON engine_clones FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Admins can delete engine clones" ON engine_clones;
CREATE POLICY "Admins can delete engine clones"
  ON engine_clones FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );
