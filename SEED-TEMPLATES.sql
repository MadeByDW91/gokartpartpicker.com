-- ============================================================================
-- Seed Build Templates
-- This script creates at least 10 build templates for different goals
-- Run this in Supabase SQL Editor as an admin user
-- ============================================================================

-- First, let's get some engine and part IDs to use
-- We'll create templates using the first available engines and parts

-- Get admin user ID (or use the first admin)
DO $$
DECLARE
  admin_user_id UUID;
  engine_1_id UUID;
  engine_2_id UUID;
  engine_3_id UUID;
  part_clutch_id UUID;
  part_torque_converter_id UUID;
  part_chain_id UUID;
  part_sprocket_id UUID;
  part_axle_id UUID;
  part_wheel_id UUID;
  part_tire_id UUID;
  part_brake_id UUID;
  part_throttle_id UUID;
  part_exhaust_id UUID;
  part_air_filter_id UUID;
BEGIN
  -- Get first admin user
  SELECT id INTO admin_user_id
  FROM profiles
  WHERE role IN ('admin', 'super_admin')
  LIMIT 1;

  -- If no admin, use first user or create a placeholder
  IF admin_user_id IS NULL THEN
    SELECT id INTO admin_user_id
    FROM profiles
    LIMIT 1;
  END IF;

  -- Get first few active engines
  SELECT id INTO engine_1_id FROM engines WHERE is_active = true ORDER BY created_at LIMIT 1;
  SELECT id INTO engine_2_id FROM engines WHERE is_active = true ORDER BY created_at OFFSET 1 LIMIT 1;
  SELECT id INTO engine_3_id FROM engines WHERE is_active = true ORDER BY created_at OFFSET 2 LIMIT 1;

  -- Get parts from different categories
  SELECT id INTO part_clutch_id FROM parts WHERE is_active = true AND category = 'clutch' LIMIT 1;
  SELECT id INTO part_torque_converter_id FROM parts WHERE is_active = true AND category = 'torque_converter' LIMIT 1;
  SELECT id INTO part_chain_id FROM parts WHERE is_active = true AND category = 'chain' LIMIT 1;
  SELECT id INTO part_sprocket_id FROM parts WHERE is_active = true AND category = 'sprocket' LIMIT 1;
  SELECT id INTO part_axle_id FROM parts WHERE is_active = true AND category = 'axle' LIMIT 1;
  SELECT id INTO part_wheel_id FROM parts WHERE is_active = true AND category = 'wheel' LIMIT 1;
  SELECT id INTO part_tire_id FROM parts WHERE is_active = true AND category = 'tire' LIMIT 1;
  SELECT id INTO part_brake_id FROM parts WHERE is_active = true AND category = 'brake' LIMIT 1;
  SELECT id INTO part_throttle_id FROM parts WHERE is_active = true AND category = 'throttle' LIMIT 1;
  SELECT id INTO part_exhaust_id FROM parts WHERE is_active = true AND category = 'exhaust' LIMIT 1;
  SELECT id INTO part_air_filter_id FROM parts WHERE is_active = true AND category = 'air_filter' LIMIT 1;

  -- Only proceed if we have at least one engine
  IF engine_1_id IS NOT NULL THEN
    -- Template 1: Speed Build
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
      created_by
    ) VALUES (
      'Speed Demon',
      'High-RPM performance build optimized for maximum top speed. Features high-engagement clutch and performance exhaust.',
      'speed',
      engine_1_id,
      COALESCE(
        jsonb_build_object(
          'clutch', part_clutch_id,
          'exhaust', part_exhaust_id,
          'air_filter', part_air_filter_id,
          'chain', part_chain_id,
          'sprocket', part_sprocket_id
        ),
        '{}'::jsonb
      ),
      450.00,
      8.5,
      12.0,
      true,
      true,
      admin_user_id
    ) ON CONFLICT DO NOTHING;

    -- Template 2: Torque Build
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
      created_by
    ) VALUES (
      'Torque Monster',
      'Low-end power build perfect for off-road and hill climbing. Torque converter provides smooth power delivery.',
      'torque',
      engine_1_id,
      COALESCE(
        jsonb_build_object(
          'torque_converter', part_torque_converter_id,
          'exhaust', part_exhaust_id,
          'chain', part_chain_id,
          'sprocket', part_sprocket_id
        ),
        '{}'::jsonb
      ),
      380.00,
      7.0,
      15.5,
      true,
      true,
      admin_user_id
    ) ON CONFLICT DO NOTHING;

    -- Template 3: Budget Build
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
      created_by
    ) VALUES (
      'Budget Blaster',
      'Affordable starter build that gets you on the track without breaking the bank. Great value for money.',
      'budget',
      engine_1_id,
      COALESCE(
        jsonb_build_object(
          'clutch', part_clutch_id,
          'chain', part_chain_id,
          'sprocket', part_sprocket_id
        ),
        '{}'::jsonb
      ),
      250.00,
      6.5,
      10.0,
      true,
      true,
      admin_user_id
    ) ON CONFLICT DO NOTHING;

    -- Template 4: Beginner Build
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
      created_by
    ) VALUES (
      'First Timer',
      'Simple, reliable build perfect for beginners. Easy to assemble and maintain with standard components.',
      'beginner',
      engine_1_id,
      COALESCE(
        jsonb_build_object(
          'clutch', part_clutch_id,
          'chain', part_chain_id,
          'sprocket', part_sprocket_id,
          'brake', part_brake_id,
          'throttle', part_throttle_id
        ),
        '{}'::jsonb
      ),
      320.00,
      6.8,
      11.0,
      true,
      true,
      admin_user_id
    ) ON CONFLICT DO NOTHING;

    -- Template 5: Competition Build
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
      created_by
    ) VALUES (
      'Race Ready',
      'Full performance competition build with all the upgrades. Maximum power and reliability for track racing.',
      'competition',
      COALESCE(engine_2_id, engine_1_id),
      COALESCE(
        jsonb_build_object(
          'clutch', part_clutch_id,
          'exhaust', part_exhaust_id,
          'air_filter', part_air_filter_id,
          'chain', part_chain_id,
          'sprocket', part_sprocket_id,
          'brake', part_brake_id
        ),
        '{}'::jsonb
      ),
      550.00,
      9.5,
      13.5,
      true,
      true,
      admin_user_id
    ) ON CONFLICT DO NOTHING;

    -- Template 6: Kids Build
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
      created_by
    ) VALUES (
      'Junior Racer',
      'Safe, governed build designed for young riders. Lower power output with reliable components.',
      'kids',
      COALESCE(engine_3_id, engine_1_id),
      COALESCE(
        jsonb_build_object(
          'clutch', part_clutch_id,
          'chain', part_chain_id,
          'sprocket', part_sprocket_id,
          'brake', part_brake_id,
          'throttle', part_throttle_id
        ),
        '{}'::jsonb
      ),
      280.00,
      5.5,
      8.5,
      true,
      true,
      admin_user_id
    ) ON CONFLICT DO NOTHING;

    -- Template 7: Speed Build (Alternative)
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
      created_by
    ) VALUES (
      'Highway Runner',
      'Street-legal speed build with performance upgrades. Optimized for top speed on paved surfaces.',
      'speed',
      COALESCE(engine_2_id, engine_1_id),
      COALESCE(
        jsonb_build_object(
          'clutch', part_clutch_id,
          'exhaust', part_exhaust_id,
          'chain', part_chain_id,
          'sprocket', part_sprocket_id,
          'air_filter', part_air_filter_id
        ),
        '{}'::jsonb
      ),
      480.00,
      8.8,
      12.5,
      true,
      true,
      admin_user_id
    ) ON CONFLICT DO NOTHING;

    -- Template 8: Torque Build (Alternative)
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
      created_by
    ) VALUES (
      'Hill Climber',
      'Maximum torque for challenging terrain. Perfect for off-road adventures and steep inclines.',
      'torque',
      COALESCE(engine_2_id, engine_1_id),
      COALESCE(
        jsonb_build_object(
          'torque_converter', part_torque_converter_id,
          'exhaust', part_exhaust_id,
          'chain', part_chain_id,
          'sprocket', part_sprocket_id,
          'axle', part_axle_id
        ),
        '{}'::jsonb
      ),
      420.00,
      7.5,
      16.0,
      true,
      true,
      admin_user_id
    ) ON CONFLICT DO NOTHING;

    -- Template 9: Budget Build (Alternative)
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
      created_by
    ) VALUES (
      'Economy Build',
      'Minimal cost build with essential components. Perfect for learning and casual riding.',
      'budget',
      COALESCE(engine_3_id, engine_1_id),
      COALESCE(
        jsonb_build_object(
          'clutch', part_clutch_id,
          'chain', part_chain_id,
          'sprocket', part_sprocket_id
        ),
        '{}'::jsonb
      ),
      220.00,
      6.0,
      9.5,
      true,
      true,
      admin_user_id
    ) ON CONFLICT DO NOTHING;

    -- Template 10: Competition Build (Alternative)
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
      created_by
    ) VALUES (
      'Championship Build',
      'Premium competition build with all performance upgrades. Built for serious racers.',
      'competition',
      COALESCE(engine_3_id, engine_2_id, engine_1_id),
      COALESCE(
        jsonb_build_object(
          'clutch', part_clutch_id,
          'exhaust', part_exhaust_id,
          'air_filter', part_air_filter_id,
          'chain', part_chain_id,
          'sprocket', part_sprocket_id,
          'brake', part_brake_id,
          'throttle', part_throttle_id
        ),
        '{}'::jsonb
      ),
      600.00,
      10.0,
      14.0,
      true,
      true,
      admin_user_id
    ) ON CONFLICT DO NOTHING;

    -- Template 11: Beginner Build (Alternative)
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
      created_by
    ) VALUES (
      'Starter Kit',
      'Complete beginner-friendly build with step-by-step assembly guide. All essential components included.',
      'beginner',
      COALESCE(engine_3_id, engine_1_id),
      COALESCE(
        jsonb_build_object(
          'clutch', part_clutch_id,
          'chain', part_chain_id,
          'sprocket', part_sprocket_id,
          'brake', part_brake_id,
          'throttle', part_throttle_id,
          'wheel', part_wheel_id,
          'tire', part_tire_id
        ),
        '{}'::jsonb
      ),
      350.00,
      7.0,
      11.5,
      true,
      true,
      admin_user_id
    ) ON CONFLICT DO NOTHING;

    -- Template 12: Kids Build (Alternative)
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
      created_by
    ) VALUES (
      'Little Racer',
      'Safe and fun build for kids. Lower power with safety features and easy controls.',
      'kids',
      COALESCE(engine_3_id, engine_1_id),
      COALESCE(
        jsonb_build_object(
          'clutch', part_clutch_id,
          'chain', part_chain_id,
          'sprocket', part_sprocket_id,
          'brake', part_brake_id,
          'throttle', part_throttle_id,
          'wheel', part_wheel_id,
          'tire', part_tire_id
        ),
        '{}'::jsonb
      ),
      300.00,
      5.8,
      9.0,
      true,
      true,
      admin_user_id
    ) ON CONFLICT DO NOTHING;

  END IF;
END $$;

-- Verify templates were created
SELECT 
  id,
  name,
  goal,
  is_public,
  is_active,
  created_at
FROM build_templates
ORDER BY created_at DESC;
