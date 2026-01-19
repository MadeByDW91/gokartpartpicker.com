-- ============================================================================
-- Add Build Templates Table
-- Created: 2026-01-16
-- Description: Template system for preset builds that users can apply
-- Owner: Agent A3 (UI) + A5 (Admin)
-- ============================================================================

-- Template goal enum for categorization
CREATE TYPE template_goal AS ENUM (
  'speed',       -- Maximum speed, high-RPM parts
  'torque',      -- Low-end power, torque-focused
  'budget',      -- Best value, under budget
  'beginner',    -- Simple, reliable, easy
  'competition', -- Full performance build
  'kids'         -- Safe, governed, reliable
);

-- ============================================================================
-- BUILD_TEMPLATES TABLE
-- ============================================================================

CREATE TABLE build_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  goal template_goal NOT NULL,
  engine_id UUID REFERENCES engines(id) ON DELETE SET NULL,
  parts JSONB NOT NULL DEFAULT '{}'::JSONB, -- {category: part_id}
  total_price DECIMAL(10,2),
  estimated_hp DECIMAL(4,1),
  estimated_torque DECIMAL(4,1),
  is_public BOOLEAN DEFAULT true NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_templates_goal ON build_templates(goal);
CREATE INDEX idx_templates_public ON build_templates(is_public) WHERE is_public = true;
CREATE INDEX idx_templates_active ON build_templates(is_active) WHERE is_active = true;
CREATE INDEX idx_templates_created_by ON build_templates(created_by);
CREATE INDEX idx_templates_name_search ON build_templates USING gin(to_tsvector('english', name));

COMMENT ON TABLE build_templates IS 'Preset build templates for quick-start configurations. Users can apply templates to the builder.';
COMMENT ON COLUMN build_templates.goal IS 'Template category/goal (speed, torque, budget, beginner, competition, kids)';
COMMENT ON COLUMN build_templates.parts IS 'JSON object mapping category to part_id: {"clutch": "uuid", "exhaust": "uuid"}';
COMMENT ON COLUMN build_templates.is_public IS 'Public templates visible to all users, private only to admins';
COMMENT ON COLUMN build_templates.is_active IS 'Active templates appear in gallery, inactive hidden';

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

CREATE TRIGGER update_build_templates_updated_at
  BEFORE UPDATE ON build_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS POLICIES (will be added in RLS migration)
-- ============================================================================

-- Enable RLS
ALTER TABLE build_templates ENABLE ROW LEVEL SECURITY;

-- Public templates are visible to everyone
CREATE POLICY "Public templates are viewable by everyone"
  ON build_templates
  FOR SELECT
  USING (is_public = true AND is_active = true);

-- Admins can view all templates
CREATE POLICY "Admins can view all templates"
  ON build_templates
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Only admins can create templates
CREATE POLICY "Only admins can create templates"
  ON build_templates
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Only admins can update templates
CREATE POLICY "Only admins can update templates"
  ON build_templates
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Only admins can delete templates
CREATE POLICY "Only admins can delete templates"
  ON build_templates
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );
