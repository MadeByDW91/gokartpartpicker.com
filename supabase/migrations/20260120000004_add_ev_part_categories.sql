-- ============================================================================
-- Add EV Part Categories
-- Created: 2026-01-20
-- Description: Extend part_category enum with EV-specific categories
-- Owner: A13 - EV Implementation Agent
-- ============================================================================

-- Add new EV part categories to the enum
-- Note: PostgreSQL doesn't support ALTER TYPE ... ADD VALUE in a transaction block
-- We need to add them one at a time

DO $$ BEGIN
    -- Add battery category
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'battery' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'part_category')
    ) THEN
        ALTER TYPE part_category ADD VALUE 'battery';
    END IF;
    
    -- Add motor_controller category
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'motor_controller' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'part_category')
    ) THEN
        ALTER TYPE part_category ADD VALUE 'motor_controller';
    END IF;
    
    -- Add bms category
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'bms' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'part_category')
    ) THEN
        ALTER TYPE part_category ADD VALUE 'bms';
    END IF;
    
    -- Add charger category
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'charger' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'part_category')
    ) THEN
        ALTER TYPE part_category ADD VALUE 'charger';
    END IF;
    
    -- Add throttle_controller category
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'throttle_controller' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'part_category')
    ) THEN
        ALTER TYPE part_category ADD VALUE 'throttle_controller';
    END IF;
    
    -- Add voltage_converter category
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'voltage_converter' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'part_category')
    ) THEN
        ALTER TYPE part_category ADD VALUE 'voltage_converter';
    END IF;
    
    -- Add battery_mount category
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'battery_mount' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'part_category')
    ) THEN
        ALTER TYPE part_category ADD VALUE 'battery_mount';
    END IF;
    
    -- Add wiring_harness category (if not already exists as 'other')
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'wiring_harness' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'part_category')
    ) THEN
        ALTER TYPE part_category ADD VALUE 'wiring_harness';
    END IF;
END $$;

COMMENT ON TYPE part_category IS 'Part categories including gas engine parts and EV-specific components';
