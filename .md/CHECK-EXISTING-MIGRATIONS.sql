-- ============================================================================
-- Check What Migrations Have Already Run
-- Run this first to see what already exists
-- ============================================================================

-- Check existing ENUM types
SELECT 
    typname as enum_type,
    'EXISTS ✓' as status
FROM pg_type 
WHERE typtype = 'e'
    AND typname IN (
        'user_role',
        'shaft_type',
        'part_category',
        'audit_action',
        'template_goal',
        'forum_category_type',
        'topic_status',
        'post_status'
    )
ORDER BY typname;

-- Check existing tables
SELECT 
    table_name,
    'EXISTS ✓' as status
FROM information_schema.tables 
WHERE table_schema = 'public'
    AND table_name IN (
        'profiles',
        'engines',
        'part_categories',
        'parts',
        'compatibility_rules',
        'engine_part_compatibility',
        'builds',
        'build_likes',
        'content',
        'audit_log',
        'build_templates',
        'forum_categories',
        'forum_topics',
        'forum_posts',
        'forum_post_likes',
        'forum_post_flags',
        'videos'
    )
ORDER BY table_name;

-- Check existing functions
SELECT 
    routine_name as function_name,
    'EXISTS ✓' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name IN (
        'check_rls_coverage',
        'run_rls_canary_tests',
        'get_forum_categories_with_counts'
    )
ORDER BY routine_name;

-- Summary
SELECT 
    '=== SUMMARY ===' as info,
    (SELECT COUNT(*) FROM pg_type WHERE typtype = 'e' AND typname IN ('user_role', 'shaft_type', 'part_category', 'audit_action', 'template_goal', 'forum_category_type', 'topic_status', 'post_status')) as enum_count,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('profiles', 'engines', 'part_categories', 'parts', 'compatibility_rules', 'engine_part_compatibility', 'builds', 'build_likes', 'content', 'audit_log', 'build_templates', 'forum_categories', 'forum_topics', 'forum_posts', 'forum_post_likes', 'forum_post_flags', 'videos')) as table_count,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name IN ('check_rls_coverage', 'run_rls_canary_tests', 'get_forum_categories_with_counts')) as function_count;
