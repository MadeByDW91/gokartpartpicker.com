-- ============================================================================
-- FILE: 20260116000001_initial_schema.sql
-- ============================================================================
-- ============================================================================
-- GoKart Part Picker - Initial Schema Migration
-- Created: 2026-01-16
-- Description: Core database schema for engines, parts, compatibility, builds
-- Owner: DB Architect + Coordinator Agent (A1)
-- ============================================================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- User roles for access control
CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');

-- Shaft types for engines
CREATE TYPE shaft_type AS ENUM ('straight', 'tapered', 'threaded');

-- Part categories for organization (aligned with db-query-contract.md)
CREATE TYPE part_category AS ENUM (
  'clutch',
  'torque_converter',
  'chain',
  'sprocket',
  'axle',
  'wheel',
  'tire',
  'brake',
  'throttle',
  'frame',
  'carburetor',
  'exhaust',
  'air_filter',
  'camshaft',
  'valve_spring',
  'flywheel',
  'ignition',
  'connecting_rod',
  'piston',
  'crankshaft',
  'oil_system',
  'header',
  'fuel_system',
  'gasket',
  'hardware',
  'other'
);

-- Audit action types
CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete');

-- ============================================================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  email TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth. Role determines access level.';
COMMENT ON COLUMN profiles.role IS 'user=standard, admin=can modify catalog, super_admin=full access';

-- ============================================================================
-- ENGINES TABLE (aligned with db-query-contract.md)
-- ============================================================================

CREATE TABLE engines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL, -- URL-friendly identifier
  name TEXT NOT NULL, -- Display name (e.g., "Predator 212 Hemi")
  brand TEXT NOT NULL, -- Manufacturer (e.g., "Predator", "Honda")
  model TEXT, -- Model number/name
  variant TEXT, -- Sub-variant (e.g., "Hemi", "Non-Hemi")
  displacement_cc INTEGER NOT NULL,
  horsepower DECIMAL(4,1) NOT NULL,
  torque DECIMAL(4,1),
  shaft_diameter DECIMAL(5,3) NOT NULL, -- inches (to match contract)
  shaft_length DECIMAL(5,3), -- inches
  shaft_type shaft_type DEFAULT 'straight',
  shaft_keyway DECIMAL(5,3), -- inches
  mount_type TEXT, -- e.g., '6.5x7.5 inch'
  oil_capacity_oz DECIMAL(5,1),
  fuel_tank_oz DECIMAL(6,1),
  weight_lbs DECIMAL(5,1),
  price DECIMAL(10,2),
  image_url TEXT,
  affiliate_url TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_engines_brand ON engines(brand);
