-- ============================================================================
-- GoKart Part Picker - Forums Schema Migration
-- Created: 2026-01-16
-- Description: Forum tables, indexes, RLS policies, and security functions
-- Owner: Forums Implementation (Phase 1)
-- ============================================================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- FORUM CATEGORIES TABLE
-- ============================================================================

CREATE TABLE forum_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES forum_categories(id) ON DELETE SET NULL,
  icon TEXT, -- Icon name or emoji
  color TEXT, -- Color for UI
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  requires_auth BOOLEAN DEFAULT FALSE NOT NULL, -- Require login to view
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_forum_categories_parent ON forum_categories(parent_id);
CREATE INDEX idx_forum_categories_active ON forum_categories(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_forum_categories_slug ON forum_categories(slug);

COMMENT ON TABLE forum_categories IS 'Forum discussion categories. Can be nested with parent_id.';

-- ============================================================================
-- FORUM TOPICS TABLE
-- ============================================================================

CREATE TABLE forum_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL, -- First post content
  is_pinned BOOLEAN DEFAULT FALSE NOT NULL,
  is_locked BOOLEAN DEFAULT FALSE NOT NULL,
  is_archived BOOLEAN DEFAULT FALSE NOT NULL,
  views_count INTEGER DEFAULT 0 NOT NULL,
  replies_count INTEGER DEFAULT 0 NOT NULL,
  last_reply_at TIMESTAMPTZ,
  last_reply_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(category_id, slug)
);

CREATE INDEX idx_topics_category ON forum_topics(category_id);
CREATE INDEX idx_topics_user ON forum_topics(user_id);
CREATE INDEX idx_topics_pinned ON forum_topics(is_pinned DESC, created_at DESC);
CREATE INDEX idx_topics_active ON forum_topics(is_archived, last_reply_at DESC) WHERE is_archived = FALSE;
CREATE INDEX idx_topics_category_active ON forum_topics(category_id, is_archived, last_reply_at DESC) WHERE is_archived = FALSE;

COMMENT ON TABLE forum_topics IS 'Forum discussion topics/threads. Each topic has a first post (content) and replies.';

-- ============================================================================
-- FORUM POSTS TABLE
-- ============================================================================

CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE NOT NULL,
  edited_at TIMESTAMPTZ,
  likes_count INTEGER DEFAULT 0 NOT NULL,
  is_solution BOOLEAN DEFAULT FALSE NOT NULL, -- Mark as solution/answer
  parent_post_id UUID REFERENCES forum_posts(id) ON DELETE SET NULL, -- For nested replies
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_posts_topic ON forum_posts(topic_id, created_at);
CREATE INDEX idx_posts_user ON forum_posts(user_id);
CREATE INDEX idx_posts_solution ON forum_posts(topic_id, is_solution) WHERE is_solution = TRUE;
CREATE INDEX idx_posts_parent ON forum_posts(parent_post_id) WHERE parent_post_id IS NOT NULL;

COMMENT ON TABLE forum_posts IS 'Forum post replies. Can be nested with parent_post_id for threaded discussions.';

-- ============================================================================
-- RATE LIMIT LOG TABLE
-- ============================================================================

CREATE TABLE rate_limit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ip_address INET,
  action_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_rate_limit_user_action ON rate_limit_log(user_id, action_type, created_at) WHERE user_id IS NOT NULL;
CREATE INDEX idx_rate_limit_ip_action ON rate_limit_log(ip_address, action_type, created_at) WHERE ip_address IS NOT NULL;
CREATE INDEX idx_rate_limit_created ON rate_limit_log(created_at);

COMMENT ON TABLE rate_limit_log IS 'Rate limiting log for forum actions. Tracks user and IP-based rate limits.';

-- ============================================================================
-- USER BANS TABLE
-- ============================================================================

