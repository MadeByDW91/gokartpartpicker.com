-- ============================================================================
-- GoKart Part Picker - Engine Seed Data
-- Created: 2026-01-16
-- Description: Initial engine catalog with popular small engines
-- Owner: DB Architect + Coordinator Agent (A1)
-- ============================================================================

-- ============================================================================
-- PREDATOR ENGINES (Harbor Freight)
-- ============================================================================

-- Predator 79cc
INSERT INTO engines (
  slug, name, brand, model, variant, displacement_cc,
  horsepower, torque, shaft_diameter, shaft_length, shaft_keyway, shaft_type,
  mount_type, oil_capacity_oz, weight_lbs,
  notes
) VALUES (
  'predator-79', 'Predator 79cc', 'Predator', '79', NULL, 79,
  2.5, 3.0, 0.750, 2.125, 0.1875, 'straight',
  '97mm x 80mm', 11.8, 20.9,
  'Compact engine popular for mini bikes. Clone of Honda GXH50. Great for kids go-karts.'
)
ON CONFLICT (slug) DO NOTHING;

-- Predator 212cc Non-Hemi (Old Style)
INSERT INTO engines (
  slug, name, brand, model, variant, displacement_cc,
  horsepower, torque, shaft_diameter, shaft_length, shaft_keyway, shaft_type,
  mount_type, oil_capacity_oz, fuel_tank_oz, weight_lbs,
  notes
) VALUES (
  'predator-212-non-hemi', 'Predator 212 Non-Hemi', 'Predator', '212', 'Non-Hemi', 212,
  6.5, 8.1, 0.750, 2.3125, 0.1875, 'straight',
  '162mm x 75.5mm', 20.3, 121.7, 34.8,
  'Original 212cc design. Flat-top piston, smaller valves. Still popular for reliability. Great aftermarket support.'
)
ON CONFLICT (slug) DO NOTHING;

-- Predator 212cc Hemi
INSERT INTO engines (
  slug, name, brand, model, variant, displacement_cc,
  horsepower, torque, shaft_diameter, shaft_length, shaft_keyway, shaft_type,
  mount_type, oil_capacity_oz, fuel_tank_oz, weight_lbs,
  notes
) VALUES (
  'predator-212-hemi', 'Predator 212 Hemi', 'Predator', '212', 'Hemi', 212,
  6.5, 8.1, 0.750, 2.3125, 0.1875, 'straight',
  '162mm x 75.5mm', 20.3, 121.7, 34.8,
  'Updated design with hemispherical combustion chamber. Domed piston, larger valves. Better flow, more power potential. Most popular engine for go-kart builds.'
)
ON CONFLICT (slug) DO NOTHING;

-- Predator Ghost 212cc
INSERT INTO engines (
  slug, name, brand, model, variant, displacement_cc,
  horsepower, torque, shaft_diameter, shaft_length, shaft_keyway, shaft_type,
  mount_type, oil_capacity_oz, fuel_tank_oz, weight_lbs,
  notes
) VALUES (
  'predator-ghost', 'Predator Ghost 212', 'Predator', 'Ghost', NULL, 212,
  7.0, 9.0, 0.750, 2.3125, 0.1875, 'straight',
  '162mm x 75.5mm', 20.3, 121.7, 32.0,
  'Performance-oriented 212. Lighter flywheel, better cam, improved head design. Stock has more power than standard 212. Designed for racing applications.'
)
ON CONFLICT (slug) DO NOTHING;

-- Predator 224cc
INSERT INTO engines (
  slug, name, brand, model, variant, displacement_cc,
  horsepower, torque, shaft_diameter, shaft_length, shaft_keyway, shaft_type,
  mount_type, oil_capacity_oz, fuel_tank_oz, weight_lbs,
  notes
) VALUES (
  'predator-224', 'Predator 224', 'Predator', '224', NULL, 224,
  7.5, 11.2, 0.875, 2.125, 0.1875, 'straight',
  '162mm x 75.5mm', 20.3, 121.7, 35.9,
  'Longer stroke version of 212. More torque, same mounting pattern. 7/8" shaft requires different clutch. Popular for mud and trail builds.'
)
ON CONFLICT (slug) DO NOTHING;