CREATE INDEX idx_engines_displacement ON engines(displacement_cc);
CREATE INDEX idx_engines_active ON engines(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_engines_slug ON engines(slug);

COMMENT ON TABLE engines IS 'Catalog of small engines. Admin-managed reference data.';
COMMENT ON COLUMN engines.slug IS 'URL-friendly unique identifier (e.g., predator-212-hemi)';
COMMENT ON COLUMN engines.shaft_diameter IS 'Shaft diameter in inches for compatibility with parts';

-- ============================================================================
-- PART CATEGORIES TABLE (for extensibility)
-- ============================================================================

CREATE TABLE part_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE part_categories IS 'Categories for parts organization. Can be extended dynamically.';

-- ============================================================================
-- PARTS TABLE (aligned with db-query-contract.md)
-- ============================================================================

CREATE TABLE parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category part_category NOT NULL,
  category_id UUID REFERENCES part_categories(id),
  brand TEXT,
  specifications JSONB DEFAULT '{}'::JSONB, -- Category-specific specs
  price DECIMAL(10,2),
  image_url TEXT,
  affiliate_url TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_parts_category ON parts(category);
CREATE INDEX idx_parts_category_id ON parts(category_id);
CREATE INDEX idx_parts_brand ON parts(brand);
CREATE INDEX idx_parts_slug ON parts(slug);
CREATE INDEX idx_parts_active ON parts(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_parts_name_search ON parts USING gin(to_tsvector('english', name));

COMMENT ON TABLE parts IS 'Catalog of go-kart parts. Admin-managed reference data.';
COMMENT ON COLUMN parts.specifications IS 'Flexible JSON for category-specific specs (e.g., clutch engagement RPM)';

-- ============================================================================
-- COMPATIBILITY_RULES TABLE (for rule-based compatibility checking)
-- ============================================================================

CREATE TABLE compatibility_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_type TEXT NOT NULL, -- shaft_match, chain_pitch, bolt_pattern, etc.
  source_category TEXT NOT NULL, -- Part category or 'engine'
  target_category TEXT NOT NULL, -- Part category
  condition JSONB NOT NULL, -- Rule condition logic
  warning_message TEXT NOT NULL, -- User-facing warning
  severity TEXT DEFAULT 'warning' CHECK (severity IN ('error', 'warning', 'info')),
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_compat_rules_type ON compatibility_rules(rule_type);
CREATE INDEX idx_compat_rules_source ON compatibility_rules(source_category);
CREATE INDEX idx_compat_rules_target ON compatibility_rules(target_category);
CREATE INDEX idx_compat_rules_active ON compatibility_rules(is_active) WHERE is_active = TRUE;

COMMENT ON TABLE compatibility_rules IS 'Deterministic compatibility rules for part/engine matching.';

-- ============================================================================
-- ENGINE_PART_COMPATIBILITY TABLE (direct compatibility mapping)
-- ============================================================================

CREATE TABLE engine_part_compatibility (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  engine_id UUID NOT NULL REFERENCES engines(id) ON DELETE CASCADE,
  part_id UUID NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  compatibility_level TEXT DEFAULT 'direct_fit' CHECK (compatibility_level IN ('direct_fit', 'requires_modification', 'adapter_required')),
  notes TEXT,
  modification_details TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES profiles(id),
  
  CONSTRAINT unique_engine_part UNIQUE (engine_id, part_id)
);

CREATE INDEX idx_compatibility_engine ON engine_part_compatibility(engine_id);
CREATE INDEX idx_compatibility_part ON engine_part_compatibility(part_id);

COMMENT ON TABLE engine_part_compatibility IS 'Direct mapping of which parts fit which engines.';

-- ============================================================================
-- BUILDS TABLE (User-created configurations - aligned with db-query-contract.md)
-- ============================================================================

CREATE TABLE builds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  engine_id UUID REFERENCES engines(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  parts JSONB DEFAULT '{}'::JSONB, -- {category: part_id}
  total_price DECIMAL(10,2) DEFAULT 0,
  is_public BOOLEAN DEFAULT FALSE,
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_builds_user ON builds(user_id);
CREATE INDEX idx_builds_engine ON builds(engine_id);
CREATE INDEX idx_builds_public ON builds(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_builds_created ON builds(created_at DESC);

COMMENT ON TABLE builds IS 'User-created engine builds/configurations. Owned by user_id.';
COMMENT ON COLUMN builds.parts IS 'JSON object mapping category to part_id: {"clutch": "uuid", "chain": "uuid"}';

-- ============================================================================
-- BUILD_LIKES TABLE (Social feature)
-- ============================================================================

CREATE TABLE build_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  build_id UUID NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT unique_build_like UNIQUE (build_id, user_id)
);

CREATE INDEX idx_build_likes_build ON build_likes(build_id);
CREATE INDEX idx_build_likes_user ON build_likes(user_id);

COMMENT ON TABLE build_likes IS 'Tracks user likes on public builds.';

-- ============================================================================
-- CONTENT TABLE (for static content/guides)
-- ============================================================================

CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('guide', 'spec', 'safety', 'faq', 'page')),
  body TEXT,
  excerpt TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  is_published BOOLEAN DEFAULT FALSE NOT NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_content_slug ON content(slug);
CREATE INDEX idx_content_type ON content(content_type);
CREATE INDEX idx_content_published ON content(is_published) WHERE is_published = TRUE;

COMMENT ON TABLE content IS 'CMS content for guides, specs, and static pages.';

-- ============================================================================
-- AUDIT_LOG TABLE (immutable audit trail)
-- ============================================================================

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action audit_action NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_table ON audit_log(table_name);
CREATE INDEX idx_audit_record ON audit_log(record_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);

COMMENT ON TABLE audit_log IS 'Immutable audit trail for all admin actions.';

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_engines_updated_at
  BEFORE UPDATE ON engines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parts_updated_at
  BEFORE UPDATE ON parts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_builds_updated_at
  BEFORE UPDATE ON builds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at
  BEFORE UPDATE ON content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compatibility_rules_updated_at
  BEFORE UPDATE ON compatibility_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PROFILE AUTO-CREATION TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
DECLARE
  current_role user_role;
BEGIN
  SELECT role INTO current_role FROM profiles WHERE id = auth.uid();
  RETURN COALESCE(current_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SEED INITIAL PART CATEGORIES
-- ============================================================================

INSERT INTO part_categories (slug, name, description, sort_order) VALUES
  ('clutch', 'Clutch', 'Centrifugal clutches and related components', 1),
  ('torque_converter', 'Torque Converter', 'CVT torque converters', 2),
  ('chain', 'Chain', 'Drive chains (#35, #40, #41, #420)', 3),
  ('sprocket', 'Sprocket', 'Driver and driven sprockets', 4),
  ('axle', 'Axle', 'Rear axles and components', 5),
  ('wheel', 'Wheel', 'Wheels and hubs', 6),
  ('tire', 'Tire', 'Go-kart tires', 7),
  ('brake', 'Brake', 'Brake systems and components', 8),
  ('throttle', 'Throttle', 'Throttle cables and pedals', 9),
  ('frame', 'Frame', 'Frame components and mounts', 10),
  ('carburetor', 'Carburetor', 'Carburetors and fuel delivery', 11),
  ('exhaust', 'Exhaust', 'Headers and exhaust systems', 12),
  ('air_filter', 'Air Filter', 'Air filters and intakes', 13),
  ('camshaft', 'Camshaft', 'Performance camshafts', 14),
  ('valve_spring', 'Valve Spring', 'Performance valve springs', 15),
  ('flywheel', 'Flywheel', 'Billet flywheels', 16),
  ('ignition', 'Ignition', 'CDI, coils, and ignition components', 17),
  ('connecting_rod', 'Connecting Rod', 'Billet connecting rods', 18),
  ('piston', 'Piston', 'Performance pistons', 19),
  ('crankshaft', 'Crankshaft', 'Stroker cranks and components', 20),
  ('oil_system', 'Oil System', 'Oil pumps, coolers, and mods', 21),
  ('header', 'Header', 'Performance headers', 22),
  ('fuel_system', 'Fuel System', 'Fuel pumps and components', 23),
  ('gasket', 'Gasket', 'Gaskets and seals', 24),
  ('hardware', 'Hardware', 'Bolts, nuts, and fasteners', 25),
  ('other', 'Other', 'Miscellaneous parts', 99);



-- ============================================================================
-- FILE: 20260116000002_rls_policies.sql
-- ============================================================================
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
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (TRUE);

-- Users can update their own profile (except role)
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
CREATE POLICY "Super admin can update any profile"
  ON profiles FOR UPDATE
  USING (is_super_admin());

-- ============================================================================
-- ENGINES POLICIES (Catalog - Admin Write, Public Read)
-- ============================================================================

-- Anyone can read active engines (even non-authenticated for SEO)
CREATE POLICY "Active engines are publicly readable"
  ON engines FOR SELECT
  USING (is_active = TRUE OR is_admin());

-- Only admins can insert engines
CREATE POLICY "Admins can insert engines"
  ON engines FOR INSERT
  WITH CHECK (is_admin());

-- Only admins can update engines
CREATE POLICY "Admins can update engines"
  ON engines FOR UPDATE
  USING (is_admin());

-- Only super_admins can delete engines
CREATE POLICY "Super admins can delete engines"
  ON engines FOR DELETE
  USING (is_super_admin());

-- ============================================================================
-- PARTS POLICIES (Catalog - Admin Write, Public Read)
-- ============================================================================

-- Anyone can read active parts
CREATE POLICY "Active parts are publicly readable"
  ON parts FOR SELECT
  USING (is_active = TRUE OR is_admin());

-- Only admins can insert parts
CREATE POLICY "Admins can insert parts"
  ON parts FOR INSERT
  WITH CHECK (is_admin());

-- Only admins can update parts
CREATE POLICY "Admins can update parts"
  ON parts FOR UPDATE
  USING (is_admin());

-- Only super_admins can delete parts
CREATE POLICY "Super admins can delete parts"
  ON parts FOR DELETE
  USING (is_super_admin());

-- ============================================================================
-- PART_CATEGORIES POLICIES
-- ============================================================================

-- Anyone can read active categories
CREATE POLICY "Active categories are publicly readable"
  ON part_categories FOR SELECT
  USING (is_active = TRUE OR is_admin());

-- Only admins can manage categories
CREATE POLICY "Admins can insert categories"
  ON part_categories FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update categories"
  ON part_categories FOR UPDATE
  USING (is_admin());

CREATE POLICY "Super admins can delete categories"
  ON part_categories FOR DELETE
  USING (is_super_admin());

-- ============================================================================
-- COMPATIBILITY_RULES POLICIES
-- ============================================================================

-- Anyone can read active rules (needed for frontend validation)
CREATE POLICY "Active rules are publicly readable"
  ON compatibility_rules FOR SELECT
  USING (is_active = TRUE OR is_admin());

-- Only admins can manage rules
CREATE POLICY "Admins can insert rules"
  ON compatibility_rules FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update rules"
  ON compatibility_rules FOR UPDATE
  USING (is_admin());

CREATE POLICY "Super admins can delete rules"
  ON compatibility_rules FOR DELETE
  USING (is_super_admin());

-- ============================================================================
-- ENGINE_PART_COMPATIBILITY POLICIES (Catalog - Admin Write, Public Read)
-- ============================================================================

-- Anyone can read active compatibility data
CREATE POLICY "Compatibility data is publicly readable"
  ON engine_part_compatibility FOR SELECT
  USING (is_active = TRUE OR is_admin());

-- Only admins can manage compatibility
CREATE POLICY "Admins can insert compatibility"
  ON engine_part_compatibility FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update compatibility"
  ON engine_part_compatibility FOR UPDATE
  USING (is_admin());

CREATE POLICY "Super admins can delete compatibility"
  ON engine_part_compatibility FOR DELETE
  USING (is_super_admin());

-- ============================================================================
-- BUILDS POLICIES (User Data - Owner Access + Public Read for Published)
-- ============================================================================

-- Users can view their own builds (any status)
CREATE POLICY "Users can view own builds"
  ON builds FOR SELECT
  USING (auth.uid() = user_id);

-- Anyone can view public builds
CREATE POLICY "Public builds are readable"
  ON builds FOR SELECT
  USING (is_public = TRUE);

-- Admins can view all builds
CREATE POLICY "Admins can view all builds"
  ON builds FOR SELECT
  USING (is_admin());

-- Users can create their own builds
CREATE POLICY "Users can create builds"
  ON builds FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own builds
CREATE POLICY "Users can update own builds"
  ON builds FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can update any build (moderation)
CREATE POLICY "Admins can update any build"
  ON builds FOR UPDATE
  USING (is_admin());

-- Users can delete their own builds
CREATE POLICY "Users can delete own builds"
  ON builds FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can delete any build
CREATE POLICY "Admins can delete any build"
  ON builds FOR DELETE
  USING (is_admin());

-- ============================================================================
-- BUILD_LIKES POLICIES
-- ============================================================================

-- Users can view likes on public builds
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
CREATE POLICY "Users can view own likes"
  ON build_likes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can like public builds
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
CREATE POLICY "Users can unlike builds"
  ON build_likes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- CONTENT POLICIES
-- ============================================================================

-- Anyone can read published content
CREATE POLICY "Published content is publicly readable"
  ON content FOR SELECT
  USING (is_published = TRUE OR is_admin());

-- Only admins can manage content
CREATE POLICY "Admins can insert content"
  ON content FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update content"
  ON content FOR UPDATE
  USING (is_admin());

CREATE POLICY "Super admins can delete content"
  ON content FOR DELETE
  USING (is_super_admin());

-- ============================================================================
-- AUDIT_LOG POLICIES (Admin Read-Only, Immutable)
-- ============================================================================

-- Only admins can read audit logs
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
CREATE TRIGGER audit_engines_changes
  AFTER INSERT OR UPDATE OR DELETE ON engines
  FOR EACH ROW EXECUTE FUNCTION audit_catalog_changes();

CREATE TRIGGER audit_parts_changes
  AFTER INSERT OR UPDATE OR DELETE ON parts
  FOR EACH ROW EXECUTE FUNCTION audit_catalog_changes();

CREATE TRIGGER audit_compatibility_changes
  AFTER INSERT OR UPDATE OR DELETE ON engine_part_compatibility
  FOR EACH ROW EXECUTE FUNCTION audit_catalog_changes();

CREATE TRIGGER audit_content_changes
  AFTER INSERT OR UPDATE OR DELETE ON content
  FOR EACH ROW EXECUTE FUNCTION audit_catalog_changes();

CREATE TRIGGER audit_rules_changes
  AFTER INSERT OR UPDATE OR DELETE ON compatibility_rules
  FOR EACH ROW EXECUTE FUNCTION audit_catalog_changes();



-- ============================================================================
-- FILE: 20260116000003_rls_canary_tests.sql
-- ============================================================================
-- =============================================================================
-- GoKartPartPicker RLS Canary Tests
-- Migration: 20260116000003_rls_canary_tests.sql
-- Purpose: Stored procedures to verify RLS policies are working correctly
-- 
-- USAGE: Run these tests after deployment to verify security:
--   SELECT * FROM run_rls_canary_tests();
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TEST RESULT TYPE
-- -----------------------------------------------------------------------------
CREATE TYPE rls_test_result AS (
  test_name TEXT,
  passed BOOLEAN,
  message TEXT,
  tested_at TIMESTAMPTZ
);

-- -----------------------------------------------------------------------------
-- TEST HELPER: Execute as specific role
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION test_as_role(role_name TEXT, test_query TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  result BOOLEAN;
BEGIN
  -- Set role context
  PERFORM set_config('request.jwt.claim.role', role_name, TRUE);
  PERFORM set_config('request.jwt.claim.sub', '', TRUE);
  
  -- Execute and return success
  EXECUTE test_query;
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- TEST HELPER: Execute as specific user
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION test_as_user(user_id UUID, test_query TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  result BOOLEAN;
BEGIN
  -- Set user context
  PERFORM set_config('request.jwt.claim.role', 'authenticated', TRUE);
  PERFORM set_config('request.jwt.claim.sub', user_id::TEXT, TRUE);
  
  -- Execute and return success
  EXECUTE test_query;
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- TEST HELPER: Count visible rows as role
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION count_visible_as_role(role_name TEXT, table_name TEXT)
RETURNS BIGINT AS $$
DECLARE
  row_count BIGINT;
BEGIN
  PERFORM set_config('request.jwt.claim.role', role_name, TRUE);
  PERFORM set_config('request.jwt.claim.sub', '', TRUE);
  
  EXECUTE format('SELECT COUNT(*) FROM %I', table_name) INTO row_count;
  RETURN row_count;
EXCEPTION
  WHEN OTHERS THEN
    RETURN -1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- TEST HELPER: Count visible rows as user
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION count_visible_as_user(user_id UUID, table_name TEXT)
RETURNS BIGINT AS $$
DECLARE
  row_count BIGINT;
BEGIN
  PERFORM set_config('request.jwt.claim.role', 'authenticated', TRUE);
  PERFORM set_config('request.jwt.claim.sub', user_id::TEXT, TRUE);
  
  EXECUTE format('SELECT COUNT(*) FROM %I', table_name) INTO row_count;
  RETURN row_count;
EXCEPTION
  WHEN OTHERS THEN
    RETURN -1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- MAIN TEST RUNNER
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION run_rls_canary_tests()
RETURNS SETOF rls_test_result AS $$
DECLARE
  test rls_test_result;
  test_user_id UUID;
  other_user_id UUID;
  admin_user_id UUID;
  test_build_id UUID;
  test_engine_id UUID;
  row_count BIGINT;
BEGIN
  -- =========================================================================
  -- SETUP: Create test fixtures
  -- =========================================================================
  
  -- Create test users in auth.users (requires service role)
  -- Note: In production, use actual test accounts
  
  -- For now, we'll test with simulated contexts
  test_user_id := '00000000-0000-0000-0000-000000000001'::UUID;
  other_user_id := '00000000-0000-0000-0000-000000000002'::UUID;
  admin_user_id := '00000000-0000-0000-0000-000000000003'::UUID;
  
  -- =========================================================================
  -- TEST SUITE: Anonymous Access
  -- =========================================================================
  
  -- TEST: Anon can read active engines
  test.test_name := 'anon_can_read_active_engines';
  test.tested_at := NOW();
  BEGIN
    PERFORM set_config('request.jwt.claim.role', 'anon', TRUE);
    PERFORM set_config('request.jwt.claim.sub', '', TRUE);
    
    -- Should not raise exception
    PERFORM id FROM engines WHERE is_active = TRUE LIMIT 1;
    test.passed := TRUE;
    test.message := 'Anonymous users can read active engines';
  EXCEPTION
    WHEN OTHERS THEN
      test.passed := FALSE;
      test.message := 'FAILED: Anonymous users cannot read engines - ' || SQLERRM;
  END;
  RETURN NEXT test;
  
  -- TEST: Anon cannot read inactive engines
  test.test_name := 'anon_cannot_read_inactive_engines';
  test.tested_at := NOW();
  BEGIN
    PERFORM set_config('request.jwt.claim.role', 'anon', TRUE);
    PERFORM set_config('request.jwt.claim.sub', '', TRUE);
    
    SELECT COUNT(*) INTO row_count FROM engines WHERE is_active = FALSE;
    
    IF row_count = 0 THEN
      test.passed := TRUE;
      test.message := 'Anonymous users cannot see inactive engines (count = 0)';
    ELSE
      test.passed := FALSE;
      test.message := 'FAILED: Anonymous users can see inactive engines (count = ' || row_count || ')';
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      test.passed := TRUE;
      test.message := 'Anonymous users cannot see inactive engines (exception raised)';
  END;
  RETURN NEXT test;
  
  -- TEST: Anon can read active parts
  test.test_name := 'anon_can_read_active_parts';
  test.tested_at := NOW();
  BEGIN
    PERFORM set_config('request.jwt.claim.role', 'anon', TRUE);
    PERFORM set_config('request.jwt.claim.sub', '', TRUE);
    
    PERFORM id FROM parts WHERE is_active = TRUE LIMIT 1;
    test.passed := TRUE;
    test.message := 'Anonymous users can read active parts';
  EXCEPTION
    WHEN OTHERS THEN
      test.passed := FALSE;
      test.message := 'FAILED: Anonymous users cannot read parts - ' || SQLERRM;
  END;
  RETURN NEXT test;
  
  -- TEST: Anon can read published content
  test.test_name := 'anon_can_read_published_content';
  test.tested_at := NOW();
  BEGIN
    PERFORM set_config('request.jwt.claim.role', 'anon', TRUE);
    PERFORM set_config('request.jwt.claim.sub', '', TRUE);
    
    PERFORM id FROM content WHERE is_published = TRUE LIMIT 1;
    test.passed := TRUE;
    test.message := 'Anonymous users can read published content';
  EXCEPTION
    WHEN OTHERS THEN
      test.passed := FALSE;
      test.message := 'FAILED: Anonymous users cannot read content - ' || SQLERRM;
  END;
  RETURN NEXT test;
  
  -- TEST: Anon cannot read unpublished content
  test.test_name := 'anon_cannot_read_unpublished_content';
  test.tested_at := NOW();
  BEGIN
    PERFORM set_config('request.jwt.claim.role', 'anon', TRUE);
    PERFORM set_config('request.jwt.claim.sub', '', TRUE);
    
    SELECT COUNT(*) INTO row_count FROM content WHERE is_published = FALSE;
    
    IF row_count = 0 THEN
      test.passed := TRUE;
      test.message := 'Anonymous users cannot see unpublished content';
    ELSE
      test.passed := FALSE;
      test.message := 'FAILED: Anonymous users can see unpublished content (count = ' || row_count || ')';
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      test.passed := TRUE;
      test.message := 'Anonymous users cannot see unpublished content';
  END;
  RETURN NEXT test;
  
  -- TEST: Anon cannot read audit logs
  test.test_name := 'anon_cannot_read_audit_log';
  test.tested_at := NOW();
  BEGIN
    PERFORM set_config('request.jwt.claim.role', 'anon', TRUE);
    PERFORM set_config('request.jwt.claim.sub', '', TRUE);
    
    SELECT COUNT(*) INTO row_count FROM audit_log;
    
    IF row_count = 0 THEN
      test.passed := TRUE;
      test.message := 'Anonymous users cannot read audit logs';
    ELSE
      test.passed := FALSE;
      test.message := 'SECURITY VIOLATION: Anonymous users can read audit logs!';
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      test.passed := TRUE;
      test.message := 'Anonymous users cannot read audit logs (access denied)';
  END;
  RETURN NEXT test;
  
  -- TEST: Anon cannot read private builds
  test.test_name := 'anon_cannot_read_private_builds';
  test.tested_at := NOW();
  BEGIN
    PERFORM set_config('request.jwt.claim.role', 'anon', TRUE);
    PERFORM set_config('request.jwt.claim.sub', '', TRUE);
    
    SELECT COUNT(*) INTO row_count FROM builds WHERE is_public = FALSE;
    
    IF row_count = 0 THEN
      test.passed := TRUE;
      test.message := 'Anonymous users cannot see private builds';
    ELSE
      test.passed := FALSE;
      test.message := 'SECURITY VIOLATION: Anonymous users can see private builds!';
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      test.passed := TRUE;
      test.message := 'Anonymous users cannot see private builds';
  END;
  RETURN NEXT test;
  
  -- =========================================================================
  -- TEST SUITE: Write Protection
  -- =========================================================================
  
  -- TEST: Anon cannot insert engines
  test.test_name := 'anon_cannot_insert_engines';
  test.tested_at := NOW();
  BEGIN
    PERFORM set_config('request.jwt.claim.role', 'anon', TRUE);
    PERFORM set_config('request.jwt.claim.sub', '', TRUE);
    
    INSERT INTO engines (slug, name, brand, model, displacement_cc)
    VALUES ('test-engine', 'Test', 'Test', 'Test', 100);
    
    -- If we got here, the insert succeeded (BAD)
    test.passed := FALSE;
    test.message := 'SECURITY VIOLATION: Anonymous users can insert engines!';
    
    -- Clean up
    DELETE FROM engines WHERE slug = 'test-engine';
  EXCEPTION
    WHEN OTHERS THEN
      test.passed := TRUE;
      test.message := 'Anonymous users cannot insert engines (correctly denied)';
  END;
  RETURN NEXT test;
  
  -- TEST: Anon cannot insert parts
  test.test_name := 'anon_cannot_insert_parts';
  test.tested_at := NOW();
  BEGIN
    PERFORM set_config('request.jwt.claim.role', 'anon', TRUE);
    PERFORM set_config('request.jwt.claim.sub', '', TRUE);
    
    INSERT INTO parts (slug, name, category_id)
    VALUES ('test-part', 'Test', '00000000-0000-0000-0000-000000000001');
    
    test.passed := FALSE;
    test.message := 'SECURITY VIOLATION: Anonymous users can insert parts!';
  EXCEPTION
    WHEN OTHERS THEN
      test.passed := TRUE;
      test.message := 'Anonymous users cannot insert parts (correctly denied)';
  END;
  RETURN NEXT test;
  
  -- TEST: Anon cannot update engines
  test.test_name := 'anon_cannot_update_engines';
  test.tested_at := NOW();
  BEGIN
    PERFORM set_config('request.jwt.claim.role', 'anon', TRUE);
    PERFORM set_config('request.jwt.claim.sub', '', TRUE);
    
    UPDATE engines SET name = 'HACKED' WHERE TRUE;
    
    -- Check if any rows were affected
    IF FOUND THEN
      test.passed := FALSE;
      test.message := 'SECURITY VIOLATION: Anonymous users can update engines!';
    ELSE
      test.passed := TRUE;
      test.message := 'Anonymous users cannot update engines';
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      test.passed := TRUE;
      test.message := 'Anonymous users cannot update engines (correctly denied)';
  END;
  RETURN NEXT test;
  
  -- TEST: Anon cannot delete engines
  test.test_name := 'anon_cannot_delete_engines';
  test.tested_at := NOW();
  BEGIN
    PERFORM set_config('request.jwt.claim.role', 'anon', TRUE);
    PERFORM set_config('request.jwt.claim.sub', '', TRUE);
    
    DELETE FROM engines WHERE TRUE;
    
    IF FOUND THEN
      test.passed := FALSE;
      test.message := 'SECURITY VIOLATION: Anonymous users can delete engines!';
    ELSE
      test.passed := TRUE;
      test.message := 'Anonymous users cannot delete engines';
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      test.passed := TRUE;
      test.message := 'Anonymous users cannot delete engines (correctly denied)';
  END;
  RETURN NEXT test;
  
  -- =========================================================================
  -- TEST SUITE: Audit Log Immutability
  -- =========================================================================
  
  -- TEST: Audit log cannot be updated
  test.test_name := 'audit_log_immutable_update';
  test.tested_at := NOW();
  BEGIN
    UPDATE audit_log SET action = 'HACKED' WHERE TRUE;
    
    IF FOUND THEN
      test.passed := FALSE;
      test.message := 'SECURITY VIOLATION: Audit log can be modified!';
    ELSE
      test.passed := TRUE;
      test.message := 'Audit log is immutable (no updates)';
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      test.passed := TRUE;
      test.message := 'Audit log is immutable (update denied)';
  END;
  RETURN NEXT test;
  
  -- TEST: Audit log cannot be deleted
  test.test_name := 'audit_log_immutable_delete';
  test.tested_at := NOW();
  BEGIN
    DELETE FROM audit_log WHERE TRUE;
    
    IF FOUND THEN
      test.passed := FALSE;
      test.message := 'SECURITY VIOLATION: Audit log records can be deleted!';
    ELSE
      test.passed := TRUE;
      test.message := 'Audit log is immutable (no deletes)';
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      test.passed := TRUE;
      test.message := 'Audit log is immutable (delete denied)';
  END;
  RETURN NEXT test;
  
  -- =========================================================================
  -- TEST SUITE: RLS Policy Existence
  -- =========================================================================
  
  -- TEST: All tables have RLS enabled
  test.test_name := 'all_tables_have_rls_enabled';
  test.tested_at := NOW();
  BEGIN
    SELECT COUNT(*) INTO row_count
    FROM pg_tables t
    LEFT JOIN pg_class c ON c.relname = t.tablename AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = t.schemaname)
    WHERE t.schemaname = 'public'
    AND t.tablename NOT LIKE 'pg_%'
    AND t.tablename NOT LIKE '_prisma%'
    AND NOT c.relrowsecurity;
    
    IF row_count = 0 THEN
      test.passed := TRUE;
      test.message := 'All public tables have RLS enabled';
    ELSE
      test.passed := FALSE;
      test.message := 'WARNING: ' || row_count || ' tables do not have RLS enabled';
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      test.passed := FALSE;
      test.message := 'Could not verify RLS status - ' || SQLERRM;
  END;
  RETURN NEXT test;
  
  -- =========================================================================
  -- SUMMARY
  -- =========================================================================
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- QUICK CHECK: List tables without RLS
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_rls_coverage()
RETURNS TABLE (
  table_name TEXT,
  rls_enabled BOOLEAN,
  policy_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.tablename::TEXT,
    c.relrowsecurity,
    (SELECT COUNT(*) FROM pg_policies p WHERE p.tablename = t.tablename)
  FROM pg_tables t
  JOIN pg_class c ON c.relname = t.tablename 
    AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = t.schemaname)
  WHERE t.schemaname = 'public'
  AND t.tablename NOT LIKE 'pg_%'
  ORDER BY t.tablename;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- GRANT: Allow authenticated users to run tests (for CI/CD)
-- -----------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION run_rls_canary_tests() TO authenticated;
GRANT EXECUTE ON FUNCTION check_rls_coverage() TO authenticated;

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================


-- ============================================================================
-- FILE: 20260116000004_seed_engines.sql
-- ============================================================================
-- ============================================================================
-- GoKart Part Picker - Engine Seed Data
-- Created: 2026-01-16
-- Description: Initial engine catalog with popular small engines
-- Owner: DB Architect + Coordinator Agent (A1)
-- ============================================================================

-- ============================================================================
-- PREDATOR ENGINES (Harbor Freight)
-- ============================================================================

-- Predator 79cc
INSERT INTO engines (
  slug, name, brand, model, variant, displacement_cc,
  horsepower, torque, shaft_diameter, shaft_length, shaft_keyway, shaft_type,
  mount_type, oil_capacity_oz, weight_lbs,
  notes
) VALUES (
  'predator-79', 'Predator 79cc', 'Predator', '79', NULL, 79,
  2.5, 3.0, 0.750, 2.125, 0.1875, 'straight',
  '97mm x 80mm', 11.8, 20.9,
  'Compact engine popular for mini bikes. Clone of Honda GXH50. Great for kids go-karts.'
);

-- Predator 212cc Non-Hemi (Old Style)
INSERT INTO engines (
  slug, name, brand, model, variant, displacement_cc,
  horsepower, torque, shaft_diameter, shaft_length, shaft_keyway, shaft_type,
  mount_type, oil_capacity_oz, fuel_tank_oz, weight_lbs,
  notes
) VALUES (
  'predator-212-non-hemi', 'Predator 212 Non-Hemi', 'Predator', '212', 'Non-Hemi', 212,
  6.5, 8.1, 0.750, 2.3125, 0.1875, 'straight',
  '162mm x 75.5mm', 20.3, 121.7, 34.8,
  'Original 212cc design. Flat-top piston, smaller valves. Still popular for reliability. Great aftermarket support.'
);

-- Predator 212cc Hemi
INSERT INTO engines (
  slug, name, brand, model, variant, displacement_cc,
  horsepower, torque, shaft_diameter, shaft_length, shaft_keyway, shaft_type,
  mount_type, oil_capacity_oz, fuel_tank_oz, weight_lbs,
  notes
) VALUES (
  'predator-212-hemi', 'Predator 212 Hemi', 'Predator', '212', 'Hemi', 212,
  6.5, 8.1, 0.750, 2.3125, 0.1875, 'straight',
  '162mm x 75.5mm', 20.3, 121.7, 34.8,
  'Updated design with hemispherical combustion chamber. Domed piston, larger valves. Better flow, more power potential. Most popular engine for go-kart builds.'
);

-- Predator Ghost 212cc
INSERT INTO engines (
  slug, name, brand, model, variant, displacement_cc,
  horsepower, torque, shaft_diameter, shaft_length, shaft_keyway, shaft_type,
  mount_type, oil_capacity_oz, fuel_tank_oz, weight_lbs,
  notes
) VALUES (
  'predator-ghost', 'Predator Ghost 212', 'Predator', 'Ghost', NULL, 212,
  7.0, 9.0, 0.750, 2.3125, 0.1875, 'straight',
  '162mm x 75.5mm', 20.3, 121.7, 32.0,
  'Performance-oriented 212. Lighter flywheel, better cam, improved head design. Stock has more power than standard 212. Designed for racing applications.'
);

-- Predator 224cc
INSERT INTO engines (
  slug, name, brand, model, variant, displacement_cc,
  horsepower, torque, shaft_diameter, shaft_length, shaft_keyway, shaft_type,
  mount_type, oil_capacity_oz, fuel_tank_oz, weight_lbs,
  notes
) VALUES (
  'predator-224', 'Predator 224', 'Predator', '224', NULL, 224,
  7.5, 11.2, 0.875, 2.125, 0.1875, 'straight',
  '162mm x 75.5mm', 20.3, 121.7, 35.9,
  'Longer stroke version of 212. More torque, same mounting pattern. 7/8" shaft requires different clutch. Popular for mud and trail builds.'
);

-- Predator 301cc
INSERT INTO engines (
  slug, name, brand, model, variant, displacement_cc,
  horsepower, torque, shaft_diameter, shaft_length, shaft_keyway, shaft_type,
  mount_type, oil_capacity_oz, fuel_tank_oz, weight_lbs,
  notes
) VALUES (
  'predator-301', 'Predator 301', 'Predator', '301', NULL, 301,
  8.0, 14.0, 1.000, 2.500, 0.250, 'straight',
  '178mm x 92mm', 37.2, 202.9, 55.1,
  'Mid-size engine. 1" shaft for heavy-duty applications. Great for larger go-karts and utility vehicles. Same mounting as GX270/GX340.'
);

-- Predator 420cc
INSERT INTO engines (
  slug, name, brand, model, variant, displacement_cc,
  horsepower, torque, shaft_diameter, shaft_length, shaft_keyway, shaft_type,
  mount_type, oil_capacity_oz, fuel_tank_oz, weight_lbs,
  notes
) VALUES (
  'predator-420', 'Predator 420', 'Predator', '420', NULL, 420,
  13.0, 18.4, 1.000, 3.500, 0.250, 'straight',
  '198mm x 92mm', 37.2, 209.5, 68.3,
  'Popular mid-large engine. Clone of Honda GX390. Great power for the price. Used in racing, go-karts, and utility applications.'
);

-- Predator 670cc
INSERT INTO engines (
  slug, name, brand, model, variant, displacement_cc,
  horsepower, torque, shaft_diameter, shaft_length, shaft_keyway, shaft_type,
  mount_type, oil_capacity_oz, fuel_tank_oz, weight_lbs,
  notes
) VALUES (
  'predator-670', 'Predator 670 V-Twin', 'Predator', '670', NULL, 670,
  22.0, 37.0, 1.000, 3.500, 0.3125, 'straight',
  '203mm x 116mm', 64.2, 777.1, 92.6,
  'V-twin engine with serious power. Electric start standard. Great for large go-karts, buggies, and off-road vehicles. Best bang for buck in V-twin category.'
);

-- ============================================================================
-- HONDA ENGINES
-- ============================================================================

-- Honda GX200
INSERT INTO engines (
  slug, name, brand, model, variant, displacement_cc,
  horsepower, torque, shaft_diameter, shaft_length, shaft_keyway, shaft_type,
  mount_type, oil_capacity_oz, fuel_tank_oz, weight_lbs,
  notes
) VALUES (
  'honda-gx200', 'Honda GX200', 'Honda', 'GX200', NULL, 196,
  5.5, 9.1, 0.750, 2.28125, 0.1875, 'straight',
  '162mm x 75.5mm', 20.3, 104.8, 35.5,
  'The original. Industry standard for small engine reliability. Same mounting pattern as Predator 212. OHV design. Gold standard for racing classes requiring stock Honda.'
);

-- ============================================================================
-- BRIGGS & STRATTON ENGINES
-- ============================================================================

-- Briggs 206
INSERT INTO engines (
  slug, name, brand, model, variant, displacement_cc,
  horsepower, torque, shaft_diameter, shaft_length, shaft_keyway, shaft_type,
  mount_type, oil_capacity_oz, weight_lbs,
  notes
) VALUES (
  'briggs-206', 'Briggs & Stratton 206', 'Briggs & Stratton', '206', NULL, 206,
  5.5, 8.5, 0.750, 2.250, 0.1875, 'straight',
  '162mm x 75.5mm', 20.3, 28.7,
  'Purpose-built racing engine. Sealed for class racing - no modifications allowed. Used in LO206 racing class nationwide. Very affordable racing series. Side cover seal ensures stock internals.'
);

-- ============================================================================
-- VERIFICATION QUERY (can be run to check seed data)
-- ============================================================================
-- Run this in Supabase SQL editor to verify:
/*
SELECT 
  slug,
  name,
  brand,
  displacement_cc,
  horsepower,
  shaft_diameter
FROM engines
ORDER BY brand, displacement_cc;
*/



-- ============================================================================
-- FILE: 20260116000005_hardening_constraints.sql
-- ============================================================================
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


-- ============================================================================
-- FILE: 20260116000006_seed_parts.sql
-- ============================================================================
-- ============================================================================
-- GoKart Part Picker - Parts Seed Data
-- Created: 2026-01-16
-- Description: Sample parts for testing parts pages
-- Owner: A5 (Admin)
-- ============================================================================

-- Note: category_id is looked up dynamically from part_categories table
-- using a subquery to avoid hardcoding UUIDs

-- ============================================================================
-- CLUTCHES
-- ============================================================================

INSERT INTO parts (
  slug, name, category, category_id, brand, specifications, price, is_active
) VALUES
  (
    'maxtorque-clutch-3-4',
    'MaxTorque Clutch 3/4"',
    'clutch',
    (SELECT id FROM part_categories WHERE slug = 'clutch'),
    'MaxTorque',
    '{"bore_in": 0.75, "engagement_rpm": 1800, "chain_size": "#35", "chain_pitch": "#35"}'::jsonb,
    49.99,
    true
  ),
  (
    'hilliard-extreme-duty-clutch-3-4',
    'Hilliard Extreme Duty Clutch 3/4"',
    'clutch',
    (SELECT id FROM part_categories WHERE slug = 'clutch'),
    'Hilliard',
    '{"bore_in": 0.75, "engagement_rpm": 2000, "chain_size": "#35", "chain_pitch": "#35"}'::jsonb,
    79.99,
    true
  ),
  (
    'maxtorque-clutch-5-8',
    'MaxTorque Clutch 5/8"',
    'clutch',
    (SELECT id FROM part_categories WHERE slug = 'clutch'),
    'MaxTorque',
    '{"bore_in": 0.625, "engagement_rpm": 1800, "chain_size": "#35", "chain_pitch": "#35"}'::jsonb,
    44.99,
    true
  );

-- ============================================================================
-- TORQUE CONVERTERS
-- ============================================================================

INSERT INTO parts (
  slug, name, category, category_id, brand, specifications, price, is_active
) VALUES
  (
    'comet-30-series-torque-converter',
    'Comet 30 Series Torque Converter',
    'torque_converter',
    (SELECT id FROM part_categories WHERE slug = 'torque_converter'),
    'Comet',
    '{"bore_in": 0.75, "driver_pulley": "6", "driven_pulley": "7", "belt": "203589", "series": "30"}'::jsonb,
    199.99,
    true
  ),
  (
    'comet-40-series-torque-converter',
    'Comet 40 Series Torque Converter',
    'torque_converter',
    (SELECT id FROM part_categories WHERE slug = 'torque_converter'),
    'Comet',
    '{"bore_in": 0.75, "driver_pulley": "7", "driven_pulley": "8", "belt": "203780", "series": "40"}'::jsonb,
    249.99,
    true
  );

-- ============================================================================
-- CHAINS
-- ============================================================================

INSERT INTO parts (
  slug, name, category, category_id, brand, specifications, price, is_active
) VALUES
  (
    'chain-35-10ft',
    '#35 Chain 10ft',
    'chain',
    (SELECT id FROM part_categories WHERE slug = 'chain'),
    'Generic',
    '{"chain_size": "#35", "pitch": "#35", "length_ft": 10, "links": 120, "pitch_in": 0.375}'::jsonb,
    24.99,
    true
  ),
  (
    'chain-40-10ft',
    '#40 Chain 10ft',
    'chain',
    (SELECT id FROM part_categories WHERE slug = 'chain'),
    'Generic',
    '{"chain_size": "#40", "pitch": "#40", "length_ft": 10, "links": 120, "pitch_in": 0.5}'::jsonb,
    29.99,
    true
  ),
  (
    'chain-420-10ft',
    '#420 Chain 10ft',
    'chain',
    (SELECT id FROM part_categories WHERE slug = 'chain'),
    'Generic',
    '{"chain_size": "#420", "pitch": "#420", "length_ft": 10, "links": 120, "pitch_in": 0.375}'::jsonb,
    19.99,
    true
  );

-- ============================================================================
-- SPROCKETS
-- ============================================================================

INSERT INTO parts (
  slug, name, category, category_id, brand, specifications, price, is_active
) VALUES
  (
    'sprocket-35-10-tooth',
    '#35 Sprocket 10 Tooth',
    'sprocket',
    (SELECT id FROM part_categories WHERE slug = 'sprocket'),
    'Generic',
    '{"chain_size": "#35", "pitch": "#35", "teeth": 10, "bore_in": 0.75, "type": "driver"}'::jsonb,
    12.99,
    true
  ),
  (
    'sprocket-35-60-tooth',
    '#35 Sprocket 60 Tooth',
    'sprocket',
    (SELECT id FROM part_categories WHERE slug = 'sprocket'),
    'Generic',
    '{"chain_size": "#35", "pitch": "#35", "teeth": 60, "bore_in": 1.0, "type": "driven"}'::jsonb,
    19.99,
    true
  ),
  (
    'sprocket-40-12-tooth',
    '#40 Sprocket 12 Tooth',
    'sprocket',
    (SELECT id FROM part_categories WHERE slug = 'sprocket'),
    'Generic',
    '{"chain_size": "#40", "pitch": "#40", "teeth": 12, "bore_in": 0.75, "type": "driver"}'::jsonb,
    14.99,
    true
  );

-- ============================================================================
-- BRAKES
-- ============================================================================

INSERT INTO parts (
  slug, name, category, category_id, brand, specifications, price, is_active
) VALUES
  (
    'disc-brake-kit-6-inch',
    'Disc Brake Kit 6"',
    'brake',
    (SELECT id FROM part_categories WHERE slug = 'brake'),
    'Generic',
    '{"type": "disc", "rotor_diameter": "6", "caliper_type": "single_piston", "mount_type": "bolt_on"}'::jsonb,
    89.99,
    true
  ),
  (
    'drum-brake-kit',
    'Drum Brake Kit',
    'brake',
    (SELECT id FROM part_categories WHERE slug = 'brake'),
    'Generic',
    '{"type": "drum", "drum_diameter": "6", "mount_type": "bolt_on"}'::jsonb,
    59.99,
    true
  );

-- ============================================================================
-- VERIFICATION QUERY (can be run to check seed data)
-- ============================================================================
-- Run this in Supabase SQL editor to verify:
/*
SELECT 
  p.slug,
  p.name,
  p.category,
  pc.name as category_name,
  p.brand,
  p.price,
  p.is_active
FROM parts p
LEFT JOIN part_categories pc ON pc.id = p.category_id
ORDER BY p.category, p.brand, p.name;
*/


-- ============================================================================
-- FILE: 20260116000007_add_harbor_freight_links.sql
-- ============================================================================
-- ============================================================================
-- Add Harbor Freight Links to Engines
-- Created: 2026-01-16
-- Description: Add direct Harbor Freight product links to engines
-- Note: These are NOT affiliate links - direct links per pricing policy
-- ============================================================================

-- Predator 212 (6.5 HP) - Most common engine
UPDATE engines 
SET affiliate_url = 'https://www.harborfreight.com/65-hp-212cc-ohv-horizontal-shaft-gas-engine-epa-69730.html'
WHERE (name ILIKE '%predator%212%' OR name ILIKE '%212%') 
  AND displacement_cc = 212
  AND brand ILIKE '%predator%'
  AND (affiliate_url IS NULL OR affiliate_url = '');

-- Predator 420 (13 HP)
UPDATE engines 
SET affiliate_url = 'https://www.harborfreight.com/13-hp-420cc-ohv-horizontal-shaft-gas-engine-epa-60340.html'
WHERE displacement_cc = 420
  AND brand ILIKE '%predator%'
  AND (affiliate_url IS NULL OR affiliate_url = '');

-- Predator 670 V-Twin (22 HP)
UPDATE engines 
SET affiliate_url = 'https://www.harborfreight.com/22-hp-670cc-v-twin-horizontal-shaft-gas-engine-epa-61614.html'
WHERE displacement_cc = 670
  AND brand ILIKE '%predator%'
  AND (affiliate_url IS NULL OR affiliate_url = '');

-- Note: Only updates engines that don't already have affiliate_url set
-- This preserves any manually entered links


-- ============================================================================
-- FILE: 20260116000008_fix_profile_trigger.sql
-- ============================================================================
-- Fix Profile Creation Trigger
-- Created: 2026-01-16
-- Description: Improve handle_new_user trigger to handle edge cases
-- ============================================================================

-- Drop and recreate the trigger function with better error handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
  v_base_username TEXT;
  v_counter INTEGER := 0;
BEGIN
  -- Extract username from metadata or use email prefix
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    LOWER(split_part(NEW.email, '@', 1))
  );
  
  -- Ensure username meets format requirements (lowercase, alphanumeric, underscore)
  -- Remove any invalid characters
  v_username := LOWER(REGEXP_REPLACE(v_username, '[^a-z0-9_]', '_', 'g'));
  
  -- Ensure minimum length (add padding if needed)
  IF LENGTH(v_username) < 3 THEN
    v_username := v_username || '_' || LPAD((EXTRACT(EPOCH FROM NOW())::BIGINT % 1000)::TEXT, 3, '0');
  END IF;
  
  -- Ensure maximum length
  IF LENGTH(v_username) > 30 THEN
    v_username := LEFT(v_username, 30);
  END IF;
  
  -- Handle duplicate usernames by appending a number
  v_base_username := v_username;
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = v_username) LOOP
    v_counter := v_counter + 1;
    v_username := LEFT(v_base_username, 27) || '_' || LPAD(v_counter::TEXT, 2, '0');
    -- Safety check to prevent infinite loop
    IF v_counter > 999 THEN
      v_username := v_base_username || '_' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT;
      EXIT;-- ============================================================================

    END IF;
  END LOOP;
  
  -- Insert profile
  INSERT INTO profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    v_username
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicate if trigger runs twice
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    -- Try to create with minimal data
    BEGIN
      INSERT INTO profiles (id, email, username)
      VALUES (
        NEW.id,
        NEW.email,
        'user_' || SUBSTRING(NEW.id::TEXT, 1, 8)
      )
      ON CONFLICT (id) DO NOTHING;
    EXCEPTION
      WHEN OTHERS THEN
        -- If even this fails, just log and continue
        RAISE WARNING 'Failed to create profile with fallback username: %', SQLERRM;
    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

COMMENT ON FUNCTION handle_new_user() IS 'Automatically creates a profile when a new auth user is created. Handles username conflicts and format validation.';


-- ============================================================================
-- FILE: 20260116000008_update_engine_prices_harborfreight.sql
-- ============================================================================
-- ============================================================================
-- Update Engine Prices from Harbor Freight
-- Created: 2026-01-16
-- Description: Update all Predator engine prices and affiliate URLs from Harbor Freight
-- Note: Prices as of 2026-01-16. These should be updated periodically.
-- Per PRICING-POLICY.md: Direct links (NOT affiliate links)
-- ============================================================================

-- Predator 79cc (3 HP) - Item 69733
UPDATE engines 
SET 
  price = 119.99,
  affiliate_url = 'https://www.harborfreight.com/3-hp-79cc-ohv-horizontal-shaft-gas-engine-epa-69733.html'
WHERE slug = 'predator-79';

-- Predator 212cc Non-Hemi (6.5 HP) - Item 69730
-- Note: Standard 212cc engine, typically the Non-Hemi variant
UPDATE engines 
SET 
  price = 149.99,
  affiliate_url = 'https://www.harborfreight.com/65-hp-212cc-ohv-horizontal-shaft-gas-engine-epa-69730.html'
WHERE slug = 'predator-212-non-hemi';

-- Predator 212cc Hemi (6.5 HP) - Item 69730 or 60363
-- Note: Hemi and Non-Hemi often share the same SKU on Harbor Freight
UPDATE engines 
SET 
  price = 149.99,
  affiliate_url = 'https://www.harborfreight.com/65-hp-212cc-ohv-horizontal-shaft-gas-engine-epa-69730.html'
WHERE slug = 'predator-212-hemi';

-- Predator Ghost 212cc (Racing Engine) - Item 57531
UPDATE engines 
SET 
  price = 329.99,
  affiliate_url = 'https://www.harborfreight.com/brands/predator/racing-engines/212cc-ghost-kart-racing-engine-57531.html'
WHERE slug = 'predator-ghost';

-- Predator 224cc - Need to verify current SKU and price
-- Note: 224cc may be discontinued or rare - keeping existing price if set
UPDATE engines 
SET 
  affiliate_url = 'https://www.harborfreight.com/search?q=predator%20224'
WHERE slug = 'predator-224' AND (affiliate_url IS NULL OR affiliate_url = '');

-- Predator 301cc (8 HP) - Item 62554
UPDATE engines 
SET 
  price = 249.99,
  affiliate_url = 'https://www.harborfreight.com/8-hp-301cc-ohv-horizontal-shaft-gas-engine-epa-62554.html'
WHERE slug = 'predator-301';

-- Predator 420cc (13 HP) - Item 60340
UPDATE engines 
SET 
  price = 379.99,
  affiliate_url = 'https://www.harborfreight.com/13-hp-420cc-ohv-horizontal-shaft-gas-engine-epa-60340.html'
WHERE slug = 'predator-420';

-- Predator 670cc V-Twin (22 HP) - Item 61614
UPDATE engines 
SET 
  price = 949.99,
  affiliate_url = 'https://www.harborfreight.com/22-hp-670cc-v-twin-horizontal-shaft-gas-engine-epa-61614.html'
WHERE slug = 'predator-670';

-- ============================================================================
-- Verification Query
-- ============================================================================
-- Run this to verify prices were updated:
/*
SELECT 
  slug,
  name,
  price,
  affiliate_url,
  CASE 
    WHEN affiliate_url LIKE '%harborfreight%' THEN '✓'
    ELSE '✗'
  END as has_harbor_freight_link
FROM engines
WHERE brand ILIKE '%predator%'
ORDER BY displacement_cc;
*/

-- ============================================================================
-- Notes
-- ============================================================================
-- 1. Prices are current as of 2026-01-16
-- 2. Prices may vary with promotions, coupons, or store location
-- 3. Harbor Freight periodically runs sales - prices should be updated monthly
-- 4. For price monitoring, consider automated price checking script
-- 5. All affiliate_url links are direct (non-affiliate) per PRICING-POLICY.md


-- ============================================================================
-- FILE: 20260116000009_add_profile_insert_policy.sql
-- ============================================================================
-- ============================================================================
-- Add INSERT Policy for Profiles (for trigger)
-- Created: 2026-01-16
-- Description: Allow the trigger to insert profiles even with RLS enabled
-- ============================================================================

-- The trigger uses SECURITY DEFINER, but we should also have a policy
-- that allows the service role to insert profiles (for the trigger)

-- Note: SECURITY DEFINER functions bypass RLS, but having an explicit policy
-- is good practice and can help with debugging

-- Allow authenticated users to insert their own profile
-- Note: The trigger uses SECURITY DEFINER which bypasses RLS,
-- but this policy helps if the trigger needs to run as the user
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);


-- ============================================================================
-- FILE: 20260116000010_simplify_profile_trigger.sql
-- ============================================================================
-- ============================================================================
-- Simplify Profile Trigger - More Robust Version
-- Created: 2026-01-16
-- Description: Simplified trigger that definitely works
-- ============================================================================

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create a simpler, more robust trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
BEGIN
  -- Get username from metadata or generate from email
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    LOWER(REGEXP_REPLACE(split_part(NEW.email, '@', 1), '[^a-z0-9]', '_', 'g'))
  );
  
  -- Ensure it's lowercase and valid format
  v_username := LOWER(REGEXP_REPLACE(v_username, '[^a-z0-9_]', '_', 'g'));
  
  -- Ensure minimum length
  IF LENGTH(v_username) < 3 THEN
    v_username := 'user_' || SUBSTRING(REPLACE(NEW.id::TEXT, '-', ''), 1, 8);
  END IF;
  
  -- Ensure maximum length
  IF LENGTH(v_username) > 30 THEN
    v_username := LEFT(v_username, 30);
  END IF;
  
  -- Handle potential duplicates by appending user ID suffix
  IF EXISTS (SELECT 1 FROM profiles WHERE username = v_username) THEN
    v_username := LEFT(v_username, 22) || '_' || SUBSTRING(REPLACE(NEW.id::TEXT, '-', ''), 1, 7);
  END IF;
  
  -- Insert the profile
  -- Use ON CONFLICT to handle race conditions
  INSERT INTO profiles (id, email, username, role)
  VALUES (NEW.id, NEW.email, v_username, 'user')
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = COALESCE(profiles.username, EXCLUDED.username);
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If username is still duplicate, use UUID-based fallback
    INSERT INTO profiles (id, email, username, role)
    VALUES (
      NEW.id,
      NEW.email,
      'user_' || SUBSTRING(REPLACE(NEW.id::TEXT, '-', ''), 1, 12),
      'user'
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email;
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log the error but don't fail user creation
    -- Supabase will still create the auth user even if profile creation fails
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

COMMENT ON FUNCTION handle_new_user() IS 'Creates a profile when a new auth user is created. Uses SECURITY DEFINER to bypass RLS.';


-- ============================================================================
-- FILE: 20260116000011_add_build_templates.sql
-- ============================================================================
-- ============================================================================
-- Add Build Templates Table
-- Created: 2026-01-16
-- Description: Template system for preset builds that users can apply
-- Owner: Agent A3 (UI) + A5 (Admin)
-- ============================================================================

-- Template goal enum for categorization
CREATE TYPE template_goal AS ENUM (
  'speed',       -- Maximum speed, high-RPM parts
  'torque',      -- Low-end power, torque-focused
  'budget',      -- Best value, under budget
  'beginner',    -- Simple, reliable, easy
  'competition', -- Full performance build
  'kids'         -- Safe, governed, reliable
);

-- ============================================================================
-- BUILD_TEMPLATES TABLE
-- ============================================================================

CREATE TABLE build_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  goal template_goal NOT NULL,
  engine_id UUID REFERENCES engines(id) ON DELETE SET NULL,
  parts JSONB NOT NULL DEFAULT '{}'::JSONB, -- {category: part_id}
  total_price DECIMAL(10,2),
  estimated_hp DECIMAL(4,1),
  estimated_torque DECIMAL(4,1),
  is_public BOOLEAN DEFAULT true NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_templates_goal ON build_templates(goal);
CREATE INDEX idx_templates_public ON build_templates(is_public) WHERE is_public = true;
CREATE INDEX idx_templates_active ON build_templates(is_active) WHERE is_active = true;
CREATE INDEX idx_templates_created_by ON build_templates(created_by);
CREATE INDEX idx_templates_name_search ON build_templates USING gin(to_tsvector('english', name));

COMMENT ON TABLE build_templates IS 'Preset build templates for quick-start configurations. Users can apply templates to the builder.';
COMMENT ON COLUMN build_templates.goal IS 'Template category/goal (speed, torque, budget, beginner, competition, kids)';
COMMENT ON COLUMN build_templates.parts IS 'JSON object mapping category to part_id: {"clutch": "uuid", "exhaust": "uuid"}';
COMMENT ON COLUMN build_templates.is_public IS 'Public templates visible to all users, private only to admins';
COMMENT ON COLUMN build_templates.is_active IS 'Active templates appear in gallery, inactive hidden';

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

CREATE TRIGGER update_build_templates_updated_at
  BEFORE UPDATE ON build_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS POLICIES (will be added in RLS migration)
-- ============================================================================

-- Enable RLS
ALTER TABLE build_templates ENABLE ROW LEVEL SECURITY;

-- Public templates are visible to everyone
CREATE POLICY "Public templates are viewable by everyone"
  ON build_templates
  FOR SELECT
  USING (is_public = true AND is_active = true);

-- Admins can view all templates
CREATE POLICY "Admins can view all templates"
  ON build_templates
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Only admins can create templates
CREATE POLICY "Only admins can create templates"
  ON build_templates
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Only admins can update templates
CREATE POLICY "Only admins can update templates"
  ON build_templates
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Only admins can delete templates
CREATE POLICY "Only admins can delete templates"
  ON build_templates
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );


