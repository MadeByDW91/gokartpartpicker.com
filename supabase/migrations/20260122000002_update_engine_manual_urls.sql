-- ============================================================================
-- Update Engine Manual URLs to Supabase Storage
-- Created: 2026-01-22
-- Description: Update schematic_url to point to uploaded PDFs in Supabase Storage
-- ============================================================================
-- 
-- INSTRUCTIONS:
-- 1. First, run: 20260122000001_setup_engine_manuals_storage.sql
-- 2. Upload your PDFs to Supabase Storage bucket 'engine-manuals' in a 'manuals' folder
-- 3. Find your Supabase project reference:
--    - Go to: Supabase Dashboard → Settings → API
--    - Look at Project URL: https://[YOUR-PROJECT-REF].supabase.co
--    - Copy the [YOUR-PROJECT-REF] part
-- 4. Replace [YOUR-PROJECT-REF] below with your actual project reference
-- 5. Run this migration to update all URLs
-- ============================================================================

-- ============================================================================
-- PREDATOR ENGINES
-- ============================================================================
-- Replace [YOUR-PROJECT-REF] with your actual Supabase project reference

UPDATE engines 
SET schematic_url = 'https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/engine-manuals/manuals/predator-79.pdf'
WHERE slug = 'predator-79';

UPDATE engines 
SET schematic_url = 'https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/engine-manuals/manuals/predator-212-non-hemi.pdf'
WHERE slug = 'predator-212-non-hemi';

UPDATE engines 
SET schematic_url = 'https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/engine-manuals/manuals/predator-212-hemi.pdf'
WHERE slug = 'predator-212-hemi';

UPDATE engines 
SET schematic_url = 'https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/engine-manuals/manuals/predator-ghost.pdf'
WHERE slug = 'predator-ghost';

UPDATE engines 
SET schematic_url = 'https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/engine-manuals/manuals/predator-224.pdf'
WHERE slug = 'predator-224';

UPDATE engines 
SET schematic_url = 'https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/engine-manuals/manuals/predator-301.pdf'
WHERE slug = 'predator-301';

UPDATE engines 
SET schematic_url = 'https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/engine-manuals/manuals/predator-420.pdf'
WHERE slug = 'predator-420';

UPDATE engines 
SET schematic_url = 'https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/engine-manuals/manuals/predator-670.pdf'
WHERE slug = 'predator-670';

-- ============================================================================
-- HONDA ENGINES
-- ============================================================================

UPDATE engines 
SET schematic_url = 'https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/engine-manuals/manuals/honda-gx200.pdf'
WHERE slug = 'honda-gx200';

-- ============================================================================
-- BRIGGS & STRATTON ENGINES
-- ============================================================================

UPDATE engines 
SET schematic_url = 'https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/engine-manuals/manuals/briggs-206.pdf'
WHERE slug = 'briggs-206';

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run this after updating to verify all URLs are correct:
-- SELECT slug, name, brand, schematic_url,
--   CASE 
--     WHEN schematic_url LIKE '%supabase.co/storage%' THEN '✓ Stored in Supabase'
--     WHEN schematic_url IS NOT NULL THEN '✓ External URL'
--     ELSE '✗ No Manual'
--   END as status
-- FROM engines
-- WHERE is_active = true
-- ORDER BY brand, name;
