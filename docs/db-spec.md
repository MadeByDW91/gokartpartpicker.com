# GoKart Part Picker - Database Specification

> **Owner**: DB Architect + Coordinator Agent (A1)  
> **Version**: 1.1.0  
> **Created**: 2026-01-16  
> **Database**: Supabase (PostgreSQL)  
> **Status**: ✅ Schema Complete, Ready for Migration

---

## Table of Contents

1. [Overview](#overview)
2. [Schema Diagram](#schema-diagram)
3. [Tables Reference](#tables-reference)
4. [Enum Types](#enum-types)
5. [Row Level Security](#row-level-security)
6. [Helper Functions](#helper-functions)
7. [Audit System](#audit-system)
8. [Common Queries](#common-queries)
9. [Migration Guide](#migration-guide)

---

## Overview

The GoKart Part Picker database is designed to support:

- **Engine Catalog**: Reference data for small engines (Predator, Honda, Briggs)
- **Parts Catalog**: Aftermarket parts with category organization
- **Compatibility Rules**: Deterministic rule-based compatibility checking
- **Engine-Part Mapping**: Direct compatibility mappings
- **User Builds**: User-created engine configurations
- **Social Features**: Likes, public sharing
- **Content**: Guides, specs, and static pages
- **Admin Audit**: Complete audit trail for catalog changes

### Design Principles

1. **Catalog data is admin-controlled** - Engines, parts, and compatibility are managed by admins only
2. **User data is isolated** - Users can only access their own builds (except public ones)
3. **Everything is audited** - All admin actions create audit logs
4. **RLS everywhere** - Row Level Security on every table
5. **Aligned with db-query-contract.md** - Schema matches frontend expectations

---

## Schema Diagram

```
┌─────────────────┐         ┌─────────────────┐
│    profiles     │         │     engines     │
├─────────────────┤         ├─────────────────┤
│ id (PK, FK auth)│         │ id (PK)         │
│ username        │         │ slug (UNIQUE)   │
│ email           │    ┌───▶│ name            │
│ avatar_url      │    │    │ brand           │
│ role            │    │    │ displacement_cc │
│ created_at      │    │    │ horsepower      │
│ updated_at      │    │    │ shaft_diameter  │
└────────┬────────┘    │    │ is_active       │
         │             │    └────────┬────────┘
         │             │             │
         ▼             │             ▼
┌─────────────────┐    │    ┌─────────────────────────┐
│     builds      │    │    │ engine_part_compatibility│
├─────────────────┤    │    ├─────────────────────────┤
│ id (PK)         │    │    │ id (PK)                 │
│ user_id (FK)────┼────┤    │ engine_id (FK)──────────┘
│ engine_id (FK)──┼────┘    │ part_id (FK)────────────┐
│ name            │         │ compatibility_level     │
│ parts (JSONB)   │         │ notes                   │
│ is_public       │         └─────────────────────────┘
│ total_price     │                   │
└────────┬────────┘                   │
         │                            ▼
         │                   ┌─────────────────┐
         │                   │      parts      │
         │                   ├─────────────────┤
         │                   │ id (PK)         │
         │                   │ slug (UNIQUE)   │
         │                   │ name            │
         │                   │ category        │
         │                   │ brand           │
         │                   │ specifications  │
         │                   │ price           │
         │                   │ is_active       │
         │                   └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────────┐    ┌─────────────────┐
│   build_likes   │    │ compatibility_rules │    │   audit_log     │
├─────────────────┤    ├─────────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)             │    │ id (PK)         │
│ build_id (FK)   │    │ rule_type           │    │ user_id (FK)    │
│ user_id (FK)    │    │ source_category     │    │ action          │
│ created_at      │    │ target_category     │    │ table_name      │
└─────────────────┘    │ condition (JSONB)   │    │ record_id       │
                       │ warning_message     │    │ old_data (JSON) │
                       └─────────────────────┘    │ new_data (JSON) │
                                                  └─────────────────┘

┌─────────────────┐    ┌─────────────────┐
│     content     │    │ part_categories │
├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │
│ slug (UNIQUE)   │    │ slug (UNIQUE)   │
│ title           │    │ name            │
│ content_type    │    │ sort_order      │
│ body            │    │ is_active       │
│ is_published    │    └─────────────────┘
└─────────────────┘
```

---

## Tables Reference

### `profiles`

Extends Supabase `auth.users`. Auto-created via trigger on signup.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | References `auth.users(id)` |
| `username` | TEXT (UNIQUE) | Public display name |
| `email` | TEXT | User's email |
| `avatar_url` | TEXT | Avatar image URL |
| `role` | `user_role` | Access level: `user`, `admin`, `super_admin` |
| `created_at` | TIMESTAMPTZ | Account creation time |
| `updated_at` | TIMESTAMPTZ | Last profile update |

**Indexes**: Primary key on `id`, unique on `username`

---

### `engines`

Reference catalog of small engines. **Admin-managed**.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique engine ID |
| `slug` | TEXT (UNIQUE) | URL-friendly identifier |
| `name` | TEXT | Display name (e.g., "Predator 212 Hemi") |
| `brand` | TEXT | Manufacturer (e.g., "Predator", "Honda") |
| `model` | TEXT | Model number/name |
| `variant` | TEXT | Sub-variant (e.g., "Hemi", "Non-Hemi") |
| `displacement_cc` | INTEGER | Engine displacement in cc |
| `horsepower` | DECIMAL(4,1) | Rated horsepower |
| `torque` | DECIMAL(4,1) | Torque (lb-ft) |
| `shaft_diameter` | DECIMAL(5,3) | Output shaft diameter (inches) |
| `shaft_length` | DECIMAL(5,3) | Output shaft length (inches) |
| `shaft_type` | `shaft_type` | straight, tapered, or threaded |
| `shaft_keyway` | DECIMAL(5,3) | Keyway width (inches) |
| `mount_type` | TEXT | Bolt pattern description |
| `oil_capacity_oz` | DECIMAL(5,1) | Oil capacity (fl oz) |
| `fuel_tank_oz` | DECIMAL(6,1) | Fuel tank size (fl oz) |
| `weight_lbs` | DECIMAL(5,1) | Dry weight (lbs) |
| `price` | DECIMAL(10,2) | Price in USD |
| `image_url` | TEXT | Engine image URL |
| `affiliate_url` | TEXT | Affiliate purchase link |
| `is_active` | BOOLEAN | Visible in catalog |
| `notes` | TEXT | Additional info |
| `created_at` | TIMESTAMPTZ | Record creation |
| `updated_at` | TIMESTAMPTZ | Last update |
| `created_by` | UUID (FK) | Admin who created |

**Indexes**: `brand`, `displacement_cc`, `slug`, `is_active`

---

### `parts`

Reference catalog of go-kart parts. **Admin-managed**.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique part ID |
| `slug` | TEXT (UNIQUE) | URL-friendly identifier |
| `name` | TEXT | Part name |
| `category` | `part_category` | Enum category type |
| `category_id` | UUID (FK) | Link to part_categories |
| `brand` | TEXT | Manufacturer brand |
| `specifications` | JSONB | Category-specific specs |
| `price` | DECIMAL(10,2) | Price in USD |
| `image_url` | TEXT | Product image |
| `affiliate_url` | TEXT | Purchase link |
| `is_active` | BOOLEAN | Visible in catalog |
| `created_at` | TIMESTAMPTZ | Record creation |
| `updated_at` | TIMESTAMPTZ | Last update |
| `created_by` | UUID (FK) | Admin who created |

**Indexes**: `category`, `category_id`, `brand`, `slug`, `is_active`, full-text on `name`

#### `specifications` Examples by Category

```json
// Clutch
{
  "engagement_rpm": 3500,
  "type": "centrifugal",
  "shoes": 2,
  "bore_size": 0.750
}

// Chain
{
  "pitch": "#35",
  "length_links": 106,
  "type": "roller"
}

// Sprocket
{
  "pitch": "#35",
  "teeth": 60,
  "bore_size": 1.0,
  "type": "driven"
}
```

---

### `compatibility_rules`

Deterministic rules for compatibility checking. **Admin-managed**.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique rule ID |
| `rule_type` | TEXT | shaft_match, chain_pitch, bolt_pattern, etc. |
| `source_category` | TEXT | Source part category or 'engine' |
| `target_category` | TEXT | Target part category |
| `condition` | JSONB | Rule condition logic |
| `warning_message` | TEXT | User-facing warning |
| `severity` | TEXT | error, warning, or info |
| `is_active` | BOOLEAN | Rule is active |
| `created_at` | TIMESTAMPTZ | Record creation |
| `updated_at` | TIMESTAMPTZ | Last update |
| `created_by` | UUID (FK) | Admin who created |

**Indexes**: `rule_type`, `source_category`, `target_category`, `is_active`

---

### `builds`

User-created engine configurations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique build ID |
| `user_id` | UUID (FK) | Owner's profile ID |
| `engine_id` | UUID (FK) | Selected engine |
| `name` | TEXT | Build name |
| `description` | TEXT | Build description |
| `parts` | JSONB | Selected parts by category `{"clutch": "uuid"}` |
| `total_price` | DECIMAL(10,2) | Calculated total price |
| `is_public` | BOOLEAN | Visible to other users |
| `likes_count` | INTEGER | Cached like count |
| `views_count` | INTEGER | View counter |
| `image_url` | TEXT | Build cover image |
| `created_at` | TIMESTAMPTZ | Creation time |
| `updated_at` | TIMESTAMPTZ | Last update |

**Indexes**: `user_id`, `engine_id`, `is_public`, `created_at`

---

### `content`

CMS content for guides and static pages.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique content ID |
| `slug` | TEXT (UNIQUE) | URL-friendly identifier |
| `title` | TEXT | Content title |
| `content_type` | TEXT | guide, spec, safety, faq, page |
| `body` | TEXT | Main content body |
| `excerpt` | TEXT | Short summary |
| `metadata` | JSONB | Additional metadata |
| `is_published` | BOOLEAN | Publicly visible |
| `published_at` | TIMESTAMPTZ | Publish date |
| `created_at` | TIMESTAMPTZ | Creation time |
| `updated_at` | TIMESTAMPTZ | Last update |
| `created_by` | UUID (FK) | Admin who created |

---

### `audit_log`

Immutable audit trail. **Admin read-only**.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique log ID |
| `user_id` | UUID (FK) | User who acted |
| `action` | `audit_action` | create, update, delete |
| `table_name` | TEXT | Affected table |
| `record_id` | UUID | Affected record |
| `old_data` | JSONB | Before state |
| `new_data` | JSONB | After state |
| `ip_address` | INET | Request IP |
| `user_agent` | TEXT | Browser info |
| `created_at` | TIMESTAMPTZ | Action time |

---

## Enum Types

### `user_role`
```sql
'user'        -- Standard user, can create builds
'admin'       -- Can manage catalog (engines, parts, rules)
'super_admin' -- Full access including role management
```

### `shaft_type`
```sql
'straight'  -- Standard straight shaft
'tapered'   -- Tapered shaft (less common)
'threaded'  -- Threaded shaft output
```

### `part_category`
```sql
-- Drive train
'clutch', 'torque_converter', 'chain', 'sprocket',

-- Chassis
'axle', 'wheel', 'tire', 'brake', 'throttle', 'frame',

-- Engine performance
'carburetor', 'exhaust', 'air_filter', 'camshaft', 'valve_spring',
'flywheel', 'ignition', 'connecting_rod', 'piston', 'crankshaft',
'oil_system', 'header', 'fuel_system', 'gasket', 'hardware', 'other'
```

### `audit_action`
```sql
'create' -- New record
'update' -- Modified record
'delete' -- Removed record
```

---

## Row Level Security

### Access Control Matrix

| Table | Anonymous | User | Admin | Super Admin |
|-------|-----------|------|-------|-------------|
| `profiles` | ✅ Read | ✅ Read, Update own | ✅ Read | ✅ All |
| `engines` | ✅ Active | ✅ Active | ✅ CRUD | ✅ CRUD + Delete |
| `parts` | ✅ Active | ✅ Active | ✅ CRUD | ✅ CRUD + Delete |
| `compatibility_rules` | ✅ Active | ✅ Active | ✅ CRUD | ✅ CRUD + Delete |
| `builds` | Public only | Own + Public | All | All |
| `build_likes` | Public builds | Own likes | All | All |
| `content` | Published | Published | ✅ CRUD | ✅ CRUD + Delete |
| `audit_log` | ❌ | ❌ | ✅ Read | ✅ Read |

---

## Helper Functions

### `is_admin()`
Returns `TRUE` if current user has `admin` or `super_admin` role.

### `is_super_admin()`
Returns `TRUE` if current user has `super_admin` role.

### `get_user_role()`
Returns current user's role enum value.

### `log_audit_action()`
Creates audit log entry. Called automatically by triggers.

---

## Audit System

All catalog changes are automatically logged via triggers on:
- `engines`
- `parts`
- `engine_part_compatibility`
- `content`
- `compatibility_rules`

---

## Common Queries

### Get All Active Engines
```sql
SELECT * FROM engines 
WHERE is_active = TRUE 
ORDER BY displacement_cc;
```

### Get User's Builds with Engine Info
```sql
SELECT 
  b.*,
  e.name as engine_name,
  e.brand as engine_brand,
  e.horsepower
FROM builds b
LEFT JOIN engines e ON e.id = b.engine_id
WHERE b.user_id = auth.uid()
ORDER BY b.updated_at DESC;
```

### Get Compatibility Rules for Frontend
```sql
SELECT * FROM compatibility_rules 
WHERE is_active = TRUE;
```

---

## Migration Guide

### Migration Files (run in order)

1. `20260116000001_initial_schema.sql` - Tables, indexes, triggers, seed categories
2. `20260116000002_rls_policies.sql` - RLS policies and security
3. `20260116000003_rls_canary_tests.sql` - Security test functions
4. `20260116000004_seed_engines.sql` - Initial engine data (10 engines)
5. `20260116000005_hardening_constraints.sql` - CHECK constraints, additional indexes

### Using Supabase CLI

```bash
# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push

# Or reset and reseed (CAUTION: destroys data)
supabase db reset
```

---

## Seeded Engines

| Brand | Model | Variant | CC | HP | Shaft |
|-------|-------|---------|-----|-----|-------|
| Predator | 79 | - | 79 | 2.5 | 3/4" |
| Predator | 212 | Non-Hemi | 212 | 6.5 | 3/4" |
| Predator | 212 | Hemi | 212 | 6.5 | 3/4" |
| Predator | Ghost | - | 212 | 7.0 | 3/4" |
| Predator | 224 | - | 224 | 7.5 | 7/8" |
| Predator | 301 | - | 301 | 8.0 | 1" |
| Predator | 420 | - | 420 | 13.0 | 1" |
| Predator | 670 | - | 670 | 22.0 | 1" |
| Honda | GX200 | - | 196 | 5.5 | 3/4" |
| Briggs | 206 | - | 206 | 5.5 | 3/4" |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-16 | Initial schema design |
| 1.1.0 | 2026-01-16 | Aligned with db-query-contract.md, added content table |
