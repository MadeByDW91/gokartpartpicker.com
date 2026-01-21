-- ============================================================================
-- Test Seed Insert - Run this to verify inserts work
-- ============================================================================

-- Test 1: Insert a simple engine (minimal fields)
INSERT INTO engines (
  slug, 
  name, 
  brand, 
  model, 
  displacement_cc,
  horsepower, 
  shaft_diameter, 
  shaft_length, 
  shaft_type,
  mount_type,
  is_active
) VALUES (
  'test-simple-engine',
  'Test Simple Engine',
  'Test',
  'Test',
  100,
  5.0,
  0.750,
  2.0,
  'straight',
  'test',
  true
)
ON CONFLICT (slug) DO UPDATE 
SET 
  name = EXCLUDED.name,
  is_active = true
RETURNING id, slug, name, is_active;

-- Test 2: Check if it was inserted
SELECT id, slug, name, brand, is_active 
FROM engines 
WHERE slug = 'test-simple-engine';

-- Test 3: Try to query it with RLS (as anon user)
-- This simulates what the frontend sees
SET ROLE anon;
SELECT id, slug, name, brand, is_active 
FROM engines 
WHERE slug = 'test-simple-engine' AND is_active = true;
RESET ROLE;

-- Test 4: Check part_categories exist (required for parts)
SELECT id, slug, name, is_active 
FROM part_categories 
WHERE slug IN ('clutch', 'torque_converter', 'exhaust', 'air_filter', 'carburetor')
ORDER BY slug;

-- Test 5: Insert a simple part (if categories exist)
INSERT INTO parts (
  slug,
  name,
  category,
  category_id,
  brand,
  price,
  is_active
) VALUES (
  'test-simple-part',
  'Test Simple Part',
  'clutch',
  (SELECT id FROM part_categories WHERE slug = 'clutch' LIMIT 1),
  'Test',
  29.99,
  true
)
ON CONFLICT (slug) DO UPDATE 
SET 
  name = EXCLUDED.name,
  is_active = true
RETURNING id, slug, name, category, is_active;

-- Test 6: Check if part was inserted
SELECT id, slug, name, category, brand, is_active 
FROM parts 
WHERE slug = 'test-simple-part';
