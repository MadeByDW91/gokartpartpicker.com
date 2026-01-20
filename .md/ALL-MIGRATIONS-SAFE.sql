-- ============================================================================
-- GoKart Part Picker - ALL MIGRATIONS (Safe Version)
-- This version uses IF NOT EXISTS to skip already-created objects
-- Created: 2026-01-19
-- ============================================================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUM TYPES (with IF NOT EXISTS handling)
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE shaft_type AS ENUM ('straight', 'tapered', 'threaded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE part_category AS ENUM (
        'clutch', 'torque_converter', 'chain', 'sprocket', 'axle', 'wheel',
        'tire', 'brake', 'throttle', 'frame', 'carburetor', 'exhaust',
        'air_filter', 'camshaft', 'valve_spring', 'flywheel', 'ignition',
        'connecting_rod', 'piston', 'crankshaft', 'oil_system', 'header',
        'fuel_system', 'gasket', 'hardware', 'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Note: Continue with rest of migrations, but this shows the pattern
-- The combined file will have all migrations with safe handling
