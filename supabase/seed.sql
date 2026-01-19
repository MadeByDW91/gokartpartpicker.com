-- GoKart Part Picker - Local Development Seed
-- This file runs after migrations for local dev seeding
-- Production seeding is handled by migrations

-- Note: Engine seed data is in migrations/20260116000003_seed_engines.sql
-- This file is for additional local development data only

-- Example: Create a test admin user (for local dev only)
-- Uncomment and modify for your test environment:
/*
-- After signing up a user manually, promote them to admin:
UPDATE profiles 
SET role = 'super_admin' 
WHERE email = 'your-test-email@example.com';
*/

-- Verify engines were seeded
DO $$
DECLARE
  engine_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO engine_count FROM engines;
  RAISE NOTICE 'Seeded engines count: %', engine_count;
END $$;

