-- ============================================================================
-- ESSENTIAL MIGRATIONS ONLY - Run These to Fix Your Site
-- This is a minimal set to get your site working
-- ============================================================================

-- IMPORTANT: Run these ONE AT A TIME, not all at once!
-- If you see "already exists" errors, that's OK - skip them and continue

-- ============================================================================
-- STEP 1: Check What Exists First
-- ============================================================================

-- Run CHECK-DATABASE-STATUS.sql first to see what's missing

-- ============================================================================
-- STEP 2: Core Schema (if tables don't exist)
-- ============================================================================

-- Run: supabase/migrations/20260116000001_initial_schema.sql
-- This creates: profiles, engines, parts, builds, etc.

-- ============================================================================
-- STEP 3: Security Policies (if RLS not enabled)
-- ============================================================================

-- Run: supabase/migrations/20260116000002_rls_policies.sql
-- This enables Row Level Security

-- ============================================================================
-- STEP 4: Seed Data (REQUIRED - adds actual data)
-- ============================================================================

-- Run: supabase/migrations/20260116000004_seed_engines.sql
-- This adds engine data (10+ engines)

-- Run: supabase/migrations/20260116000006_seed_parts.sql
-- This adds parts data (50+ parts)

-- ============================================================================
-- STEP 5: Forums (if you want forums to work)
-- ============================================================================

-- Run: supabase/migrations/20260116000021_forums_schema.sql
-- This creates forum tables

-- ============================================================================
-- STEP 6: Build Templates (if you want templates to work)
-- ============================================================================

-- Run: supabase/migrations/20260116000011_add_build_templates.sql
-- This creates build_templates table

-- Run: supabase/migrations/20260117000003_seed_build_templates.sql
-- This adds template data (9 templates)

-- ============================================================================
-- VERIFICATION: After running, check with this:
-- ============================================================================

SELECT 
    'engines' as table_name, 
    COUNT(*) as record_count 
FROM engines
UNION ALL
SELECT 'parts', COUNT(*) FROM parts
UNION ALL
SELECT 'build_templates', COUNT(*) FROM build_templates
UNION ALL
SELECT 'forum_categories', COUNT(*) FROM forum_categories;

-- Expected results:
-- engines: 10+ records
-- parts: 50+ records
-- build_templates: 9 records
-- forum_categories: 3+ records

-- ============================================================================
-- NOTE: Don't run this file directly!
-- Copy each migration file individually and run them one by one.
-- ============================================================================
