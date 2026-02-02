-- ============================================================================
-- Add schematic_url field to engines table
-- ============================================================================
-- This allows linking to engine diagrams/schematics for builders

ALTER TABLE engines 
ADD COLUMN IF NOT EXISTS schematic_url TEXT;

COMMENT ON COLUMN engines.schematic_url IS 'URL to engine schematic/diagram PDF or image for builders reference';

-- Create index for faster queries (optional, but helpful if we filter by schematics)
CREATE INDEX IF NOT EXISTS idx_engines_has_schematic 
ON engines (id) 
WHERE schematic_url IS NOT NULL;
