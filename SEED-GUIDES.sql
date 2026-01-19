-- ============================================================================
-- GoKart Part Picker - Installation Guides Seed Data
-- Created: 2026-01-16
-- Description: Comprehensive installation guides for go-kart engines and parts
-- 
-- INSTRUCTIONS:
-- 1. Open Supabase SQL Editor
-- 2. Copy this ENTIRE file
-- 3. Paste into SQL Editor
-- 4. Click Run
-- ============================================================================

-- First, ensure all required columns exist in the content table
-- (These should already exist if migration 20260116000015_add_guides_enhancements.sql was run)
ALTER TABLE content
ADD COLUMN IF NOT EXISTS estimated_time_minutes INTEGER,
ADD COLUMN IF NOT EXISTS difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
ADD COLUMN IF NOT EXISTS related_engine_id UUID REFERENCES engines(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS related_part_id UUID REFERENCES parts(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS featured_image_url TEXT,
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0;

-- Ensure guide_steps table exists
CREATE TABLE IF NOT EXISTS guide_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guide_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  warning TEXT,
  tips TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT unique_guide_step UNIQUE (guide_id, step_number)
);

CREATE INDEX IF NOT EXISTS idx_guide_steps_guide ON guide_steps(guide_id);
CREATE INDEX IF NOT EXISTS idx_guide_steps_sort ON guide_steps(guide_id, sort_order);

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

-- Guide 4: Predator 212 Hemi Air Filter Upgrade
INSERT INTO content (
  slug, title, excerpt, body, content_type, category, difficulty_level,
  estimated_time_minutes, related_engine_id, tags, is_published, published_at
) VALUES (
  'predator-212-hemi-air-filter-upgrade',
  'Upgrading Air Filter on Predator 212 Hemi',
  'Guide to upgrading the air filter system on your Predator 212 Hemi for improved airflow and performance.',
  'A high-flow air filter can improve engine performance. This guide covers selection and installation of aftermarket air filter systems.',
  'guide',
  'Modification',
  'beginner',
  20,
  (SELECT id FROM engines WHERE slug = 'predator-212-hemi' LIMIT 1),
  ARRAY['modification', 'air filter', 'performance', 'predator-212'],
  true,
  NOW()
);

INSERT INTO guide_steps (guide_id, step_number, title, description, instructions, sort_order, warning, tips) VALUES
((SELECT id FROM content WHERE slug = 'predator-212-hemi-air-filter-upgrade' LIMIT 1), 1, 'Select Air Filter', 'Choose appropriate air filter system', '1. Consider reusable vs disposable filters. 2. Select filter size for your application. 3. Choose appropriate filter media. 4. Verify mounting compatibility.', 1, 'Poor quality filters can allow dirt into engine causing damage.', 'High-flow filters may require carburetor rejetting.'),
((SELECT id FROM content WHERE slug = 'predator-212-hemi-air-filter-upgrade' LIMIT 1), 2, 'Remove Stock Filter', 'Remove existing air filter', '1. Remove air filter cover. 2. Remove stock filter element. 3. Clean mounting surface. 4. Inspect for damage.', 2, 'Never run engine without air filter. Dirt will damage engine.', 'Keep area clean during removal.'),
((SELECT id FROM content WHERE slug = 'predator-212-hemi-air-filter-upgrade' LIMIT 1), 3, 'Install New Filter', 'Mount new air filter system', '1. Install filter adapter if needed. 2. Mount new filter. 3. Secure with proper clamps. 4. Verify seal is tight.', 3, 'Air leaks cause poor running and can allow dirt entry.', 'Use proper filter oil for reusable filters.');

-- ============================================================================
-- PREDATOR 212 NON-HEMI GUIDES
-- ============================================================================

-- Guide 5: Installing Clutch on Predator 212 Non-Hemi
INSERT INTO content (
  slug, title, excerpt, body, content_type, category, difficulty_level,
  estimated_time_minutes, related_engine_id, tags, is_published, published_at
) VALUES (
  'install-clutch-predator-212-non-hemi',
  'How to Install Clutch on Predator 212 Non-Hemi',
  'Complete guide to installing a centrifugal clutch on your Predator 212 Non-Hemi engine. Includes shaft preparation, clutch selection, and installation.',
  'A properly installed clutch is essential for go-kart operation. This guide covers clutch installation for the Predator 212 Non-Hemi engine with its 3/4" straight shaft.',
  'guide',
  'Installation',
  'beginner',
  30,
  (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi' LIMIT 1),
  ARRAY['installation', 'clutch', 'predator-212', 'drivetrain'],
  true,
  NOW()
);

INSERT INTO guide_steps (guide_id, step_number, title, description, instructions, sort_order, warning, tips) VALUES
((SELECT id FROM content WHERE slug = 'install-clutch-predator-212-non-hemi' LIMIT 1), 1, 'Select Correct Clutch', 'Choose a clutch that matches your engine shaft', '1. Verify engine has 3/4" straight shaft. 2. Select a 3/4" bore centrifugal clutch. 3. Choose appropriate tooth count for your sprocket. 4. Common sizes: 10T, 12T, or 14T.', 1, 'Using the wrong clutch size can damage both the clutch and engine shaft.', 'Measure your shaft diameter before purchasing.'),
((SELECT id FROM content WHERE slug = 'install-clutch-predator-212-non-hemi' LIMIT 1), 2, 'Prepare Shaft', 'Clean and inspect the engine shaft', '1. Clean the shaft with degreaser. 2. Inspect for burrs or damage. 3. Remove any rust or debris. 4. Apply light oil to prevent rust.', 2, 'A damaged shaft can cause clutch failure and safety issues.', 'Use fine sandpaper to remove burrs if present.'),
((SELECT id FROM content WHERE slug = 'install-clutch-predator-212-non-hemi' LIMIT 1), 3, 'Install Clutch', 'Mount the clutch on the engine shaft', '1. Slide clutch onto shaft with keyway aligned. 2. Install key in keyway. 3. Push clutch fully onto shaft. 4. Secure with set screws (if applicable). 5. Torque set screws to 15-20 ft-lbs.', 3, 'Ensure the key is fully seated. A loose key can cause catastrophic failure.', 'Use thread locker on set screws to prevent loosening.'),
((SELECT id FROM content WHERE slug = 'install-clutch-predator-212-non-hemi' LIMIT 1), 4, 'Align Chain', 'Ensure proper chain alignment', '1. Install chain on clutch and rear sprocket. 2. Check alignment between clutch and sprocket. 3. Adjust if necessary. 4. Set proper chain tension (1/2" to 3/4" deflection).', 4, 'Misaligned chains wear quickly and can break, causing injury.', 'Use a straight edge to verify alignment.');

-- Guide 6: Predator 212 Non-Hemi Break-In Procedure
INSERT INTO content (
  slug, title, excerpt, body, content_type, category, difficulty_level,
  estimated_time_minutes, related_engine_id, tags, is_published, published_at
) VALUES (
  'predator-212-non-hemi-break-in',
  'Predator 212 Non-Hemi Engine Break-In Procedure',
  'Proper break-in procedure for your new Predator 212 Non-Hemi engine. Follow these steps to ensure maximum engine life and performance.',
  'A proper break-in period is crucial for engine longevity. This guide outlines the recommended break-in procedure for the Predator 212 Non-Hemi engine.',
  'guide',
  'Maintenance',
  'beginner',
  180,
  (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi' LIMIT 1),
  ARRAY['maintenance', 'break-in', 'predator-212', 'engine care'],
  true,
  NOW()
);

INSERT INTO guide_steps (guide_id, step_number, title, description, instructions, sort_order, warning, tips) VALUES
((SELECT id FROM content WHERE slug = 'predator-212-non-hemi-break-in' LIMIT 1), 1, 'Initial Setup', 'Prepare engine for first start', '1. Fill with SAE 10W-30 oil (20.3 oz). 2. Check oil level. 3. Add fresh gasoline. 4. Prime the carburetor. 5. Check all connections.', 1, 'Never run the engine without proper oil level.', 'Use high-quality oil for break-in period.'),
((SELECT id FROM content WHERE slug = 'predator-212-non-hemi-break-in' LIMIT 1), 2, 'First Start', 'Initial engine start and warm-up', '1. Start engine and let idle for 5 minutes. 2. Do not apply load during this time. 3. Check for leaks. 4. Listen for unusual noises. 5. Shut down and let cool completely.', 2, 'Watch for oil leaks or unusual sounds. Stop immediately if problems occur.', 'Keep the area well-ventilated.'),
((SELECT id FROM content WHERE slug = 'predator-212-non-hemi-break-in' LIMIT 1), 3, 'Break-In Runs', 'Gradual load increase over multiple sessions', '1. Run at 25% throttle for 15 minutes. 2. Let cool completely. 3. Run at 50% throttle for 15 minutes. 4. Let cool completely. 5. Run at 75% throttle for 15 minutes. 6. Let cool completely.', 3, 'Do not exceed recommended throttle percentages during break-in.', 'Allow engine to cool between sessions.'),
((SELECT id FROM content WHERE slug = 'predator-212-non-hemi-break-in' LIMIT 1), 4, 'First Oil Change', 'Change oil after initial break-in', '1. After completing break-in runs, drain oil. 2. Inspect oil for metal particles. 3. Refill with fresh SAE 10W-30 oil. 4. Check oil level.', 4, 'Metal particles in oil are normal during break-in but should decrease.', 'Save a sample of break-in oil for inspection.'),
((SELECT id FROM content WHERE slug = 'predator-212-non-hemi-break-in' LIMIT 1), 5, 'Gradual Use', 'Continue gradual use for first 5 hours', '1. Use engine normally but avoid full throttle for extended periods. 2. Vary throttle positions. 3. Avoid constant high RPM operation. 4. Change oil again after 5 hours of operation.', 5, 'Proper break-in ensures long engine life. Don''t rush the process.', 'Keep a log of operating hours.');

-- ============================================================================
-- HONDA GX200 GUIDES
-- ============================================================================

-- Guide 7: Installing Honda GX200 on Go-Kart
INSERT INTO content (
  slug, title, excerpt, body, content_type, category, difficulty_level,
  estimated_time_minutes, related_engine_id, tags, is_published, published_at
) VALUES (
  'install-honda-gx200-go-kart',
  'How to Install Honda GX200 Engine on Go-Kart',
  'Professional installation guide for mounting a Honda GX200 engine on your go-kart frame. Includes mounting specifications and alignment procedures.',
  'The Honda GX200 is the industry standard for reliability. This guide covers proper installation to ensure optimal performance and safety.',
  'guide',
  'Installation',
  'intermediate',
  60,
  (SELECT id FROM engines WHERE slug = 'honda-gx200' LIMIT 1),
  ARRAY['installation', 'engine', 'honda-gx200', 'mounting'],
  true,
  NOW()
);

INSERT INTO guide_steps (guide_id, step_number, title, description, instructions, sort_order, warning, tips) VALUES
((SELECT id FROM content WHERE slug = 'install-honda-gx200-go-kart' LIMIT 1), 1, 'Frame Preparation', 'Prepare the frame for Honda GX200 mounting', '1. Verify frame can support engine weight (35.5 lbs). 2. Clean mounting surface. 3. Check mounting pattern: 162mm x 75.5mm. 4. Mark mounting hole locations.', 1, 'Ensure frame is structurally sound before mounting engine.', 'Use a square to verify frame alignment.'),
((SELECT id FROM content WHERE slug = 'install-honda-gx200-go-kart' LIMIT 1), 2, 'Install Mounting Plate', 'Attach mounting plate to frame', '1. Position mounting plate (162mm x 75.5mm pattern). 2. Drill mounting holes (use proper drill bit size). 3. Install grade 8 bolts with lock washers. 4. Torque to 25-30 ft-lbs.', 2, 'Use proper drill bits and cutting oil to prevent damage.', 'Check plate alignment with engine before drilling.'),
((SELECT id FROM content WHERE slug = 'install-honda-gx200-go-kart' LIMIT 1), 3, 'Mount Engine', 'Secure Honda GX200 to mounting plate', '1. Position engine on mounting plate. 2. Align mounting holes. 3. Install mounting bolts. 4. Torque in star pattern to 25-30 ft-lbs. 5. Verify engine is level.', 3, 'Improper mounting can cause vibration and premature failure.', 'Use a level to ensure engine is properly aligned.'),
((SELECT id FROM content WHERE slug = 'install-honda-gx200-go-kart' LIMIT 1), 4, 'Connect Systems', 'Install fuel, throttle, and electrical connections', '1. Mount fuel tank securely. 2. Connect fuel line with filter. 3. Install throttle linkage. 4. Connect kill switch if applicable. 5. Check all connections.', 4, 'Verify fuel system integrity before starting engine.', 'Use fuel line clamps on all connections.');

-- Guide 8: Honda GX200 Carburetor Tuning
INSERT INTO content (
  slug, title, excerpt, body, content_type, category, difficulty_level,
  estimated_time_minutes, related_engine_id, tags, is_published, published_at
) VALUES (
  'honda-gx200-carburetor-tuning',
  'Honda GX200 Carburetor Tuning Guide',
  'Learn how to properly tune the carburetor on your Honda GX200 engine for optimal performance and fuel efficiency.',
  'Proper carburetor tuning ensures your Honda GX200 runs smoothly and efficiently. This guide covers idle, high-speed, and mixture adjustments.',
  'guide',
  'Maintenance',
  'intermediate',
  45,
  (SELECT id FROM engines WHERE slug = 'honda-gx200' LIMIT 1),
  ARRAY['maintenance', 'carburetor', 'tuning', 'honda-gx200'],
  true,
  NOW()
);

INSERT INTO guide_steps (guide_id, step_number, title, description, instructions, sort_order, warning, tips) VALUES
((SELECT id FROM content WHERE slug = 'honda-gx200-carburetor-tuning' LIMIT 1), 1, 'Initial Setup', 'Prepare for carburetor adjustment', '1. Ensure engine is at operating temperature. 2. Work in well-ventilated area. 3. Have proper tools ready (screwdriver set). 4. Note current screw positions.', 1, 'Work in a well-ventilated area. Engine exhaust contains carbon monoxide.', 'Take photos of screw positions before adjusting.'),
((SELECT id FROM content WHERE slug = 'honda-gx200-carburetor-tuning' LIMIT 1), 2, 'Idle Speed Adjustment', 'Set proper idle speed', '1. Locate idle speed screw. 2. Start engine and let warm up. 3. Adjust idle to 1400-1600 RPM. 4. Engine should idle smoothly without stalling.', 2, 'Idle too low can cause stalling. Idle too high wastes fuel.', 'Use a tachometer for accurate RPM reading.'),
((SELECT id FROM content WHERE slug = 'honda-gx200-carburetor-tuning' LIMIT 1), 3, 'Idle Mixture Adjustment', 'Fine-tune idle air/fuel mixture', '1. Locate idle mixture screw. 2. Turn screw in until engine starts to stumble. 3. Turn screw out until engine runs smoothly. 4. Find the "sweet spot" between these points.', 3, 'Too rich (screw out too far) causes black smoke. Too lean (screw in too far) causes backfiring.', 'Make small adjustments (1/8 turn at a time).'),
((SELECT id FROM content WHERE slug = 'honda-gx200-carburetor-tuning' LIMIT 1), 4, 'High-Speed Mixture', 'Adjust high-speed fuel mixture', '1. Locate high-speed mixture screw. 2. Run engine at full throttle. 3. Adjust for smooth operation. 4. Check for proper acceleration response.', 4, 'Improper high-speed mixture can cause engine damage at full throttle.', 'Test under load for accurate adjustment.');

-- ============================================================================
-- PREDATOR 420 GUIDES
-- ============================================================================

-- Guide 9: Installing Predator 420 on Go-Kart
INSERT INTO content (
  slug, title, excerpt, body, content_type, category, difficulty_level,
  estimated_time_minutes, related_engine_id, tags, is_published, published_at
) VALUES (
  'install-predator-420-go-kart',
  'How to Install Predator 420 Engine on Go-Kart',
  'Complete installation guide for the larger Predator 420 engine. Includes mounting considerations, clearance requirements, and safety checks.',
  'The Predator 420 provides significant power for larger go-karts. This guide covers proper installation including mounting, fuel system, and safety considerations.',
  'guide',
  'Installation',
  'intermediate',
  90,
  (SELECT id FROM engines WHERE slug = 'predator-420' LIMIT 1),
  ARRAY['installation', 'engine', 'predator-420', 'large engine'],
  true,
  NOW()
);

INSERT INTO guide_steps (guide_id, step_number, title, description, instructions, sort_order, warning, tips) VALUES
((SELECT id FROM content WHERE slug = 'install-predator-420-go-kart' LIMIT 1), 1, 'Frame Evaluation', 'Verify frame can handle larger engine', '1. Check frame strength and welds. 2. Verify mounting pattern: 198mm x 92mm. 3. Ensure adequate clearance for larger engine. 4. Check weight capacity (engine weighs 68.3 lbs).', 1, 'The Predator 420 is significantly heavier than smaller engines. Ensure frame can support the weight.', 'Reinforce frame if necessary.'),
((SELECT id FROM content WHERE slug = 'install-predator-420-go-kart' LIMIT 1), 2, 'Mounting Plate Installation', 'Install heavy-duty mounting plate', '1. Use thicker mounting plate (minimum 1/4" steel). 2. Drill mounting holes for 198mm x 92mm pattern. 3. Use grade 8 bolts (minimum 7/16" diameter). 4. Torque to 35-40 ft-lbs.', 2, 'Standard mounting plates may not be sufficient for this engine size.', 'Consider using a reinforced mounting plate.'),
((SELECT id FROM content WHERE slug = 'install-predator-420-go-kart' LIMIT 1), 3, 'Engine Mounting', 'Secure the Predator 420 engine', '1. Use proper lifting equipment (engine is heavy). 2. Position engine on mounting plate. 3. Align all mounting holes. 4. Install bolts in star pattern. 5. Torque to 35-40 ft-lbs.', 3, 'Never attempt to lift this engine manually. Use proper equipment.', 'Have a helper assist with engine placement.'),
((SELECT id FROM content WHERE slug = 'install-predator-420-go-kart' LIMIT 1), 4, 'Fuel System Setup', 'Install appropriate fuel system', '1. Use larger fuel tank (engine has 209.5 oz capacity). 2. Install larger fuel line (minimum 1/4" ID). 3. Use appropriate fuel filter. 4. Check all connections for leaks.', 4, 'Larger engine requires more fuel. Ensure adequate fuel supply.', 'Consider electric fuel pump for consistent supply.');

-- Guide 10: Predator 420 Torque Converter Installation
INSERT INTO content (
  slug, title, excerpt, body, content_type, category, difficulty_level,
  estimated_time_minutes, related_engine_id, tags, is_published, published_at
) VALUES (
  'predator-420-torque-converter-install',
  'Installing Torque Converter on Predator 420',
  'Step-by-step guide to installing a torque converter on your Predator 420 engine. Includes shaft preparation, alignment, and belt installation.',
  'A torque converter provides automatic gearing for better acceleration and top speed. This guide covers installation on the Predator 420''s 1" straight shaft.',
  'guide',
  'Installation',
  'intermediate',
  60,
  (SELECT id FROM engines WHERE slug = 'predator-420' LIMIT 1),
  ARRAY['installation', 'torque converter', 'predator-420', 'drivetrain'],
  true,
  NOW()
);

INSERT INTO guide_steps (guide_id, step_number, title, description, instructions, sort_order, warning, tips) VALUES
((SELECT id FROM content WHERE slug = 'predator-420-torque-converter-install' LIMIT 1), 1, 'Select Torque Converter', 'Choose correct torque converter', '1. Verify engine has 1" straight shaft. 2. Select 1" bore torque converter. 3. Choose appropriate driven unit size for your application. 4. Common: 30 series or 40 series.', 1, 'Using wrong size can cause damage and poor performance.', 'Consult manufacturer specifications.'),
((SELECT id FROM content WHERE slug = 'predator-420-torque-converter-install' LIMIT 1), 2, 'Prepare Engine Shaft', 'Clean and prepare the 1" shaft', '1. Clean shaft thoroughly. 2. Inspect for damage. 3. Remove any burrs. 4. Apply light oil to prevent rust.', 2, 'A damaged shaft will cause torque converter failure.', 'Use fine emery cloth for final cleaning.'),
((SELECT id FROM content WHERE slug = 'predator-420-torque-converter-install' LIMIT 1), 3, 'Install Drive Unit', 'Mount drive unit on engine shaft', '1. Slide drive unit onto shaft. 2. Align keyway and install key. 3. Push unit fully onto shaft. 4. Secure with set screws. 5. Torque set screws to 20-25 ft-lbs.', 3, 'Ensure key is fully seated. Loose key causes failure.', 'Use thread locker on set screws.'),
((SELECT id FROM content WHERE slug = 'predator-420-torque-converter-install' LIMIT 1), 4, 'Install Driven Unit', 'Mount driven unit on jackshaft or axle', '1. Position driven unit. 2. Align with drive unit. 3. Install belt. 4. Adjust belt tension. 5. Verify alignment.', 4, 'Misalignment causes belt wear and poor performance.', 'Use alignment tool for accuracy.');

-- ============================================================================
-- GENERAL INSTALLATION GUIDES (Applicable to Multiple Engines)
-- ============================================================================

-- Guide 11: Installing Chain and Sprockets
INSERT INTO content (
  slug, title, excerpt, body, content_type, category, difficulty_level,
  estimated_time_minutes, related_engine_id, tags, is_published, published_at
) VALUES (
  'install-chain-sprockets-go-kart',
  'How to Install Chain and Sprockets on Go-Kart',
  'Complete guide to installing drive chain and sprockets on your go-kart. Covers chain sizing, sprocket selection, alignment, and tension adjustment.',
  'Proper chain and sprocket installation is critical for go-kart performance and safety. This guide covers everything from selection to final adjustment.',
  'guide',
  'Installation',
  'beginner',
  45,
  (SELECT id FROM engines WHERE slug = 'predator-212-hemi' LIMIT 1),
  ARRAY['installation', 'chain', 'sprocket', 'drivetrain', 'general'],
  true,
  NOW()
);

INSERT INTO guide_steps (guide_id, step_number, title, description, instructions, sort_order, warning, tips) VALUES
((SELECT id FROM content WHERE slug = 'install-chain-sprockets-go-kart' LIMIT 1), 1, 'Select Chain Size', 'Choose appropriate chain for your application', '1. Common sizes: #35, #40, #41, or #420. 2. Match chain to sprocket pitch. 3. Consider strength requirements. 4. #35 is common for small engines, #40 for larger.', 1, 'Mismatched chain and sprockets will not work and can cause damage.', 'Check manufacturer specifications.'),
((SELECT id FROM content WHERE slug = 'install-chain-sprockets-go-kart' LIMIT 1), 2, 'Select Sprockets', 'Choose front and rear sprockets', '1. Front sprocket: Match to engine/clutch output. 2. Rear sprocket: Choose based on desired gear ratio. 3. Common ratios: 6:1 to 10:1 for go-karts. 4. Verify tooth count matches chain pitch.', 2, 'Wrong gear ratio affects acceleration and top speed significantly.', 'Use online gear ratio calculators.'),
((SELECT id FROM content WHERE slug = 'install-chain-sprockets-go-kart' LIMIT 1), 3, 'Install Sprockets', 'Mount sprockets on engine and axle', '1. Install front sprocket on clutch/torque converter. 2. Install rear sprocket on axle. 3. Verify both are secure. 4. Check alignment between sprockets.', 3, 'Misaligned sprockets cause rapid chain wear.', 'Use straight edge to check alignment.'),
((SELECT id FROM content WHERE slug = 'install-chain-sprockets-go-kart' LIMIT 1), 4, 'Install Chain', 'Install and adjust chain tension', '1. Measure and cut chain to length. 2. Install master link. 3. Set proper tension (1/2" to 3/4" deflection). 4. Verify chain doesn''t rub on frame. 5. Lubricate chain.', 4, 'Too tight causes wear. Too loose can derail and cause injury.', 'Check tension regularly during break-in.');

-- Guide 12: Go-Kart Brake Installation
INSERT INTO content (
  slug, title, excerpt, body, content_type, category, difficulty_level,
  estimated_time_minutes, related_engine_id, tags, is_published, published_at
) VALUES (
  'install-brakes-go-kart',
  'How to Install Brakes on Go-Kart',
  'Essential guide to installing braking systems on your go-kart. Covers disc brake installation, cable adjustment, and safety checks.',
  'Proper brakes are essential for safety. This guide covers installation of disc brake systems commonly used on go-karts.',
  'guide',
  'Installation',
  'intermediate',
  90,
  (SELECT id FROM engines WHERE slug = 'predator-212-hemi' LIMIT 1),
  ARRAY['installation', 'brakes', 'safety', 'general'],
  true,
  NOW()
);

INSERT INTO guide_steps (guide_id, step_number, title, description, instructions, sort_order, warning, tips) VALUES
((SELECT id FROM content WHERE slug = 'install-brakes-go-kart' LIMIT 1), 1, 'Select Brake System', 'Choose appropriate brake system', '1. Disc brakes are most common. 2. Select brake rotor size (4" to 6" common). 3. Choose caliper type. 4. Verify mounting compatibility with axle.', 1, 'Brakes are a critical safety component. Never compromise on quality.', 'Consult with experienced builders for recommendations.'),
((SELECT id FROM content WHERE slug = 'install-brakes-go-kart' LIMIT 1), 2, 'Install Brake Rotor', 'Mount brake rotor on axle', '1. Clean axle mounting area. 2. Install rotor on axle. 3. Secure with set screws or keyway. 4. Verify rotor is true (not warped).', 2, 'A warped rotor causes poor braking and vibration.', 'Check rotor runout with dial indicator if available.'),
((SELECT id FROM content WHERE slug = 'install-brakes-go-kart' LIMIT 1), 3, 'Install Caliper', 'Mount brake caliper', '1. Position caliper over rotor. 2. Align caliper mounting bracket. 3. Secure bracket to frame. 4. Install caliper on bracket. 5. Verify proper clearance.', 3, 'Improper caliper alignment causes poor braking and pad wear.', 'Use shims if needed for alignment.'),
((SELECT id FROM content WHERE slug = 'install-brakes-go-kart' LIMIT 1), 4, 'Install Brake Cable', 'Connect brake cable and adjust', '1. Route brake cable from pedal to caliper. 2. Install cable ends. 3. Adjust cable tension. 4. Test brake operation. 5. Verify adequate stopping power.', 4, 'Test brakes at low speed first. Never operate without working brakes.', 'Brake cable should have slight slack when released.');

-- Guide 13: Throttle Linkage Installation
INSERT INTO content (
  slug, title, excerpt, body, content_type, category, difficulty_level,
  estimated_time_minutes, related_engine_id, tags, is_published, published_at
) VALUES (
  'install-throttle-linkage-go-kart',
  'How to Install Throttle Linkage on Go-Kart',
  'Step-by-step guide to installing throttle linkage from pedal to carburetor. Includes cable routing, adjustment, and safety checks.',
  'Proper throttle linkage ensures smooth engine response and safety. This guide covers cable installation and adjustment for go-kart applications.',
  'guide',
  'Installation',
  'beginner',
  30,
  (SELECT id FROM engines WHERE slug = 'predator-212-hemi' LIMIT 1),
  ARRAY['installation', 'throttle', 'linkage', 'general'],
  true,
  NOW()
);

INSERT INTO guide_steps (guide_id, step_number, title, description, instructions, sort_order, warning, tips) VALUES
((SELECT id FROM content WHERE slug = 'install-throttle-linkage-go-kart' LIMIT 1), 1, 'Select Throttle Cable', 'Choose appropriate throttle cable', '1. Measure distance from pedal to carburetor. 2. Add 6-12" for routing. 3. Select cable with proper ends. 4. Common: bicycle brake cable or motorcycle throttle cable.', 1, 'Too short cable causes binding. Too long causes slack.', 'Measure twice, cut once.'),
((SELECT id FROM content WHERE slug = 'install-throttle-linkage-go-kart' LIMIT 1), 2, 'Install Pedal End', 'Connect cable to throttle pedal', '1. Route cable to pedal location. 2. Install cable end in pedal. 3. Secure with cable clamp. 4. Verify pedal returns to idle position.', 2, 'Cable must return to idle when released for safety.', 'Test return spring operation.'),
((SELECT id FROM content WHERE slug = 'install-throttle-linkage-go-kart' LIMIT 1), 3, 'Connect Carburetor End', 'Attach cable to carburetor throttle arm', '1. Route cable to carburetor. 2. Connect to throttle arm. 3. Install return spring if needed. 4. Verify full range of motion.', 3, 'Throttle must open fully and return to idle completely.', 'Check for binding in cable routing.'),
((SELECT id FROM content WHERE slug = 'install-throttle-linkage-go-kart' LIMIT 1), 4, 'Adjust and Test', 'Fine-tune throttle operation', '1. Adjust cable tension. 2. Verify idle position. 3. Check full throttle position. 4. Test smooth operation throughout range. 5. Verify return to idle.', 4, 'Throttle must return to idle immediately when released.', 'Test with engine off first, then with engine running at idle.');

-- Guide 14: Engine Oil Selection and Maintenance
INSERT INTO content (
  slug, title, excerpt, body, content_type, category, difficulty_level,
  estimated_time_minutes, related_engine_id, tags, is_published, published_at
) VALUES (
  'engine-oil-selection-maintenance',
  'Go-Kart Engine Oil Selection and Maintenance',
  'Complete guide to selecting the right oil for your go-kart engine and maintaining proper oil levels. Covers oil types, change intervals, and troubleshooting.',
  'Proper oil selection and maintenance is crucial for engine longevity. This guide covers oil types, capacities, change intervals, and common issues.',
  'guide',
  'Maintenance',
  'beginner',
  25,
  (SELECT id FROM engines WHERE slug = 'predator-212-hemi' LIMIT 1),
  ARRAY['maintenance', 'oil', 'engine care', 'general'],
  true,
  NOW()
);

INSERT INTO guide_steps (guide_id, step_number, title, description, instructions, sort_order, warning, tips) VALUES
((SELECT id FROM content WHERE slug = 'engine-oil-selection-maintenance' LIMIT 1), 1, 'Select Oil Type', 'Choose appropriate oil for your engine', '1. Use SAE 10W-30 or 5W-30 for most small engines. 2. Synthetic oil provides better protection. 3. Check manufacturer recommendations. 4. Avoid automotive oil with friction modifiers.', 1, 'Wrong oil type can cause engine damage. Always check specifications.', 'Synthetic oil lasts longer but costs more.'),
((SELECT id FROM content WHERE slug = 'engine-oil-selection-maintenance' LIMIT 1), 2, 'Check Oil Level', 'Verify proper oil level', '1. Park on level surface. 2. Remove dipstick and wipe clean. 3. Reinsert and remove. 4. Check level between min and max marks. 5. Add oil if needed.', 2, 'Too much or too little oil can cause engine damage.', 'Check oil when engine is cool for accurate reading.'),
((SELECT id FROM content WHERE slug = 'engine-oil-selection-maintenance' LIMIT 1), 3, 'Change Intervals', 'Follow recommended change schedule', '1. First change: After break-in (5 hours). 2. Regular changes: Every 20-25 hours of operation. 3. More frequent if racing or heavy use. 4. Change before storage.', 3, 'Old oil loses its protective properties. Regular changes are essential.', 'Keep a log of operating hours.'),
((SELECT id FROM content WHERE slug = 'engine-oil-selection-maintenance' LIMIT 1), 4, 'Troubleshooting', 'Identify common oil-related issues', '1. Oil consumption: Check for leaks. 2. Milky oil: Water contamination (head gasket issue). 3. Dark oil quickly: Engine running hot or dirty. 4. Low pressure: Check oil level and quality.', 4, 'Unusual oil appearance indicates problems. Investigate immediately.', 'Save oil sample for analysis if problems persist.');

-- Guide 15: Carburetor Cleaning and Rebuild
INSERT INTO content (
  slug, title, excerpt, body, content_type, category, difficulty_level,
  estimated_time_minutes, related_engine_id, tags, is_published, published_at
) VALUES (
  'carburetor-cleaning-rebuild',
  'How to Clean and Rebuild Go-Kart Carburetor',
  'Complete guide to cleaning and rebuilding small engine carburetors. Includes disassembly, cleaning procedures, and reassembly with proper adjustments.',
  'A clean carburetor is essential for proper engine operation. This guide covers complete carburetor service including cleaning, inspection, and rebuilding.',
  'guide',
  'Maintenance',
  'intermediate',
  120,
  (SELECT id FROM engines WHERE slug = 'predator-212-hemi' LIMIT 1),
  ARRAY['maintenance', 'carburetor', 'cleaning', 'rebuild', 'general'],
  true,
  NOW()
);

INSERT INTO guide_steps (guide_id, step_number, title, description, instructions, sort_order, warning, tips) VALUES
((SELECT id FROM content WHERE slug = 'carburetor-cleaning-rebuild' LIMIT 1), 1, 'Remove Carburetor', 'Safely remove carburetor from engine', '1. Disconnect fuel line. 2. Remove throttle linkage. 3. Remove mounting bolts. 4. Remove carburetor. 5. Drain any remaining fuel.', 1, 'Work in well-ventilated area. Gasoline is flammable.', 'Take photos before disassembly for reference.'),
((SELECT id FROM content WHERE slug = 'carburetor-cleaning-rebuild' LIMIT 1), 2, 'Disassemble', 'Take apart carburetor components', '1. Remove float bowl. 2. Remove float and needle valve. 3. Remove jets (main and idle). 4. Remove throttle plate if applicable. 5. Keep all parts organized.', 2, 'Small parts are easy to lose. Use containers for organization.', 'Label parts or take photos of assembly.'),
((SELECT id FROM content WHERE slug = 'carburetor-cleaning-rebuild' LIMIT 1), 3, 'Clean Components', 'Thoroughly clean all parts', '1. Soak parts in carburetor cleaner. 2. Use compressed air to blow out passages. 3. Clean jets with fine wire. 4. Inspect for damage. 5. Replace worn parts.', 3, 'Never use wire brushes that can damage jets. Use soft materials.', 'Use safety glasses when using compressed air.'),
((SELECT id FROM content WHERE slug = 'carburetor-cleaning-rebuild' LIMIT 1), 4, 'Reassemble', 'Put carburetor back together', '1. Install new gaskets. 2. Reinstall jets. 3. Install float and needle valve. 4. Install float bowl. 5. Verify all connections.', 4, 'Incorrect assembly causes poor running or fuel leaks.', 'Follow manufacturer specifications for float height.'),
((SELECT id FROM content WHERE slug = 'carburetor-cleaning-rebuild' LIMIT 1), 5, 'Reinstall and Tune', 'Mount carburetor and adjust', '1. Install carburetor on engine. 2. Connect fuel line. 3. Connect throttle linkage. 4. Start engine and tune. 5. Check for leaks.', 5, 'Verify no fuel leaks before operating. Gasoline is highly flammable.', 'Tune carburetor at operating temperature.');

-- Guide 16: Go-Kart Safety Inspection Checklist
INSERT INTO content (
  slug, title, excerpt, body, content_type, category, difficulty_level,
  estimated_time_minutes, related_engine_id, tags, is_published, published_at
) VALUES (
  'go-kart-safety-inspection',
  'Go-Kart Safety Inspection Checklist',
  'Comprehensive safety inspection checklist for your go-kart. Covers all critical safety components and systems before operation.',
  'Safety should always be the top priority. This guide provides a complete checklist to ensure your go-kart is safe to operate.',
  'guide',
  'Safety',
  'beginner',
  30,
  (SELECT id FROM engines WHERE slug = 'predator-212-hemi' LIMIT 1),
  ARRAY['safety', 'inspection', 'checklist', 'general'],
  true,
  NOW()
);

INSERT INTO guide_steps (guide_id, step_number, title, description, instructions, sort_order, warning, tips) VALUES
((SELECT id FROM content WHERE slug = 'go-kart-safety-inspection' LIMIT 1), 1, 'Frame Inspection', 'Check frame for damage and integrity', '1. Inspect all welds for cracks. 2. Check for bent or damaged frame members. 3. Verify all bolts are tight. 4. Check for rust or corrosion. 5. Ensure frame is structurally sound.', 1, 'A damaged frame can fail catastrophically. Never operate with frame damage.', 'Use a flashlight to inspect hard-to-see areas.'),
((SELECT id FROM content WHERE slug = 'go-kart-safety-inspection' LIMIT 1), 2, 'Brake System Check', 'Verify brakes are working properly', '1. Test brake pedal operation. 2. Check brake cable condition. 3. Inspect brake pads/rotors. 4. Test stopping power. 5. Verify brake return.', 2, 'Brakes are critical for safety. Never operate without working brakes.', 'Test brakes at low speed first.'),
((SELECT id FROM content WHERE slug = 'go-kart-safety-inspection' LIMIT 1), 3, 'Throttle System', 'Inspect throttle linkage and operation', '1. Check throttle cable condition. 2. Verify smooth operation. 3. Test return to idle. 4. Check for binding. 5. Verify full range of motion.', 3, 'Throttle must return to idle immediately when released.', 'Test with engine off first.'),
((SELECT id FROM content WHERE slug = 'go-kart-safety-inspection' LIMIT 1), 4, 'Engine Mounting', 'Verify engine is securely mounted', '1. Check all mounting bolts. 2. Verify proper torque. 3. Check for cracks in mounting plate. 4. Inspect engine for leaks. 5. Verify clearance from frame.', 4, 'A loose engine can cause serious injury. Check mounting regularly.', 'Use a torque wrench for verification.'),
((SELECT id FROM content WHERE slug = 'go-kart-safety-inspection' LIMIT 1), 5, 'Drivetrain Inspection', 'Check chain, sprockets, and drive components', '1. Inspect chain for wear. 2. Check chain tension. 3. Verify sprocket alignment. 4. Check for loose sprockets. 5. Inspect clutch/torque converter.', 5, 'Drivetrain failure can cause loss of control. Inspect regularly.', 'Replace worn components before failure.'),
((SELECT id FROM content WHERE slug = 'go-kart-safety-inspection' LIMIT 1), 6, 'Wheels and Tires', 'Inspect wheels, tires, and bearings', '1. Check tire condition and pressure. 2. Inspect wheel bearings. 3. Verify wheel nuts are tight. 4. Check for wheel damage. 5. Verify proper alignment.', 6, 'Wheel failure at speed is extremely dangerous. Inspect carefully.', 'Check tire pressure before each use.'),
((SELECT id FROM content WHERE slug = 'go-kart-safety-inspection' LIMIT 1), 7, 'Safety Equipment', 'Verify all safety equipment is in place', '1. Check kill switch operation. 2. Verify seat belts (if applicable). 3. Check for sharp edges. 4. Verify proper lighting (if required). 5. Ensure proper safety gear for driver.', 7, 'Always wear appropriate safety gear: helmet, gloves, eye protection.', 'Safety gear is your last line of defense.');

-- Guide 17: Exhaust System Installation
INSERT INTO content (
  slug, title, excerpt, body, content_type, category, difficulty_level,
  estimated_time_minutes, related_engine_id, tags, is_published, published_at
) VALUES (
  'exhaust-system-installation',
  'Installing Performance Exhaust on Go-Kart Engine',
  'Complete guide to installing aftermarket exhaust systems on go-kart engines. Includes header installation, pipe routing, and safety considerations.',
  'A performance exhaust can improve power and sound. This guide covers exhaust system installation including headers, pipes, and mufflers.',
  'guide',
  'Installation',
  'intermediate',
  60,
  (SELECT id FROM engines WHERE slug = 'predator-212-hemi' LIMIT 1),
  ARRAY['installation', 'exhaust', 'performance', 'general'],
  true,
  NOW()
);

INSERT INTO guide_steps (guide_id, step_number, title, description, instructions, sort_order, warning, tips) VALUES
((SELECT id FROM content WHERE slug = 'exhaust-system-installation' LIMIT 1), 1, 'Remove Stock Exhaust', 'Remove existing exhaust system', '1. Allow engine to cool completely. 2. Remove exhaust mounting bolts. 3. Remove exhaust from engine. 4. Clean exhaust port.', 1, 'Exhaust components are extremely hot. Allow to cool completely.', 'Use penetrating oil on stuck bolts.'),
((SELECT id FROM content WHERE slug = 'exhaust-system-installation' LIMIT 1), 2, 'Install Header', 'Mount performance header', '1. Install header gasket. 2. Position header on exhaust port. 3. Install mounting bolts. 4. Torque evenly to specification.', 2, 'Improper gasket installation causes exhaust leaks.', 'Use new gasket for best seal.'),
((SELECT id FROM content WHERE slug = 'exhaust-system-installation' LIMIT 1), 3, 'Route Exhaust Pipe', 'Install and route exhaust pipe', '1. Position pipe for clearance. 2. Avoid contact with frame or components. 3. Secure with mounting brackets. 4. Install muffler if applicable.', 3, 'Exhaust pipe gets extremely hot. Ensure adequate clearance.', 'Use heat shields if needed.'),
((SELECT id FROM content WHERE slug = 'exhaust-system-installation' LIMIT 1), 4, 'Final Checks', 'Verify installation and test', '1. Check all connections. 2. Verify no exhaust leaks. 3. Check clearance from all components. 4. Test engine operation.', 4, 'Exhaust leaks are dangerous and reduce performance.', 'Listen for exhaust leaks at idle and under load.');

-- Guide 18: Valve Adjustment Guide
INSERT INTO content (
  slug, title, excerpt, body, content_type, category, difficulty_level,
  estimated_time_minutes, related_engine_id, tags, is_published, published_at
) VALUES (
  'valve-adjustment-guide',
  'How to Adjust Valves on Small Engines',
  'Step-by-step guide to adjusting valve clearance on OHV small engines. Includes finding TDC, measuring clearance, and proper adjustment procedures.',
  'Proper valve clearance is essential for engine performance and longevity. This guide covers valve adjustment for overhead valve (OHV) engines.',
  'guide',
  'Maintenance',
  'advanced',
  90,
  (SELECT id FROM engines WHERE slug = 'predator-212-hemi' LIMIT 1),
  ARRAY['maintenance', 'valves', 'adjustment', 'advanced', 'general'],
  true,
  NOW()
);

INSERT INTO guide_steps (guide_id, step_number, title, description, instructions, sort_order, warning, tips) VALUES
((SELECT id FROM content WHERE slug = 'valve-adjustment-guide' LIMIT 1), 1, 'Prepare Engine', 'Get engine ready for valve adjustment', '1. Ensure engine is completely cool. 2. Remove valve cover. 3. Clean area around valves. 4. Gather tools: feeler gauges, wrenches.', 1, 'Engine must be cold for accurate adjustment. Hot engines have different clearances.', 'Work in clean area to prevent dirt entry.'),
((SELECT id FROM content WHERE slug = 'valve-adjustment-guide' LIMIT 1), 2, 'Find Top Dead Center', 'Position engine at TDC compression stroke', '1. Remove spark plug. 2. Rotate engine to TDC. 3. Verify compression stroke (valves closed). 4. Lock engine at TDC if possible.', 2, 'Incorrect TDC position gives wrong clearance readings.', 'Use TDC mark on flywheel if available.'),
((SELECT id FROM content WHERE slug = 'valve-adjustment-guide' LIMIT 1), 3, 'Measure Clearance', 'Check current valve clearance', '1. Insert feeler gauge between valve and rocker. 2. Check intake valve clearance (typically 0.004-0.006"). 3. Check exhaust valve clearance (typically 0.006-0.008"). 4. Note which valves need adjustment.', 3, 'Wrong clearance causes poor performance and can damage engine.', 'Use correct feeler gauge size.'),
((SELECT id FROM content WHERE slug = 'valve-adjustment-guide' LIMIT 1), 4, 'Adjust Valves', 'Set proper valve clearance', '1. Loosen lock nut on adjuster. 2. Turn adjuster to achieve proper clearance. 3. Hold adjuster and tighten lock nut. 4. Recheck clearance after tightening. 5. Repeat for other valve.', 4, 'Over-tightening valves causes damage. Too loose causes noise and wear.', 'Double-check clearance after tightening lock nut.'),
((SELECT id FROM content WHERE slug = 'valve-adjustment-guide' LIMIT 1), 5, 'Reassemble', 'Put engine back together', '1. Install valve cover with new gasket. 2. Reinstall spark plug. 3. Start engine and check for unusual noises. 4. Verify smooth operation.', 5, 'Unusual noises after adjustment indicate problems. Stop and recheck.', 'Keep notes of clearance settings for future reference.');

-- Guide 19: Fuel System Troubleshooting
INSERT INTO content (
  slug, title, excerpt, body, content_type, category, difficulty_level,
  estimated_time_minutes, related_engine_id, tags, is_published, published_at
) VALUES (
  'fuel-system-troubleshooting',
  'Go-Kart Fuel System Troubleshooting Guide',
  'Comprehensive troubleshooting guide for fuel system problems. Covers common issues, diagnosis procedures, and solutions.',
  'Fuel system problems are common in go-karts. This guide helps diagnose and fix fuel delivery, carburetor, and related issues.',
  'guide',
  'Troubleshooting',
  'intermediate',
  45,
  (SELECT id FROM engines WHERE slug = 'predator-212-hemi' LIMIT 1),
  ARRAY['troubleshooting', 'fuel system', 'diagnosis', 'general'],
  true,
  NOW()
);

INSERT INTO guide_steps (guide_id, step_number, title, description, instructions, sort_order, warning, tips) VALUES
((SELECT id FROM content WHERE slug = 'fuel-system-troubleshooting' LIMIT 1), 1, 'Identify Symptoms', 'Recognize fuel system problems', '1. Engine won''t start: Check fuel delivery. 2. Engine runs rough: Check carburetor. 3. Engine stalls: Check fuel filter. 4. Poor performance: Check fuel quality. 5. Fuel leaks: Inspect all connections.', 1, 'Fuel is flammable. Work carefully and in well-ventilated area.', 'Keep fire extinguisher nearby.'),
((SELECT id FROM content WHERE slug = 'fuel-system-troubleshooting' LIMIT 1), 2, 'Check Fuel Delivery', 'Verify fuel reaches carburetor', '1. Check fuel tank level. 2. Inspect fuel line for kinks or blockages. 3. Check fuel filter condition. 4. Verify fuel flows from tank. 5. Check for air leaks in fuel line.', 2, 'Blocked fuel line prevents engine operation.', 'Use clean fuel for testing.'),
((SELECT id FROM content WHERE slug = 'fuel-system-troubleshooting' LIMIT 1), 3, 'Inspect Carburetor', 'Check carburetor for issues', '1. Check for fuel in float bowl. 2. Inspect float and needle valve. 3. Check jets for blockage. 4. Verify throttle operation. 5. Check for leaks.', 3, 'Dirty carburetor is common cause of problems.', 'Clean carburetor if fuel is old or contaminated.'),
((SELECT id FROM content WHERE slug = 'fuel-system-troubleshooting' LIMIT 1), 4, 'Test and Verify', 'Test repairs and verify operation', '1. Reinstall components. 2. Test fuel flow. 3. Start engine and check operation. 4. Verify smooth running. 5. Check for leaks.', 4, 'Always test in safe area. Be prepared to stop engine quickly.', 'Keep notes of what was fixed for future reference.');

-- Guide 20: Winter Storage Preparation
INSERT INTO content (
  slug, title, excerpt, body, content_type, category, difficulty_level,
  estimated_time_minutes, related_engine_id, tags, is_published, published_at
) VALUES (
  'winter-storage-preparation',
  'Preparing Go-Kart for Winter Storage',
  'Complete guide to preparing your go-kart for winter storage. Includes engine preparation, fuel system treatment, and storage best practices.',
  'Proper winter storage ensures your go-kart starts easily in spring. This guide covers all steps for safe long-term storage.',
  'guide',
  'Maintenance',
  'beginner',
  60,
  (SELECT id FROM engines WHERE slug = 'predator-212-hemi' LIMIT 1),
  ARRAY['maintenance', 'storage', 'winter', 'general'],
  true,
  NOW()
);

INSERT INTO guide_steps (guide_id, step_number, title, description, instructions, sort_order, warning, tips) VALUES
((SELECT id FROM content WHERE slug = 'winter-storage-preparation' LIMIT 1), 1, 'Clean Go-Kart', 'Thoroughly clean before storage', '1. Wash entire go-kart. 2. Remove dirt and debris. 3. Dry completely. 4. Apply protective coating to metal parts if desired.', 1, 'Dirt and moisture cause corrosion during storage.', 'Use compressed air to dry hard-to-reach areas.'),
((SELECT id FROM content WHERE slug = 'winter-storage-preparation' LIMIT 1), 2, 'Fuel System Preparation', 'Prepare fuel system for storage', '1. Add fuel stabilizer to tank. 2. Run engine for 5 minutes to circulate stabilizer. 3. Drain fuel tank completely OR fill completely. 4. Remove and clean carburetor if storing long-term.', 2, 'Old fuel goes bad and can damage fuel system.', 'Stabilizer prevents fuel degradation for 6-12 months.'),
((SELECT id FROM content WHERE slug = 'winter-storage-preparation' LIMIT 1), 3, 'Engine Preparation', 'Prepare engine for storage', '1. Change oil (old oil contains acids). 2. Remove spark plug. 3. Add teaspoon of oil to cylinder. 4. Rotate engine to distribute oil. 5. Reinstall spark plug.', 3, 'Old oil can cause corrosion. Fresh oil protects engine.', 'Label spark plug wire for easy reconnection.'),
((SELECT id FROM content WHERE slug = 'winter-storage-preparation' LIMIT 1), 4, 'Battery and Electrical', 'Prepare electrical system', '1. Remove battery if applicable. 2. Store battery in cool, dry place. 3. Charge battery periodically. 4. Disconnect electrical connections if storing long-term.', 4, 'Batteries can freeze and be damaged in cold temperatures.', 'Use battery maintainer if keeping battery connected.'),
((SELECT id FROM content WHERE slug = 'winter-storage-preparation' LIMIT 1), 5, 'Tires and Final Steps', 'Prepare tires and final storage', '1. Inflate tires to proper pressure. 2. Elevate go-kart to take weight off tires. 3. Cover with breathable cover. 4. Store in dry, protected location.', 5, 'Flat spots can develop if tires sit under weight.', 'Use jack stands to support frame, not just tires.');

-- ============================================================================
-- LINK ADDITIONAL GUIDES TO MULTIPLE ENGINES
-- ============================================================================

-- Link general guides to other engines for better coverage
UPDATE content SET related_engine_id = (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi' LIMIT 1) WHERE slug = 'install-chain-sprockets-go-kart' AND related_engine_id = (SELECT id FROM engines WHERE slug = 'predator-212-hemi' LIMIT 1);
UPDATE content SET related_engine_id = (SELECT id FROM engines WHERE slug = 'honda-gx200' LIMIT 1) WHERE slug = 'install-brakes-go-kart' AND related_engine_id = (SELECT id FROM engines WHERE slug = 'predator-212-hemi' LIMIT 1);
UPDATE content SET related_engine_id = (SELECT id FROM engines WHERE slug = 'predator-420' LIMIT 1) WHERE slug = 'install-throttle-linkage-go-kart' AND related_engine_id = (SELECT id FROM engines WHERE slug = 'predator-212-hemi' LIMIT 1);

-- Note: Some guides are general and linked to the most common engine (Predator 212 Hemi)
-- In a production system, you might want to create multiple guide entries for different engines
-- or use a many-to-many relationship between guides and engines
