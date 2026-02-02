-- ============================================================================
-- Add Tire Sub-Categories (Front and Rear)
-- Created: 2026-01-23
-- Description: Extend part_category enum with tire_front and tire_rear categories
-- ============================================================================

-- Add new tire sub-categories to the enum
-- Note: PostgreSQL doesn't support ALTER TYPE ... ADD VALUE in a transaction block
-- We need to add them one at a time

DO $$ BEGIN
    -- Add tire_front category
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'tire_front' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'part_category')
    ) THEN
        ALTER TYPE part_category ADD VALUE 'tire_front';
    END IF;
    
    -- Add tire_rear category
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'tire_rear' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'part_category')
    ) THEN
        ALTER TYPE part_category ADD VALUE 'tire_rear';
    END IF;
END $$;

COMMENT ON TYPE part_category IS 'Part categories including gas engine parts, EV-specific components, and tire sub-categories (front/rear)';
