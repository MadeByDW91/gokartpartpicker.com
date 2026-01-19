-- ============================================================================
-- Add User Template Submission with Admin Approval
-- Created: 2026-01-16
-- Description: Allow users to submit templates that require admin approval
-- Owner: Agent A3 (UI) + A5 (Admin)
-- ============================================================================

-- Add approval status enum
DO $$ BEGIN
  CREATE TYPE template_approval_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add approval status to templates
ALTER TABLE build_templates 
  ADD COLUMN IF NOT EXISTS approval_status template_approval_status DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS review_notes TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- Update existing templates to be approved (admin-created)
UPDATE build_templates 
SET approval_status = 'approved'
WHERE approval_status IS NULL;

-- Set approval status NOT NULL after setting defaults
ALTER TABLE build_templates 
  ALTER COLUMN approval_status SET NOT NULL;

-- Index for pending templates (for admin queue)
CREATE INDEX IF NOT EXISTS idx_templates_approval_status 
  ON build_templates(approval_status) 
  WHERE approval_status = 'pending';

COMMENT ON COLUMN build_templates.approval_status IS 'pending=awaiting admin review, approved=publicly visible, rejected=not shown';
COMMENT ON COLUMN build_templates.submitted_by IS 'User who submitted this template (null for admin-created)';
COMMENT ON COLUMN build_templates.reviewed_by IS 'Admin who reviewed this template';
COMMENT ON COLUMN build_templates.review_notes IS 'Admin notes for approval/rejection';

-- Update RLS policy to allow users to create templates with pending status
DROP POLICY IF EXISTS "Only admins can create templates" ON build_templates;

CREATE POLICY "Users can create pending templates"
  ON build_templates
  FOR INSERT
  WITH CHECK (
    -- Admins can create approved templates
    (approval_status = 'approved' AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    ))
    OR
    -- Regular users can create pending templates
    (approval_status = 'pending' AND auth.uid() = submitted_by)
  );

-- Update policy to allow admins to update approval status
CREATE POLICY "Admins can update template approval"
  ON build_templates
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Users can view approved templates or their own pending templates
DROP POLICY IF EXISTS "Public templates are viewable by everyone" ON build_templates;

CREATE POLICY "Approved public templates are viewable by everyone"
  ON build_templates
  FOR SELECT
  USING (
    (is_public = true AND is_active = true AND approval_status = 'approved')
    OR
    (auth.uid() = created_by)
    OR
    (auth.uid() = submitted_by)
  );
