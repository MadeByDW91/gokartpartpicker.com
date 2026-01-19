-- ============================================================================
-- GoKart Part Picker - Performance Indexes Migration
-- Created: 2026-01-17
-- Description: Critical indexes for production performance
-- Owner: Performance Optimization
-- ============================================================================

-- ============================================================================
-- FORUM INDEXES (High traffic tables)
-- ============================================================================

-- Forum topics by category (most common query)
CREATE INDEX IF NOT EXISTS idx_forum_topics_category_active 
ON forum_topics(category_id, is_archived, created_at DESC)
WHERE is_archived = FALSE;

-- Forum topics pinned first, then by date
CREATE INDEX IF NOT EXISTS idx_forum_topics_pinned_created 
ON forum_topics(is_pinned DESC, created_at DESC)
WHERE is_archived = FALSE;

-- Forum topics by views/replies (popular sorting)
CREATE INDEX IF NOT EXISTS idx_forum_topics_views 
ON forum_topics(views_count DESC)
WHERE is_archived = FALSE;

CREATE INDEX IF NOT EXISTS idx_forum_topics_replies 
ON forum_topics(replies_count DESC)
WHERE is_archived = FALSE;

-- Forum topics slug lookup
CREATE INDEX IF NOT EXISTS idx_forum_topics_slug 
ON forum_topics(slug);

-- Forum posts by topic (most common query)
CREATE INDEX IF NOT EXISTS idx_forum_posts_topic_created 
ON forum_posts(topic_id, created_at ASC);

-- Forum posts by user (for admin/user profile pages)
CREATE INDEX IF NOT EXISTS idx_forum_posts_user 
ON forum_posts(user_id, created_at DESC);

-- Forum categories by slug (lookup)
CREATE INDEX IF NOT EXISTS idx_forum_categories_slug 
ON forum_categories(slug)
WHERE is_active = TRUE;

-- ============================================================================
-- BUILD INDEXES (User-generated content)
-- ============================================================================

-- User builds (most common query)
CREATE INDEX IF NOT EXISTS idx_builds_user_created 
ON builds(user_id, created_at DESC);

-- Builds by engine (popular filter)
CREATE INDEX IF NOT EXISTS idx_builds_engine 
ON builds(engine_id, is_public, created_at DESC)
WHERE engine_id IS NOT NULL;

-- Builds by template flag
CREATE INDEX IF NOT EXISTS idx_builds_templates 
ON builds(is_template, is_active, created_at DESC)
WHERE is_template = TRUE AND is_active = TRUE;

-- Build parts lookup
CREATE INDEX IF NOT EXISTS idx_build_parts_build 
ON build_parts(build_id, part_id);

-- Build parts by part (reverse lookup)
CREATE INDEX IF NOT EXISTS idx_build_parts_part 
ON build_parts(part_id);

-- ============================================================================
-- PART INDEXES (Filtering performance)
-- ============================================================================

-- Parts by category + active (most common filter)
CREATE INDEX IF NOT EXISTS idx_parts_category_active 
ON parts(category, is_active)
WHERE is_active = TRUE;

-- Parts by brand (filtering)
CREATE INDEX IF NOT EXISTS idx_parts_brand_active 
ON parts(brand, is_active)
WHERE brand IS NOT NULL AND is_active = TRUE;

-- Parts by price range (filtering)
CREATE INDEX IF NOT EXISTS idx_parts_price_active 
ON parts(price, is_active)
WHERE price IS NOT NULL AND is_active = TRUE;

-- ============================================================================
-- COMPATIBILITY INDEXES (Join performance)
-- ============================================================================

-- Compatibility rules by source category (most common lookup)
CREATE INDEX IF NOT EXISTS idx_compatibility_rules_source 
ON compatibility_rules(source_category, is_active)
WHERE is_active = TRUE;

-- Compatibility rules by target category
CREATE INDEX IF NOT EXISTS idx_compatibility_rules_target 
ON compatibility_rules(target_category, is_active)
WHERE is_active = TRUE;

-- Engine-part compatibility lookups
CREATE INDEX IF NOT EXISTS idx_engine_part_compatibility_engine 
ON engine_part_compatibility(engine_id);

CREATE INDEX IF NOT EXISTS idx_engine_part_compatibility_part 
ON engine_part_compatibility(part_id);

-- ============================================================================
-- PROFILE INDEXES (User lookups)
-- ============================================================================

-- Profile by username (lookup)
CREATE INDEX IF NOT EXISTS idx_profiles_username 
ON profiles(username)
WHERE username IS NOT NULL;

-- Profile by role (admin queries)
CREATE INDEX IF NOT EXISTS idx_profiles_role 
ON profiles(role)
WHERE role IN ('admin', 'super_admin');

-- ============================================================================
-- CONTENT INDEXES (Guides/videos)
-- ============================================================================

-- Content by type and published status
CREATE INDEX IF NOT EXISTS idx_content_type_published 
ON content(content_type, is_published, created_at DESC)
WHERE is_published = TRUE;

-- Content by engine (guides filtering)
CREATE INDEX IF NOT EXISTS idx_content_engine 
ON content(engine_id, is_published)
WHERE engine_id IS NOT NULL AND is_published = TRUE;

-- Videos by engine
CREATE INDEX IF NOT EXISTS idx_videos_engine_active 
ON videos(engine_id, is_active)
WHERE is_active = TRUE;

-- ============================================================================
-- AUDIT LOG INDEXES (Admin queries)
-- ============================================================================

-- Audit log by user
CREATE INDEX IF NOT EXISTS idx_audit_log_user 
ON audit_log(user_id, created_at DESC)
WHERE user_id IS NOT NULL;

-- Audit log by action type
CREATE INDEX IF NOT EXISTS idx_audit_log_action 
ON audit_log(action, created_at DESC);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON INDEX idx_forum_topics_category_active IS 'Optimizes forum category topic listings';
COMMENT ON INDEX idx_builds_user_created IS 'Optimizes user build queries';
COMMENT ON INDEX idx_parts_category_active IS 'Optimizes parts filtering by category';
COMMENT ON INDEX idx_forum_posts_topic_created IS 'Optimizes topic post listings';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