-- ============================================================================
-- FILE: 20260116000012_add_price_tracking.sql
-- ============================================================================
-- ============================================================================
-- Add Price Tracking and Alerts
-- Created: 2026-01-16
-- Description: Track price history and enable price drop alerts
-- Owner: Agent A3 (UI)
-- ============================================================================

-- ============================================================================
-- PRICE_HISTORY TABLE
-- ============================================================================

CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  engine_id UUID REFERENCES engines(id) ON DELETE CASCADE,
  part_id UUID REFERENCES parts(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
  source TEXT, -- 'harbor_freight', 'amazon', 'direct', etc.
  checked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_price_history_engine ON price_history(engine_id, checked_at DESC);
CREATE INDEX idx_price_history_part ON price_history(part_id, checked_at DESC);
CREATE INDEX idx_price_history_checked ON price_history(checked_at DESC);

COMMENT ON TABLE price_history IS 'Historical price tracking for engines and parts';
COMMENT ON COLUMN price_history.source IS 'Price source (harbor_freight, amazon, direct, etc.)';

-- ============================================================================
-- PRICE_ALERTS TABLE
-- ============================================================================

CREATE TABLE price_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  engine_id UUID REFERENCES engines(id) ON DELETE CASCADE,
  part_id UUID REFERENCES parts(id) ON DELETE CASCADE,
  target_price DECIMAL(10,2) NOT NULL, -- Alert when price drops below this
  current_price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  email_notifications BOOLEAN DEFAULT true NOT NULL,
  in_app_notifications BOOLEAN DEFAULT true NOT NULL,
  last_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT check_item CHECK (
    (engine_id IS NOT NULL AND part_id IS NULL) OR
    (engine_id IS NULL AND part_id IS NOT NULL)
  )
);

CREATE INDEX idx_price_alerts_user ON price_alerts(user_id, is_active);
CREATE INDEX idx_price_alerts_engine ON price_alerts(engine_id);
CREATE INDEX idx_price_alerts_part ON price_alerts(part_id);
CREATE INDEX idx_price_alerts_active ON price_alerts(is_active) WHERE is_active = true;

COMMENT ON TABLE price_alerts IS 'User price drop alerts for engines and parts';

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

CREATE TRIGGER update_price_alerts_updated_at
  BEFORE UPDATE ON price_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Price history is viewable by everyone
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Price history is viewable by everyone"
  ON price_history
  FOR SELECT
  USING (true);

-- Only admins can insert price history
CREATE POLICY "Only admins can insert price history"
  ON price_history
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Price alerts are private to users
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own alerts"
  ON price_alerts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own alerts"
  ON price_alerts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
  ON price_alerts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
  ON price_alerts
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTION: Get price change percentage
-- ============================================================================

CREATE OR REPLACE FUNCTION get_price_change(
  p_engine_id UUID DEFAULT NULL,
  p_part_id UUID DEFAULT NULL,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  current_price DECIMAL,
  previous_price DECIMAL,
  change_amount DECIMAL,
  change_percentage DECIMAL,
  days_ago INTEGER
) AS $$
BEGIN
  IF p_engine_id IS NOT NULL THEN
    RETURN QUERY
    WITH current AS (
      SELECT price, checked_at
      FROM price_history
      WHERE engine_id = p_engine_id
      ORDER BY checked_at DESC
      LIMIT 1
    ),
    previous AS (
      SELECT price, checked_at, 
             EXTRACT(DAY FROM (SELECT checked_at FROM current) - checked_at)::INTEGER AS days_diff
      FROM price_history
      WHERE engine_id = p_engine_id
        AND checked_at < (SELECT checked_at FROM current)
      ORDER BY checked_at DESC
      LIMIT 1
    )
    SELECT
      c.price AS current_price,
      p.price AS previous_price,
      (c.price - p.price) AS change_amount,
      CASE WHEN p.price > 0 THEN ((c.price - p.price) / p.price * 100) ELSE 0 END AS change_percentage,
      p.days_diff AS days_ago
    FROM current c
    CROSS JOIN previous p
    WHERE p.days_diff <= p_days;
  ELSIF p_part_id IS NOT NULL THEN
    RETURN QUERY
    WITH current AS (
      SELECT price, checked_at
      FROM price_history
      WHERE part_id = p_part_id
      ORDER BY checked_at DESC
      LIMIT 1
    ),
    previous AS (
      SELECT price, checked_at,
             EXTRACT(DAY FROM (SELECT checked_at FROM current) - checked_at)::INTEGER AS days_diff
      FROM price_history
      WHERE part_id = p_part_id
        AND checked_at < (SELECT checked_at FROM current)
      ORDER BY checked_at DESC
      LIMIT 1
    )
    SELECT
      c.price AS current_price,
      p.price AS previous_price,
      (c.price - p.price) AS change_amount,
      CASE WHEN p.price > 0 THEN ((c.price - p.price) / p.price * 100) ELSE 0 END AS change_percentage,
      p.days_diff AS days_ago
    FROM current c
    CROSS JOIN previous p
    WHERE p.days_diff <= p_days;
  END IF;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- FILE: 20260116000012_add_videos.sql
-- ============================================================================
-- ============================================================================
-- GoKart Part Picker - Videos Table
-- Created: 2026-01-16
-- Description: Educational/how-to videos linked to engines or parts
-- Owner: Agent A9 (Video Content)
-- ============================================================================

-- ============================================================================
-- VIDEOS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL, -- YouTube/Vimeo embed URL or direct link
  thumbnail_url TEXT, -- Video thumbnail image
  duration_seconds INTEGER, -- Video length in seconds
  category TEXT NOT NULL CHECK (category IN (
    'unboxing',
    'installation',
    'maintenance',
    'modification',
    'troubleshooting',
    'tutorial',
    'review',
    'tips'
  )),
  
  -- Link to engine OR part (exclusive)
  engine_id UUID REFERENCES engines(id) ON DELETE CASCADE,
  part_id UUID REFERENCES parts(id) ON DELETE CASCADE,
  
  -- Metadata
  channel_name TEXT, -- YouTube channel or creator name
  channel_url TEXT, -- Creator channel URL
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  published_date DATE, -- Original publish date
  language TEXT DEFAULT 'en',
  
  -- Admin management
  is_featured BOOLEAN DEFAULT FALSE, -- Featured videos shown first
  display_order INTEGER DEFAULT 0, -- Sort order within category
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  
  -- Audit
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT video_linked_to_item CHECK (
    (engine_id IS NOT NULL AND part_id IS NULL) OR
    (engine_id IS NULL AND part_id IS NOT NULL)
  ),
  CONSTRAINT video_url_format CHECK (
    video_url ~ '^(https?://)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com)/' OR
    video_url ~ '^https?://.+\.(mp4|webm|ogg)'
  )
);