CREATE TABLE user_bans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  banned_by UUID NOT NULL REFERENCES profiles(id),
  reason TEXT NOT NULL,
  ban_type TEXT NOT NULL CHECK (ban_type IN ('temporary', 'permanent')),
  expires_at TIMESTAMPTZ, -- NULL for permanent bans
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_user_bans_user ON user_bans(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_user_bans_expires ON user_bans(expires_at) WHERE ban_type = 'temporary' AND is_active = TRUE;

COMMENT ON TABLE user_bans IS 'User ban records. Tracks temporary and permanent bans.';

-- ============================================================================
-- FORUM AUDIT LOG TABLE
-- ============================================================================

CREATE TYPE forum_audit_action AS ENUM (
  'topic_created',
  'topic_edited',
  'topic_deleted',
  'topic_pinned',
  'topic_locked',
  'topic_archived',
  'post_created',
  'post_edited',
  'post_deleted',
  'post_liked',
  'user_banned',
  'user_warned',
  'content_flagged',
  'content_approved',
  'content_rejected'
);

CREATE TABLE forum_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action forum_audit_action NOT NULL,
  content_type TEXT,
  content_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_forum_audit_user ON forum_audit_log(user_id);
CREATE INDEX idx_forum_audit_action ON forum_audit_log(action);
CREATE INDEX idx_forum_audit_created ON forum_audit_log(created_at DESC);
CREATE INDEX idx_forum_audit_content ON forum_audit_log(content_type, content_id);

COMMENT ON TABLE forum_audit_log IS 'Audit log for all forum actions. Immutable record of security-relevant events.';

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Check if user is moderator (admin or moderator role)
CREATE OR REPLACE FUNCTION is_moderator()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin', 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is banned
CREATE OR REPLACE FUNCTION is_user_banned(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_bans
    WHERE user_id = p_user_id
    AND is_active = TRUE
    AND (ban_type = 'permanent' OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_ip_address INET,
  p_action_type TEXT,
  p_max_attempts INTEGER,
  p_window_seconds INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  -- Check user limit (if authenticated)
  IF p_user_id IS NOT NULL THEN
    SELECT COUNT(*) INTO attempt_count
    FROM rate_limit_log
    WHERE user_id = p_user_id
      AND action_type = p_action_type
      AND created_at > NOW() - (p_window_seconds || ' seconds')::INTERVAL;
    
    IF attempt_count >= p_max_attempts THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  -- Check IP limit (always)
  SELECT COUNT(*) INTO attempt_count
  FROM rate_limit_log
  WHERE ip_address = p_ip_address
    AND action_type = p_action_type
    AND created_at > NOW() - (p_window_seconds || ' seconds')::INTERVAL;
  
  IF attempt_count >= p_max_attempts THEN
    RETURN FALSE;
  END IF;
  
  -- Log this attempt
  INSERT INTO rate_limit_log (user_id, ip_address, action_type)
  VALUES (p_user_id, p_ip_address, p_action_type);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update topic stats when post is created
CREATE OR REPLACE FUNCTION update_topic_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forum_topics
  SET 
    replies_count = (
      SELECT COUNT(*) - 1 -- Subtract 1 because first post is in content field
      FROM forum_posts
      WHERE topic_id = NEW.topic_id
    ),
    last_reply_at = NEW.created_at,
    last_reply_by = NEW.user_id,
    updated_at = NOW()
  WHERE id = NEW.topic_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_topic_stats_on_post
  AFTER INSERT ON forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_topic_stats();

-- Update topic stats when post is deleted
CREATE OR REPLACE FUNCTION update_topic_stats_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forum_topics
  SET 
    replies_count = (
      SELECT COUNT(*) - 1
      FROM forum_posts
      WHERE topic_id = OLD.topic_id
    ),
    updated_at = NOW()
  WHERE id = OLD.topic_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_topic_stats_on_post_delete
  AFTER DELETE ON forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_topic_stats_on_delete();

-- Updated_at trigger
CREATE TRIGGER update_forum_categories_updated_at
  BEFORE UPDATE ON forum_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_topics_updated_at
  BEFORE UPDATE ON forum_topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at
  BEFORE UPDATE ON forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- CONSTRAINTS
-- ============================================================================

-- Ensure slug is URL-friendly
ALTER TABLE forum_categories
ADD CONSTRAINT forum_categories_slug_format 
CHECK (slug ~ '^[a-z0-9-]+$');

ALTER TABLE forum_topics
ADD CONSTRAINT forum_topics_slug_format 
CHECK (slug ~ '^[a-z0-9-]+$');

-- Ensure title/content are not empty
ALTER TABLE forum_topics
ADD CONSTRAINT forum_topics_title_not_empty 
CHECK (char_length(TRIM(title)) > 0);

ALTER TABLE forum_topics
ADD CONSTRAINT forum_topics_content_not_empty 
CHECK (char_length(TRIM(content)) > 0);

ALTER TABLE forum_posts
ADD CONSTRAINT forum_posts_content_not_empty 
CHECK (char_length(TRIM(content)) > 0);

-- Ensure slug has reasonable length
ALTER TABLE forum_categories
ADD CONSTRAINT forum_categories_slug_length 
CHECK (char_length(slug) >= 3 AND char_length(slug) <= 200);

ALTER TABLE forum_topics
ADD CONSTRAINT forum_topics_slug_length 
CHECK (char_length(slug) >= 3 AND char_length(slug) <= 200);

-- Ensure title has reasonable length
ALTER TABLE forum_topics
ADD CONSTRAINT forum_topics_title_length 
CHECK (char_length(title) >= 3 AND char_length(title) <= 200);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- FORUM CATEGORIES RLS POLICIES
-- ============================================================================

-- Public can view active categories (if not requires_auth)
CREATE POLICY "Public can view active categories"
ON forum_categories FOR SELECT
USING (
  is_active = TRUE 
  AND (requires_auth = FALSE OR auth.uid() IS NOT NULL)
);

-- Admins can manage categories
CREATE POLICY "Admins can manage categories"
ON forum_categories FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================================================
-- FORUM TOPICS RLS POLICIES
-- ============================================================================

-- Public can view topics in public categories
CREATE POLICY "Public can view topics in public categories"
ON forum_topics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM forum_categories
    WHERE forum_categories.id = forum_topics.category_id
    AND forum_categories.is_active = TRUE
    AND (forum_categories.requires_auth = FALSE OR auth.uid() IS NOT NULL)
  )
);

-- Authenticated users can create topics (if not banned)
CREATE POLICY "Authenticated users can create topics"
ON forum_topics FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND NOT is_user_banned(auth.uid())
  AND EXISTS (
    SELECT 1 FROM forum_categories
    WHERE forum_categories.id = category_id
    AND forum_categories.is_active = TRUE
  )
  AND EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND email_confirmed_at IS NOT NULL -- Require verified email
  )
);

-- Users can edit own topics (within time limit, if not locked)
CREATE POLICY "Users can edit own topics"
ON forum_topics FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  AND created_at > NOW() - INTERVAL '1 hour' -- 1 hour edit window
  AND is_locked = FALSE
)
WITH CHECK (
  auth.uid() = user_id
  AND is_locked = FALSE
);

-- Users can delete own topics (within time limit, if no replies)
CREATE POLICY "Users can delete own topics"
ON forum_topics FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
  AND created_at > NOW() - INTERVAL '1 hour'
  AND replies_count = 0 -- Only if no replies
);

-- Admins can moderate all topics
CREATE POLICY "Admins can moderate topics"
ON forum_topics FOR ALL
USING (is_admin() OR is_moderator())
WITH CHECK (is_admin() OR is_moderator());

-- ============================================================================
-- FORUM POSTS RLS POLICIES
-- ============================================================================

-- Public can view posts in public topics
CREATE POLICY "Public can view posts in public topics"
ON forum_posts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM forum_topics
    WHERE forum_topics.id = forum_posts.topic_id
    AND forum_topics.is_archived = FALSE
  )
);

-- Authenticated users can create posts (if topic not locked, user not banned)
CREATE POLICY "Authenticated users can create posts"
ON forum_posts FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND NOT is_user_banned(auth.uid())
  AND EXISTS (
    SELECT 1 FROM forum_topics
    WHERE forum_topics.id = topic_id
    AND forum_topics.is_locked = FALSE
    AND forum_topics.is_archived = FALSE
  )
  AND EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND email_confirmed_at IS NOT NULL -- Require verified email
  )
);

-- Users can edit own posts (within time limit)
CREATE POLICY "Users can edit own posts"
ON forum_posts FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  AND created_at > NOW() - INTERVAL '15 minutes' -- 15 minute edit window
)
WITH CHECK (auth.uid() = user_id);

-- Users can delete own posts (within time limit, if no replies)
CREATE POLICY "Users can delete own posts"
ON forum_posts FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
  AND created_at > NOW() - INTERVAL '15 minutes'
  AND NOT EXISTS (
    SELECT 1 FROM forum_posts
    WHERE parent_post_id = forum_posts.id
  )
);

