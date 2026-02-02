-- ============================================================================
-- Add manual_url field to engines table
-- ============================================================================
-- This allows linking to engine owner's manuals (PDFs) for reference
-- We keep schematic_url for diagrams/schematics, and add manual_url for full manuals

ALTER TABLE engines 
ADD COLUMN IF NOT EXISTS manual_url TEXT;

COMMENT ON COLUMN engines.manual_url IS 'URL to engine owner''s manual PDF for builders reference';

-- Create index for faster queries (optional, but helpful if we filter by manuals)
CREATE INDEX IF NOT EXISTS idx_engines_has_manual 
ON engines (id) 
WHERE manual_url IS NOT NULL;
