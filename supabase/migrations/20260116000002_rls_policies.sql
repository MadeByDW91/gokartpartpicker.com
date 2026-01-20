-- ============================================================================
-- GoKart Part Picker - Row Level Security Policies
-- Created: 2026-01-16
-- Description: RLS policies for data isolation and access control
-- Owner: DB Architect + Coordinator Agent (A1)
-- ============================================================================

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE engines ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE compatibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE engine_part_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can view all profiles (for public display names)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (TRUE);

-- Users can update their own profile (except role)
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      -- Non-admins cannot change their role
      role = (SELECT role FROM profiles WHERE id = auth.uid())
      OR is_super_admin()
    )
  );

-- Super admin can update any profile (for role management)
DROP POLICY IF EXISTS "Super admin can update any profile" ON profiles;
CREATE POLICY "Super admin can update any profile"
  ON profiles FOR UPDATE
  USING (is_super_admin());

-- ============================================================================
-- ENGINES POLICIES (Catalog - Admin Write, Public Read)
-- ============================================================================

-- Anyone can read active engines (even non-authenticated for SEO)
DROP POLICY IF EXISTS "Active engines are publicly readable" ON engines;
CREATE POLICY "Active engines are publicly readable"
  ON engines FOR SELECT
  USING (is_active = TRUE OR is_admin());

-- Only admins can insert engines
DROP POLICY IF EXISTS "Admins can insert engines" ON engines;
CREATE POLICY "Admins can insert engines"
  ON engines FOR INSERT
  WITH CHECK (is_admin());

-- Only admins can update engines
DROP POLICY IF EXISTS "Admins can update engines" ON engines;
CREATE POLICY "Admins can update engines"
  ON engines FOR UPDATE
  USING (is_admin());

-- Only super_admins can delete engines
DROP POLICY IF EXISTS "Super admins can delete engines" ON engines;
CREATE POLICY "Super admins can delete engines"
  ON engines FOR DELETE
  USING (is_super_admin());

-- ============================================================================
-- PARTS POLICIES (Catalog - Admin Write, Public Read)
-- ============================================================================

-- Anyone can read active parts
DROP POLICY IF EXISTS "Active parts are publicly readable" ON parts;
CREATE POLICY "Active parts are publicly readable"
  ON parts FOR SELECT
  USING (is_active = TRUE OR is_admin());

-- Only admins can insert parts
DROP POLICY IF EXISTS "Admins can insert parts" ON parts;
CREATE POLICY "Admins can insert parts"
  ON parts FOR INSERT
  WITH CHECK (is_admin());

-- Only admins can update parts
DROP POLICY IF EXISTS "Admins can update parts" ON parts;
CREATE POLICY "Admins can update parts"
  ON parts FOR UPDATE
  USING (is_admin());

-- Only super_admins can delete parts
DROP POLICY IF EXISTS "Super admins can delete parts" ON parts;
CREATE POLICY "Super admins can delete parts"
  ON parts FOR DELETE
  USING (is_super_admin());

-- ============================================================================
-- PART_CATEGORIES POLICIES
-- ============================================================================

-- Anyone can read active categories
DROP POLICY IF EXISTS "Active categories are publicly readable" ON part_categories;
CREATE POLICY "Active categories are publicly readable"
  ON part_categories FOR SELECT
  USING (is_active = TRUE OR is_admin());

-- Only admins can manage categories
DROP POLICY IF EXISTS "Admins can insert categories" ON part_categories;
CREATE POLICY "Admins can insert categories"
  ON part_categories FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update categories" ON part_categories;
CREATE POLICY "Admins can update categories"
  ON part_categories FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "Super admins can delete categories" ON part_categories;
CREATE POLICY "Super admins can delete categories"
  ON part_categories FOR DELETE
  USING (is_super_admin());

-- ============================================================================
-- COMPATIBILITY_RULES POLICIES
-- ============================================================================

