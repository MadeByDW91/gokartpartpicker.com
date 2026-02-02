-- ============================================================================
-- Product Ingestion System with Admin Approval
-- Created: 2026-01-21
-- Description: Staged product import pipeline with approval workflow
-- Owner: Product Ingestion Implementation
-- ============================================================================

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- Import job status
DO $$ BEGIN
  CREATE TYPE import_job_status AS ENUM ('ingesting', 'completed', 'failed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Part proposal status
DO $$ BEGIN
  CREATE TYPE part_proposal_status AS ENUM ('proposed', 'approved', 'rejected', 'published');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Compatibility proposal status
DO $$ BEGIN
  CREATE TYPE compatibility_proposal_status AS ENUM ('proposed', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Link candidate status
DO $$ BEGIN
  CREATE TYPE link_candidate_status AS ENUM ('candidate', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- IMPORT_JOBS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS import_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  source_type TEXT NOT NULL, -- 'csv', 'api', 'manual', etc.
  source_file TEXT, -- Original filename if applicable
  status import_job_status DEFAULT 'ingesting' NOT NULL,
  total_rows INTEGER DEFAULT 0 NOT NULL,
  processed_rows INTEGER DEFAULT 0 NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_import_jobs_created_by ON import_jobs(created_by);
CREATE INDEX IF NOT EXISTS idx_import_jobs_status ON import_jobs(status);
CREATE INDEX IF NOT EXISTS idx_import_jobs_created_at ON import_jobs(created_at DESC);

COMMENT ON TABLE import_jobs IS 'Tracks import batches for product ingestion';
COMMENT ON COLUMN import_jobs.status IS 'ingesting=in progress, completed=finished, failed=error occurred, cancelled=aborted';

-- ============================================================================
-- IMPORT_RAW_RECORDS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS import_raw_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  import_job_id UUID NOT NULL REFERENCES import_jobs(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL,
  raw_data JSONB NOT NULL DEFAULT '{}'::JSONB,
  status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'processed', 'error'
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_import_raw_records_job_id ON import_raw_records(import_job_id);
CREATE INDEX IF NOT EXISTS idx_import_raw_records_status ON import_raw_records(status);

COMMENT ON TABLE import_raw_records IS 'Raw imported data (staging) before proposal generation';

-- ============================================================================
-- PART_PROPOSALS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS part_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  import_job_id UUID NOT NULL REFERENCES import_jobs(id) ON DELETE CASCADE,
  raw_record_id UUID NOT NULL REFERENCES import_raw_records(id) ON DELETE CASCADE,
  proposed_part_id UUID REFERENCES parts(id) ON DELETE SET NULL, -- If matching existing part
  status part_proposal_status DEFAULT 'proposed' NOT NULL,
  proposed_data JSONB NOT NULL DEFAULT '{}'::JSONB, -- Complete part data
  match_confidence DECIMAL(3,2), -- 0.0-1.0 if matched to existing part
  match_reason TEXT, -- Why matched or why new
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_part_proposals_job_id ON part_proposals(import_job_id);
CREATE INDEX IF NOT EXISTS idx_part_proposals_status ON part_proposals(status);
CREATE INDEX IF NOT EXISTS idx_part_proposals_proposed_part_id ON part_proposals(proposed_part_id);
CREATE INDEX IF NOT EXISTS idx_part_proposals_created_at ON part_proposals(created_at DESC);

COMMENT ON TABLE part_proposals IS 'Proposed part records awaiting approval';
COMMENT ON COLUMN part_proposals.status IS 'proposed=awaiting review, approved=ready to publish, rejected=not approved, published=live in parts table';

-- ============================================================================
-- COMPATIBILITY_PROPOSALS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS compatibility_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_proposal_id UUID NOT NULL REFERENCES part_proposals(id) ON DELETE CASCADE,
  engine_id UUID NOT NULL REFERENCES engines(id) ON DELETE CASCADE,
  compatibility_level TEXT DEFAULT 'direct_fit' NOT NULL CHECK (compatibility_level IN ('direct_fit', 'requires_modification', 'adapter_required')),
  notes TEXT,
  status compatibility_proposal_status DEFAULT 'proposed' NOT NULL,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_compatibility_proposals_part_proposal_id ON compatibility_proposals(part_proposal_id);
CREATE INDEX IF NOT EXISTS idx_compatibility_proposals_status ON compatibility_proposals(status);
CREATE INDEX IF NOT EXISTS idx_compatibility_proposals_engine_id ON compatibility_proposals(engine_id);

COMMENT ON TABLE compatibility_proposals IS 'Proposed engine-part compatibility relationships';

-- ============================================================================
-- LINK_CANDIDATES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS link_candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_proposal_id UUID REFERENCES part_proposals(id) ON DELETE CASCADE,
  part_id UUID REFERENCES parts(id) ON DELETE CASCADE, -- If linked to published part
  link_type TEXT NOT NULL, -- 'amazon_affiliate', 'ebay_affiliate', 'other_affiliate', 'non_affiliate'
  url TEXT NOT NULL,
  vendor_name TEXT,
  price DECIMAL(10,2),
  in_stock BOOLEAN,
  status link_candidate_status DEFAULT 'candidate' NOT NULL,
  generated_by TEXT, -- 'automated', 'manual', 'import'
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_link_candidates_part_proposal_id ON link_candidates(part_proposal_id);
CREATE INDEX IF NOT EXISTS idx_link_candidates_part_id ON link_candidates(part_id);
CREATE INDEX IF NOT EXISTS idx_link_candidates_status ON link_candidates(status);

COMMENT ON TABLE link_candidates IS 'Proposed purchase links (affiliate and non-affiliate)';

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Import Jobs: Users can see their own, admins can see all
CREATE POLICY "Users can view their own import jobs"
  ON import_jobs
  FOR SELECT
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Users can create their own import jobs"
  ON import_jobs
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update import jobs"
  ON import_jobs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Import Raw Records: Users can see records from their own jobs, admins can see all
CREATE POLICY "Users can view raw records from their own jobs"
  ON import_raw_records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM import_jobs
      WHERE import_jobs.id = import_raw_records.import_job_id
      AND (import_jobs.created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
      ))
    )
  );

CREATE POLICY "Users can create raw records for their own jobs"
  ON import_raw_records
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM import_jobs
      WHERE import_jobs.id = import_raw_records.import_job_id
      AND import_jobs.created_by = auth.uid()
    )
  );

