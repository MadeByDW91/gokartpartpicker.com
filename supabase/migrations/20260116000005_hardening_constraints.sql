-- ============================================================================
-- GoKart Part Picker - Database Hardening Constraints
-- Created: 2026-01-16
-- Description: Additional CHECK constraints and validations for data integrity
-- Owner: Database Hardening Agent
-- ============================================================================

-- ============================================================================
-- ENGINES TABLE CONSTRAINTS
-- ============================================================================

-- Ensure displacement is positive
ALTER TABLE engines
ADD CONSTRAINT engines_displacement_positive 
CHECK (displacement_cc > 0);

-- Ensure horsepower is positive
ALTER TABLE engines
ADD CONSTRAINT engines_horsepower_positive 
CHECK (horsepower > 0);

-- Ensure shaft diameter is positive (if provided)
ALTER TABLE engines
ADD CONSTRAINT engines_shaft_diameter_positive 
CHECK (shaft_diameter > 0);

-- Ensure torque is positive (if provided)
ALTER TABLE engines
ADD CONSTRAINT engines_torque_positive 
CHECK (torque IS NULL OR torque > 0);

-- Ensure weight is positive (if provided)
ALTER TABLE engines
ADD CONSTRAINT engines_weight_positive 
CHECK (weight_lbs IS NULL OR weight_lbs > 0);

-- Ensure slug is URL-friendly (lowercase, alphanumeric, hyphens)
ALTER TABLE engines
ADD CONSTRAINT engines_slug_format 
CHECK (slug ~ '^[a-z0-9-]+$');

-- Ensure slug has reasonable length
ALTER TABLE engines
ADD CONSTRAINT engines_slug_length 
CHECK (char_length(slug) >= 3 AND char_length(slug) <= 100);

-- Ensure name is not empty
ALTER TABLE engines
ADD CONSTRAINT engines_name_not_empty 
CHECK (char_length(TRIM(name)) > 0);

-- ============================================================================
-- PARTS TABLE CONSTRAINTS
-- ============================================================================

-- Ensure price is non-negative (if provided)
ALTER TABLE parts
ADD CONSTRAINT parts_price_non_negative 
CHECK (price IS NULL OR price >= 0);

-- Ensure slug is URL-friendly
ALTER TABLE parts
ADD CONSTRAINT parts_slug_format 
CHECK (slug ~ '^[a-z0-9-]+$');

-- Ensure slug has reasonable length
ALTER TABLE parts
ADD CONSTRAINT parts_slug_length 
CHECK (char_length(slug) >= 3 AND char_length(slug) <= 150);

-- Ensure name is not empty
ALTER TABLE parts
ADD CONSTRAINT parts_name_not_empty 
CHECK (char_length(TRIM(name)) > 0);

-- ============================================================================
-- BUILDS TABLE CONSTRAINTS
-- ============================================================================

-- Ensure name is not empty
ALTER TABLE builds
ADD CONSTRAINT builds_name_not_empty 
CHECK (char_length(TRIM(name)) > 0);

-- Ensure name has reasonable length
ALTER TABLE builds
ADD CONSTRAINT builds_name_length 
CHECK (char_length(name) <= 200);

-- Ensure likes count is non-negative
ALTER TABLE builds
ADD CONSTRAINT builds_likes_non_negative 
CHECK (likes_count >= 0);

-- Ensure views count is non-negative
ALTER TABLE builds
ADD CONSTRAINT builds_views_non_negative 
CHECK (views_count >= 0);

-- Ensure total price is non-negative (if set)
ALTER TABLE builds
ADD CONSTRAINT builds_total_price_non_negative 
CHECK (total_price IS NULL OR total_price >= 0);

-- ============================================================================
-- PROFILES TABLE CONSTRAINTS
-- ============================================================================

-- Ensure username format if provided (lowercase, alphanumeric, underscore)
ALTER TABLE profiles
ADD CONSTRAINT profiles_username_format 
CHECK (username IS NULL OR username ~ '^[a-z0-9_]+$');

-- Ensure username length if provided
ALTER TABLE profiles
ADD CONSTRAINT profiles_username_length 
CHECK (username IS NULL OR (char_length(username) >= 3 AND char_length(username) <= 30));

-- ============================================================================
-- CONTENT TABLE CONSTRAINTS
-- ============================================================================

-- Ensure slug is URL-friendly
ALTER TABLE content
ADD CONSTRAINT content_slug_format 
CHECK (slug ~ '^[a-z0-9-]+$');

-- Ensure slug has reasonable length
ALTER TABLE content
ADD CONSTRAINT content_slug_length 
CHECK (char_length(slug) >= 3 AND char_length(slug) <= 200);

-- Ensure title is not empty
ALTER TABLE content
ADD CONSTRAINT content_title_not_empty 
CHECK (char_length(TRIM(title)) > 0);

-- ============================================================================
-- PART_CATEGORIES TABLE CONSTRAINTS
-- ============================================================================

-- Ensure slug is URL-friendly
ALTER TABLE part_categories
ADD CONSTRAINT part_categories_slug_format 
CHECK (slug ~ '^[a-z0-9_-]+$');

-- Ensure name is not empty
ALTER TABLE part_categories
ADD CONSTRAINT part_categories_name_not_empty 
CHECK (char_length(TRIM(name)) > 0);

-- ============================================================================
-- COMPATIBILITY_RULES TABLE CONSTRAINTS
-- ============================================================================

-- Ensure warning message is not empty
ALTER TABLE compatibility_rules
ADD CONSTRAINT rules_warning_not_empty 
CHECK (char_length(TRIM(warning_message)) > 0);

-- Ensure rule_type is not empty
ALTER TABLE compatibility_rules
ADD CONSTRAINT rules_type_not_empty 
CHECK (char_length(TRIM(rule_type)) > 0);

-- ============================================================================
-- ADDITIONAL INDEXES FOR COMMON QUERIES
-- ============================================================================

-- Index for querying builds by public + created (popular builds)
CREATE INDEX IF NOT EXISTS idx_builds_public_created 
ON builds(is_public, created_at DESC) 
WHERE is_public = TRUE;

-- Index for querying builds by likes (most liked)
CREATE INDEX IF NOT EXISTS idx_builds_likes 
ON builds(likes_count DESC) 
WHERE is_public = TRUE;

-- Index for full-text search on content
CREATE INDEX IF NOT EXISTS idx_content_search 
ON content USING gin(to_tsvector('english', title || ' ' || COALESCE(excerpt, '')));

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON CONSTRAINT engines_displacement_positive ON engines IS 'Engine displacement must be positive';
COMMENT ON CONSTRAINT engines_slug_format ON engines IS 'Slug must be lowercase alphanumeric with hyphens only';
COMMENT ON CONSTRAINT builds_name_not_empty ON builds IS 'Build name is required';
COMMENT ON CONSTRAINT profiles_username_format ON profiles IS 'Username must be lowercase alphanumeric with underscores only';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