-- Anyone can read active rules (needed for frontend validation)
DROP POLICY IF EXISTS "Active rules are publicly readable" ON compatibility_rules;
CREATE POLICY "Active rules are publicly readable"
  ON compatibility_rules FOR SELECT
  USING (is_active = TRUE OR is_admin());

-- Only admins can manage rules
DROP POLICY IF EXISTS "Admins can insert rules" ON compatibility_rules;
CREATE POLICY "Admins can insert rules"
  ON compatibility_rules FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update rules" ON compatibility_rules;
CREATE POLICY "Admins can update rules"
  ON compatibility_rules FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "Super admins can delete rules" ON compatibility_rules;
CREATE POLICY "Super admins can delete rules"
  ON compatibility_rules FOR DELETE
  USING (is_super_admin());

-- ============================================================================
-- ENGINE_PART_COMPATIBILITY POLICIES (Catalog - Admin Write, Public Read)
-- ============================================================================

-- Anyone can read active compatibility data
DROP POLICY IF EXISTS "Compatibility data is publicly readable" ON engine_part_compatibility;
CREATE POLICY "Compatibility data is publicly readable"
  ON engine_part_compatibility FOR SELECT
  USING (is_active = TRUE OR is_admin());

-- Only admins can manage compatibility
DROP POLICY IF EXISTS "Admins can insert compatibility" ON engine_part_compatibility;
CREATE POLICY "Admins can insert compatibility"
  ON engine_part_compatibility FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update compatibility" ON engine_part_compatibility;
CREATE POLICY "Admins can update compatibility"
  ON engine_part_compatibility FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "Super admins can delete compatibility" ON engine_part_compatibility;
CREATE POLICY "Super admins can delete compatibility"
  ON engine_part_compatibility FOR DELETE
  USING (is_super_admin());

-- ============================================================================
-- BUILDS POLICIES (User Data - Owner Access + Public Read for Published)
-- ============================================================================

-- Users can view their own builds (any status)
DROP POLICY IF EXISTS "Users can view own builds" ON builds;
CREATE POLICY "Users can view own builds"
  ON builds FOR SELECT
  USING (auth.uid() = user_id);

-- Anyone can view public builds
DROP POLICY IF EXISTS "Public builds are readable" ON builds;
CREATE POLICY "Public builds are readable"
  ON builds FOR SELECT
  USING (is_public = TRUE);

-- Admins can view all builds
DROP POLICY IF EXISTS "Admins can view all builds" ON builds;
CREATE POLICY "Admins can view all builds"
  ON builds FOR SELECT
  USING (is_admin());

-- Users can create their own builds
DROP POLICY IF EXISTS "Users can create builds" ON builds;
CREATE POLICY "Users can create builds"
  ON builds FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own builds
DROP POLICY IF EXISTS "Users can update own builds" ON builds;
CREATE POLICY "Users can update own builds"
  ON builds FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can update any build (moderation)
DROP POLICY IF EXISTS "Admins can update any build" ON builds;
CREATE POLICY "Admins can update any build"
  ON builds FOR UPDATE
  USING (is_admin());

-- Users can delete their own builds
DROP POLICY IF EXISTS "Users can delete own builds" ON builds;
CREATE POLICY "Users can delete own builds"
  ON builds FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can delete any build
DROP POLICY IF EXISTS "Admins can delete any build" ON builds;
CREATE POLICY "Admins can delete any build"
  ON builds FOR DELETE
  USING (is_admin());

-- ============================================================================
-- BUILD_LIKES POLICIES
-- ============================================================================

-- Users can view likes on public builds
DROP POLICY IF EXISTS "Likes on public builds are readable" ON build_likes;
CREATE POLICY "Likes on public builds are readable"
  ON build_likes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM builds
      WHERE builds.id = build_likes.build_id
      AND builds.is_public = TRUE
    )
  );

-- Users can see their own likes
DROP POLICY IF EXISTS "Users can view own likes" ON build_likes;
CREATE POLICY "Users can view own likes"
  ON build_likes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can like public builds
DROP POLICY IF EXISTS "Users can like public builds" ON build_likes;
CREATE POLICY "Users can like public builds"
  ON build_likes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM builds
      WHERE builds.id = build_likes.build_id
      AND builds.is_public = TRUE
    )
  );

