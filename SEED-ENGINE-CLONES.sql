-- ============================================================================
-- Seed Engine Clone Relationships
-- This script creates common clone relationships between engines
-- Many engines are clones of Honda GX series engines
-- Run this in Supabase SQL Editor as an admin user
-- ============================================================================

-- Common clone relationships:
-- - Predator 212 is a clone of Honda GX200
-- - Predator 79cc is a clone of Honda GX100
-- - Many Chinese engines are clones of Honda GX series
-- - Predator 224 is similar to Honda GX200 (larger displacement)

-- Note: This script assumes you have engines in your database.
-- It will find engines by name/brand and create relationships.

DO $$
DECLARE
  predator_212_id UUID;
  predator_79cc_id UUID;
  predator_224_id UUID;
  honda_gx200_id UUID;
  honda_gx100_id UUID;
  admin_user_id UUID;
BEGIN
  -- Get admin user ID
  SELECT id INTO admin_user_id
  FROM profiles
  WHERE role IN ('admin', 'super_admin')
  LIMIT 1;

  -- Find engines by name/brand (case-insensitive)
  SELECT id INTO predator_212_id
  FROM engines
  WHERE LOWER(name) LIKE '%predator%212%'
    AND is_active = true
  LIMIT 1;

  SELECT id INTO predator_79cc_id
  FROM engines
  WHERE LOWER(name) LIKE '%predator%79%'
    AND is_active = true
  LIMIT 1;

  SELECT id INTO predator_224_id
  FROM engines
  WHERE LOWER(name) LIKE '%predator%224%'
    AND is_active = true
  LIMIT 1;

  SELECT id INTO honda_gx200_id
  FROM engines
  WHERE LOWER(brand) = 'honda'
    AND (LOWER(name) LIKE '%gx200%' OR LOWER(name) LIKE '%200%')
    AND is_active = true
  LIMIT 1;

  SELECT id INTO honda_gx100_id
  FROM engines
  WHERE LOWER(brand) = 'honda'
    AND (LOWER(name) LIKE '%gx100%' OR LOWER(name) LIKE '%100%')
    AND is_active = true
  LIMIT 1;

  -- Create clone relationships (bidirectional)
  
  -- Predator 212 <-> Honda GX200
  IF predator_212_id IS NOT NULL AND honda_gx200_id IS NOT NULL THEN
    -- Predator 212 is clone of Honda GX200
    INSERT INTO engine_clones (engine_id, clone_engine_id, relationship_type, notes, created_by)
    VALUES (
      predator_212_id,
      honda_gx200_id,
      'clone',
      'Predator 212 is a clone of Honda GX200. Shares all parts compatibility.',
      admin_user_id
    )
    ON CONFLICT (engine_id, clone_engine_id) DO NOTHING;

    -- Reverse relationship
    INSERT INTO engine_clones (engine_id, clone_engine_id, relationship_type, notes, created_by)
    VALUES (
      honda_gx200_id,
      predator_212_id,
      'clone',
      'Honda GX200. Predator 212 is a clone of this engine.',
      admin_user_id
    )
    ON CONFLICT (engine_id, clone_engine_id) DO NOTHING;
  END IF;

  -- Predator 79cc <-> Honda GX100
  IF predator_79cc_id IS NOT NULL AND honda_gx100_id IS NOT NULL THEN
    INSERT INTO engine_clones (engine_id, clone_engine_id, relationship_type, notes, created_by)
    VALUES (
      predator_79cc_id,
      honda_gx100_id,
      'clone',
      'Predator 79cc is a clone of Honda GX100. Shares all parts compatibility.',
      admin_user_id
    )
    ON CONFLICT (engine_id, clone_engine_id) DO NOTHING;

    INSERT INTO engine_clones (engine_id, clone_engine_id, relationship_type, notes, created_by)
    VALUES (
      honda_gx100_id,
      predator_79cc_id,
      'clone',
      'Honda GX100. Predator 79cc is a clone of this engine.',
      admin_user_id
    )
    ON CONFLICT (engine_id, clone_engine_id) DO NOTHING;
  END IF;

  -- Predator 224 <-> Honda GX200 (similar, not exact clone)
  IF predator_224_id IS NOT NULL AND honda_gx200_id IS NOT NULL THEN
    INSERT INTO engine_clones (engine_id, clone_engine_id, relationship_type, notes, created_by)
    VALUES (
      predator_224_id,
      honda_gx200_id,
      'compatible',
      'Predator 224 is similar to Honda GX200. Most parts are compatible, but displacement is larger.',
      admin_user_id
    )
    ON CONFLICT (engine_id, clone_engine_id) DO NOTHING;

    INSERT INTO engine_clones (engine_id, clone_engine_id, relationship_type, notes, created_by)
    VALUES (
      honda_gx200_id,
      predator_224_id,
      'compatible',
      'Honda GX200. Predator 224 is similar and mostly compatible.',
      admin_user_id
    )
    ON CONFLICT (engine_id, clone_engine_id) DO NOTHING;
  END IF;

  -- You can add more relationships here as needed
  -- Example: Other clone engines
  -- IF engine_a_id IS NOT NULL AND engine_b_id IS NOT NULL THEN
  --   INSERT INTO engine_clones ...
  -- END IF;

END $$;

-- Verify relationships were created
SELECT 
  e1.name as engine,
  e2.name as clone_engine,
  ec.relationship_type,
  ec.notes
FROM engine_clones ec
JOIN engines e1 ON e1.id = ec.engine_id
JOIN engines e2 ON e2.id = ec.clone_engine_id
WHERE ec.is_active = true
ORDER BY e1.name, ec.relationship_type;
