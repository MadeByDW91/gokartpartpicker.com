-- ============================================================================
-- GoKart Part Picker - Add Build Type Templates (On-Road, Off-Road, Racing)
-- Created: 2026-01-27
-- Description: Add new template goals and templates for different build types
-- Owner: Templates Implementation
-- ============================================================================

-- ============================================================================
-- ADD NEW TEMPLATE GOAL ENUM VALUES
-- ============================================================================

-- Add new goal types for build categories
ALTER TYPE template_goal ADD VALUE IF NOT EXISTS 'offroad';
ALTER TYPE template_goal ADD VALUE IF NOT EXISTS 'onroad';
ALTER TYPE template_goal ADD VALUE IF NOT EXISTS 'racing';

-- ============================================================================
-- OFF-ROAD TEMPLATES
-- ============================================================================

-- Off-Road Build – Predator 212 Hemi
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
  'Off-Road Build – Predator 212 Hemi',
  'Built for dirt trails, mud, and rough terrain. Features torque-focused gearing, knobby tires, and durable components that can handle the abuse.',
  'offroad',
  id,
  '{}'::JSONB, -- Parts to be populated during ingestion
  400.00,
  6.5,
  8.5,
  true,
  true,
  'approved'
FROM engines
WHERE slug = 'predator-212-hemi'
LIMIT 1;

-- Off-Road Build – Predator 301 (Heavy Duty)
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
  'Off-Road Build – Predator 301',
  'Maximum torque for serious off-road adventures. Larger displacement handles hills, heavy loads, and challenging terrain with ease.',
  'offroad',
  id,
  '{}'::JSONB,
  550.00,
  8.0,
  12.0,
  true,
  true,
  'approved'
FROM engines
WHERE slug = 'predator-301'
LIMIT 1;

-- ============================================================================
-- ON-ROAD / STREET TEMPLATES
-- ============================================================================

-- On-Road Build – Predator 212 Hemi (Street Cruiser)
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
  'Street Cruiser – Predator 212 Hemi',
  'Smooth riding on pavement and paved tracks. Features slick tires, balanced gearing, and components optimized for street performance.',
  'onroad',
  id,
  '{}'::JSONB,
  380.00,
  6.5,
  8.1,
  true,
  true,
  'approved'
FROM engines
WHERE slug = 'predator-212-hemi'
LIMIT 1;

-- On-Road Build – Predator 224 (Street Performance)
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
  'Street Performance – Predator 224',
  'More power for paved surfaces. Larger displacement with street-focused components for an exciting on-road experience.',
  'onroad',
  id,
  '{}'::JSONB,
  450.00,
  7.0,
  10.5,
  true,
  true,
  'approved'
FROM engines
WHERE slug = 'predator-224'
LIMIT 1;

-- ============================================================================
-- RACING TEMPLATES
-- ============================================================================

-- Racing Build – Predator 212 Hemi (Track Ready)
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
  'Track Ready – Predator 212 Hemi',
  'Optimized for racing on paved tracks. High-RPM camshaft, performance exhaust, and racing slicks for competitive lap times.',
  'racing',
  id,
  '{}'::JSONB,
  650.00,
  9.0,
  8.0,
  true,
  true,
  'approved'
FROM engines
WHERE slug = 'predator-212-hemi'
LIMIT 1;

-- Racing Build – Predator 212 Hemi (Sprint Racer)
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
  'Sprint Racer – Predator 212 Hemi',
  'Built for sprint racing with maximum acceleration. Aggressive gearing, lightweight components, and performance parts for quick bursts of speed.',
  'racing',
  id,
  '{}'::JSONB,
  700.00,
  10.0,
  7.5,
  true,
  true,
  'approved'
FROM engines
WHERE slug = 'predator-212-hemi'
LIMIT 1;

-- Racing Build – Predator 420 (Endurance Racer)
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
  'Endurance Racer – Predator 420',
  'Built for longer races with consistent power delivery. Larger displacement, balanced tuning, and reliable components for sustained performance.',
  'racing',
  id,
  '{}'::JSONB,
  900.00,
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

COMMENT ON TYPE template_goal IS 'Template goals: speed, torque, budget, beginner, competition, kids, offroad, onroad, racing';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
