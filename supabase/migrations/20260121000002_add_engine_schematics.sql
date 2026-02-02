-- ============================================================================
-- Add Engine Schematic/Manual URLs
-- Created: 2026-01-21
-- Description: Add schematic_url (manuals/diagrams) to all engines
-- ============================================================================
-- 
-- INSTRUCTIONS FOR FINDING MANUAL URLs:
-- 
-- 1. PREDATOR ENGINES (Harbor Freight):
--    - Go to: https://www.harborfreight.com
--    - Search for the engine model (e.g., "Predator 212")
--    - On product page, look for "Manuals & Downloads" section
--    - Common format: https://manuals.harborfreight.com/manuals/69000-69999/XXXXX.pdf
--    - Item numbers: 69730 (212cc), 60363 (alternative), etc.
--
-- 2. HONDA ENGINES:
--    - Go to: https://engines.honda.com
--    - Navigate to Support > Manuals
--    - Search by model number (e.g., "GX200")
--    - Download PDF and host or use direct link if available
--
-- 3. BRIGGS & STRATTON:
--    - Go to: https://www.briggsandstratton.com
--    - Navigate to Support > Manuals & Parts Lists
--    - Search by model number
--
-- 4. TILLOTSON:
--    - Go to: https://tillotson.ie
--    - Navigate to Support/Downloads section
--
-- NOTE: Replace the placeholder URLs below with actual manual PDF URLs
-- You can host PDFs in Supabase Storage or use external URLs
-- ============================================================================

-- ============================================================================
-- PREDATOR ENGINES (Harbor Freight)
-- ============================================================================

-- Predator 79cc
-- Harbor Freight Item: Search for "Predator 79cc" on harborfreight.com
-- Manual URL: Find on product page under "Manuals & Downloads"
UPDATE engines 
SET schematic_url = 'https://manuals.harborfreight.com/manuals/69000-69999/69730.pdf'
WHERE slug = 'predator-79';

-- Predator 212 Non-Hemi
-- Harbor Freight Item: #69730 or #60363
-- Most Predator 212 engines use the same manual
UPDATE engines 
SET schematic_url = 'https://manuals.harborfreight.com/manuals/69000-69999/69730.pdf'
WHERE slug = 'predator-212-non-hemi';

-- Predator 212 Hemi
-- Harbor Freight Item: #69730
-- Same manual as Non-Hemi version
UPDATE engines 
SET schematic_url = 'https://manuals.harborfreight.com/manuals/69000-69999/69730.pdf'
WHERE slug = 'predator-212-hemi';

-- Predator Ghost 212
-- Harbor Freight Item: Search for "Predator Ghost"
-- May use same manual as 212 or have specific Ghost manual
UPDATE engines 
SET schematic_url = 'https://manuals.harborfreight.com/manuals/69000-69999/69730.pdf'
WHERE slug = 'predator-ghost';

-- Predator 224
-- Harbor Freight Item: Search for "Predator 224"
-- Similar to 212, may share manual or have specific one
UPDATE engines 
SET schematic_url = 'https://manuals.harborfreight.com/manuals/69000-69999/69730.pdf'
WHERE slug = 'predator-224';

-- Predator 301
-- Harbor Freight Item: Search for "Predator 301"
UPDATE engines 
SET schematic_url = 'https://manuals.harborfreight.com/manuals/69000-69999/69730.pdf'
WHERE slug = 'predator-301';

-- Predator 420
-- Harbor Freight Item: Search for "Predator 420"
-- Clone of Honda GX390, may be able to use Honda manual as reference
UPDATE engines 
SET schematic_url = 'https://manuals.harborfreight.com/manuals/69000-69999/69730.pdf'
WHERE slug = 'predator-420';

-- Predator 670 V-Twin
-- Harbor Freight Item: Search for "Predator 670"
-- V-Twin engine, likely has its own manual
UPDATE engines 
SET schematic_url = 'https://manuals.harborfreight.com/manuals/69000-69999/69730.pdf'
WHERE slug = 'predator-670';

-- ============================================================================
-- HONDA ENGINES
-- ============================================================================

-- Honda GX200
-- Official Honda manual: https://engines.honda.com
-- Search for "GX200" in manuals section
-- Alternative: Many aftermarket sites host Honda manuals
UPDATE engines 
SET schematic_url = 'https://engines.honda.com/support/manuals'
WHERE slug = 'honda-gx200';

-- ============================================================================
-- BRIGGS & STRATTON ENGINES
-- ============================================================================

-- Briggs & Stratton 206
-- Official Briggs manual: https://www.briggsandstratton.com
-- Navigate to Support > Manuals & Parts Lists
-- Search for model "206" or "LO206"
UPDATE engines 
SET schematic_url = 'https://www.briggsandstratton.com/support/manuals'
WHERE slug = 'briggs-206';

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this to check which engines have schematics:
-- SELECT slug, name, brand, 
--   CASE 
--     WHEN schematic_url IS NOT NULL THEN 'Has Schematic ✓'
--     ELSE 'No Schematic'
--   END as status
-- FROM engines
-- WHERE is_active = true
-- ORDER BY brand, name;