-- Part Proposals: Users can see proposals from their own jobs, admins can see all and update
CREATE POLICY "Users can view proposals from their own jobs"
  ON part_proposals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM import_jobs
      WHERE import_jobs.id = part_proposals.import_job_id
      AND (import_jobs.created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
      ))
    )
  );

CREATE POLICY "Admins can create part proposals"
  ON part_proposals
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update part proposals"
  ON part_proposals
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Compatibility Proposals: Same pattern as part proposals
CREATE POLICY "Users can view compatibility proposals from their own jobs"
  ON compatibility_proposals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM part_proposals
      JOIN import_jobs ON import_jobs.id = part_proposals.import_job_id
      WHERE part_proposals.id = compatibility_proposals.part_proposal_id
      AND (import_jobs.created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
      ))
    )
  );

CREATE POLICY "Admins can create compatibility proposals"
  ON compatibility_proposals
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update compatibility proposals"
  ON compatibility_proposals
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Link Candidates: Same pattern
CREATE POLICY "Users can view link candidates from their own jobs"
  ON link_candidates
  FOR SELECT
  USING (
    (part_proposal_id IS NULL OR EXISTS (
      SELECT 1 FROM part_proposals
      JOIN import_jobs ON import_jobs.id = part_proposals.import_job_id
      WHERE part_proposals.id = link_candidates.part_proposal_id
      AND (import_jobs.created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
      ))
    ))
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can create link candidates"
  ON link_candidates
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update link candidates"
  ON link_candidates
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );
