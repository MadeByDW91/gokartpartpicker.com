-- ============================================================================
-- GoKart Part Picker - Parts Seed Data
-- Created: 2026-01-16
-- Description: Sample parts for testing parts pages
-- Owner: A5 (Admin)
-- ============================================================================

-- Note: category_id is looked up dynamically from part_categories table
-- using a subquery to avoid hardcoding UUIDs

-- ============================================================================
-- CLUTCHES
-- ============================================================================

INSERT INTO parts (
  slug, name, category, category_id, brand, specifications, price, is_active
) VALUES
  (
    'maxtorque-clutch-3-4',
    'MaxTorque Clutch 3/4"',
    'clutch',
    (SELECT id FROM part_categories WHERE slug = 'clutch'),
    'MaxTorque',
    '{"bore_in": 0.75, "engagement_rpm": 1800, "chain_size": "#35", "chain_pitch": "#35"}'::jsonb,
    49.99,
    true
  ),
  (
    'hilliard-extreme-duty-clutch-3-4',
    'Hilliard Extreme Duty Clutch 3/4"',
    'clutch',
    (SELECT id FROM part_categories WHERE slug = 'clutch'),
    'Hilliard',
    '{"bore_in": 0.75, "engagement_rpm": 2000, "chain_size": "#35", "chain_pitch": "#35"}'::jsonb,
    79.99,
    true
  ),
  (
    'maxtorque-clutch-5-8',
    'MaxTorque Clutch 5/8"',
    'clutch',
    (SELECT id FROM part_categories WHERE slug = 'clutch'),
    'MaxTorque',
    '{"bore_in": 0.625, "engagement_rpm": 1800, "chain_size": "#35", "chain_pitch": "#35"}'::jsonb,
    44.99,
    true
  )
ON CONFLICT (slug) DO UPDATE SET 
  is_active = true,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price;

-- ============================================================================
-- TORQUE CONVERTERS
-- ============================================================================

INSERT INTO parts (
  slug, name, category, category_id, brand, specifications, price, is_active
) VALUES
  (
    'comet-30-series-torque-converter',
    'Comet 30 Series Torque Converter',
    'torque_converter',
    (SELECT id FROM part_categories WHERE slug = 'torque_converter'),
    'Comet',
    '{"bore_in": 0.75, "driver_pulley": "6", "driven_pulley": "7", "belt": "203589", "series": "30"}'::jsonb,
    199.99,
    true
  ),
  (
    'comet-40-series-torque-converter',
    'Comet 40 Series Torque Converter',
    'torque_converter',
    (SELECT id FROM part_categories WHERE slug = 'torque_converter'),
    'Comet',
    '{"bore_in": 0.75, "driver_pulley": "7", "driven_pulley": "8", "belt": "203780", "series": "40"}'::jsonb,
    249.99,
    true
  )
ON CONFLICT (slug) DO UPDATE SET 
  is_active = true,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price;

-- ============================================================================
-- CHAINS
-- ============================================================================

INSERT INTO parts (
  slug, name, category, category_id, brand, specifications, price, is_active
) VALUES
  (
    'chain-35-10ft',
    '#35 Chain 10ft',
    'chain',
    (SELECT id FROM part_categories WHERE slug = 'chain'),
    'Generic',
    '{"chain_size": "#35", "pitch": "#35", "length_ft": 10, "links": 120, "pitch_in": 0.375}'::jsonb,
    24.99,
    true
  ),
  (
    'chain-40-10ft',
    '#40 Chain 10ft',
    'chain',
    (SELECT id FROM part_categories WHERE slug = 'chain'),
    'Generic',
    '{"chain_size": "#40", "pitch": "#40", "length_ft": 10, "links": 120, "pitch_in": 0.5}'::jsonb,
    29.99,
    true
  ),
  (
    'chain-420-10ft',
    '#420 Chain 10ft',
    'chain',
    (SELECT id FROM part_categories WHERE slug = 'chain'),
    'Generic',
    '{"chain_size": "#420", "pitch": "#420", "length_ft": 10, "links": 120, "pitch_in": 0.375}'::jsonb,
    19.99,
    true
  )
ON CONFLICT (slug) DO UPDATE SET 
  is_active = true,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price;

-- ============================================================================
-- SPROCKETS
-- ============================================================================

INSERT INTO parts (
  slug, name, category, category_id, brand, specifications, price, is_active
) VALUES
  (
    'sprocket-35-10-tooth',
    '#35 Sprocket 10 Tooth',
    'sprocket',
    (SELECT id FROM part_categories WHERE slug = 'sprocket'),
    'Generic',
    '{"chain_size": "#35", "pitch": "#35", "teeth": 10, "bore_in": 0.75, "type": "driver"}'::jsonb,
    12.99,
    true
  ),
  (
    'sprocket-35-60-tooth',
    '#35 Sprocket 60 Tooth',
    'sprocket',
    (SELECT id FROM part_categories WHERE slug = 'sprocket'),
    'Generic',
    '{"chain_size": "#35", "pitch": "#35", "teeth": 60, "bore_in": 1.0, "type": "driven"}'::jsonb,
    19.99,
    true
  ),
  (
    'sprocket-40-12-tooth',
    '#40 Sprocket 12 Tooth',
    'sprocket',
    (SELECT id FROM part_categories WHERE slug = 'sprocket'),
    'Generic',
    '{"chain_size": "#40", "pitch": "#40", "teeth": 12, "bore_in": 0.75, "type": "driver"}'::jsonb,
    14.99,
    true
  )
ON CONFLICT (slug) DO UPDATE SET 
  is_active = true,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price;

-- ============================================================================
-- BRAKES
-- ============================================================================

INSERT INTO parts (
  slug, name, category, category_id, brand, specifications, price, is_active
) VALUES
  (
    'disc-brake-kit-6-inch',
    'Disc Brake Kit 6"',
    'brake',
    (SELECT id FROM part_categories WHERE slug = 'brake'),
    'Generic',
    '{"type": "disc", "rotor_diameter": "6", "caliper_type": "single_piston", "mount_type": "bolt_on"}'::jsonb,
    89.99,
    true
  ),
  (
    'drum-brake-kit',
    'Drum Brake Kit',
    'brake',
    (SELECT id FROM part_categories WHERE slug = 'brake'),
    'Generic',
    '{"type": "drum", "drum_diameter": "6", "mount_type": "bolt_on"}'::jsonb,
    59.99,
    true
  )
ON CONFLICT (slug) DO UPDATE SET 
  is_active = true,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price;

-- ============================================================================
-- VERIFICATION QUERY (can be run to check seed data)
-- ============================================================================
-- Run this in Supabase SQL editor to verify:
/*
SELECT 
  p.slug,
  p.name,
  p.category,
  pc.name as category_name,
  p.brand,
  p.price,
  p.is_active
FROM parts p
LEFT JOIN part_categories pc ON pc.id = p.category_id
ORDER BY p.category, p.brand, p.name;
*/