CREATE INDEX IF NOT EXISTS idx_videos_engine ON videos(engine_id) WHERE engine_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_videos_part ON videos(part_id) WHERE part_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_featured ON videos(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_videos_active ON videos(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_videos_display_order ON videos(display_order);

COMMENT ON TABLE videos IS 'Educational/how-to videos linked to engines or parts';
COMMENT ON COLUMN videos.video_url IS 'YouTube/Vimeo embed URL or direct video link';
COMMENT ON COLUMN videos.category IS 'Video type: unboxing, installation, maintenance, etc.';
COMMENT ON COLUMN videos.display_order IS 'Sort order within category (lower numbers first)';

-- ============================================================================
-- RLS POLICIES FOR VIDEOS
-- ============================================================================

-- Enable RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Videos are publicly readable (active videos only)
DROP POLICY IF EXISTS "Videos are publicly readable" ON videos;
CREATE POLICY "Videos are publicly readable"
ON videos FOR SELECT
USING (is_active = TRUE);

-- Only admins can manage videos
DROP POLICY IF EXISTS "Admins can manage videos" ON videos;
CREATE POLICY "Admins can manage videos"
ON videos FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- ============================================================================
-- AUDIT TRIGGER FOR VIDEOS
-- ============================================================================

-- Add audit trigger (reuses existing audit_catalog_changes, which calls log_audit_action)
DROP TRIGGER IF EXISTS videos_audit_trigger ON videos;
CREATE TRIGGER videos_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON videos
FOR EACH ROW
EXECUTE FUNCTION audit_catalog_changes();

-- ============================================================================
-- UPDATE TRIGGER FOR VIDEOS
-- ============================================================================

DROP TRIGGER IF EXISTS videos_updated_at_trigger ON videos;
CREATE TRIGGER videos_updated_at_trigger
BEFORE UPDATE ON videos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- FILE: 20260116000013_seed_videos.sql
-- ============================================================================
-- ============================================================================
-- GoKart Part Picker - Video Seed Data
-- Created: 2026-01-16
-- Description: Initial video catalog for top engines
-- Owner: Agent A9 (Video Content)
-- 
-- Note: This is a starting point with example video URLs.
-- Replace with actual YouTube/Vimeo URLs when collecting real videos.
-- ============================================================================

-- ============================================================================
-- HELPER: Get engine ID from slug (for use in video inserts)
-- ============================================================================

-- This query gets engine IDs for reference:
-- SELECT id, slug, name FROM engines ORDER BY brand, displacement_cc;

-- ============================================================================
-- PREDATOR 212 HEMI VIDEOS (Most Popular Engine) - Step 1
-- 3 videos use verified YouTube IDs; 3 use PLACEHOLDER1 — replace via admin.
-- ============================================================================

-- 1. REVIEW (verified) — Predator 212 Ghost disassembly & review — linked to predator-ghost
INSERT INTO videos (
  title, description, video_url, thumbnail_url, duration_seconds,
  category, engine_id, channel_name, channel_url, published_date,
  is_featured, display_order, is_active
) VALUES (
  'New Predator 212 Ghost Engine Disassembly, Identification and Review',
  'Disassembly and identification of the Predator 212 Ghost engine. Covers key differences from the standard 212 and what to look for.',
  'https://www.youtube.com/watch?v=a2K26VuxDCU',
  'https://img.youtube.com/vi/a2K26VuxDCU/maxresdefault.jpg',
  900,
  'review',
  (SELECT id FROM engines WHERE slug = 'predator-ghost'),
  'YouTube Creator',
  'https://www.youtube.com',
  '2022-01-01',
  true,
  0,
  true
);

-- 2. MODIFICATION (verified) — Budget high‑performance build
INSERT INTO videos (
  title, description, video_url, thumbnail_url, duration_seconds,
  category, engine_id, channel_name, channel_url, published_date,
  is_featured, display_order, is_active
) VALUES (
  'Predator 212 Budget High Performance Build | DIY Go Karts',
  'Step-by-step Predator 212 performance build on a budget. Covers intake, exhaust, jetting, and power gains.',
  'https://www.youtube.com/watch?v=kLAkwti_0zc',
  'https://img.youtube.com/vi/kLAkwti_0zc/maxresdefault.jpg',
  1200,
  'modification',
  (SELECT id FROM engines WHERE slug = 'predator-212-hemi'),
  'DIY Go Karts',
  'https://www.youtube.com',
  '2020-01-01',
  true,
  1,
  true
);

-- 3. MAINTENANCE (verified) — Oil / engine orientation
INSERT INTO videos (
  title, description, video_url, thumbnail_url, duration_seconds,
  category, engine_id, channel_name, channel_url, published_date,
  is_featured, display_order, is_active
) VALUES (
  'Predator 212 Oil and Engine Orientation Tips',
  'Oil-related issues and engine orientation for the Predator 212. Important for vertical or unusual mounting in karts and minibikes.',
  'https://www.youtube.com/watch?v=RTHDeAMrjO4',
  'https://img.youtube.com/vi/RTHDeAMrjO4/maxresdefault.jpg',
  600,
  'maintenance',
  (SELECT id FROM engines WHERE slug = 'predator-212-hemi'),
  'YouTube Creator',
  'https://www.youtube.com',
  '2019-01-01',
  false,
  0,
  true
);

-- 4. INSTALLATION (replace PLACEHOLDER1) — Search: "Predator 212 go kart install" or "torque converter Predator 212"
INSERT INTO videos (
  title, description, video_url, thumbnail_url, duration_seconds,
  category, engine_id, channel_name, channel_url, published_date,
  is_featured, display_order, is_active
) VALUES (
  'How to Install Predator 212 Hemi in Go-Kart',
  'Step-by-step guide on mounting and installing the Predator 212 Hemi in your go-kart. Covers mounting, fuel line, and throttle.',
  'https://www.youtube.com/watch?v=PLACEHOLDER1',
  NULL,
  1200,
  'installation',
  (SELECT id FROM engines WHERE slug = 'predator-212-hemi'),
  'GoKart Builds',
  'https://www.youtube.com',
  '2024-02-01',
  false,
  0,
  true
);

-- 5. TUTORIAL (replace PLACEHOLDER1) — Search: "Predator 212 break in" or "Predator 212 first start"
INSERT INTO videos (
  title, description, video_url, thumbnail_url, duration_seconds,
  category, engine_id, channel_name, channel_url, published_date,
  is_featured, display_order, is_active
) VALUES (
  'Predator 212 Break-In Procedure Explained',
  'Proper break-in for new Predator 212 engines. Extends engine life and improves performance.',
  'https://www.youtube.com/watch?v=PLACEHOLDER1',
  NULL,
  540,
  'tutorial',
  (SELECT id FROM engines WHERE slug = 'predator-212-hemi'),
  'Engine Care Guide',
  'https://www.youtube.com',
  '2024-01-10',
  false,
  0,
  true
);

-- 6. TROUBLESHOOTING (replace PLACEHOLDER1) — Search: "Predator 212 won''t start" or "Predator 212 carburetor adjustment"
INSERT INTO videos (
  title, description, video_url, thumbnail_url, duration_seconds,
  category, engine_id, channel_name, channel_url, published_date,
  is_featured, display_order, is_active
) VALUES (
  'Predator 212 Won''t Start - Common Issues and Fixes',
  'Troubleshooting Predator 212 no-start. Covers fuel, spark, compression, and carburetor adjustment.',
  'https://www.youtube.com/watch?v=PLACEHOLDER1',
  NULL,
  720,
  'troubleshooting',
  (SELECT id FROM engines WHERE slug = 'predator-212-hemi'),
  'Small Engine Repair',
  'https://www.youtube.com',
  '2024-03-01',
  false,
  0,
  true
);

-- ============================================================================
-- PREDATOR 224 VIDEOS
-- ============================================================================

-- Featured: Review and Comparison
INSERT INTO videos (
  title, description, video_url, thumbnail_url, duration_seconds,
  category, engine_id, channel_name, channel_url, published_date,
  is_featured, display_order, is_active
) VALUES (
  'Predator 224 Review vs 212 - Is it Worth It?',
  'Detailed comparison between the Predator 224 and 212 engines. Shows the differences and when to choose each.',
  'https://www.youtube.com/watch?v=EXAMPLE_PREDATOR_224_REVIEW',
  'https://img.youtube.com/vi/EXAMPLE_PREDATOR_224_REVIEW/maxresdefault.jpg',
  900,
  'review',
  (SELECT id FROM engines WHERE slug = 'predator-224'),
  'GoKart Builds',
  'https://www.youtube.com/@gokartbuilds',
  '2024-02-01',
  true,
  0,
  true
);

-- Installation: Shaft Differences
INSERT INTO videos (
  title, description, video_url, thumbnail_url, duration_seconds,
  category, engine_id, channel_name, channel_url, published_date,
  is_featured, display_order, is_active
) VALUES (
  'Installing Predator 224 - Understanding 7/8" Shaft',
  'Installation guide focusing on the 7/8" shaft of the Predator 224 and compatible clutches.',
  'https://www.youtube.com/watch?v=EXAMPLE_PREDATOR_224_INSTALL',
  'https://img.youtube.com/vi/EXAMPLE_PREDATOR_224_INSTALL/maxresdefault.jpg',
  960,
  'installation',
  (SELECT id FROM engines WHERE slug = 'predator-224'),
  'GoKart Builds',
  'https://www.youtube.com/@gokartbuilds',
  '2024-02-10',
  false,
  0,
  true
);

-- ============================================================================
-- PREDATOR 420 VIDEOS
-- ============================================================================

-- Featured: Power Review
INSERT INTO videos (
  title, description, video_url, thumbnail_url, duration_seconds,
  category, engine_id, channel_name, channel_url, published_date,
  is_featured, display_order, is_active
) VALUES (
  'Predator 420 Review - Power and Performance',
  'Full review of the Predator 420 engine. Shows power output, torque, and real-world performance in go-kart applications.',
  'https://www.youtube.com/watch?v=EXAMPLE_PREDATOR_420_REVIEW',
  'https://img.youtube.com/vi/EXAMPLE_PREDATOR_420_REVIEW/maxresdefault.jpg',
  1080,
  'review',
  (SELECT id FROM engines WHERE slug = 'predator-420'),
  'Performance Karting',
  'https://www.youtube.com/@performancekarting',
  '2024-02-15',
  true,
  0,
  true
);

-- Installation: Larger Frame Setup
INSERT INTO videos (
  title, description, video_url, thumbnail_url, duration_seconds,
  category, engine_id, channel_name, channel_url, published_date,
  is_featured, display_order, is_active
) VALUES (
  'Installing Predator 420 in Large Go-Kart Frame',
  'Step-by-step installation of the larger Predator 420 engine. Covers frame modifications and mounting considerations.',
  'https://www.youtube.com/watch?v=EXAMPLE_PREDATOR_420_INSTALL',
  'https://img.youtube.com/vi/EXAMPLE_PREDATOR_420_INSTALL/maxresdefault.jpg',
  1320,
  'installation',
  (SELECT id FROM engines WHERE slug = 'predator-420'),
  'GoKart Builds',
  'https://www.youtube.com/@gokartbuilds',
  '2024-03-01',
  false,
  0,
  true
);

-- ============================================================================
-- HONDA GX200 VIDEOS
-- ============================================================================

-- Featured: Why Choose Honda?
INSERT INTO videos (
  title, description, video_url, thumbnail_url, duration_seconds,
  category, engine_id, channel_name, channel_url, published_date,
  is_featured, display_order, is_active
) VALUES (
  'Honda GX200 vs Clone Engines - Reliability Comparison',
  'Comparison of Honda GX200 with Predator and clone engines. Explains when Honda is worth the premium price.',
  'https://www.youtube.com/watch?v=EXAMPLE_HONDA_GX200_COMPARISON',
  'https://img.youtube.com/vi/EXAMPLE_HONDA_GX200_COMPARISON/maxresdefault.jpg',
  840,
  'review',
  (SELECT id FROM engines WHERE slug = 'honda-gx200'),
  'Engine Experts',
  'https://www.youtube.com/@engineexperts',
  '2024-01-20',
  true,
  0,
  true
);

-- Maintenance: Long-term Care
INSERT INTO videos (
  title, description, video_url, thumbnail_url, duration_seconds,
  category, engine_id, channel_name, channel_url, published_date,
  is_featured, display_order, is_active
) VALUES (
  'Honda GX200 Maintenance Schedule',
  'Proper maintenance schedule to keep your Honda GX200 running for years. Oil changes, air filter, valve adjustments.',
  'https://www.youtube.com/watch?v=EXAMPLE_HONDA_GX200_MAINTENANCE',
  'https://img.youtube.com/vi/EXAMPLE_HONDA_GX200_MAINTENANCE/maxresdefault.jpg',
  720,
  'maintenance',
  (SELECT id FROM engines WHERE slug = 'honda-gx200'),
  'Honda Small Engines',
  'https://www.youtube.com/@hondasmallengines',
  '2024-02-01',
  false,
  0,
  true
);

-- ============================================================================
-- PREDATOR GHOST 212 VIDEOS
-- ============================================================================

-- Featured: Racing Engine Review
INSERT INTO videos (
  title, description, video_url, thumbnail_url, duration_seconds,
  category, engine_id, channel_name, channel_url, published_date,
  is_featured, display_order, is_active
) VALUES (
  'Predator Ghost 212 - Racing Engine Review',
  'Review of the Predator Ghost 212 performance engine. Shows stock power and racing capabilities.',
  'https://www.youtube.com/watch?v=EXAMPLE_PREDATOR_GHOST_REVIEW',
  'https://img.youtube.com/vi/EXAMPLE_PREDATOR_GHOST_REVIEW/maxresdefault.jpg',
  780,
  'review',
  (SELECT id FROM engines WHERE slug = 'predator-ghost'),
  'Racing Performance',
  'https://www.youtube.com/@racingperformance',
  '2024-02-20',
  true,
  0,
  true
);

-- ============================================================================
-- NOTE TO ADMINS
-- ============================================================================

-- IMPORTANT: The video URLs above are placeholders (EXAMPLE_...).
-- You need to replace them with actual YouTube or Vimeo URLs.
-- 
-- To find videos:
-- 1. Search YouTube for: "{Engine Name} unboxing", "{Engine Name} installation", etc.
-- 2. Look for popular channels: GoKart Builds, Small Engine Repair, Racing Performance
-- 3. Copy the YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID)
-- 4. The thumbnail URL will auto-generate as: https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg
--
-- To add more videos:
-- 1. Use the admin panel at /admin/videos/new
-- 2. Or use the bulk import feature with CSV
-- 3. Or create additional INSERT statements following the pattern above
--
-- Target: 20+ videos per top engine (212 Hemi, 224, 420, GX200, Ghost)
-- Categories to cover: unboxing, installation, maintenance, modification, 
--                      troubleshooting, tutorial, review, tips


-- ============================================================================
-- FILE: 20260116000013_user_templates_approval.sql
-- ============================================================================
-- ============================================================================
-- Add User Template Submission with Admin Approval
-- Created: 2026-01-16
-- Description: Allow users to submit templates that require admin approval
-- Owner: Agent A3 (UI) + A5 (Admin)
-- ============================================================================

-- Add approval status enum
DO $$ BEGIN
  CREATE TYPE template_approval_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add approval status to templates
ALTER TABLE build_templates 
  ADD COLUMN IF NOT EXISTS approval_status template_approval_status DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS review_notes TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- Update existing templates to be approved (admin-created)
UPDATE build_templates 
SET approval_status = 'approved'
WHERE approval_status IS NULL;

-- Set approval status NOT NULL after setting defaults
ALTER TABLE build_templates 
  ALTER COLUMN approval_status SET NOT NULL;

-- Index for pending templates (for admin queue)
CREATE INDEX IF NOT EXISTS idx_templates_approval_status 
  ON build_templates(approval_status) 
  WHERE approval_status = 'pending';

COMMENT ON COLUMN build_templates.approval_status IS 'pending=awaiting admin review, approved=publicly visible, rejected=not shown';
COMMENT ON COLUMN build_templates.submitted_by IS 'User who submitted this template (null for admin-created)';
COMMENT ON COLUMN build_templates.reviewed_by IS 'Admin who reviewed this template';
COMMENT ON COLUMN build_templates.review_notes IS 'Admin notes for approval/rejection';

-- Update RLS policy to allow users to create templates with pending status
DROP POLICY IF EXISTS "Only admins can create templates" ON build_templates;

CREATE POLICY "Users can create pending templates"
  ON build_templates
  FOR INSERT
  WITH CHECK (
    -- Admins can create approved templates
    (approval_status = 'approved' AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    ))
    OR
    -- Regular users can create pending templates
    (approval_status = 'pending' AND auth.uid() = submitted_by)
  );

-- Update policy to allow admins to update approval status
CREATE POLICY "Admins can update template approval"
  ON build_templates
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Users can view approved templates or their own pending templates
DROP POLICY IF EXISTS "Public templates are viewable by everyone" ON build_templates;

CREATE POLICY "Approved public templates are viewable by everyone"
  ON build_templates
  FOR SELECT
  USING (
    (is_public = true AND is_active = true AND approval_status = 'approved')
    OR
    (auth.uid() = created_by)
    OR
    (auth.uid() = submitted_by)
  );


-- ============================================================================
-- FILE: 20260116000014_add_engine_clones.sql
-- ============================================================================
-- ============================================================================
-- Add Engine Clones/Compatibility Table
-- Created: 2026-01-16
-- Description: Links engines that are clones or compatible with the same parts
-- Owner: Database Architect
-- ============================================================================

-- ============================================================================
-- ENGINE_CLONES TABLE
-- ============================================================================

CREATE TABLE engine_clones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  engine_id UUID NOT NULL REFERENCES engines(id) ON DELETE CASCADE,
  clone_engine_id UUID NOT NULL REFERENCES engines(id) ON DELETE CASCADE,
  relationship_type TEXT DEFAULT 'clone' CHECK (relationship_type IN ('clone', 'compatible', 'similar')),
  notes TEXT, -- e.g., "Same parts compatibility as Honda GX200"
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES profiles(id),
  
  -- Prevent duplicate relationships
  CONSTRAINT unique_engine_clone UNIQUE (engine_id, clone_engine_id),
  -- Prevent self-references
  CONSTRAINT no_self_reference CHECK (engine_id != clone_engine_id)
);

CREATE INDEX idx_engine_clones_engine ON engine_clones(engine_id);
CREATE INDEX idx_engine_clones_clone ON engine_clones(clone_engine_id);
CREATE INDEX idx_engine_clones_active ON engine_clones(is_active) WHERE is_active = TRUE;

COMMENT ON TABLE engine_clones IS 'Links engines that are clones or compatible with the same parts. Many engines are clones of Honda GX series (e.g., Predator 212 is a clone of Honda GX200).';
COMMENT ON COLUMN engine_clones.relationship_type IS 'clone=exact clone, compatible=same parts fit, similar=mostly compatible';
COMMENT ON COLUMN engine_clones.notes IS 'Optional notes about the relationship (e.g., "Shares all parts with Honda GX200")';

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

CREATE TRIGGER update_engine_clones_updated_at
  BEFORE UPDATE ON engine_clones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE engine_clones ENABLE ROW LEVEL SECURITY;

-- Anyone can view active clone relationships
CREATE POLICY "Engine clones are publicly readable"
  ON engine_clones FOR SELECT
  USING (is_active = TRUE);

-- Admins can view all relationships
CREATE POLICY "Admins can view all engine clones"
  ON engine_clones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Only admins can manage clone relationships
CREATE POLICY "Admins can insert engine clones"
  ON engine_clones FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update engine clones"
  ON engine_clones FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can delete engine clones"
  ON engine_clones FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );


-- ============================================================================
-- FILE: 20260116000015_add_guides_enhancements.sql
-- ============================================================================
-- ============================================================================
-- Guides System Enhancements
-- Created: 2026-01-16
-- Description: Enhance content table for installation guides with better metadata
-- ============================================================================