-- Admins can moderate all posts
CREATE POLICY "Admins can moderate posts"
ON forum_posts FOR ALL
USING (is_admin() OR is_moderator())
WITH CHECK (is_admin() OR is_moderator());

-- ============================================================================
-- RATE LIMIT LOG RLS POLICIES
-- ============================================================================

-- Users can view own rate limit logs
CREATE POLICY "Users can view own rate limit logs"
ON rate_limit_log FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can view all rate limit logs
CREATE POLICY "Admins can view all rate limit logs"
ON rate_limit_log FOR SELECT
TO authenticated
USING (is_admin() OR is_moderator());

-- System can insert rate limit logs (via function)
CREATE POLICY "System can insert rate limit logs"
ON rate_limit_log FOR INSERT
TO authenticated
WITH CHECK (true); -- Function handles validation

-- ============================================================================
-- USER BANS RLS POLICIES
-- ============================================================================

-- Users can view own ban status
CREATE POLICY "Users can view own ban status"
ON user_bans FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can view all bans
CREATE POLICY "Admins can view all bans"
ON user_bans FOR SELECT
TO authenticated
USING (is_admin() OR is_moderator());

-- Admins can manage bans
CREATE POLICY "Admins can manage bans"
ON user_bans FOR ALL
TO authenticated
USING (is_admin() OR is_moderator())
WITH CHECK (is_admin() OR is_moderator());

-- ============================================================================
-- FORUM AUDIT LOG RLS POLICIES
-- ============================================================================

-- Only admins can read audit logs
CREATE POLICY "Admins can read audit logs"
ON forum_audit_log FOR SELECT
TO authenticated
USING (is_admin() OR is_moderator());

-- System can insert audit logs (via function)
CREATE POLICY "System can insert audit logs"
ON forum_audit_log FOR INSERT
TO authenticated
WITH CHECK (true); -- Function handles validation

-- No one can modify or delete audit logs
CREATE POLICY "No audit log modification"
ON forum_audit_log FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "No audit log deletion"
ON forum_audit_log FOR DELETE
TO authenticated
USING (false);

-- ============================================================================
-- SEED INITIAL CATEGORIES
-- ============================================================================

INSERT INTO forum_categories (slug, name, description, icon, color, sort_order, is_active, requires_auth) VALUES
  ('build-planning', 'Build Planning', 'Get help planning your go-kart build', '🔧', '#3b82f6', 1, TRUE, FALSE),
  ('build-showcase', 'Build Showcase', 'Share your completed builds', '🏆', '#10b981', 2, TRUE, FALSE),
  ('troubleshooting', 'Troubleshooting', 'Get help with build issues', '🔍', '#f59e0b', 3, TRUE, FALSE),
  ('engines', 'Engines', 'Engine discussions and questions', '⚙️', '#8b5cf6', 4, TRUE, FALSE),
  ('parts', 'Parts & Components', 'Parts discussions by category', '📦', '#ec4899', 5, TRUE, FALSE),
  ('performance-mods', 'Performance Mods', 'Performance upgrades and modifications', '🚀', '#ef4444', 6, TRUE, FALSE),
  ('maintenance', 'Maintenance', 'Care, repair, and maintenance', '🛠️', '#06b6d4', 7, TRUE, FALSE),
  ('general-discussion', 'General Discussion', 'Off-topic discussions', '💬', '#64748b', 8, TRUE, FALSE),
  ('deals-sales', 'Deals & Sales', 'Share good deals and sales', '💰', '#22c55e', 9, TRUE, FALSE),
  ('for-sale-trade', 'For Sale/Trade', 'Buy, sell, and trade parts', '🛒', '#f97316', 10, TRUE, FALSE),
  ('site-feedback', 'Site Feedback', 'Feature requests and feedback', '💡', '#6366f1', 11, TRUE, FALSE)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION is_moderator() IS 'Check if current user is a moderator (admin or moderator role)';
COMMENT ON FUNCTION is_user_banned(UUID) IS 'Check if a user is currently banned';
COMMENT ON FUNCTION check_rate_limit(UUID, INET, TEXT, INTEGER, INTEGER) IS 'Check and log rate limit for user/IP and action type';
