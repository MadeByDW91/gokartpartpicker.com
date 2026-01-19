# ADR-001: Database Schema Design

> **Status:** Accepted  
> **Date:** Day 0  
> **Owner:** A1 (Database)

---

## Context

Project Atlas requires a database schema that supports:
- Engine catalog with specifications
- Parts catalog with categories
- User builds with saved configurations
- Compatibility rules between engines and parts
- Content management for guides and documentation
- User accounts and profiles

---

## Decision

We will use PostgreSQL (via Supabase) with the following schema design.

---

## Schema Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    profiles     │     │     engines     │     │   categories    │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (FK users)   │     │ id              │     │ id              │
│ username        │     │ name            │     │ name            │
│ role            │     │ slug            │     │ slug            │
│ created_at      │     │ brand           │     │ parent_id       │
└─────────────────┘     │ model           │     │ sort_order      │
                        │ specs (jsonb)   │     └────────┬────────┘
                        └────────┬────────┘              │
                                 │                       │
                    ┌────────────┴────────────┐          │
                    │                         │          │
              ┌─────┴─────┐             ┌─────┴──────────┴─────┐
              │  builds   │             │        parts         │
              ├───────────┤             ├──────────────────────┤
              │ id        │             │ id                   │
              │ user_id   │◀────────┐   │ name                 │
              │ engine_id │         │   │ slug                 │
              │ name      │         │   │ category_id          │
              │ is_public │         │   │ specs (jsonb)        │
              └─────┬─────┘         │   │ compatible_engines[] │
                    │               │   └──────────────────────┘
                    │               │
              ┌─────┴─────┐         │
              │build_parts│         │
              ├───────────┤         │
              │ build_id  │◀────────┤
              │ part_id   │         │
              │ quantity  │         │
              └───────────┘         │
                                    │
              ┌─────────────────────┴─────────────────────┐
              │           compatibility_rules             │
              ├───────────────────────────────────────────┤
              │ id                                        │
              │ rule_type                                 │
              │ source_type / source_id                   │
              │ target_type / target_id                   │
              │ condition (jsonb)                         │
              │ result (compatible/incompatible/warning)  │
              │ message                                   │
              └───────────────────────────────────────────┘
```

---

## Table Definitions

### `profiles`

Extends Supabase `auth.users` with application-specific data.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'user',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');

-- Trigger to create profile on user signup
CREATE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### `engines`

The core engine catalog.

```sql
CREATE TABLE engines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  brand VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  
  -- Specifications
  displacement_cc INTEGER NOT NULL,
  horsepower DECIMAL(4,1),
  torque_ft_lbs DECIMAL(4,1),
  rpm_max INTEGER,
  
  -- Shaft specifications (critical for compatibility)
  shaft_diameter_mm DECIMAL(4,2),
  shaft_length_mm DECIMAL(5,2),
  shaft_keyway_width_mm DECIMAL(4,2),
  shaft_type shaft_type NOT NULL DEFAULT 'straight',
  
  -- Physical
  weight_lbs DECIMAL(5,1),
  oil_capacity_oz DECIMAL(4,1),
  fuel_tank_oz DECIMAL(5,1),
  
  -- Content
  description TEXT,
  image_url TEXT,
  
  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE TYPE shaft_type AS ENUM ('straight', 'tapered', 'threaded');

CREATE INDEX idx_engines_slug ON engines(slug);
CREATE INDEX idx_engines_brand ON engines(brand);
CREATE INDEX idx_engines_active ON engines(is_active) WHERE is_active = true;
```

### `categories`

Hierarchical part categories.

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
```

### `parts`

The parts catalog.

```sql
CREATE TABLE parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  sku VARCHAR(50),
  brand VARCHAR(100),
  
  -- Classification
  category_id UUID NOT NULL REFERENCES categories(id),
  
  -- Specifications (flexible JSON for different part types)
  specs JSONB NOT NULL DEFAULT '{}',
  
  -- Compatibility
  compatible_engine_ids UUID[] DEFAULT '{}',
  universal BOOLEAN NOT NULL DEFAULT false,
  
  -- Content
  description TEXT,
  image_url TEXT,
  
  -- Safety
  safety_notes TEXT,
  requires_modification BOOLEAN NOT NULL DEFAULT false,
  
  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_parts_slug ON parts(slug);
CREATE INDEX idx_parts_category ON parts(category_id);
CREATE INDEX idx_parts_active ON parts(is_active) WHERE is_active = true;
CREATE INDEX idx_parts_engines ON parts USING GIN (compatible_engine_ids);
```

### `builds`

User-created builds.

```sql
CREATE TABLE builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  engine_id UUID NOT NULL REFERENCES engines(id),
  
  -- Identity
  name VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Sharing
  is_public BOOLEAN NOT NULL DEFAULT false,
  share_slug VARCHAR(20) UNIQUE,
  
  -- Status
  status build_status NOT NULL DEFAULT 'draft',
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE build_status AS ENUM ('draft', 'complete', 'archived');

CREATE INDEX idx_builds_user ON builds(user_id);
CREATE INDEX idx_builds_public ON builds(is_public) WHERE is_public = true;
CREATE INDEX idx_builds_share ON builds(share_slug) WHERE share_slug IS NOT NULL;
```