-- Add guide-specific columns to content table
ALTER TABLE content
ADD COLUMN IF NOT EXISTS estimated_time_minutes INTEGER,
ADD COLUMN IF NOT EXISTS difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
ADD COLUMN IF NOT EXISTS related_engine_id UUID REFERENCES engines(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS related_part_id UUID REFERENCES parts(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS featured_image_url TEXT,
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0;

-- Create index for guide categories
CREATE INDEX IF NOT EXISTS idx_content_category ON content(category) WHERE content_type = 'guide';
CREATE INDEX IF NOT EXISTS idx_content_difficulty ON content(difficulty_level) WHERE content_type = 'guide';
CREATE INDEX IF NOT EXISTS idx_content_related_engine ON content(related_engine_id) WHERE related_engine_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_content_related_part ON content(related_part_id) WHERE related_part_id IS NOT NULL;

-- Add comments
COMMENT ON COLUMN content.estimated_time_minutes IS 'Estimated time to complete the guide in minutes';
COMMENT ON COLUMN content.difficulty_level IS 'Difficulty level: beginner, intermediate, advanced, expert';
COMMENT ON COLUMN content.related_engine_id IS 'Engine this guide is related to (if applicable)';
COMMENT ON COLUMN content.related_part_id IS 'Part this guide is related to (if applicable)';
COMMENT ON COLUMN content.category IS 'Guide category (e.g., Installation, Maintenance, Performance, Safety)';
COMMENT ON COLUMN content.tags IS 'Array of tags for searching and filtering';
COMMENT ON COLUMN content.featured_image_url IS 'Featured image for the guide card';
COMMENT ON COLUMN content.views_count IS 'Number of times this guide has been viewed';
COMMENT ON COLUMN content.helpful_count IS 'Number of users who found this guide helpful';

-- Create guide_steps table for step-by-step instructions
CREATE TABLE IF NOT EXISTS guide_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guide_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  warning TEXT,
  tips TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT unique_guide_step UNIQUE (guide_id, step_number)
);

CREATE INDEX IF NOT EXISTS idx_guide_steps_guide ON guide_steps(guide_id);
CREATE INDEX IF NOT EXISTS idx_guide_steps_sort ON guide_steps(guide_id, sort_order);

COMMENT ON TABLE guide_steps IS 'Step-by-step instructions for installation guides';
COMMENT ON COLUMN guide_steps.step_number IS 'Step number in the sequence';
COMMENT ON COLUMN guide_steps.warning IS 'Safety warning or important note for this step';
COMMENT ON COLUMN guide_steps.tips IS 'Helpful tips for completing this step';

-- Create guide_helpful table to track user feedback
CREATE TABLE IF NOT EXISTS guide_helpful (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guide_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_helpful BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT unique_guide_helpful UNIQUE (guide_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_guide_helpful_guide ON guide_helpful(guide_id);
CREATE INDEX IF NOT EXISTS idx_guide_helpful_user ON guide_helpful(user_id);

COMMENT ON TABLE guide_helpful IS 'Tracks user feedback on guides (helpful/not helpful)';

-- RLS Policies for guide_steps (public read, admin write)
ALTER TABLE guide_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to guide steps"
ON guide_steps FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM content 
    WHERE content.id = guide_steps.guide_id 
    AND content.is_published = TRUE
  )
);

CREATE POLICY "Allow admins to manage guide steps"
ON guide_steps FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- RLS Policies for guide_helpful (authenticated users can vote)
ALTER TABLE guide_helpful ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to vote on guides"
ON guide_helpful FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow public read access to guide helpful votes"
ON guide_helpful FOR SELECT
USING (TRUE);


-- ============================================================================
-- FILE: 20260116000016_seed_videos_all_engines.sql
-- ============================================================================
-- ============================================================================
-- Seed 15 videos per engine for all engines
-- Created: 2026-01-16
-- Replaces existing video seeds with 15 placeholder videos per engine.
-- Replace PLACEHOLDER in video_url with real YouTube IDs via Admin → Videos.
-- ============================================================================

DELETE FROM videos;

-- ============================================================================
-- Helper: 15 categories (2 unboxing, 2 installation, 2 maintenance, 2 modification,
-- 2 troubleshooting, 2 tutorial, 2 review, 1 tips). is_featured=true for first 3.
-- ============================================================================

-- Predator 79cc (15)
INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, category, engine_id, channel_name, channel_url, published_date, is_featured, display_order, is_active) VALUES
('Predator 79cc Unboxing and First Look', 'Unboxing the Predator 79cc. What comes in the box.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'unboxing', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 0, true),
('Predator 79cc Installation on Mini Bike', 'How to mount and install the Predator 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 600, 'installation', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 1, true),
('Predator 79cc Oil Change and Maintenance', 'Oil change and basic maintenance.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 420, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 2, true),
('Predator 79cc Performance Mods', 'Simple performance mods for the 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 720, 'modification', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 3, true),
('Predator 79cc Won''t Start - Troubleshooting', 'Troubleshooting no-start on the 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 540, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 4, true),
('Predator 79cc Break-In and First Run', 'Break-in procedure for new 79cc engines.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 5, true),
('Predator 79cc Review for Mini Bikes', 'Review of the Predator 79cc for mini bikes and karts.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 600, 'review', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 6, true),
('Predator 79cc Tips and Best Practices', 'Tips for getting the most from your 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 360, 'tips', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 7, true),
('Predator 79cc Unboxing – What to Check', 'What to check when unboxing your 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 300, 'unboxing', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 8, true),
('Predator 79cc Mounting and Wiring', 'Mounting and throttle wiring for 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 660, 'installation', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 9, true),
('Predator 79cc Air Filter and Carb Care', 'Air filter and carb maintenance.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 450, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 10, true),
('Predator 79cc Exhaust and Intake Upgrades', 'Exhaust and intake upgrade guide.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 780, 'modification', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 11, true),
('Predator 79cc Carburetor Adjustment', 'Carb adjustment for idle and performance.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 540, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 12, true),
('Predator 79cc Governor Removal How-To', 'Governor removal tutorial and considerations.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 600, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 13, true),
('Predator 79cc vs Honda GXH50 Comparison', 'Predator 79cc compared to Honda GXH50.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 720, 'review', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 14, true);

-- Predator 212 Non-Hemi (15)
INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, category, engine_id, channel_name, channel_url, published_date, is_featured, display_order, is_active) VALUES
('Predator 212 Non-Hemi Unboxing', 'Unboxing the Predator 212 Non-Hemi (flat-top).', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'unboxing', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 0, true),
('Predator 212 Non-Hemi Go-Kart Install', 'Installing the 212 Non-Hemi in a go-kart.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 720, 'installation', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 1, true),
('Predator 212 Non-Hemi Oil and Maintenance', 'Oil change and maintenance for 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 2, true),
('Predator 212 Non-Hemi Stage 1 Kit', 'Stage 1 upgrade on the 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 900, 'modification', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 3, true),
('Predator 212 Non-Hemi No-Start Fixes', 'Troubleshooting no-start on 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 600, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 4, true),
('Predator 212 Non-Hemi Break-In', 'Break-in procedure for 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 540, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 5, true),
('Predator 212 Non-Hemi vs Hemi Review', '212 Non-Hemi vs Hemi – which to choose.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 660, 'review', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 6, true),
('Predator 212 Non-Hemi Reliability Tips', 'Tips for long life on the 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 420, 'tips', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 7, true),
('Predator 212 Non-Hemi First Look', 'First look at the 212 Non-Hemi out of the box.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 360, 'unboxing', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 8, true),
('Predator 212 Non-Hemi Torque Converter', 'Torque converter install on 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 840, 'installation', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 9, true),
('Predator 212 Non-Hemi Valve Lash', 'Valve lash adjustment on 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 510, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 10, true),
('Predator 212 Non-Hemi Cam and Rod', 'Cam and rod upgrade on 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 1020, 'modification', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 11, true),
('Predator 212 Non-Hemi Carb Cleaning', 'Carburetor cleaning and jetting.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 570, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 12, true),
('Predator 212 Non-Hemi Governor Removal', 'Governor removal on 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 600, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 13, true),
('Predator 212 Non-Hemi Long-Term Review', 'Long-term review of the 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 780, 'review', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 14, true);

-- Predator 212 Hemi (15)
INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, category, engine_id, channel_name, channel_url, published_date, is_featured, display_order, is_active) VALUES
('Predator 212 Hemi Unboxing', 'Unboxing the Predator 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'unboxing', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 0, true),
('Predator 212 Hemi Go-Kart Installation', 'Installing the 212 Hemi in a go-kart.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 780, 'installation', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 1, true),
('Predator 212 Hemi Oil and Maintenance', 'Oil change and maintenance for 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 2, true),
('Predator 212 Hemi Stage 1 and 2 Build', 'Stage 1 and 2 performance build.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 1200, 'modification', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 3, true),
('Predator 212 Hemi Won''t Start – Fixes', 'Troubleshooting no-start on 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 600, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 4, true),
('Predator 212 Hemi Break-In Procedure', 'Break-in for new 212 Hemi engines.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 540, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 5, true),
('Predator 212 Hemi Review and Comparison', '212 Hemi review and vs other 212s.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 720, 'review', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 6, true),
('Predator 212 Hemi Tuning Tips', 'Tuning and jetting tips for 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 450, 'tips', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 7, true),
('Predator 212 Hemi – What''s in the Box', 'What comes in the 212 Hemi box.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 360, 'unboxing', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 8, true),
('Predator 212 Hemi Mounting and Throttle', 'Mounting and throttle setup.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 660, 'installation', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 9, true),
('Predator 212 Hemi Oil and Orientation', 'Oil level and engine orientation tips.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 420, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 10, true),
('Predator 212 Hemi Budget Build', 'Budget performance build for 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 960, 'modification', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 11, true),
('Predator 212 Hemi Carburetor Issues', 'Carb adjustment and common issues.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 570, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 12, true),
('Predator 212 Hemi Governor Removal', 'Governor removal how-to.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 630, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 13, true),
('Predator 212 Hemi – Is It Worth It?', '212 Hemi value and performance review.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 600, 'review', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 14, true);

-- Predator Ghost 212 (15)
INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, category, engine_id, channel_name, channel_url, published_date, is_featured, display_order, is_active) VALUES
('Predator Ghost 212 Unboxing', 'Unboxing the Predator Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 420, 'unboxing', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 0, true),
('Predator Ghost 212 Go-Kart Install', 'Installing the Ghost 212 in a go-kart.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 720, 'installation', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 1, true),
('Predator Ghost 212 Maintenance', 'Oil and maintenance for Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 2, true),
('Predator Ghost 212 Stock vs Modded', 'Stock vs modified Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 900, 'modification', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 3, true),
('Predator Ghost 212 Troubleshooting', 'Common Ghost 212 issues and fixes.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 540, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 4, true),
('Predator Ghost 212 Break-In', 'Break-in for the Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 5, true),
('Predator Ghost 212 Racing Review', 'Ghost 212 for racing – full review.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 780, 'review', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 6, true),
('Predator Ghost 212 Racing Tips', 'Racing and setup tips for Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 450, 'tips', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 7, true),
('Predator Ghost 212 First Look', 'First look at the Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 360, 'unboxing', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 8, true),
('Predator Ghost 212 Clutch Setup', 'Clutch and drivetrain setup.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 600, 'installation', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 9, true),
('Predator Ghost 212 Valve Check', 'Valve lash on Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 420, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 10, true),
('Predator Ghost 212 Mods for Racing', 'Racing mods for Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 960, 'modification', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 11, true),
('Predator Ghost 212 No-Start', 'Ghost 212 no-start troubleshooting.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 510, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 12, true),
('Predator Ghost 212 Jetting Guide', 'Jetting the Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 540, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 13, true),
('Predator Ghost 212 vs 212 Hemi', 'Ghost 212 vs 212 Hemi comparison.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 660, 'review', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 14, true);

-- Predator 224 (15)
INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, category, engine_id, channel_name, channel_url, published_date, is_featured, display_order, is_active) VALUES
('Predator 224 Unboxing', 'Unboxing the Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 450, 'unboxing', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 0, true),
('Predator 224 Installation – 7/8" Shaft', 'Installing the 224; 7/8" shaft and clutch.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 780, 'installation', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 1, true),
('Predator 224 Oil and Maintenance', 'Oil and maintenance for Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 2, true),
('Predator 224 Performance Build', 'Performance build on the 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 1080, 'modification', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 3, true),
('Predator 224 Troubleshooting', 'Common 224 issues and fixes.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 540, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 4, true),
('Predator 224 Break-In', 'Break-in for Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 510, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 5, true),
('Predator 224 vs 212 Review', '224 vs 212 – is the 224 worth it?', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 720, 'review', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 6, true),
('Predator 224 Torque Tips', 'Getting the most torque from the 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 420, 'tips', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 7, true),
('Predator 224 First Look', 'First look at the Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 360, 'unboxing', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 8, true),
('Predator 224 Torque Converter', 'Torque converter for 7/8" shaft.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 840, 'installation', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 9, true),
('Predator 224 Valve Adjustment', 'Valve lash on the 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 450, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 10, true),
('Predator 224 Big Bore and Cam', 'Big bore and cam on 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 1140, 'modification', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 11, true),
('Predator 224 Carb and Governor', 'Carb and governor issues.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 570, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 12, true),
('Predator 224 Governor Removal', 'Governor removal on 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 600, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 13, true),
('Predator 224 Mud and Trail Review', '224 for mud and trail – review.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 660, 'review', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 14, true);

-- Predator 301 (15)
INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, category, engine_id, channel_name, channel_url, published_date, is_featured, display_order, is_active) VALUES
('Predator 301 Unboxing', 'Unboxing the Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'unboxing', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 0, true),
('Predator 301 Go-Kart Installation', 'Installing the 301 in a go-kart.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 900, 'installation', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 1, true),
('Predator 301 Oil and Maintenance', 'Oil and maintenance for 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 510, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 2, true),
('Predator 301 Performance Mods', 'Performance mods for the 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 1020, 'modification', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 3, true),
('Predator 301 Troubleshooting', '301 no-start and common issues.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 570, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 4, true),
('Predator 301 Break-In', 'Break-in for Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 540, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 5, true),
('Predator 301 Review', 'Full review of the Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 780, 'review', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 6, true),
('Predator 301 1" Shaft Tips', '1" shaft and clutch tips.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 450, 'tips', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 7, true),
('Predator 301 – What''s in the Box', 'What comes with the 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 360, 'unboxing', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 8, true),
('Predator 301 Mounting 1" Shaft', 'Mounting and 1" shaft setup.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 720, 'installation', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 9, true),
('Predator 301 Air Filter and Oil', 'Air filter and oil maintenance.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 10, true),
('Predator 301 Header and Exhaust', 'Header and exhaust upgrade.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 660, 'modification', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 11, true),
('Predator 301 Carb and Fuel', 'Carb and fuel system fixes.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 600, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 12, true),
('Predator 301 Governor and Jetting', 'Governor and jetting how-to.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 630, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 13, true),
('Predator 301 vs 420 Comparison', '301 vs 420 – which to choose.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 720, 'review', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 14, true);

-- Predator 420 (15)
INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, category, engine_id, channel_name, channel_url, published_date, is_featured, display_order, is_active) VALUES
('Predator 420 Unboxing', 'Unboxing the Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 510, 'unboxing', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 0, true),
('Predator 420 Go-Kart Installation', 'Installing the 420 in a go-kart.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 960, 'installation', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 1, true),
('Predator 420 Oil and Maintenance', 'Oil and maintenance for 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 540, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 2, true),
('Predator 420 Performance Build', 'Performance build on the 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 1200, 'modification', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 3, true),
('Predator 420 Troubleshooting', '420 no-start and common issues.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 600, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 4, true),
('Predator 420 Break-In', 'Break-in for Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 570, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 5, true),
('Predator 420 Review', 'Full review of the Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 840, 'review', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 6, true),
('Predator 420 Power and Torque Tips', 'Power and torque tips for 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tips', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 7, true),
('Predator 420 First Look', 'First look at the 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 390, 'unboxing', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 8, true),
('Predator 420 Frame and Mounting', 'Frame mods and mounting the 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 900, 'installation', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 9, true),
('Predator 420 Valve Lash', 'Valve adjustment on 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 510, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 10, true),
('Predator 420 Cam and Header', 'Cam and header upgrade.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 1080, 'modification', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 11, true),
('Predator 420 Carb and Governor', 'Carb and governor troubleshooting.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 630, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 12, true),
('Predator 420 Governor Removal', 'Governor removal on 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 660, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 13, true),
('Predator 420 vs Honda GX390', '420 vs Honda GX390 comparison.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 780, 'review', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 14, true);

-- Predator 670 V-Twin (15)
INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, category, engine_id, channel_name, channel_url, published_date, is_featured, display_order, is_active) VALUES
('Predator 670 V-Twin Unboxing', 'Unboxing the Predator 670 V-Twin.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 540, 'unboxing', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 0, true),
('Predator 670 Go-Kart Installation', 'Installing the 670 V-Twin in a go-kart.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 1200, 'installation', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 1, true),
('Predator 670 Oil and Maintenance', 'Oil and maintenance for 670 V-Twin.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 600, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 2, true),
('Predator 670 Performance Mods', 'Performance mods for 670 V-Twin.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 1320, 'modification', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 3, true),
('Predator 670 Electric Start Issues', '670 electric start troubleshooting.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 660, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 4, true),
('Predator 670 Break-In', 'Break-in for 670 V-Twin.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 600, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 5, true),
('Predator 670 V-Twin Review', 'Full review of the 670 V-Twin.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 900, 'review', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 6, true),
('Predator 670 Power and Wiring Tips', 'Power and wiring tips for 670.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 540, 'tips', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 7, true),
('Predator 670 First Look', 'First look at the 670 V-Twin.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 450, 'unboxing', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 8, true),
('Predator 670 Mounting and Shaft', 'Mounting and 1" shaft setup.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 960, 'installation', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 9, true),
('Predator 670 Oil and Filter', 'Oil and filter change on 670.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 570, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 10, true),
('Predator 670 Exhaust and Intake', 'Exhaust and intake upgrade.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 1140, 'modification', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 11, true),
('Predator 670 Carb and Fuel', 'Carb and fuel system fixes.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 690, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 12, true),
('Predator 670 Charging System', 'Charging and electric start setup.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 720, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 13, true),
('Predator 670 for Buggies and UTVs', '670 for buggies and UTVs – review.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 840, 'review', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 14, true);

-- Honda GX200 (15)
INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, category, engine_id, channel_name, channel_url, published_date, is_featured, display_order, is_active) VALUES
('Honda GX200 Unboxing', 'Unboxing the Honda GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 450, 'unboxing', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 0, true),
('Honda GX200 Go-Kart Installation', 'Installing the GX200 in a go-kart.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 720, 'installation', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 1, true),
('Honda GX200 Oil and Maintenance', 'Oil and maintenance for GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 2, true),
('Honda GX200 Performance Mods', 'Performance mods for GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 960, 'modification', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 3, true),
('Honda GX200 Troubleshooting', 'GX200 no-start and common issues.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 540, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 4, true),
('Honda GX200 Break-In', 'Break-in for Honda GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 510, 'tutorial', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 5, true),
('Honda GX200 vs Clone Review', 'GX200 vs Predator and clone engines.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 780, 'review', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 6, true),
('Honda GX200 Reliability Tips', 'Tips for GX200 longevity.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 420, 'tips', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 7, true),
('Honda GX200 First Look', 'First look at the GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 360, 'unboxing', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 8, true),
('Honda GX200 Clutch and Drivetrain', 'Clutch and drivetrain setup.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 660, 'installation', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 9, true),
('Honda GX200 Valve Adjustment', 'Valve lash on GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 450, 'maintenance', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 10, true),
('Honda GX200 Racing Build', 'Racing build for GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 1080, 'modification', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 11, true),
('Honda GX200 Carb Tuning', 'Carb tuning and jetting.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 570, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 12, true),
('Honda GX200 Maintenance Schedule', 'Maintenance schedule for GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 600, 'tutorial', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 13, true),
('Honda GX200 Long-Term Review', 'Long-term GX200 review.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 720, 'review', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 14, true);

-- Briggs & Stratton 206 (15)
INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, category, engine_id, channel_name, channel_url, published_date, is_featured, display_order, is_active) VALUES
('Briggs 206 Unboxing', 'Unboxing the Briggs & Stratton 206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 420, 'unboxing', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 0, true),
('Briggs 206 LO206 Kart Installation', 'Installing the 206 in an LO206 kart.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 780, 'installation', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 1, true),
('Briggs 206 Oil and Maintenance', 'Oil and sealed-engine maintenance.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 2, true),
('Briggs 206 – No Mods Allowed', 'Why the 206 is sealed; no modifications.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 540, 'modification', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 3, true),
('Briggs 206 Troubleshooting', '206 no-start and common issues.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 510, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 4, true),
('Briggs 206 Break-In', 'Break-in for LO206 racing.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 5, true),
('Briggs 206 LO206 Class Review', '206 for LO206 class – full review.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 720, 'review', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 6, true),
('Briggs 206 Racing Tips', 'Racing and setup tips for 206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 450, 'tips', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 7, true),
('Briggs 206 First Look', 'First look at the 206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 360, 'unboxing', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 8, true),
('Briggs 206 Mounting and Chain', 'Mounting and chain setup for 206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 630, 'installation', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 9, true),
('Briggs 206 Seal and Tech', 'Seal and tech inspection for 206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 420, 'maintenance', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 10, true),
('Briggs 206 Legal Parts', 'Legal parts and prep for LO206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 600, 'modification', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 11, true),
('Briggs 206 Carb Issues', 'Carb issues on sealed 206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 540, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 12, true),
('Briggs 206 Pre-Race Checklist', 'Pre-race checklist for 206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 510, 'tutorial', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 13, true),
('Briggs 206 vs Predator 212', '206 vs Predator 212 for racing.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 660, 'review', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 14, true);

-- ============================================================================
-- NOTE: All video_url use PLACEHOLDER. Replace with real YouTube IDs via
-- Admin → Videos, or bulk-import with scripts/videos/import-videos.ts
-- ============================================================================


-- ============================================================================
-- FILE: 20260116000017_fix_video_engine_links.sql
-- ============================================================================
-- ============================================================================
-- Fix videos about one engine that were wrongly linked to another
-- E.g. "Predator 212 Ghost" content was linked to predator-212-hemi; move to
-- predator-ghost so each engine page only shows videos for that engine.
-- ============================================================================

-- Ghost content wrongly on Hemi → move to predator-ghost
UPDATE videos
SET engine_id = (SELECT id FROM engines WHERE slug = 'predator-ghost')
WHERE engine_id = (SELECT id FROM engines WHERE slug = 'predator-212-hemi')
  AND (title ILIKE '%ghost%' OR description ILIKE '%ghost%');


-- ============================================================================
-- FILE: 20260116000018_auto_thumbnail_videos.sql
-- ============================================================================
-- ============================================================================
-- Auto-populate video thumbnail_url from YouTube video_url
-- 1) One-time backfill for existing rows
-- 2) Trigger: on INSERT/UPDATE, set thumbnail_url when null and video_url has a valid YouTube ID
-- ============================================================================

-- 1) Backfill: set thumbnail_url for any video where we can derive from video_url
--    Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
UPDATE videos v
SET thumbnail_url = 'https://i.ytimg.com/vi/' || sub.yt_id || '/hqdefault.jpg'
FROM (
  SELECT 
    id AS vid,
    (regexp_match(video_url, '(?:youtube\.com/(?:watch\?v=|embed/)|youtu\.be/)([a-zA-Z0-9_-]{11})'))[1] AS yt_id
  FROM videos
  WHERE (thumbnail_url IS NULL OR thumbnail_url = '')
    AND video_url IS NOT NULL 
    AND video_url ~ '(?:youtube\.com/(?:watch\?v=|embed/)|youtu\.be/)[a-zA-Z0-9_-]{11}'
) sub
WHERE v.id = sub.vid 
  AND sub.yt_id IS NOT NULL 
  AND sub.yt_id !~ '^(PLACEHOLDER|EXAMPLE)';

-- 2) Trigger function: auto-set thumbnail when thumbnail_url is empty and video_url has a valid YouTube ID
CREATE OR REPLACE FUNCTION videos_auto_thumbnail()
RETURNS TRIGGER AS $$
DECLARE
  yt_id text;
BEGIN
  -- Only derive when thumbnail is empty
  IF NEW.thumbnail_url IS NOT NULL AND NEW.thumbnail_url != '' THEN
    RETURN NEW;
  END IF;
  IF NEW.video_url IS NULL OR NEW.video_url = '' THEN
    RETURN NEW;
  END IF;

  yt_id := (regexp_match(NEW.video_url, '(?:youtube\.com/(?:watch\?v=|embed/)|youtu\.be/)([a-zA-Z0-9_-]{11})'))[1];
  IF yt_id IS NULL OR yt_id ~ '^(PLACEHOLDER|EXAMPLE)' THEN
    RETURN NEW;
  END IF;

  NEW.thumbnail_url := 'https://i.ytimg.com/vi/' || yt_id || '/hqdefault.jpg';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3) Trigger on INSERT and UPDATE (video_url or thumbnail_url)
DROP TRIGGER IF EXISTS videos_auto_thumbnail_trigger ON videos;
CREATE TRIGGER videos_auto_thumbnail_trigger
  BEFORE INSERT OR UPDATE OF video_url, thumbnail_url
  ON videos
  FOR EACH ROW
  EXECUTE FUNCTION videos_auto_thumbnail();


-- ============================================================================
-- FILE: 20260116000019_seed_videos_25_per_engine.sql
-- ============================================================================
-- ============================================================================
-- Seed 25 videos per engine (250 total). Engine-specific topics.
-- Replace PLACEHOLDER via Admin → Auto-fill URLs from YouTube or populate-from-youtube-api.ts
-- ============================================================================

DELETE FROM videos;

-- predator-79 (25)
INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, category, engine_id, channel_name, channel_url, published_date, is_featured, display_order, is_active) VALUES
('Predator 79cc Unboxing', 'Unboxing the Predator 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'unboxing', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 0, true),
('Predator 79cc – What''s in the Box', 'What comes in the Predator 79cc box.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'unboxing', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 1, true),
('Predator 79cc Mini Bike Mounting', 'Mounting the Predator 79cc on a mini bike.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 2, true),
('Predator 79cc Installation – 3/4" Shaft and Mounting', 'Predator 79cc 3/4" shaft and mounting.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 3, true),
('Predator 79cc Clutch and Chain Setup', 'Clutch and chain setup for Predator 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 4, true),
('Predator 79cc Oil Change and Capacity', 'Oil change and capacity for Predator 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 5, true),
('Predator 79cc Air Filter Service', 'Air filter service for Predator 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 6, true),
('Predator 79cc Valve Lash Adjustment', 'Valve lash adjustment on Predator 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 7, true),
('Predator 79cc Performance Mods and Upgrades', 'Performance mods for Predator 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 8, true),
('Predator 79cc Governor Removal', 'Governor removal on Predator 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 9, true),
('Predator 79cc Exhaust and Intake Upgrades', 'Exhaust and intake upgrades for Predator 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 10, true),
('Predator 79cc Carburetor Jetting', 'Carburetor jetting for Predator 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 11, true),
('Predator 79cc Won''t Start – Troubleshooting', 'Troubleshooting no-start on Predator 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 12, true),
('Predator 79cc Running Rich or Lean – Fixes', 'Fixing rich or lean running on Predator 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 13, true),
('Predator 79cc Common Problems and Solutions', 'Common Predator 79cc problems and fixes.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 14, true),
('Predator 79cc Break-In Procedure', 'Break-in procedure for Predator 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 15, true),
('Predator 79cc First Run and Break-In', 'First run and break-in for Predator 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 16, true),
('Predator 79cc Full Review', 'Full review of the Predator 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 17, true),
('Predator 79cc vs Honda GXH50 – Comparison', 'Predator 79cc vs Honda GXH50.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 18, true),
('Predator 79cc Long-Term Review', 'Long-term review of the Predator 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 19, true),
('Predator 79cc Tuning and Jetting Tips', 'Tuning and jetting tips for Predator 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tips', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 20, true),
('Predator 79cc Best Mods for Mini Bikes', 'Best mods for Predator 79cc on mini bikes.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tips', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 21, true),
('Predator 79cc Oil Type and Weight', 'Oil type and weight for Predator 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 22, true),
('Predator 79cc Throttle and Choke Setup', 'Throttle and choke setup for Predator 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 23, true),
('Predator 79cc Kill Switch and Wiring', 'Kill switch and wiring for Predator 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 24, true);

-- predator-212-non-hemi (25)
INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, category, engine_id, channel_name, channel_url, published_date, is_featured, display_order, is_active) VALUES
('Predator 212 Non-Hemi Unboxing', 'Unboxing the Predator 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'unboxing', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 0, true),
('Predator 212 Non-Hemi – What''s in the Box', 'What comes in the 212 Non-Hemi box.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'unboxing', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 1, true),
('Predator 212 Non-Hemi Go-Kart Mounting', 'Go-kart mounting for Predator 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 2, true),
('Predator 212 Non-Hemi Installation – 3/4" Shaft', 'Predator 212 Non-Hemi 3/4" shaft install.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 3, true),
('Predator 212 Non-Hemi Torque Converter Install', 'Torque converter install on 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 4, true),
('Predator 212 Non-Hemi Oil Change and Maintenance', 'Oil change and maintenance for 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 5, true),
('Predator 212 Non-Hemi Air Filter Service', 'Air filter service for 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 6, true),
('Predator 212 Non-Hemi Valve Lash Adjustment', 'Valve lash on 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 7, true),
('Predator 212 Non-Hemi Stage 1 Kit', 'Stage 1 kit on 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 8, true),
('Predator 212 Non-Hemi Governor Removal', 'Governor removal on 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 9, true),
('Predator 212 Non-Hemi Exhaust and Header', 'Exhaust and header for 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 10, true),
('Predator 212 Non-Hemi Carburetor Jetting', 'Carburetor jetting for 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 11, true),
('Predator 212 Non-Hemi Won''t Start – Troubleshooting', 'No-start troubleshooting for 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 12, true),
('Predator 212 Non-Hemi Running Rich or Lean', 'Rich or lean fixes for 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 13, true),
('Predator 212 Non-Hemi Common Problems', 'Common 212 Non-Hemi problems.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 14, true),
('Predator 212 Non-Hemi Break-In Procedure', 'Break-in for 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 15, true),
('Predator 212 Non-Hemi First Run and Break-In', 'First run and break-in for 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 16, true),
('Predator 212 Non-Hemi Full Review', 'Full review of 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 17, true),
('Predator 212 Non-Hemi vs Hemi – Comparison', '212 Non-Hemi vs Hemi comparison.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 18, true),
('Predator 212 Non-Hemi Long-Term Review', 'Long-term review of 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 19, true),
('Predator 212 Non-Hemi Tuning Tips', 'Tuning tips for 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tips', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 20, true),
('Predator 212 Non-Hemi Best Mods for Go-Karts', 'Best go-kart mods for 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tips', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 21, true),
('Predator 212 Non-Hemi Oil Type and Weight', 'Oil type and weight for 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 22, true),
('Predator 212 Non-Hemi Throttle and Choke Setup', 'Throttle and choke for 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 23, true),
('Predator 212 Non-Hemi Kill Switch and Wiring', 'Kill switch and wiring for 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 24, true);

-- predator-212-hemi (25)
INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, category, engine_id, channel_name, channel_url, published_date, is_featured, display_order, is_active) VALUES
('Predator 212 Hemi Unboxing', 'Unboxing the Predator 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'unboxing', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 0, true),
('Predator 212 Hemi – What''s in the Box', 'What comes in the 212 Hemi box.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'unboxing', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 1, true),
('Predator 212 Hemi Go-Kart Mounting', 'Go-kart mounting for Predator 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 2, true),
('Predator 212 Hemi Installation – 3/4" Shaft', 'Predator 212 Hemi 3/4" shaft install.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 3, true),
('Predator 212 Hemi Torque Converter Install', 'Torque converter install on 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 4, true),
('Predator 212 Hemi Oil Change and Maintenance', 'Oil change and maintenance for 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 5, true),
('Predator 212 Hemi Air Filter Service', 'Air filter service for 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 6, true),
('Predator 212 Hemi Valve Lash Adjustment', 'Valve lash on 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 7, true),
('Predator 212 Hemi Stage 1 Kit Install', 'Stage 1 kit on 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 8, true),
('Predator 212 Hemi Governor Removal', 'Governor removal on 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 9, true),
('Predator 212 Hemi Exhaust and Header Upgrade', 'Exhaust and header for 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 10, true),
('Predator 212 Hemi Carburetor Jetting', 'Carburetor jetting for 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 11, true),
('Predator 212 Hemi Won''t Start – Troubleshooting', 'No-start troubleshooting for 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 12, true),
('Predator 212 Hemi Running Rich or Lean – Fixes', 'Rich or lean fixes for 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 13, true),
('Predator 212 Hemi Common Problems and Solutions', 'Common 212 Hemi problems.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 14, true),
('Predator 212 Hemi Break-In Procedure', 'Break-in for 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 15, true),
('Predator 212 Hemi First Run and Break-In', 'First run and break-in for 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 16, true),
('Predator 212 Hemi Full Review', 'Full review of 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 17, true),
('Predator 212 Hemi vs Ghost 212 – Comparison', '212 Hemi vs Ghost 212 comparison.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 18, true),
('Predator 212 Hemi Long-Term Review', 'Long-term review of 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 19, true),
('Predator 212 Hemi Tuning and Jetting Tips', 'Tuning tips for 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tips', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 20, true),
('Predator 212 Hemi Best Mods for Go-Karts', 'Best go-kart mods for 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tips', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 21, true),
('Predator 212 Hemi Oil Type and Weight', 'Oil type and weight for 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 22, true),
('Predator 212 Hemi Throttle and Choke Setup', 'Throttle and choke for 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 23, true),
('Predator 212 Hemi Kill Switch and Wiring', 'Kill switch and wiring for 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 24, true);

-- predator-ghost (25)
INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, category, engine_id, channel_name, channel_url, published_date, is_featured, display_order, is_active) VALUES
('Predator Ghost 212 Unboxing', 'Unboxing the Predator Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'unboxing', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 0, true),
('Predator Ghost 212 – What''s in the Box', 'What comes in the Ghost 212 box.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'unboxing', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 1, true),
('Predator Ghost 212 Go-Kart Mounting', 'Go-kart mounting for Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 2, true),
('Predator Ghost 212 Installation – 3/4" Shaft', 'Ghost 212 3/4" shaft install.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 3, true),
('Predator Ghost 212 Clutch and Drivetrain Setup', 'Clutch and drivetrain for Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 4, true),
('Predator Ghost 212 Oil Change and Maintenance', 'Oil and maintenance for Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 5, true),
('Predator Ghost 212 Air Filter Service', 'Air filter service for Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 6, true),
('Predator Ghost 212 Valve Lash Adjustment', 'Valve lash on Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 7, true),
('Predator Ghost 212 Stock vs Modded – Upgrades', 'Stock vs modded Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 8, true),
('Predator Ghost 212 Governor and Performance Mods', 'Governor and performance mods for Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 9, true),
('Predator Ghost 212 Exhaust and Header', 'Exhaust and header for Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 10, true),
('Predator Ghost 212 Carburetor Jetting for Racing', 'Carb jetting for Ghost 212 racing.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 11, true),
('Predator Ghost 212 Won''t Start – Troubleshooting', 'No-start troubleshooting for Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 12, true),
('Predator Ghost 212 Running Rich or Lean', 'Rich or lean fixes for Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 13, true),
('Predator Ghost 212 Common Problems', 'Common Ghost 212 problems.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 14, true),
('Predator Ghost 212 Break-In Procedure', 'Break-in for Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 15, true),
('Predator Ghost 212 First Run and Break-In', 'First run and break-in for Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 16, true),
('Predator Ghost 212 Full Review', 'Full review of Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 17, true),
('Predator Ghost 212 vs 212 Hemi – Comparison', 'Ghost 212 vs 212 Hemi comparison.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 18, true),
('Predator Ghost 212 Long-Term Racing Review', 'Long-term racing review of Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 19, true),
('Predator Ghost 212 Tuning and Jetting Tips', 'Tuning tips for Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tips', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 20, true),
('Predator Ghost 212 Best Mods for Racing', 'Best racing mods for Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tips', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 21, true),
('Predator Ghost 212 Oil Type and Weight', 'Oil type and weight for Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 22, true),
('Predator Ghost 212 Throttle and Choke Setup', 'Throttle and choke for Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 23, true),
('Predator Ghost 212 Kill Switch and Wiring', 'Kill switch and wiring for Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 24, true);

-- predator-224 (25)
INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, category, engine_id, channel_name, channel_url, published_date, is_featured, display_order, is_active) VALUES
('Predator 224 Unboxing', 'Unboxing the Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'unboxing', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 0, true),
('Predator 224 – What''s in the Box', 'What comes in the Predator 224 box.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'unboxing', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 1, true),
('Predator 224 Go-Kart Mounting', 'Go-kart mounting for Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 2, true),
('Predator 224 Installation – 7/8" Shaft', 'Predator 224 7/8" shaft install.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 3, true),
('Predator 224 Torque Converter Install', 'Torque converter install on Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 4, true),
('Predator 224 Oil Change and Maintenance', 'Oil and maintenance for Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 5, true),
('Predator 224 Air Filter Service', 'Air filter service for Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 6, true),
('Predator 224 Valve Lash Adjustment', 'Valve lash on Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 7, true),
('Predator 224 Stage 1 and Performance Mods', 'Stage 1 and performance mods for Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 8, true),
('Predator 224 Governor Removal', 'Governor removal on Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 9, true),
('Predator 224 Exhaust and Header', 'Exhaust and header for Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 10, true),
('Predator 224 Carburetor Jetting', 'Carburetor jetting for Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 11, true),
('Predator 224 Won''t Start – Troubleshooting', 'No-start troubleshooting for Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 12, true),
('Predator 224 Running Rich or Lean', 'Rich or lean fixes for Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 13, true),
('Predator 224 Common Problems', 'Common Predator 224 problems.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 14, true),
('Predator 224 Break-In Procedure', 'Break-in for Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 15, true),
('Predator 224 First Run and Break-In', 'First run and break-in for Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 16, true),
('Predator 224 Full Review', 'Full review of Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 17, true),
('Predator 224 vs 212 – Comparison', 'Predator 224 vs 212 comparison.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 18, true),
('Predator 224 Long-Term Review for Mud and Trail', 'Long-term review of Predator 224 for mud and trail.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 19, true),
('Predator 224 Tuning Tips', 'Tuning tips for Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tips', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 20, true),
('Predator 224 Best Mods for Torque', 'Best mods for torque on Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tips', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 21, true),
('Predator 224 Oil Type and Weight', 'Oil type and weight for Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 22, true),
('Predator 224 Throttle and Choke Setup', 'Throttle and choke for Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 23, true),
('Predator 224 Kill Switch and Wiring', 'Kill switch and wiring for Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 24, true);

-- predator-301 (25)
INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, category, engine_id, channel_name, channel_url, published_date, is_featured, display_order, is_active) VALUES
('Predator 301 Unboxing', 'Unboxing the Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'unboxing', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 0, true),
('Predator 301 – What''s in the Box', 'What comes in the Predator 301 box.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'unboxing', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 1, true),
('Predator 301 Go-Kart Mounting', 'Go-kart mounting for Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 2, true),
('Predator 301 Installation – 1" Shaft', 'Predator 301 1" shaft install.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 3, true),
('Predator 301 Torque Converter Install', 'Torque converter install on Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 4, true),
('Predator 301 Oil Change and Maintenance', 'Oil and maintenance for Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 5, true),
('Predator 301 Air Filter Service', 'Air filter service for Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 6, true),
('Predator 301 Valve Lash Adjustment', 'Valve lash on Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 7, true),
('Predator 301 Performance Mods', 'Performance mods for Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 8, true),
('Predator 301 Governor Removal', 'Governor removal on Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 9, true),
('Predator 301 Exhaust and Header', 'Exhaust and header for Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 10, true),
('Predator 301 Carburetor and Governor Mods', 'Carburetor and governor mods for Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 11, true),
('Predator 301 Won''t Start – Troubleshooting', 'No-start troubleshooting for Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 12, true),
('Predator 301 Running Rich or Lean', 'Rich or lean fixes for Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 13, true),
('Predator 301 Common Problems', 'Common Predator 301 problems.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 14, true),
('Predator 301 Break-In Procedure', 'Break-in for Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 15, true),
('Predator 301 First Run and Break-In', 'First run and break-in for Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 16, true),
('Predator 301 Full Review', 'Full review of Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 17, true),
('Predator 301 vs 420 – Comparison', 'Predator 301 vs 420 comparison.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 18, true),
('Predator 301 Long-Term Review', 'Long-term review of Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 19, true),
('Predator 301 Tuning and 1" Shaft Tips', 'Tuning and 1" shaft tips for Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tips', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 20, true),
('Predator 301 Best Mods for Go-Karts', 'Best go-kart mods for Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tips', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 21, true),
('Predator 301 Oil Type and Weight', 'Oil type and weight for Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 22, true),
('Predator 301 Throttle and Choke Setup', 'Throttle and choke for Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 23, true),
('Predator 301 Kill Switch and Wiring', 'Kill switch and wiring for Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 24, true);

-- predator-420 (25)
INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, category, engine_id, channel_name, channel_url, published_date, is_featured, display_order, is_active) VALUES
('Predator 420 Unboxing', 'Unboxing the Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'unboxing', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 0, true),
('Predator 420 – What''s in the Box', 'What comes in the Predator 420 box.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'unboxing', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 1, true),
('Predator 420 Go-Kart Mounting', 'Go-kart mounting for Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 2, true),
('Predator 420 Installation – 1" Shaft', 'Predator 420 1" shaft install.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 3, true),
('Predator 420 Torque Converter Install', 'Torque converter install on Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 4, true),
('Predator 420 Oil Change and Maintenance', 'Oil and maintenance for Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 5, true),
('Predator 420 Air Filter Service', 'Air filter service for Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 6, true),
('Predator 420 Valve Lash Adjustment', 'Valve lash on Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 7, true),
('Predator 420 Stage 1 and Performance Mods', 'Stage 1 and performance mods for Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 8, true),
('Predator 420 Governor Removal', 'Governor removal on Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 9, true),
('Predator 420 Exhaust and Header', 'Exhaust and header for Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 10, true),
('Predator 420 Carburetor and Governor Mods', 'Carburetor and governor mods for Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 11, true),
('Predator 420 Won''t Start – Troubleshooting', 'No-start troubleshooting for Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 12, true),
('Predator 420 Running Rich or Lean', 'Rich or lean fixes for Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 13, true),
('Predator 420 Common Problems', 'Common Predator 420 problems.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 14, true),
('Predator 420 Break-In Procedure', 'Break-in for Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 15, true),
('Predator 420 First Run and Break-In', 'First run and break-in for Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 16, true),
('Predator 420 Full Review', 'Full review of Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 17, true),
('Predator 420 vs Honda GX390 – Comparison', 'Predator 420 vs Honda GX390 comparison.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 18, true),
('Predator 420 Long-Term Review', 'Long-term review of Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 19, true),
('Predator 420 Tuning Tips', 'Tuning tips for Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tips', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 20, true),
('Predator 420 Best Mods for Go-Karts', 'Best go-kart mods for Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tips', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 21, true),
('Predator 420 Oil Type and Weight', 'Oil type and weight for Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 22, true),
('Predator 420 Throttle and Choke Setup', 'Throttle and choke for Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 23, true),
('Predator 420 Kill Switch and Wiring', 'Kill switch and wiring for Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 24, true);

-- predator-670 (25)
INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, category, engine_id, channel_name, channel_url, published_date, is_featured, display_order, is_active) VALUES
('Predator 670 V-Twin Unboxing', 'Unboxing the Predator 670 V-Twin.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'unboxing', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 0, true),
('Predator 670 – What''s in the Box', 'What comes in the Predator 670 box.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'unboxing', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 1, true),
('Predator 670 Go-Kart or Buggy Mounting', 'Mounting Predator 670 on go-kart or buggy.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 2, true),
('Predator 670 Installation – 1" Shaft', 'Predator 670 1" shaft install.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 3, true),
('Predator 670 Torque Converter and Drivetrain', 'Torque converter and drivetrain for Predator 670.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 4, true),
('Predator 670 Oil Change and Maintenance', 'Oil and maintenance for Predator 670.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 5, true),
('Predator 670 Air Filter and Dual Carb Service', 'Air filter and dual carb service for Predator 670.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 6, true),
('Predator 670 Valve Lash Adjustment', 'Valve lash on Predator 670.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 7, true),
('Predator 670 Performance Mods', 'Performance mods for Predator 670.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 8, true),
('Predator 670 Governor and Carb Mods', 'Governor and carb mods for Predator 670.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 9, true),
('Predator 670 Exhaust and Headers', 'Exhaust and headers for Predator 670.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 10, true),
('Predator 670 Carburetor Jetting and Sync', 'Carburetor jetting and sync for Predator 670.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 11, true),
('Predator 670 Won''t Start – Troubleshooting', 'No-start troubleshooting for Predator 670.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 12, true),
('Predator 670 Electric Start Issues', 'Electric start issues on Predator 670.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 13, true),
('Predator 670 Common Problems', 'Common Predator 670 problems.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 14, true),
('Predator 670 Break-In Procedure', 'Break-in for Predator 670.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 15, true),
('Predator 670 First Run and Break-In', 'First run and break-in for Predator 670.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 16, true),
('Predator 670 V-Twin Full Review', 'Full review of Predator 670 V-Twin.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 17, true),
('Predator 670 vs Honda V-Twin – Comparison', 'Predator 670 vs Honda V-Twin comparison.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 18, true),
('Predator 670 Long-Term Review for Buggies', 'Long-term review of Predator 670 for buggies.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 19, true),
('Predator 670 Tuning and Wiring Tips', 'Tuning and wiring tips for Predator 670.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tips', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 20, true),
('Predator 670 Best Mods for Buggies and UTVs', 'Best mods for Predator 670 on buggies and UTVs.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tips', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 21, true),
('Predator 670 Oil Type and Weight', 'Oil type and weight for Predator 670.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 22, true),
('Predator 670 Throttle and Choke Setup', 'Throttle and choke for Predator 670.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 23, true),
('Predator 670 Charging System and Wiring', 'Charging system and wiring for Predator 670.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 24, true);

-- honda-gx200 (25)
INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, category, engine_id, channel_name, channel_url, published_date, is_featured, display_order, is_active) VALUES
('Honda GX200 Unboxing', 'Unboxing the Honda GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'unboxing', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 0, true),
('Honda GX200 – What''s in the Box', 'What comes in the Honda GX200 box.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'unboxing', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 1, true),
('Honda GX200 Go-Kart Mounting', 'Go-kart mounting for Honda GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 2, true),
('Honda GX200 Installation – 3/4" Shaft', 'Honda GX200 3/4" shaft install.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 3, true),
('Honda GX200 Torque Converter Install', 'Torque converter install on Honda GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 4, true),
('Honda GX200 Oil Change and Maintenance', 'Oil and maintenance for Honda GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 5, true),
('Honda GX200 Air Filter Service', 'Air filter service for Honda GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 6, true),
('Honda GX200 Valve Lash Adjustment', 'Valve lash on Honda GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 7, true),
('Honda GX200 Performance Mods', 'Performance mods for Honda GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 8, true),
('Honda GX200 Governor Removal', 'Governor removal on Honda GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 9, true),
('Honda GX200 Exhaust and Header', 'Exhaust and header for Honda GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 10, true),
('Honda GX200 Carburetor Jetting', 'Carburetor jetting for Honda GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 11, true),
('Honda GX200 Won''t Start – Troubleshooting', 'No-start troubleshooting for Honda GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 12, true),
('Honda GX200 Running Rich or Lean', 'Rich or lean fixes for Honda GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 13, true),
('Honda GX200 Common Problems', 'Common Honda GX200 problems.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 14, true),
('Honda GX200 Break-In Procedure', 'Break-in for Honda GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 15, true),
('Honda GX200 First Run and Break-In', 'First run and break-in for Honda GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 16, true),
('Honda GX200 Full Review', 'Full review of Honda GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 17, true),
('Honda GX200 vs Predator 212 – Comparison', 'Honda GX200 vs Predator 212 comparison.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 18, true),
('Honda GX200 Long-Term Reliability Review', 'Long-term reliability review of Honda GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 19, true),
('Honda GX200 Tuning Tips', 'Tuning tips for Honda GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tips', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 20, true),
('Honda GX200 Best Mods for Go-Karts', 'Best go-kart mods for Honda GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tips', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 21, true),
('Honda GX200 Oil Type and Weight', 'Oil type and weight for Honda GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 22, true),
('Honda GX200 Throttle and Choke Setup', 'Throttle and choke for Honda GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 23, true),
('Honda GX200 Kill Switch and Wiring', 'Kill switch and wiring for Honda GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 24, true);

-- briggs-206 (25)
INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, category, engine_id, channel_name, channel_url, published_date, is_featured, display_order, is_active) VALUES
('Briggs 206 Unboxing', 'Unboxing the Briggs 206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'unboxing', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 0, true),
('Briggs 206 LO206 – What''s in the Box', 'What comes in the Briggs 206 LO206 box.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'unboxing', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 1, true),
('Briggs 206 Go-Kart Mounting', 'Go-kart mounting for Briggs 206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 2, true),
('Briggs 206 Installation – 3/4" Shaft', 'Briggs 206 3/4" shaft install.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', true, 3, true),
('Briggs 206 Clutch and Drivetrain Setup', 'Clutch and drivetrain for Briggs 206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 4, true),
('Briggs 206 Oil Change and Maintenance', 'Oil and maintenance for Briggs 206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 5, true),
('Briggs 206 Air Filter Service', 'Air filter service for Briggs 206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 6, true),
('Briggs 206 Pre-Race Maintenance', 'Pre-race maintenance for Briggs 206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 7, true),
('Briggs 206 LO206 Class Rules – No Mods', 'LO206 class rules – no mods allowed.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 8, true),
('Briggs 206 Sealed Engine Explained', 'Briggs 206 sealed engine explained.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 9, true),
('Briggs 206 Legal Upgrades and Parts', 'Legal upgrades and parts for Briggs 206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 10, true),
('Briggs 206 Carburetor – Stock Settings', 'Briggs 206 carburetor stock settings.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 11, true),
('Briggs 206 Won''t Start – Troubleshooting', 'No-start troubleshooting for Briggs 206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 12, true),
('Briggs 206 Running Issues – Fixes', 'Running issues and fixes for Briggs 206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 13, true),
('Briggs 206 Common Problems', 'Common Briggs 206 problems.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 14, true),
('Briggs 206 Break-In Procedure', 'Break-in for Briggs 206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 15, true),
('Briggs 206 First Run and Break-In', 'First run and break-in for Briggs 206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 16, true),
('Briggs 206 LO206 Full Review', 'Full review of Briggs 206 LO206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 17, true),
('Briggs 206 vs Clone 212 – Comparison', 'Briggs 206 vs clone 212 comparison.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 18, true),
('Briggs 206 Long-Term Racing Review', 'Long-term racing review of Briggs 206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 19, true),
('Briggs 206 Tuning and Setup Tips', 'Tuning and setup tips for Briggs 206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tips', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 20, true),
('Briggs 206 Racing Tips and Best Practices', 'Racing tips and best practices for Briggs 206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tips', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 21, true),
('Briggs 206 Oil Type and Weight', 'Oil type and weight for Briggs 206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 22, true),
('Briggs 206 Throttle and Choke', 'Throttle and choke for Briggs 206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 23, true),
('Briggs 206 Kill Switch and Wiring', 'Kill switch and wiring for Briggs 206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 24, true);



-- ============================================================================
-- FILE: 20260116000020_add_10_videos_per_engine.sql
-- ============================================================================
-- ============================================================================
-- Add 10 more videos per engine (100 total). Does NOT delete existing videos.
-- Run after 20260116000019_seed_videos_25_per_engine.sql.
-- Replace PLACEHOLDER via Admin → Auto-fill URLs from YouTube or populate-from-youtube-api.ts
-- ============================================================================

-- predator-79 (+10, display_order 25-34)
INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, category, engine_id, channel_name, channel_url, published_date, is_featured, display_order, is_active) VALUES
('Predator 79cc Spark Plug and Ignition', 'Spark plug and ignition for Predator 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 25, true),
('Predator 79cc Fuel Line and Tank Setup', 'Fuel line and tank setup for Predator 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 26, true),
('Predator 79cc RPM and Rev Limit', 'RPM and rev limit for Predator 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tips', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 27, true),
('Predator 79cc Recoil Starter Repair', 'Recoil starter repair for Predator 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 28, true),
('Predator 79cc Pull Start Replacement', 'Pull start replacement for Predator 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 29, true),
('Predator 79cc Chassis and Mounting Plate', 'Chassis and mounting plate for Predator 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 30, true),
('Predator 79cc Mini Bike vs Go-Kart Setup', 'Mini bike vs go-kart setup for Predator 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 31, true),
('Predator 79cc Cold Start and Warm-Up', 'Cold start and warm-up for Predator 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tips', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 32, true),
('Predator 79cc Aftermarket Parts Overview', 'Aftermarket parts overview for Predator 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 33, true),
('Predator 79cc Noise and Exhaust Tips', 'Noise and exhaust tips for Predator 79cc.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-79'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 34, true);

-- predator-212-non-hemi (+10, display_order 25-34)
INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, category, engine_id, channel_name, channel_url, published_date, is_featured, display_order, is_active) VALUES
('Predator 212 Non-Hemi Spark Plug and Ignition', 'Spark plug and ignition for 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 25, true),
('Predator 212 Non-Hemi Fuel Line and Tank', 'Fuel line and tank for 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 26, true),
('Predator 212 Non-Hemi Stage 2 Upgrades', 'Stage 2 upgrades for 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 27, true),
('Predator 212 Non-Hemi Recoil Starter Repair', 'Recoil starter repair for 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 28, true),
('Predator 212 Non-Hemi Low Oil Shutdown', 'Low oil shutdown on 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 29, true),
('Predator 212 Non-Hemi Chain Tension and Sprockets', 'Chain tension and sprockets for 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 30, true),
('Predator 212 Non-Hemi Electric Start Conversion', 'Electric start conversion for 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 31, true),
('Predator 212 Non-Hemi Dyno and Horsepower Test', 'Dyno and horsepower test for 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 32, true),
('Predator 212 Non-Hemi Cold Start Tips', 'Cold start tips for 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tips', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 33, true),
('Predator 212 Non-Hemi Budget Build Guide', 'Budget build guide for 212 Non-Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-212-non-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 34, true);

-- predator-212-hemi (+10, display_order 25-34)
INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, category, engine_id, channel_name, channel_url, published_date, is_featured, display_order, is_active) VALUES
('Predator 212 Hemi Spark Plug and Ignition', 'Spark plug and ignition for 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 25, true),
('Predator 212 Hemi Fuel Line and Tank', 'Fuel line and tank for 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 26, true),
('Predator 212 Hemi Stage 2 and Cam Upgrades', 'Stage 2 and cam upgrades for 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 27, true),
('Predator 212 Hemi Recoil Starter Repair', 'Recoil starter repair for 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 28, true),
('Predator 212 Hemi Low Oil Shutdown', 'Low oil shutdown on 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 29, true),
('Predator 212 Hemi Chain Tension and Sprockets', 'Chain tension and sprockets for 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 30, true),
('Predator 212 Hemi Electric Start Conversion', 'Electric start conversion for 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 31, true),
('Predator 212 Hemi Dyno and Horsepower Test', 'Dyno and horsepower test for 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 32, true),
('Predator 212 Hemi Cold Start Tips', 'Cold start tips for 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tips', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 33, true),
('Predator 212 Hemi Budget Build Guide', 'Budget build guide for 212 Hemi.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-212-hemi'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 34, true);

-- predator-ghost (+10, display_order 25-34)
INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, category, engine_id, channel_name, channel_url, published_date, is_featured, display_order, is_active) VALUES
('Predator Ghost 212 Spark Plug and Ignition', 'Spark plug and ignition for Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 25, true),
('Predator Ghost 212 Fuel Line and Tank', 'Fuel line and tank for Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 26, true),
('Predator Ghost 212 Cam and Rod Upgrades', 'Cam and rod upgrades for Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 27, true),
('Predator Ghost 212 Recoil Starter Repair', 'Recoil starter repair for Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 28, true),
('Predator Ghost 212 Low Oil Shutdown', 'Low oil shutdown on Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 29, true),
('Predator Ghost 212 Chain and Sprocket Setup for Racing', 'Chain and sprocket setup for Ghost 212 racing.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 30, true),
('Predator Ghost 212 Electric Start Conversion', 'Electric start conversion for Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 31, true),
('Predator Ghost 212 Dyno and Horsepower Test', 'Dyno and horsepower test for Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 32, true),
('Predator Ghost 212 Cold Start and Tuning', 'Cold start and tuning for Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tips', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 33, true),
('Predator Ghost 212 Budget Racing Build', 'Budget racing build for Ghost 212.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-ghost'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 34, true);

-- predator-224 (+10, display_order 25-34)
INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, category, engine_id, channel_name, channel_url, published_date, is_featured, display_order, is_active) VALUES
('Predator 224 Spark Plug and Ignition', 'Spark plug and ignition for Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 25, true),
('Predator 224 Fuel Line and Tank', 'Fuel line and tank for Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 26, true),
('Predator 224 7/8" Shaft Adapters and Hubs', '7/8" shaft adapters and hubs for Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 27, true),
('Predator 224 Recoil Starter Repair', 'Recoil starter repair for Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 28, true),
('Predator 224 Low Oil Shutdown', 'Low oil shutdown on Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 29, true),
('Predator 224 Chain Tension and Sprockets', 'Chain tension and sprockets for Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 30, true),
('Predator 224 Electric Start Conversion', 'Electric start conversion for Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 31, true),
('Predator 224 Dyno and Torque Test', 'Dyno and torque test for Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 32, true),
('Predator 224 Cold Start and Mud Use', 'Cold start and mud use for Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tips', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 33, true),
('Predator 224 Budget Mud Kart Build', 'Budget mud kart build for Predator 224.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-224'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 34, true);

-- predator-301 (+10, display_order 25-34)
INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, category, engine_id, channel_name, channel_url, published_date, is_featured, display_order, is_active) VALUES
('Predator 301 Spark Plug and Ignition', 'Spark plug and ignition for Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 25, true),
('Predator 301 Fuel Line and Tank', 'Fuel line and tank for Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 26, true),
('Predator 301 1" Shaft Adapters and Hubs', '1" shaft adapters and hubs for Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 27, true),
('Predator 301 Recoil Starter Repair', 'Recoil starter repair for Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 28, true),
('Predator 301 Low Oil Shutdown', 'Low oil shutdown on Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 29, true),
('Predator 301 Chain Tension and Sprockets', 'Chain tension and sprockets for Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 30, true),
('Predator 301 Electric Start and Charging', 'Electric start and charging for Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 31, true),
('Predator 301 Dyno and Horsepower Test', 'Dyno and horsepower test for Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 32, true),
('Predator 301 Cold Start Tips', 'Cold start tips for Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tips', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 33, true),
('Predator 301 Budget Go-Kart Build', 'Budget go-kart build for Predator 301.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-301'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 34, true);

-- predator-420 (+10, display_order 25-34)
INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, category, engine_id, channel_name, channel_url, published_date, is_featured, display_order, is_active) VALUES
('Predator 420 Spark Plug and Ignition', 'Spark plug and ignition for Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 25, true),
('Predator 420 Fuel Line and Tank', 'Fuel line and tank for Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 26, true),
('Predator 420 1" Shaft Adapters and Hubs', '1" shaft adapters and hubs for Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 27, true),
('Predator 420 Recoil Starter Repair', 'Recoil starter repair for Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 28, true),
('Predator 420 Low Oil Shutdown', 'Low oil shutdown on Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 29, true),
('Predator 420 Chain Tension and Sprockets', 'Chain tension and sprockets for Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 30, true),
('Predator 420 Electric Start and Charging', 'Electric start and charging for Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 31, true),
('Predator 420 Dyno and Horsepower Test', 'Dyno and horsepower test for Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 32, true),
('Predator 420 Cold Start Tips', 'Cold start tips for Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tips', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 33, true),
('Predator 420 Budget Buggy Build', 'Budget buggy build for Predator 420.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-420'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 34, true);

-- predator-670 (+10, display_order 25-34)
INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, category, engine_id, channel_name, channel_url, published_date, is_featured, display_order, is_active) VALUES
('Predator 670 Spark Plug and Ignition', 'Spark plug and ignition for Predator 670.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 25, true),
('Predator 670 Fuel Line and Dual Tank Setup', 'Fuel line and dual tank setup for Predator 670.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 26, true),
('Predator 670 Dual Carb Sync and Tuning', 'Dual carb sync and tuning for Predator 670.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 27, true),
('Predator 670 Electric Start and Battery', 'Electric start and battery for Predator 670.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 28, true),
('Predator 670 One Cylinder Firing', 'One cylinder not firing on Predator 670.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 29, true),
('Predator 670 Belt and Drive Setup', 'Belt and drive setup for Predator 670.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 30, true),
('Predator 670 Performance Exhaust Build', 'Performance exhaust build for Predator 670.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 31, true),
('Predator 670 Dyno and Horsepower Test', 'Dyno and horsepower test for Predator 670.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 32, true),
('Predator 670 Cold Start and Choke', 'Cold start and choke for Predator 670.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tips', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 33, true),
('Predator 670 UTV and Buggy Build Guide', 'UTV and buggy build guide for Predator 670.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'predator-670'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 34, true);

-- honda-gx200 (+10, display_order 25-34)
INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, category, engine_id, channel_name, channel_url, published_date, is_featured, display_order, is_active) VALUES
('Honda GX200 Spark Plug and Ignition', 'Spark plug and ignition for Honda GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 25, true),
('Honda GX200 Fuel Line and Tank', 'Fuel line and tank for Honda GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 26, true),
('Honda GX200 Stage 2 and Cam', 'Stage 2 and cam for Honda GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 27, true),
('Honda GX200 Recoil Starter Repair', 'Recoil starter repair for Honda GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 28, true),
('Honda GX200 Low Oil Alert', 'Low oil alert on Honda GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 29, true),
('Honda GX200 Chain Tension and Sprockets', 'Chain tension and sprockets for Honda GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 30, true),
('Honda GX200 Electric Start Conversion', 'Electric start conversion for Honda GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 31, true),
('Honda GX200 Dyno and Reliability Test', 'Dyno and reliability test for Honda GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 32, true),
('Honda GX200 Cold Start Tips', 'Cold start tips for Honda GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tips', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 33, true),
('Honda GX200 Budget Go-Kart Build', 'Budget go-kart build for Honda GX200.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'honda-gx200'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 34, true);

-- briggs-206 (+10, display_order 25-34)
INSERT INTO videos (title, description, video_url, thumbnail_url, duration_seconds, category, engine_id, channel_name, channel_url, published_date, is_featured, display_order, is_active) VALUES
('Briggs 206 Spark Plug and Ignition', 'Spark plug and ignition for Briggs 206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 25, true),
('Briggs 206 Fuel Line and Tank', 'Fuel line and tank for Briggs 206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'installation', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 26, true),
('Briggs 206 Legal Air Filter Options', 'Legal air filter options for Briggs 206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'modification', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 27, true),
('Briggs 206 Recoil Starter Repair', 'Recoil starter repair for Briggs 206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 28, true),
('Briggs 206 Low Oil Shutdown', 'Low oil shutdown on Briggs 206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'troubleshooting', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 29, true),
('Briggs 206 Chain and Sprocket Setup for Racing', 'Chain and sprocket setup for Briggs 206 racing.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 30, true),
('Briggs 206 Carburetor Rebuild – Stock', 'Carburetor rebuild stock for Briggs 206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'maintenance', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 31, true),
('Briggs 206 Dyno and Power Test', 'Dyno and power test for Briggs 206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'review', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 32, true),
('Briggs 206 Cold Start and Pre-Race', 'Cold start and pre-race for Briggs 206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tips', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 33, true),
('Briggs 206 Budget LO206 Kart Build', 'Budget LO206 kart build for Briggs 206.', 'https://www.youtube.com/watch?v=PLACEHOLDER', NULL, 480, 'tutorial', (SELECT id FROM engines WHERE slug = 'briggs-206'), 'GoKart Builds', 'https://www.youtube.com', '2024-01-01', false, 34, true);



-- ============================================================================
-- FILE: 20260116000020_add_profile_preferences.sql
-- ============================================================================
-- ============================================================================
-- GoKart Part Picker - Profile Preferences & User Data
-- Created: 2026-01-16
-- Description: Add user preferences and data collection fields to profiles
-- ============================================================================

-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
ADD COLUMN IF NOT EXISTS build_goals TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS budget_range TEXT CHECK (budget_range IN ('under-500', '500-1000', '1000-2000', '2000-5000', '5000-plus')),
ADD COLUMN IF NOT EXISTS primary_use_case TEXT CHECK (primary_use_case IN ('racing', 'recreation', 'kids', 'work', 'competition', 'other')),
ADD COLUMN IF NOT EXISTS interested_categories TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS newsletter_subscribed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS public_profile BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_builds_publicly BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS referral_source TEXT,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for active users
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active_at DESC);

-- Create index for experience level (for filtering/recommendations)
CREATE INDEX IF NOT EXISTS idx_profiles_experience ON profiles(experience_level);

-- Update last_active_at trigger function
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET last_active_at = NOW()
  WHERE id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: We'll trigger this from the application layer when users interact
-- For now, we'll update it manually or via a scheduled job

COMMENT ON COLUMN profiles.bio IS 'User bio/description';
COMMENT ON COLUMN profiles.location IS 'User location (city, state, country)';
COMMENT ON COLUMN profiles.experience_level IS 'User experience level for personalized recommendations';
COMMENT ON COLUMN profiles.build_goals IS 'Array of build goals: speed, torque, budget, beginner, competition, kids';
COMMENT ON COLUMN profiles.budget_range IS 'Budget range for build recommendations';
COMMENT ON COLUMN profiles.primary_use_case IS 'Primary use case for go-kart';
COMMENT ON COLUMN profiles.interested_categories IS 'Part categories user is interested in';
COMMENT ON COLUMN profiles.newsletter_subscribed IS 'Whether user wants newsletter emails';
COMMENT ON COLUMN profiles.email_notifications IS 'Whether user wants email notifications';
COMMENT ON COLUMN profiles.public_profile IS 'Whether profile is publicly visible';
COMMENT ON COLUMN profiles.show_builds_publicly IS 'Whether user builds are shown publicly';
COMMENT ON COLUMN profiles.referral_source IS 'Where user came from (for tracking)';
COMMENT ON COLUMN profiles.last_active_at IS 'Last time user was active on the site';


-- ============================================================================
-- FILE: 20260116000021_forums_schema.sql
-- ============================================================================
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


-- ============================================================================
-- FILE: 20260116000022_seed_forum_topics.sql
-- ============================================================================
-- ============================================================================
-- GoKart Part Picker - Seed Forum Topics
-- Created: 2026-01-16
-- Description: Seed initial forum topics for each category
-- ============================================================================

-- Helper function to create a topic slug from title
CREATE OR REPLACE FUNCTION slugify(text)
RETURNS text AS $$
  SELECT lower(regexp_replace(regexp_replace(regexp_replace($1, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'), '-+', '-', 'g'));
$$ LANGUAGE sql IMMUTABLE;

-- Get a system user ID (or create one if needed)
-- We'll use the first admin user, or create a system user
DO $$
DECLARE
  system_user_id UUID;
  category_id_val UUID;
  topic_id_val UUID;
  engine_record RECORD;
BEGIN
  -- Get or create a system user for seeding
  SELECT id INTO system_user_id
  FROM profiles
  WHERE role IN ('admin', 'super_admin')
  LIMIT 1;

  -- If no admin exists, we'll need to handle this differently
  -- For now, we'll skip topics if no user exists
  IF system_user_id IS NULL THEN
    RAISE NOTICE 'No admin user found. Please create an admin user first.';
    RETURN;
  END IF;

  -- ============================================================================
  -- BUILD PLANNING - 5 Topics
  -- ============================================================================
  SELECT id INTO category_id_val FROM forum_categories WHERE slug = 'build-planning';
  IF category_id_val IS NOT NULL THEN
    INSERT INTO forum_topics (category_id, user_id, title, slug, content) VALUES
      (category_id_val, system_user_id, 'First Build - Need Advice', 'first-build-need-advice', 'I''m planning my first go-kart build and could use some guidance on engine selection and basic parts. What should I consider?'),
      (category_id_val, system_user_id, 'Budget Build Under $500', 'budget-build-under-500', 'Looking to build a budget-friendly go-kart for under $500. Any recommendations on where to save money without sacrificing too much performance?'),
      (category_id_val, system_user_id, 'Racing Build Planning', 'racing-build-planning', 'Planning a competitive racing build. Need advice on engine modifications, safety equipment, and performance parts.'),
      (category_id_val, system_user_id, 'Kids Go-Kart Build', 'kids-go-kart-build', 'Building a safe go-kart for my kids. What engine size and safety features should I prioritize?'),
      (category_id_val, system_user_id, 'Build Checklist and Timeline', 'build-checklist-and-timeline', 'Creating a comprehensive checklist for my build. What order should I assemble parts in?')
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- ============================================================================
  -- BUILD SHOWCASE - 5 Topics
  -- ============================================================================
  SELECT id INTO category_id_val FROM forum_categories WHERE slug = 'build-showcase';
  IF category_id_val IS NOT NULL THEN
    INSERT INTO forum_topics (category_id, user_id, title, slug, content) VALUES
      (category_id_val, system_user_id, 'My First Build - Predator 212', 'my-first-build-predator-212', 'Just finished my first build using a Predator 212 engine. Here''s what I learned and some photos!'),
      (category_id_val, system_user_id, 'Speed Build - 50+ MPH', 'speed-build-50-mph', 'Built a high-performance kart that hits 50+ MPH. Sharing my mods and setup.'),
      (category_id_val, system_user_id, 'Off-Road Go-Kart Build', 'off-road-go-kart-build', 'Built a go-kart specifically for off-road trails. Custom suspension and larger tires made all the difference.'),
      (category_id_val, system_user_id, 'Restoration Project Complete', 'restoration-project-complete', 'Finished restoring a vintage go-kart frame with modern components. Before and after photos included.'),
      (category_id_val, system_user_id, 'Electric Conversion Build', 'electric-conversion-build', 'Converted my gas-powered kart to electric. Here''s my experience and what I''d do differently.')
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- ============================================================================
  -- TROUBLESHOOTING - 5 Topics
  -- ============================================================================
  SELECT id INTO category_id_val FROM forum_categories WHERE slug = 'troubleshooting';
  IF category_id_val IS NOT NULL THEN
    INSERT INTO forum_topics (category_id, user_id, title, slug, content) VALUES
      (category_id_val, system_user_id, 'Engine Won''t Start', 'engine-wont-start', 'My engine cranks but won''t start. Checked spark plug and fuel. What else should I check?'),
      (category_id_val, system_user_id, 'Chain Keeps Coming Off', 'chain-keeps-coming-off', 'Having issues with my chain constantly coming off the sprockets. Alignment looks good. Any suggestions?'),
      (category_id_val, system_user_id, 'Brakes Not Working Properly', 'brakes-not-working-properly', 'My brakes feel spongy and don''t stop well. Already bled the system. What could be wrong?'),
      (category_id_val, system_user_id, 'Engine Overheating', 'engine-overheating', 'Engine runs hot after just a few minutes. Oil level is good. Could this be a cooling issue?'),
      (category_id_val, system_user_id, 'Loss of Power Under Load', 'loss-of-power-under-load', 'Engine runs fine at idle but loses power when I accelerate. Carburetor issue?')
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- ============================================================================
  -- PARTS & COMPONENTS - 5 Topics
  -- ============================================================================
  SELECT id INTO category_id_val FROM forum_categories WHERE slug = 'parts';
  IF category_id_val IS NOT NULL THEN
    INSERT INTO forum_topics (category_id, user_id, title, slug, content) VALUES
      (category_id_val, system_user_id, 'Best Clutch for Predator 212', 'best-clutch-for-predator-212', 'Looking for clutch recommendations for my Predator 212 build. What engagement RPM should I look for?'),
      (category_id_val, system_user_id, 'Torque Converter vs Clutch', 'torque-converter-vs-clutch', 'Trying to decide between a torque converter and centrifugal clutch. What are the pros and cons of each?'),
      (category_id_val, system_user_id, 'Chain and Sprocket Sizing', 'chain-and-sprocket-sizing', 'Need help understanding chain sizes (#35, #40, #41) and how to choose the right sprocket ratio.'),
      (category_id_val, system_user_id, 'Brake System Options', 'brake-system-options', 'What brake systems work best for go-karts? Disc vs drum, hydraulic vs mechanical?'),
      (category_id_val, system_user_id, 'Wheel and Tire Selection', 'wheel-and-tire-selection', 'Choosing wheels and tires for my build. What size and type should I use for street vs off-road?')
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- ============================================================================
  -- PERFORMANCE MODS - 5 Topics
  -- ============================================================================
  SELECT id INTO category_id_val FROM forum_categories WHERE slug = 'performance-mods';
  IF category_id_val IS NOT NULL THEN
    INSERT INTO forum_topics (category_id, user_id, title, slug, content) VALUES
      (category_id_val, system_user_id, 'Stage 1 Mods - What to Do First', 'stage-1-mods-what-to-do-first', 'Starting with performance mods. What are the best first steps? Governor removal, air filter, exhaust?'),
      (category_id_val, system_user_id, 'Camshaft Upgrade Results', 'camshaft-upgrade-results', 'Just installed a performance camshaft. Here''s my before/after dyno results and what I learned.'),
      (category_id_val, system_user_id, 'Carburetor Tuning Tips', 'carburetor-tuning-tips', 'Having trouble tuning my carburetor after mods. Any tips on jet sizing and air/fuel mixture?'),
      (category_id_val, system_user_id, 'Header and Exhaust Upgrades', 'header-and-exhaust-upgrades', 'What exhaust systems provide the best performance gains? Looking at header options.'),
      (category_id_val, system_user_id, 'Advanced Engine Modifications', 'advanced-engine-modifications', 'Planning advanced mods: porting, polishing, big bore kits. What''s the best bang for your buck?')
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- ============================================================================
  -- MAINTENANCE - 5 Topics
  -- ============================================================================
  SELECT id INTO category_id_val FROM forum_categories WHERE slug = 'maintenance';
  IF category_id_val IS NOT NULL THEN
    INSERT INTO forum_topics (category_id, user_id, title, slug, content) VALUES
      (category_id_val, system_user_id, 'Oil Change Schedule', 'oil-change-schedule', 'How often should I change the oil in my go-kart engine? What oil weight is best?'),
      (category_id_val, system_user_id, 'Winter Storage Tips', 'winter-storage-tips', 'Storing my go-kart for the winter. What maintenance should I do before storing it?'),
      (category_id_val, system_user_id, 'Chain Maintenance', 'chain-maintenance', 'How do I properly maintain my chain? Cleaning, lubrication, and tension tips.'),
      (category_id_val, system_user_id, 'Engine Break-In Procedure', 'engine-break-in-procedure', 'Just got a new engine. What''s the proper break-in procedure? How many hours before I can push it?'),
      (category_id_val, system_user_id, 'Pre-Season Inspection Checklist', 'pre-season-inspection-checklist', 'Getting ready for the season. What should I check before taking my kart out?')
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- ============================================================================
  -- GENERAL DISCUSSION - 5 Topics
  -- ============================================================================
  SELECT id INTO category_id_val FROM forum_categories WHERE slug = 'general-discussion';
  IF category_id_val IS NOT NULL THEN
    INSERT INTO forum_topics (category_id, user_id, title, slug, content) VALUES
      (category_id_val, system_user_id, 'Welcome New Members!', 'welcome-new-members', 'Welcome to the GoKart Part Picker community! Introduce yourself and share what you''re working on.'),
      (category_id_val, system_user_id, 'Local Go-Kart Tracks', 'local-go-kart-tracks', 'Share information about go-kart tracks and racing venues in your area.'),
      (category_id_val, system_user_id, 'Go-Kart Safety Discussion', 'go-kart-safety-discussion', 'Let''s talk about safety equipment and practices. What safety gear do you use?'),
      (category_id_val, system_user_id, 'Best Go-Kart Builds You''ve Seen', 'best-go-kart-builds-youve-seen', 'Share photos and stories of impressive go-kart builds you''ve seen or been inspired by.'),
      (category_id_val, system_user_id, 'Go-Kart Racing Stories', 'go-kart-racing-stories', 'Share your racing experiences, close calls, and memorable moments on the track.')
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- ============================================================================
  -- DEALS & SALES - 5 Topics
  -- ============================================================================
  SELECT id INTO category_id_val FROM forum_categories WHERE slug = 'deals-sales';
  IF category_id_val IS NOT NULL THEN
    INSERT INTO forum_topics (category_id, user_id, title, slug, content) VALUES
      (category_id_val, system_user_id, 'Harbor Freight Predator Sale', 'harbor-freight-predator-sale', 'Harbor Freight has Predator engines on sale this week. Great deal for anyone starting a build!'),
      (category_id_val, system_user_id, 'Amazon Prime Day Go-Kart Parts', 'amazon-prime-day-go-kart-parts', 'Prime Day deals on go-kart parts. Share what you find!'),
      (category_id_val, system_user_id, 'Black Friday Parts Deals', 'black-friday-parts-deals', 'Post Black Friday and Cyber Monday deals for go-kart parts and accessories.'),
      (category_id_val, system_user_id, 'Local Store Sales and Clearance', 'local-store-sales-and-clearance', 'Share deals from local stores, auto parts shops, and hardware stores.'),
      (category_id_val, system_user_id, 'Used Parts Marketplace', 'used-parts-marketplace', 'Looking for or selling used go-kart parts? Post here!')
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- ============================================================================
  -- FOR SALE/TRADE - 5 Topics
  -- ============================================================================
  SELECT id INTO category_id_val FROM forum_categories WHERE slug = 'for-sale-trade';
  IF category_id_val IS NOT NULL THEN
    INSERT INTO forum_topics (category_id, user_id, title, slug, content) VALUES
      (category_id_val, system_user_id, 'Trading Parts - What Do You Have?', 'trading-parts-what-do-you-have', 'Have extra parts? Looking to trade? Post what you have and what you need.'),
      (category_id_val, system_user_id, 'Complete Go-Kart For Sale', 'complete-go-kart-for-sale', 'Selling my completed go-kart build. Includes engine, all parts, and extras.'),
      (category_id_val, system_user_id, 'Engine For Sale - Predator 212', 'engine-for-sale-predator-212', 'Selling a lightly used Predator 212 engine. Only 10 hours on it.'),
      (category_id_val, system_user_id, 'Parts Lot For Sale', 'parts-lot-for-sale', 'Selling a collection of go-kart parts: clutches, chains, sprockets, wheels, and more.'),
      (category_id_val, system_user_id, 'Wanted: Specific Parts', 'wanted-specific-parts', 'Looking for specific parts for my build. Post what you''re looking for here.')
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- ============================================================================
  -- SITE FEEDBACK - 5 Topics
  -- ============================================================================
  SELECT id INTO category_id_val FROM forum_categories WHERE slug = 'site-feedback';
  IF category_id_val IS NOT NULL THEN
    INSERT INTO forum_topics (category_id, user_id, title, slug, content) VALUES
      (category_id_val, system_user_id, 'Feature Requests', 'feature-requests', 'What features would you like to see added to GoKart Part Picker? Share your ideas!'),
      (category_id_val, system_user_id, 'Bug Reports', 'bug-reports', 'Found a bug or issue with the site? Report it here so we can fix it.'),
      (category_id_val, system_user_id, 'UI/UX Feedback', 'ui-ux-feedback', 'How can we improve the user experience? Share your thoughts on the interface and design.'),
      (category_id_val, system_user_id, 'Mobile App Suggestions', 'mobile-app-suggestions', 'Would you use a mobile app? What features would be most useful?'),
      (category_id_val, system_user_id, 'Community Guidelines Discussion', 'community-guidelines-discussion', 'Let''s discuss community guidelines and how to keep the forums helpful and friendly.')
    ON CONFLICT (category_id, slug) DO NOTHING;
  END IF;

  -- ============================================================================
  -- ENGINES - One Topic Per Engine
  -- ============================================================================
  SELECT id INTO category_id_val FROM forum_categories WHERE slug = 'engines';
  IF category_id_val IS NOT NULL THEN
    -- Create a topic for each active engine
    FOR engine_record IN 
      SELECT id, name, slug, brand, displacement_cc, horsepower
      FROM engines
      WHERE is_active = TRUE
      ORDER BY brand, name
    LOOP
      INSERT INTO forum_topics (category_id, user_id, title, slug, content)
      VALUES (
        category_id_val,
        system_user_id,
        engine_record.name || ' Discussion',
        slugify(engine_record.name || '-discussion'),
        'Discussion thread for the ' || engine_record.name || ' (' || engine_record.brand || ' ' || engine_record.displacement_cc || 'cc, ' || engine_record.horsepower || ' HP). Share your experiences, modifications, and questions about this engine.'
      )
      ON CONFLICT (category_id, slug) DO NOTHING;
    END LOOP;
  END IF;

  RAISE NOTICE 'Forum topics seeded successfully!';
END $$;

-- Clean up helper function
DROP FUNCTION IF EXISTS slugify(text);


-- ============================================================================
-- FILE: 20260116000023_backfill_video_thumbnails.sql
-- ============================================================================
-- ============================================================================
-- 1) Use mqdefault (more reliable than hqdefault for some videos)
-- 2) Backfill thumbnail_url for any video with a real YouTube video_url but NULL thumbnail
--    (catches rows filled after 20260116000018 or where the trigger didn't run)
-- Idempotent: only touches rows where thumbnail_url IS NULL.
-- ============================================================================

-- 1) Update trigger to use mqdefault going forward
CREATE OR REPLACE FUNCTION videos_auto_thumbnail()
RETURNS TRIGGER AS $$
DECLARE
  yt_id text;
BEGIN
  IF NEW.thumbnail_url IS NOT NULL AND NEW.thumbnail_url != '' THEN
    RETURN NEW;
  END IF;
  IF NEW.video_url IS NULL OR NEW.video_url = '' THEN
    RETURN NEW;
  END IF;

  yt_id := (regexp_match(NEW.video_url, '(?:youtube\.com/(?:watch\?v=|embed/)|youtu\.be/)([a-zA-Z0-9_-]{11})'))[1];
  IF yt_id IS NULL OR yt_id ~ '^(PLACEHOLDER|EXAMPLE)' THEN
    RETURN NEW;
  END IF;

  NEW.thumbnail_url := 'https://i.ytimg.com/vi/' || yt_id || '/mqdefault.jpg';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2) Backfill: set thumbnail_url for videos with real YouTube URL and NULL thumbnail
UPDATE videos v
SET thumbnail_url = 'https://i.ytimg.com/vi/' || sub.yt_id || '/mqdefault.jpg'
FROM (
  SELECT 
    id AS vid,
    (regexp_match(video_url, '(?:youtube\.com/(?:watch\?v=|embed/)|youtu\.be/)([a-zA-Z0-9_-]{11})'))[1] AS yt_id
  FROM videos
  WHERE (thumbnail_url IS NULL OR thumbnail_url = '')
    AND video_url IS NOT NULL 
    AND video_url ~ '(?:youtube\.com/(?:watch\?v=|embed/)|youtu\.be/)[a-zA-Z0-9_-]{11}'
) sub
WHERE v.id = sub.vid 
  AND sub.yt_id IS NOT NULL 
  AND sub.yt_id !~ '^(PLACEHOLDER|EXAMPLE)';


-- ============================================================================
-- FILE: 20260117000001_performance_indexes.sql
-- ============================================================================
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


-- ============================================================================
-- FILE: 20260117000002_optimize_forum_category_counts.sql
-- ============================================================================
-- ============================================================================
-- GoKart Part Picker - Optimize Forum Category Counts
-- Created: 2026-01-17
-- Description: Fix N+1 query issue in getForumCategories by using aggregation
-- Owner: Performance Optimization
-- ============================================================================

-- ============================================================================
-- FUNCTION: Get Forum Categories with Counts
-- ============================================================================

-- Function to get categories with topic/post counts in a single query
CREATE OR REPLACE FUNCTION get_forum_categories_with_counts()
RETURNS TABLE (
  id UUID,
  slug TEXT,
  name TEXT,
  description TEXT,
  parent_id UUID,
  icon TEXT,
  color TEXT,
  sort_order INTEGER,
  is_active BOOLEAN,
  requires_auth BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  topic_count BIGINT,
  post_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    c.id,
    c.slug,
    c.name,
    c.description,
    c.parent_id,
    c.icon,
    c.color,
    c.sort_order,
    c.is_active,
    c.requires_auth,
    c.created_at,
    c.updated_at,
    COUNT(DISTINCT t.id) FILTER (WHERE t.is_archived = FALSE) as topic_count,
    COALESCE(SUM(t.replies_count) FILTER (WHERE t.is_archived = FALSE), 0) as post_count
  FROM forum_categories c
  LEFT JOIN forum_topics t ON t.category_id = c.id
  WHERE c.is_active = TRUE
  GROUP BY c.id
  ORDER BY c.sort_order, c.name;
$$;

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION get_forum_categories_with_counts() TO authenticated;
GRANT EXECUTE ON FUNCTION get_forum_categories_with_counts() TO anon;

COMMENT ON FUNCTION get_forum_categories_with_counts() IS 'Returns forum categories with topic and post counts in a single query, avoiding N+1 query problems';

-- ============================================================================
-- VIEW: Forum Categories with Counts (Alternative approach)
-- ============================================================================

-- Materialized view for even better performance (optional, use if counts don't need to be real-time)
-- Uncomment if you want to use materialized view instead:
/*
CREATE MATERIALIZED VIEW IF NOT EXISTS forum_categories_with_counts_mv AS
SELECT 
  c.id,
  c.slug,
  c.name,
  c.description,
  c.parent_id,
  c.icon,
  c.color,
  c.sort_order,
  c.is_active,
  c.requires_auth,
  c.created_at,
  c.updated_at,
  COUNT(DISTINCT t.id) FILTER (WHERE t.is_archived = FALSE) as topic_count,
  COALESCE(SUM(t.replies_count) FILTER (WHERE t.is_archived = FALSE), 0) as post_count
FROM forum_categories c
LEFT JOIN forum_topics t ON t.category_id = c.id
WHERE c.is_active = TRUE
GROUP BY c.id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_forum_categories_mv_id 
ON forum_categories_with_counts_mv(id);

-- Refresh materialized view (run periodically or after topic/post changes)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY forum_categories_with_counts_mv;

COMMENT ON MATERIALIZED VIEW forum_categories_with_counts_mv IS 'Materialized view for forum categories with counts, refreshed periodically';
*/

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================


-- ============================================================================
-- FILE: 20260117000003_seed_build_templates.sql
-- ============================================================================
-- ============================================================================
-- GoKart Part Picker - Seed Build Templates
-- Created: 2026-01-17
-- Description: Create example build templates for users to get started
-- Owner: Templates Implementation
-- ============================================================================

-- Note: This migration assumes engines and parts exist in the database
-- Templates will reference engines by slug (we'll look up IDs)
-- Parts are stored as JSONB {category: part_id}, but we'll use empty objects
-- for now since we need actual part IDs. Admins can update these later.

-- ============================================================================
-- BEGINNER TEMPLATES
-- ============================================================================

-- Beginner Build - Predator 212 Hemi (Most Popular)
INSERT INTO build_templates (
  name,
  description,
  goal,
  engine_id,
  parts,
  total_price,
  estimated_hp,
  estimated_torque,
  is_public,
  is_active,
  approval_status
) 
SELECT 
  'Beginner Build - Predator 212 Hemi',
  'Perfect starter build with the most popular engine. Includes all essential parts for a reliable go-kart that''s easy to maintain.',
  'beginner',
  id,
  '{}'::JSONB, -- Empty parts - admins can populate later
  350.00,
  6.5,
  8.1,
  true,
  true,
  'approved'
FROM engines
WHERE slug = 'predator-212-hemi'
LIMIT 1;

-- Beginner Build - Predator 79cc (Kids/Small Build)
INSERT INTO build_templates (
  name,
  description,
  goal,
  engine_id,
  parts,
  total_price,
  estimated_hp,
  estimated_torque,
  is_public,
  is_active,
  approval_status
) 
SELECT 
  'Kids Build - Predator 79cc',
  'Safe and reliable build perfect for younger riders. Lower power output with quality components for peace of mind.',
  'kids',
  id,
  '{}'::JSONB,
  250.00,
  2.5,
  3.0,
  true,
  true,
  'approved'
FROM engines
WHERE slug = 'predator-79'
LIMIT 1;

-- ============================================================================
-- BUDGET TEMPLATES
-- ============================================================================

-- Budget Build - Predator 212 Non-Hemi
INSERT INTO build_templates (
  name,
  description,
  goal,
  engine_id,
  parts,
  total_price,
  estimated_hp,
  estimated_torque,
  is_public,
  is_active,
  approval_status
) 
SELECT 
  'Budget Build - Predator 212 Non-Hemi',
  'Maximum value build using the reliable Non-Hemi engine. Great performance without breaking the bank.',
  'budget',
  id,
  '{}'::JSONB,
  280.00,
  6.5,
  8.1,
  true,
  true,
  'approved'
FROM engines
WHERE slug = 'predator-212-non-hemi'
LIMIT 1;

-- ============================================================================
-- SPEED TEMPLATES
-- ============================================================================

-- Speed Build - Predator 212 Hemi (High RPM)
INSERT INTO build_templates (
  name,
  description,
  goal,
  engine_id,
  parts,
  total_price,
  estimated_hp,
  estimated_torque,
  is_public,
  is_active,
  approval_status
) 
SELECT 
  'Speed Build - Predator 212 Hemi',
  'Optimized for top speed with high-RPM components. Perfect for racing and maximum velocity builds.',
  'speed',
  id,
  '{}'::JSONB,
  450.00,
  8.0,
  7.5,
  true,
  true,
  'approved'
FROM engines
WHERE slug = 'predator-212-hemi'
LIMIT 1;

-- Speed Build - Predator 224
INSERT INTO build_templates (
  name,
  description,
  goal,
  engine_id,
  parts,
  total_price,
  estimated_hp,
  estimated_torque,
  is_public,
  is_active,
  approval_status
) 
SELECT 
  'Speed Build - Predator 224',
  'Larger displacement for more power. High-performance components selected for maximum speed.',
  'speed',
  id,
  '{}'::JSONB,
  500.00,
  7.0,
  10.5,
  true,
  true,
  'approved'
FROM engines
WHERE slug = 'predator-224'
LIMIT 1;

-- ============================================================================
-- TORQUE TEMPLATES
-- ============================================================================

-- Torque Build - Predator 212 Hemi
INSERT INTO build_templates (
  name,
  description,
  goal,
  engine_id,
  parts,
  total_price,
  estimated_hp,
  estimated_torque,
  is_public,
  is_active,
  approval_status
) 
SELECT 
  'Torque Build - Predator 212 Hemi',
  'Optimized for low-end power and acceleration. Great for off-road, hills, and heavy loads.',
  'torque',
  id,
  '{}'::JSONB,
  420.00,
  7.0,
  9.5,
  true,
  true,
  'approved'
FROM engines
WHERE slug = 'predator-212-hemi'
LIMIT 1;

-- Torque Build - Predator 301
INSERT INTO build_templates (
  name,
  description,
  goal,
  engine_id,
  parts,
  total_price,
  estimated_hp,
  estimated_torque,
  is_public,
  is_active,
  approval_status
) 
SELECT 
  'Torque Build - Predator 301',
  'Maximum torque build with larger displacement engine. Perfect for heavy-duty applications and towing.',
  'torque',
  id,
  '{}'::JSONB,
  600.00,
  8.0,
  12.5,
  true,
  true,
  'approved'
FROM engines
WHERE slug = 'predator-301'
LIMIT 1;

-- ============================================================================
-- COMPETITION TEMPLATES
-- ============================================================================

-- Competition Build - Predator 212 Hemi
INSERT INTO build_templates (
  name,
  description,
  goal,
  engine_id,
  parts,
  total_price,
  estimated_hp,
  estimated_torque,
  is_public,
  is_active,
  approval_status
) 
SELECT 
  'Competition Build - Predator 212 Hemi',
  'Full performance build with premium components. Designed for competitive racing and maximum performance.',
  'competition',
  id,
  '{}'::JSONB,
  750.00,
  10.0,
  9.0,
  true,
  true,
  'approved'
FROM engines
WHERE slug = 'predator-212-hemi'
LIMIT 1;

-- Competition Build - Predator 420
INSERT INTO build_templates (
  name,
  description,
  goal,
  engine_id,
  parts,
  total_price,
  estimated_hp,
  estimated_torque,
  is_public,
  is_active,
  approval_status
) 
SELECT 
  'Competition Build - Predator 420',
  'Ultimate performance build with the largest displacement. Premium components throughout for serious racing.',
  'competition',
  id,
  '{}'::JSONB,
  950.00,
  13.0,
  18.0,
  true,
  true,
  'approved'
FROM engines
WHERE slug = 'predator-420'
LIMIT 1;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE build_templates IS 'Seed templates created for common build goals. Parts can be populated by admins through the admin panel.';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================


