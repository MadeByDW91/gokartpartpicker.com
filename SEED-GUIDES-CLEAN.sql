-- ============================================================================
-- GoKart Part Picker - Installation Guides Seed Data
-- Created: 2026-01-16
-- Description: Comprehensive installation guides for go-kart engines and parts
-- 
-- INSTRUCTIONS:
-- 1. Open Supabase SQL Editor
-- 2. Copy and paste this ENTIRE file
-- 3. Run the query
-- 4. Verify guides were created successfully
-- ============================================================================

-- ============================================================================
-- PREDATOR 212 HEMI GUIDES (Most Popular Engine)
-- ============================================================================

-- Guide 1: Installing Predator 212 Hemi on Go-Kart Frame
INSERT INTO content (
  slug, title, excerpt, body, content_type, category, difficulty_level,
  estimated_time_minutes, related_engine_id, tags, is_published, published_at
) VALUES (
  'install-predator-212-hemi-go-kart',
  'How to Install Predator 212 Hemi Engine on Go-Kart Frame',
  'Complete step-by-step guide to mounting your Predator 212 Hemi engine on a go-kart frame. Includes mounting plate installation, alignment, and safety checks.',
  'This comprehensive guide will walk you through installing a Predator 212 Hemi engine on your go-kart frame. Proper installation is crucial for safety and performance.',
  'guide',
  'Installation',
  'intermediate',
  60,
  (SELECT id FROM engines WHERE slug = 'predator-212-hemi' LIMIT 1),
  ARRAY['installation', 'engine', 'predator-212', 'mounting', 'frame'],
  true,
  NOW()
);

-- Steps for Guide 1
INSERT INTO guide_steps (guide_id, step_number, title, description, instructions, sort_order, warning, tips) VALUES
((SELECT id FROM content WHERE slug = 'install-predator-212-hemi-go-kart' LIMIT 1), 1, 'Prepare the Frame', 'Inspect and prepare your go-kart frame for engine installation', '1. Inspect the frame for cracks or damage. 2. Clean the mounting area thoroughly. 3. Measure the mounting plate dimensions (6.5" x 7.5" for Predator 212). 4. Mark the mounting hole locations.', 1, 'Always work on a level surface and use proper safety equipment.', 'Use a wire brush to clean rust and debris from the mounting area.'),
((SELECT id FROM content WHERE slug = 'install-predator-212-hemi-go-kart' LIMIT 1), 2, 'Install Mounting Plate', 'Attach the engine mounting plate to the frame', '1. Position the mounting plate on the frame. 2. Align the plate using the marked locations. 3. Drill pilot holes if needed. 4. Secure with grade 8 bolts (minimum 3/8" diameter). 5. Torque bolts to 25-30 ft-lbs.', 2, 'Use lock washers to prevent bolts from loosening during operation.', 'Double-check alignment before drilling. Measure twice, drill once.'),
((SELECT id FROM content WHERE slug = 'install-predator-212-hemi-go-kart' LIMIT 1), 3, 'Mount the Engine', 'Secure the engine to the mounting plate', '1. Lift the engine carefully onto the mounting plate. 2. Align the engine mounting holes with the plate holes. 3. Install mounting bolts with lock washers. 4. Torque bolts to 25-30 ft-lbs in a star pattern. 5. Check for proper clearance from frame and other components.', 3, 'Never lift the engine by the carburetor or fuel lines. Use proper lifting equipment.', 'Have a helper assist with engine placement for safety.'),
((SELECT id FROM content WHERE slug = 'install-predator-212-hemi-go-kart' LIMIT 1), 4, 'Connect Fuel System', 'Install and connect the fuel tank and lines', '1. Mount the fuel tank in a secure location. 2. Install fuel line from tank to carburetor. 3. Install fuel filter in the line. 4. Check for leaks. 5. Prime the carburetor if needed.', 4, 'Always use fuel line rated for gasoline. Check for leaks before starting the engine.', 'Use zip ties to secure fuel lines away from hot components.'),
((SELECT id FROM content WHERE slug = 'install-predator-212-hemi-go-kart' LIMIT 1), 5, 'Final Checks', 'Perform safety and operational checks', '1. Verify all bolts are properly torqued. 2. Check engine oil level. 3. Inspect fuel system for leaks. 4. Verify throttle linkage operates smoothly. 5. Check clearance between engine and frame. 6. Test engine start and idle.', 5, 'Never skip safety checks. A loose engine can cause serious injury.', 'Keep a torque wrench handy for periodic checks during break-in period.');

-- Guide 2: Predator 212 Hemi Oil Change and Maintenance
INSERT INTO content (
  slug, title, excerpt, body, content_type, category, difficulty_level,
  estimated_time_minutes, related_engine_id, tags, is_published, published_at
) VALUES (
  'predator-212-hemi-oil-change',
  'Predator 212 Hemi Oil Change and Maintenance Guide',
  'Learn how to properly change the oil in your Predator 212 Hemi engine. Includes oil type recommendations, change intervals, and maintenance tips.',
  'Regular oil changes are essential for engine longevity. This guide covers everything you need to know about maintaining your Predator 212 Hemi engine.',
  'guide',
  'Maintenance',
  'beginner',
  20,
  (SELECT id FROM engines WHERE slug = 'predator-212-hemi' LIMIT 1),
  ARRAY['maintenance', 'oil change', 'predator-212', 'engine care'],
  true,
  NOW()
);

