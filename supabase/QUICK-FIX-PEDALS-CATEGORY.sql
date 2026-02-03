-- ============================================================================
-- Quick fix: Add "pedals" to part_category enum (run in Supabase SQL Editor)
-- Use this if you get: invalid input value for enum part_category: "pedals"
-- Safe to run multiple times.
-- ============================================================================

-- 1. Add enum value if missing
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'pedals'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'part_category')
    ) THEN
        ALTER TYPE part_category ADD VALUE 'pedals';
    END IF;
END $$;

-- 2. Seed part_categories row if missing
INSERT INTO part_categories (slug, name, description, sort_order)
SELECT 'pedals', 'Pedals', 'Gas and brake pedals (often sold in pairs)', 10
WHERE NOT EXISTS (SELECT 1 FROM part_categories WHERE slug = 'pedals');