-- Predator 301cc
INSERT INTO engines (
  slug, name, brand, model, variant, displacement_cc,
  horsepower, torque, shaft_diameter, shaft_length, shaft_keyway, shaft_type,
  mount_type, oil_capacity_oz, fuel_tank_oz, weight_lbs,
  notes
) VALUES (
  'predator-301', 'Predator 301', 'Predator', '301', NULL, 301,
  8.0, 14.0, 1.000, 2.500, 0.250, 'straight',
  '178mm x 92mm', 37.2, 202.9, 55.1,
  'Mid-size engine. 1" shaft for heavy-duty applications. Great for larger go-karts and utility vehicles. Same mounting as GX270/GX340.'
)
ON CONFLICT (slug) DO NOTHING;

-- Predator 420cc
INSERT INTO engines (
  slug, name, brand, model, variant, displacement_cc,
  horsepower, torque, shaft_diameter, shaft_length, shaft_keyway, shaft_type,
  mount_type, oil_capacity_oz, fuel_tank_oz, weight_lbs,
  notes
) VALUES (
  'predator-420', 'Predator 420', 'Predator', '420', NULL, 420,
  13.0, 18.4, 1.000, 3.500, 0.250, 'straight',
  '198mm x 92mm', 37.2, 209.5, 68.3,
  'Popular mid-large engine. Clone of Honda GX390. Great power for the price. Used in racing, go-karts, and utility applications.'
)
ON CONFLICT (slug) DO NOTHING;

-- Predator 670cc
INSERT INTO engines (
  slug, name, brand, model, variant, displacement_cc,
  horsepower, torque, shaft_diameter, shaft_length, shaft_keyway, shaft_type,
  mount_type, oil_capacity_oz, fuel_tank_oz, weight_lbs,
  notes
) VALUES (
  'predator-670', 'Predator 670 V-Twin', 'Predator', '670', NULL, 670,
  22.0, 37.0, 1.000, 3.500, 0.3125, 'straight',
  '203mm x 116mm', 64.2, 777.1, 92.6,
  'V-twin engine with serious power. Electric start standard. Great for large go-karts, buggies, and off-road vehicles. Best bang for buck in V-twin category.'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- HONDA ENGINES
-- ============================================================================

-- Honda GX200
INSERT INTO engines (
  slug, name, brand, model, variant, displacement_cc,
  horsepower, torque, shaft_diameter, shaft_length, shaft_keyway, shaft_type,
  mount_type, oil_capacity_oz, fuel_tank_oz, weight_lbs,
  notes
) VALUES (
  'honda-gx200', 'Honda GX200', 'Honda', 'GX200', NULL, 196,
  5.5, 9.1, 0.750, 2.28125, 0.1875, 'straight',
  '162mm x 75.5mm', 20.3, 104.8, 35.5,
  'The original. Industry standard for small engine reliability. Same mounting pattern as Predator 212. OHV design. Gold standard for racing classes requiring stock Honda.'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- BRIGGS & STRATTON ENGINES
-- ============================================================================

-- Briggs 206
INSERT INTO engines (
  slug, name, brand, model, variant, displacement_cc,
  horsepower, torque, shaft_diameter, shaft_length, shaft_keyway, shaft_type,
  mount_type, oil_capacity_oz, weight_lbs,
  notes
) VALUES (
  'briggs-206', 'Briggs & Stratton 206', 'Briggs & Stratton', '206', NULL, 206,
  5.5, 8.5, 0.750, 2.250, 0.1875, 'straight',
  '162mm x 75.5mm', 20.3, 28.7,
  'Purpose-built racing engine. Sealed for class racing - no modifications allowed. Used in LO206 racing class nationwide. Very affordable racing series. Side cover seal ensures stock internals.'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERY (can be run to check seed data)
-- ============================================================================
-- Run this in Supabase SQL editor to verify:
/*
SELECT 
  slug,
  name,
  brand,
  displacement_cc,
  horsepower,
  shaft_diameter
FROM engines
ORDER BY brand, displacement_cc;
*/

