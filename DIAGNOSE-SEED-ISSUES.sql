-- ============================================================================
-- Diagnostic Queries for Seed Data Issues
-- Run these in Supabase SQL Editor to diagnose why seeds aren't working
-- ============================================================================

-- 1. Check if tables exist and have any data (including inactive)
SELECT 
  'engines' as table_name,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE is_active = true) as active_count,
  COUNT(*) FILTER (WHERE is_active = false) as inactive_count
FROM engines
UNION ALL
SELECT 
  'parts' as table_name,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE is_active = true) as active_count,
  COUNT(*) FILTER (WHERE is_active = false) as inactive_count
FROM parts
UNION ALL
SELECT 
  'build_templates' as table_name,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE is_active = true) as active_count,
  COUNT(*) FILTER (WHERE is_active = false) as inactive_count
FROM build_templates;

-- 2. Check if part_categories exist (required for parts seed)
SELECT slug, name, is_active 
FROM part_categories 
ORDER BY sort_order;

-- 3. Try inserting a single engine manually to see error
INSERT INTO engines (
  slug, name, brand, model, displacement_cc,
  horsepower, torque, shaft_diameter, shaft_length, shaft_type,
  mount_type, is_active
) VALUES (
  'test-engine-debug', 'Test Engine', 'Test', 'Test', 100,
  5.0, 6.0, 0.750, 2.0, 'straight',
  'test', true
)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
RETURNING id, slug, name, is_active;

-- 4. Check RLS policies on engines table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'engines';

-- 5. Check if there are any constraint violations
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'engines'::regclass
ORDER BY contype, conname;

-- 6. Check recent insert attempts (if audit log exists)
SELECT 
  action,
  table_name,
  created_at,
  new_data->>'slug' as slug,
  new_data->>'name' as name
FROM audit_log
WHERE table_name IN ('engines', 'parts')
ORDER BY created_at DESC
LIMIT 20;