INSERT INTO guide_steps (guide_id, step_number, title, description, instructions, sort_order, warning, tips) VALUES
((SELECT id FROM content WHERE slug = 'predator-212-hemi-oil-change' LIMIT 1), 1, 'Warm Up Engine', 'Run the engine briefly to warm the oil', '1. Start the engine and let it run for 2-3 minutes. 2. This warms the oil and makes it easier to drain. 3. Turn off the engine and allow to cool slightly.', 1, 'Be careful - the engine and oil will be hot. Use gloves.', 'Warm oil drains more completely than cold oil.'),
((SELECT id FROM content WHERE slug = 'predator-212-hemi-oil-change' LIMIT 1), 2, 'Drain Old Oil', 'Remove the drain plug and drain the oil', '1. Place a drain pan under the engine. 2. Remove the oil drain plug (located on the bottom of the engine). 3. Allow oil to drain completely (5-10 minutes). 4. Clean the drain plug and reinstall with a new crush washer if available.', 2, 'Used oil is hazardous waste. Dispose of properly at a recycling center.', 'Tilt the engine slightly to ensure complete drainage.'),
((SELECT id FROM content WHERE slug = 'predator-212-hemi-oil-change' LIMIT 1), 3, 'Add New Oil', 'Fill with recommended oil type and quantity', '1. Use SAE 10W-30 or 5W-30 motor oil (20.3 oz capacity). 2. Pour oil slowly into the fill port. 3. Check oil level with dipstick. 4. Oil should be between the min and max marks. 5. Do not overfill.', 3, 'Overfilling can cause engine damage. Check level carefully.', 'Use a funnel to avoid spills. Check level on a level surface.');

-- Guide 3: Predator 212 Hemi Governor Removal
INSERT INTO content (
  slug, title, excerpt, body, content_type, category, difficulty_level,
  estimated_time_minutes, related_engine_id, tags, is_published, published_at
) VALUES (
  'predator-212-hemi-governor-removal',
  'How to Remove Governor from Predator 212 Hemi',
  'Step-by-step guide to removing the governor from your Predator 212 Hemi engine for increased RPM and performance.',
  'Removing the governor allows the engine to reach higher RPMs, but requires additional modifications for safety. This guide covers the complete process.',
  'guide',
  'Modification',
  'advanced',
  90,
  (SELECT id FROM engines WHERE slug = 'predator-212-hemi' LIMIT 1),
  ARRAY['modification', 'governor removal', 'performance', 'predator-212', 'advanced'],
  true,
  NOW()
);

INSERT INTO guide_steps (guide_id, step_number, title, description, instructions, sort_order, warning, tips) VALUES
((SELECT id FROM content WHERE slug = 'predator-212-hemi-governor-removal' LIMIT 1), 1, 'Remove Side Cover', 'Access the governor mechanism', '1. Drain the engine oil. 2. Remove the side cover bolts. 3. Carefully remove the side cover. 4. Note the position of all components before removal.', 1, 'WARNING: Removing the governor voids warranty and requires additional safety modifications. Engine may exceed safe RPM limits.', 'Take photos before disassembly for reference.'),
((SELECT id FROM content WHERE slug = 'predator-212-hemi-governor-removal' LIMIT 1), 2, 'Remove Governor Gear', 'Extract the governor gear assembly', '1. Locate the governor gear on the camshaft. 2. Remove the retaining clip. 3. Slide the gear off the camshaft. 4. Remove the governor arm and linkage.', 2, 'The engine will no longer have RPM limiting. You MUST install a billet rod and flywheel for safety.', 'Keep all removed parts in labeled bags.'),
((SELECT id FROM content WHERE slug = 'predator-212-hemi-governor-removal' LIMIT 1), 3, 'Block Governor Hole', 'Seal the governor opening', '1. Install a governor removal kit or block-off plate. 2. Use proper sealant on threads. 3. Torque to specification. 4. Verify no oil leaks.', 3, 'Improper sealing will cause oil leaks and engine failure.', 'Use thread sealant rated for engine oil.'),
((SELECT id FROM content WHERE slug = 'predator-212-hemi-governor-removal' LIMIT 1), 4, 'Reassemble and Safety Mods', 'Reinstall components and add required safety parts', '1. Reinstall side cover with new gasket. 2. Refill with oil. 3. Install billet connecting rod (REQUIRED). 4. Install billet flywheel (REQUIRED). 5. Consider upgrading valve springs.', 4, 'CRITICAL: Without billet rod and flywheel, the engine can explode at high RPM. Never run without these upgrades.', 'This modification should only be done by experienced mechanics.');

-- Note: This is a shortened version with the first 3 guides
-- The full file (SEED-GUIDES.sql) contains all 20 guides
-- Continue with remaining guides from the original file...