-- Users can unlike (delete their own likes)
DROP POLICY IF EXISTS "Users can unlike builds" ON build_likes;
CREATE POLICY "Users can unlike builds"
  ON build_likes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- CONTENT POLICIES
-- ============================================================================

-- Anyone can read published content
DROP POLICY IF EXISTS "Published content is publicly readable" ON content;
CREATE POLICY "Published content is publicly readable"
  ON content FOR SELECT
  USING (is_published = TRUE OR is_admin());

-- Only admins can manage content
DROP POLICY IF EXISTS "Admins can insert content" ON content;
CREATE POLICY "Admins can insert content"
  ON content FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update content" ON content;
CREATE POLICY "Admins can update content"
  ON content FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "Super admins can delete content" ON content;
CREATE POLICY "Super admins can delete content"
  ON content FOR DELETE
  USING (is_super_admin());

-- ============================================================================
-- AUDIT_LOG POLICIES (Admin Read-Only, Immutable)
-- ============================================================================

-- Only admins can read audit logs
DROP POLICY IF EXISTS "Admins can read audit logs" ON audit_log;
CREATE POLICY "Admins can read audit logs"
  ON audit_log FOR SELECT
  USING (is_admin());

-- No insert policy - uses SECURITY DEFINER function
-- No update policy - audit logs are immutable
-- No delete policy - audit logs are immutable

-- ============================================================================
-- AUDIT LOGGING FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION log_audit_action(
  p_action audit_action,
  p_table_name TEXT,
  p_record_id UUID,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO audit_log (
    user_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data
  ) VALUES (
    auth.uid(),
    p_action,
    p_table_name,
    p_record_id,
    p_old_data,
    p_new_data
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- AUTO-AUDIT TRIGGERS FOR CATALOG TABLES
-- ============================================================================

CREATE OR REPLACE FUNCTION audit_catalog_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Only audit if user is authenticated
  IF auth.uid() IS NOT NULL THEN
    IF TG_OP = 'INSERT' THEN
      PERFORM log_audit_action('create'::audit_action, TG_TABLE_NAME, NEW.id, NULL, to_jsonb(NEW));
    ELSIF TG_OP = 'UPDATE' THEN
      PERFORM log_audit_action('update'::audit_action, TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    ELSIF TG_OP = 'DELETE' THEN
      PERFORM log_audit_action('delete'::audit_action, TG_TABLE_NAME, OLD.id, to_jsonb(OLD), NULL);
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to catalog tables
DROP TRIGGER IF EXISTS audit_engines_changes ON engines;
CREATE TRIGGER audit_engines_changes
  AFTER INSERT OR UPDATE OR DELETE ON engines
  FOR EACH ROW EXECUTE FUNCTION audit_catalog_changes();

DROP TRIGGER IF EXISTS audit_parts_changes ON parts;
CREATE TRIGGER audit_parts_changes
  AFTER INSERT OR UPDATE OR DELETE ON parts
  FOR EACH ROW EXECUTE FUNCTION audit_catalog_changes();

DROP TRIGGER IF EXISTS audit_compatibility_changes ON engine_part_compatibility;
CREATE TRIGGER audit_compatibility_changes
  AFTER INSERT OR UPDATE OR DELETE ON engine_part_compatibility
  FOR EACH ROW EXECUTE FUNCTION audit_catalog_changes();

DROP TRIGGER IF EXISTS audit_content_changes ON content;
CREATE TRIGGER audit_content_changes
  AFTER INSERT OR UPDATE OR DELETE ON content
  FOR EACH ROW EXECUTE FUNCTION audit_catalog_changes();

DROP TRIGGER IF EXISTS audit_rules_changes ON compatibility_rules;
CREATE TRIGGER audit_rules_changes
  AFTER INSERT OR UPDATE OR DELETE ON compatibility_rules
  FOR EACH ROW EXECUTE FUNCTION audit_catalog_changes();

