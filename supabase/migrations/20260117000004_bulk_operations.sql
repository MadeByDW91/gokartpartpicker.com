-- ============================================================================
-- Bulk Operations History Table
-- Created: 2026-01-17
-- Description: Track bulk operations for undo functionality and history
-- Owner: Agent A5 (Admin)
-- ============================================================================

-- Bulk operation type enum
DO $$ BEGIN
  CREATE TYPE bulk_operation_type AS ENUM (
    'update',
    'delete',
    'activate',
    'deactivate',
    'publish',
    'unpublish',
    'approve',
    'reject'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Bulk operation status enum
DO $$ BEGIN
  CREATE TYPE bulk_operation_status AS ENUM (
    'pending',
    'running',
    'completed',
    'failed',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Bulk operations table
CREATE TABLE IF NOT EXISTS bulk_operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  operation_type bulk_operation_type NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('engine', 'part', 'build', 'template', 'guide', 'video')),
  status bulk_operation_status DEFAULT 'pending' NOT NULL,
  filters JSONB DEFAULT '{}'::JSONB, -- Search/filter criteria
  changes JSONB DEFAULT '{}'::JSONB, -- Changes to apply
  affected_ids UUID[] NOT NULL DEFAULT '{}', -- IDs that will be affected
  affected_count INTEGER DEFAULT 0,
  completed_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  error_log JSONB DEFAULT '[]'::JSONB, -- Array of errors {id, error}
  snapshot JSONB, -- Before state for undo (array of {id, data})
  scheduled_at TIMESTAMPTZ, -- For scheduled operations
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ, -- For undo window (30 days default)
  can_undo BOOLEAN DEFAULT true NOT NULL
);

CREATE INDEX idx_bulk_ops_created_by ON bulk_operations(created_by);
CREATE INDEX idx_bulk_ops_status ON bulk_operations(status);
CREATE INDEX idx_bulk_ops_entity_type ON bulk_operations(entity_type);
CREATE INDEX idx_bulk_ops_scheduled ON bulk_operations(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX idx_bulk_ops_expires ON bulk_operations(expires_at) WHERE expires_at IS NOT NULL AND can_undo = true;

COMMENT ON TABLE bulk_operations IS 'History of bulk operations for undo functionality and audit';
COMMENT ON COLUMN bulk_operations.filters IS 'JSON filter criteria used to select items: {"status": "active", "category": "clutch"}';
COMMENT ON COLUMN bulk_operations.changes IS 'JSON changes to apply: {"price": 100, "is_active": false}';
COMMENT ON COLUMN bulk_operations.affected_ids IS 'Array of UUIDs affected by this operation';
COMMENT ON COLUMN bulk_operations.snapshot IS 'Before state snapshot for undo: [{"id": "uuid", "data": {...}}]';
COMMENT ON COLUMN bulk_operations.expires_at IS 'When undo expires (typically 30 days after completion)';
COMMENT ON COLUMN bulk_operations.can_undo IS 'Whether this operation can be undone';

-- Operation templates table (save common workflows)
CREATE TABLE IF NOT EXISTS bulk_operation_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('engine', 'part', 'build', 'template', 'guide', 'video')),
  operation_type bulk_operation_type NOT NULL,
  filters JSONB DEFAULT '{}'::JSONB,
  changes JSONB DEFAULT '{}'::JSONB,
  is_public BOOLEAN DEFAULT false NOT NULL, -- Shared with other admins
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_bulk_op_templates_entity ON bulk_operation_templates(entity_type);
CREATE INDEX idx_bulk_op_templates_public ON bulk_operation_templates(is_public) WHERE is_public = true;

COMMENT ON TABLE bulk_operation_templates IS 'Saved bulk operation workflows for reuse';

-- Updated_at trigger for templates
CREATE TRIGGER update_bulk_op_templates_updated_at
  BEFORE UPDATE ON bulk_operation_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE bulk_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_operation_templates ENABLE ROW LEVEL SECURITY;

-- Admins can view all bulk operations
CREATE POLICY "Admins can view bulk operations"
  ON bulk_operations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Admins can create bulk operations
CREATE POLICY "Admins can create bulk operations"
  ON bulk_operations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Admins can update bulk operations (status, progress, etc.)
CREATE POLICY "Admins can update bulk operations"
  ON bulk_operations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Admins can view operation templates
CREATE POLICY "Admins can view operation templates"
  ON bulk_operation_templates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Admins can create operation templates
CREATE POLICY "Admins can create operation templates"
  ON bulk_operation_templates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Admins can update/delete their own templates or public ones
CREATE POLICY "Admins can update operation templates"
  ON bulk_operation_templates FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
    AND (created_by = auth.uid() OR is_public = true)
  );

CREATE POLICY "Admins can delete operation templates"
  ON bulk_operation_templates FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
    AND (created_by = auth.uid() OR is_public = true)
  );