### `build_parts`

Junction table for build-to-parts relationship.

```sql
CREATE TABLE build_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
  part_id UUID NOT NULL REFERENCES parts(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(build_id, part_id)
);

CREATE INDEX idx_build_parts_build ON build_parts(build_id);
```

### `compatibility_rules`

Deterministic compatibility rules.

```sql
CREATE TABLE compatibility_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Rule identification
  name VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- Rule type
  rule_type rule_type NOT NULL,
  
  -- Source (what this rule applies to)
  source_type entity_type NOT NULL,
  source_id UUID, -- NULL means "all of this type"
  
  -- Target (what it checks against)
  target_type entity_type NOT NULL,
  target_id UUID, -- NULL means "all of this type"
  
  -- Condition (JSON-based rule expression)
  condition JSONB NOT NULL,
  
  -- Result
  result compatibility_result NOT NULL,
  message TEXT NOT NULL,
  
  -- Priority (higher = evaluated first)
  priority INTEGER NOT NULL DEFAULT 0,
  
  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE TYPE rule_type AS ENUM (
  'shaft_compatibility',
  'mounting_compatibility', 
  'performance_requirement',
  'safety_requirement',
  'part_conflict',
  'part_dependency'
);

CREATE TYPE entity_type AS ENUM ('engine', 'part', 'category');

CREATE TYPE compatibility_result AS ENUM (
  'compatible',
  'incompatible',
  'warning',
  'requires_modification'
);

CREATE INDEX idx_rules_type ON compatibility_rules(rule_type);
CREATE INDEX idx_rules_source ON compatibility_rules(source_type, source_id);
CREATE INDEX idx_rules_target ON compatibility_rules(target_type, target_id);
CREATE INDEX idx_rules_active ON compatibility_rules(is_active) WHERE is_active = true;
```

### `content`

Guide and documentation metadata.

```sql
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  
  -- Classification
  content_type content_type NOT NULL,
  
  -- Relations
  engine_id UUID REFERENCES engines(id),
  part_id UUID REFERENCES parts(id),
  category_id UUID REFERENCES categories(id),
  
  -- Content (MDX file path)
  file_path VARCHAR(500) NOT NULL,
  
  -- SEO
  excerpt TEXT,
  featured_image TEXT,
  
  -- Metadata
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE TYPE content_type AS ENUM (
  'guide',
  'spec_sheet',
  'safety_notice',
  'faq',
  'tutorial'
);

CREATE INDEX idx_content_slug ON content(slug);
CREATE INDEX idx_content_type ON content(content_type);
CREATE INDEX idx_content_published ON content(is_published) WHERE is_published = true;
```

### `audit_logs`

Security and admin action logging.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_id UUID REFERENCES profiles(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT
);

CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
```

---

## Specification JSON Schemas

### Engine Specs (Extended)

```json
{
  "bore_mm": 68.0,
  "stroke_mm": 54.0,
  "compression_ratio": "8.5:1",
  "fuel_type": "gasoline",
  "oil_type": "10W-30",
  "spark_plug": "F7RTC",
  "carburetor": {
    "type": "float",
    "venturi_mm": 19
  },
  "governor": {
    "type": "mechanical",
    "removable": true
  },
  "mounting": {
    "bolt_pattern": "4-bolt",
    "bolt_spacing_mm": [76.2, 76.2]
  }
}
```

### Part Specs (Example: Clutch)

```json
{
  "type": "centrifugal",
  "engagement_rpm": 1800,
  "max_rpm": 4000,
  "max_hp": 8,
  "bore_diameter_mm": 19.05,
  "keyway_width_mm": 4.76,
  "outer_diameter_mm": 107.95,
  "chain_pitch": "35",
  "teeth": 12,
  "weight_oz": 24
}
```

### Compatibility Rule Condition

```json
{
  "operator": "AND",
  "conditions": [
    {
      "field": "engine.shaft_diameter_mm",
      "operator": "equals",
      "value": 19.05
    },
    {
      "field": "part.specs.bore_diameter_mm",
      "operator": "equals",
      "value": 19.05
    }
  ]
}
```

---

## Consequences

### Positive

- Flexible JSONB specs allow different part types without schema changes
- Hierarchical categories support deep organization
- Compatibility rules are data-driven and maintainable
- Audit logging provides accountability
- RLS-ready structure for security

### Negative

- JSONB queries may be slower than normalized columns
- Complex compatibility rules need careful validation
- Need to maintain JSON schemas separately

### Mitigation

- Add GIN indexes on frequently queried JSONB paths
- Validate JSONB against schemas in application layer
- Consider materialized views for complex queries

---

*Document Version: 1.0*  
*Last Updated: Day 0*  
*Owner: A1 (Database)*
