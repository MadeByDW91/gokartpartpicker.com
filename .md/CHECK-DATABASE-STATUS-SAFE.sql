-- ============================================================================
-- Check Database Status - SAFE VERSION (won't error on missing tables)
-- Run this to see what's working and what's missing
-- ============================================================================

-- Check if essential tables exist
SELECT 
    '=== ESSENTIAL TABLES ===' as check_type,
    table_name,
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = t.table_name
        ) 
        THEN 'EXISTS ✓' 
        ELSE 'MISSING ✗' 
    END as status
FROM (VALUES 
    ('profiles'),
    ('engines'),
    ('parts'),
    ('part_categories'),
    ('builds'),
    ('build_templates'),
    ('forum_categories'),
    ('forum_topics'),
    ('forum_posts')
) AS t(table_name)
ORDER BY status DESC, table_name;

-- Check record counts (only for tables that exist)
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    RAISE NOTICE '=== TABLE RECORD COUNTS ===';
    
    -- Check profiles
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        SELECT COUNT(*) INTO table_count FROM profiles;
        RAISE NOTICE 'profiles: % records', table_count;
    ELSE
        RAISE NOTICE 'profiles: TABLE MISSING';
    END IF;
    
    -- Check engines
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'engines') THEN
        SELECT COUNT(*) INTO table_count FROM engines;
        RAISE NOTICE 'engines: % records', table_count;
    ELSE
        RAISE NOTICE 'engines: TABLE MISSING';
    END IF;
    
    -- Check parts
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'parts') THEN
        SELECT COUNT(*) INTO table_count FROM parts;
        RAISE NOTICE 'parts: % records', table_count;
    ELSE
        RAISE NOTICE 'parts: TABLE MISSING';
    END IF;
    
    -- Check build_templates
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'build_templates') THEN
        SELECT COUNT(*) INTO table_count FROM build_templates;
        RAISE NOTICE 'build_templates: % records', table_count;
    ELSE
        RAISE NOTICE 'build_templates: TABLE MISSING';
    END IF;
    
    -- Check forum_categories
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'forum_categories') THEN
        SELECT COUNT(*) INTO table_count FROM forum_categories;
        RAISE NOTICE 'forum_categories: % records', table_count;
    ELSE
        RAISE NOTICE 'forum_categories: TABLE MISSING';
    END IF;
END $$;

-- Check RLS policies
SELECT 
    '=== RLS STATUS ===' as check_type,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'engines', 'parts', 'builds', 'build_templates', 'forum_categories', 'forum_topics', 'forum_posts')
ORDER BY tablename;

-- Check for errors in recent migrations (if audit_log exists)
DO $$
DECLARE
    activity_count INTEGER;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_log') THEN
        SELECT COUNT(*) INTO activity_count FROM audit_log WHERE created_at > NOW() - INTERVAL '24 hours';
        RAISE NOTICE '=== RECENT ACTIVITY ===';
        RAISE NOTICE 'audit_log entries (last 24h): %', activity_count;
    ELSE
        RAISE NOTICE '=== RECENT ACTIVITY ===';
        RAISE NOTICE 'audit_log: TABLE MISSING';
    END IF;
END $$;
