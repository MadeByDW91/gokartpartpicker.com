-- ============================================================================
-- GoKart Part Picker - Seed Build Templates
-- Created: 2026-01-17
-- Description: Create example build templates for users to get started
-- Owner: Templates Implementation
-- ============================================================================

-- Note: This migration assumes engines and parts exist in the database
-- Templates will reference engines by slug (we'll look up IDs)
-- Parts are stored as JSONB {category: part_id}, but we'll use empty objects
-- for now since we need actual part IDs. Admins can update these later.

-- ============================================================================
-- BEGINNER TEMPLATES
-- ============================================================================

-- Beginner Build – Predator 212 Hemi (Most Popular)
INSERT INTO build_templates (
  name,
  description,
  goal,
  engine_id,
  parts,
  total_price,
  estimated_hp,
  estimated_torque,
  is_public,
  is_active,
  approval_status
) 
SELECT 
  'Beginner Build – Predator 212 Hemi',
  'Perfect starter build with the most popular engine. Includes all essential parts for a reliable go-kart that''s easy to maintain.',
  'beginner',
  id,
  '{}'::JSONB, -- Empty parts - admins can populate later
  350.00,
  6.5,
  8.1,
  true,
  true,
  'approved'
FROM engines
WHERE slug = 'predator-212-hemi'
LIMIT 1;

-- Kids Build – Predator 79cc
INSERT INTO build_templates (
  name,
  description,
  goal,
  engine_id,
  parts,
  total_price,
  estimated_hp,
  estimated_torque,
  is_public,
  is_active,
  approval_status
) 
SELECT 
  'Kids Build – Predator 79cc',
  'Safe and reliable build perfect for younger riders. Lower power output with quality components for peace of mind.',
  'kids',
  id,
  '{}'::JSONB,
  250.00,
  2.5,
  3.0,
  true,
  true,
  'approved'
FROM engines
WHERE slug = 'predator-79'
LIMIT 1;

-- ============================================================================
-- BUDGET TEMPLATES
-- ============================================================================

-- Budget Build – Predator 212 Non-Hemi
INSERT INTO build_templates (
  name,
  description,
  goal,
  engine_id,
  parts,
  total_price,
  estimated_hp,
  estimated_torque,
  is_public,
  is_active,
  approval_status
) 
SELECT 
  'Budget Build – Predator 212 Non-Hemi',
  'Maximum value build using the reliable Non-Hemi engine. Great performance without breaking the bank.',
  'budget',
  id,
  '{}'::JSONB,
  280.00,
  6.5,
  8.1,
  true,
  true,
  'approved'
FROM engines
WHERE slug = 'predator-212-non-hemi'
LIMIT 1;

-- ============================================================================
-- SPEED TEMPLATES
-- ============================================================================

-- Speed Build – Predator 212 Hemi (High RPM)
INSERT INTO build_templates (
  name,
  description,
  goal,
  engine_id,
  parts,
  total_price,
  estimated_hp,
  estimated_torque,
  is_public,
  is_active,
  approval_status
) 
SELECT 
  'Speed Build – Predator 212 Hemi',
  'Optimized for top speed with high-RPM components. Perfect for racing and maximum velocity builds.',
  'speed',
  id,
  '{}'::JSONB,
  450.00,
  8.0,
  7.5,
  true,
  true,
  'approved'
FROM engines
WHERE slug = 'predator-212-hemi'
LIMIT 1;

-- Speed Build – Predator 224
INSERT INTO build_templates (
  name,
  description,
  goal,
  engine_id,
  parts,
  total_price,
  estimated_hp,
  estimated_torque,
  is_public,
  is_active,
  approval_status
) 
SELECT 
  'Speed Build – Predator 224',
  'Larger displacement for more power. High-performance components selected for maximum speed.',
  'speed',
  id,
  '{}'::JSONB,
  500.00,
  7.0,
  10.5,
  true,
  true,
  'approved'
FROM engines
WHERE slug = 'predator-224'
LIMIT 1;

-- ============================================================================
-- TORQUE TEMPLATES
-- ============================================================================

-- Torque Build - Predator 212 Hemi
INSERT INTO build_templates (
  name,
  description,
  goal,
  engine_id,
  parts,
  total_price,
  estimated_hp,
  estimated_torque,
  is_public,
  is_active,
  approval_status
) 
SELECT 
  'Torque Build – Predator 212 Hemi',
  'Optimized for low-end power and acceleration. Great for off-road, hills, and heavy loads.',
  'torque',
  id,
  '{}'::JSONB,
  420.00,
  7.0,
  9.5,
  true,
  true,
  'approved'
FROM engines
WHERE slug = 'predator-212-hemi'
LIMIT 1;

-- Torque Build – Predator 301
INSERT INTO build_templates (
  name,
  description,
  goal,
  engine_id,
  parts,
  total_price,
  estimated_hp,
  estimated_torque,
  is_public,
  is_active,
  approval_status
) 
SELECT 
  'Torque Build – Predator 301',
  'Maximum torque build with larger displacement engine. Perfect for heavy-duty applications and towing.',
  'torque',
  id,
  '{}'::JSONB,
  600.00,
  8.0,
  12.5,
  true,
  true,
  'approved'
FROM engines
WHERE slug = 'predator-301'
LIMIT 1;

-- ============================================================================
-- COMPETITION TEMPLATES
-- ============================================================================

-- Competition Build – Predator 212 Hemi
INSERT INTO build_templates (
  name,
  description,
  goal,
  engine_id,
  parts,
  total_price,
  estimated_hp,
  estimated_torque,
  is_public,
  is_active,
  approval_status
) 
SELECT 
  'Competition Build – Predator 212 Hemi',
  'Full performance build with premium components. Designed for competitive racing and maximum performance.',
  'competition',
  id,
  '{}'::JSONB,
  750.00,
  10.0,
  9.0,
  true,
  true,
  'approved'
FROM engines
WHERE slug = 'predator-212-hemi'
LIMIT 1;

-- Competition Build – Predator 420
INSERT INTO build_templates (
  name,
  description,
  goal,
  engine_id,
  parts,
  total_price,
  estimated_hp,
  estimated_torque,
  is_public,
  is_active,
  approval_status
) 
SELECT 
  'Competition Build – Predator 420',
  'Ultimate performance build with the largest displacement. Premium components throughout for serious racing.',
  'competition',
  id,
  '{}'::JSONB,
  950.00,
  13.0,
  18.0,
  true,
  true,
  'approved'
FROM engines
WHERE slug = 'predator-420'
LIMIT 1;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE build_templates IS 'Seed templates created for common build goals. Parts can be populated by admins through the admin panel.';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
