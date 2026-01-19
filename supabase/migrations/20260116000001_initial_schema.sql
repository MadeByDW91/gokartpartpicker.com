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

