# Go-Kart Part Picker Database Specification

Version: 1.0.0  
Last Updated: 2026-01-16

---

## Overview

This document defines the database schema for gokartpartpicker.com. All data ingestion agents MUST conform to these structures when inserting or updating records.

---

## Core Tables

### `brands`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| name | VARCHAR(100) | NOT NULL, UNIQUE | Canonical brand name |
| slug | VARCHAR(100) | NOT NULL, UNIQUE | URL-safe identifier |
| aliases | JSONB | | Alternative names/spellings |
| logo_url | VARCHAR(500) | | Brand logo image URL |
| website | VARCHAR(500) | | Official website |
| country | VARCHAR(50) | | Country of origin |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last modification time |

**Example Brands:** Predator, Tillotson, Briggs & Stratton, Honda, Mikuni, Walbro, Comet, Hilliard

---

### `categories`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Category name |
| slug | VARCHAR(100) | NOT NULL, UNIQUE | URL-safe identifier |
| parent_id | UUID | FK → categories.id | Parent category (nullable) |
| description | TEXT | | Category description |
| required_specs | JSONB | | Specs required for parts in this category |
| optional_specs | JSONB | | Optional specs for this category |
| icon | VARCHAR(100) | | Icon identifier |
| sort_order | INTEGER | DEFAULT 0 | Display order |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last modification time |

**Category Hierarchy:**
```
engines/
  ├── complete-engines/
  ├── engine-blocks/
  ├── cylinder-heads/
  ├── camshafts/
  ├── crankshafts/
  ├── connecting-rods/
  ├── pistons/
  ├── flywheels/
  └── valve-train/
carburetors/
  ├── complete-carburetors/
  ├── carburetor-kits/
  ├── jets/
  ├── needles-seats/
  └── gaskets/
clutches/
  ├── centrifugal-clutches/
  ├── clutch-drums/
  ├── clutch-shoes/
  └── clutch-springs/
torque-converters/
  ├── driver-units/
  ├── driven-units/
  ├── belts/
  ├── springs/
  └── rebuild-kits/
chains-sprockets/
  ├── chains/
  ├── axle-sprockets/
  ├── clutch-sprockets/
  └── chain-tools/
exhaust/
  ├── headers/
  ├── mufflers/
  └── complete-systems/
ignition/
  ├── coils/
  ├── stators/
  ├── flywheels/
  └── kill-switches/
fuel-system/
  ├── fuel-pumps/
  ├── fuel-filters/
  ├── fuel-tanks/
  └── fuel-lines/
air-filtration/
  ├── air-filters/
  ├── filter-adapters/
  └── velocity-stacks/
```

---

### `parts`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| sku | VARCHAR(100) | UNIQUE | Internal SKU |
| name | VARCHAR(255) | NOT NULL | Part name |
| slug | VARCHAR(255) | NOT NULL, UNIQUE | URL-safe identifier |
| brand_id | UUID | FK → brands.id | Brand reference |
| category_id | UUID | FK → categories.id, NOT NULL | Category reference |
| description | TEXT | | Full description |
| short_description | VARCHAR(500) | | Brief description |
| metadata | JSONB | NOT NULL | Category-specific specs |
| images | JSONB | | Array of image URLs |
| status | ENUM | NOT NULL | 'active', 'discontinued', 'draft' |
| needs_review | BOOLEAN | DEFAULT false | Flag for manual review |
| review_notes | TEXT | | Notes for reviewers |
| source | VARCHAR(100) | | Data source (vendor, import file) |
| source_id | VARCHAR(255) | | ID from source system |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last modification time |

---

### `engine_families`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| name | VARCHAR(100) | NOT NULL, UNIQUE | Family name |
| slug | VARCHAR(100) | NOT NULL, UNIQUE | URL-safe identifier |
| brand_id | UUID | FK → brands.id | Brand reference |
| displacement_cc | INTEGER | | Displacement in CC |
| bore_mm | DECIMAL(5,2) | | Bore size in mm |
| stroke_mm | DECIMAL(5,2) | | Stroke length in mm |
| valve_config | VARCHAR(50) | | OHV, Flathead, etc. |
| aliases | JSONB | | Alternative names |
| compatible_with | JSONB | | Related engine families |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last modification time |

**Common Engine Families:**
- Predator 212 (Hemi & Non-Hemi)
- Predator 224
- Predator 301
- Predator 420
- Honda GX160
- Honda GX200
- Honda GX270
- Honda GX390
- Briggs & Stratton Animal
- Briggs & Stratton World Formula
- Briggs & Stratton LO206
- Tillotson 212
- Tillotson 225RS
- Clone 196cc/212cc
- Ducar 212

---

### `part_compatibility`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| part_id | UUID | FK → parts.id, NOT NULL | Part reference |
| engine_family_id | UUID | FK → engine_families.id | Compatible engine family |
| compatibility_type | ENUM | NOT NULL | 'direct_fit', 'with_modification', 'replacement_for' |
| notes | TEXT | | Compatibility notes |
| created_at | TIMESTAMP | NOT NULL | Record creation time |

---

### `vendors`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Vendor name |
| slug | VARCHAR(100) | NOT NULL, UNIQUE | URL-safe identifier |
| website | VARCHAR(500) | | Vendor website |
| affiliate_id | VARCHAR(255) | | Affiliate tracking ID |
| is_active | BOOLEAN | DEFAULT true | Active vendor flag |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last modification time |

---

### `vendor_listings`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| part_id | UUID | FK → parts.id, NOT NULL | Part reference |
| vendor_id | UUID | FK → vendors.id, NOT NULL | Vendor reference |
| vendor_sku | VARCHAR(100) | | Vendor's SKU |
| url | VARCHAR(1000) | NOT NULL | Product URL |
| price | DECIMAL(10,2) | | Current price |
| price_updated_at | TIMESTAMP | | Last price check |
| in_stock | BOOLEAN | | Stock status |
| stock_updated_at | TIMESTAMP | | Last stock check |
| created_at | TIMESTAMP | NOT NULL | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last modification time |

---

## Metadata Spec Fields by Category

### Engines

```json
{
  "displacement_cc": 212,
  "bore_mm": 70.0,
  "stroke_mm": 55.0,
  "valve_config": "OHV",
  "variant": "Hemi",
  "shaft_diameter_in": 0.75,
  "shaft_length_in": 2.43,
  "shaft_keyway": "3/16\"",
  "electric_start": false,
  "governor_removed": false,
  "stage_kit": null
}
```

### Carburetors

```json
{
  "carburetor_model": "Mikuni VM22",
  "throat_diameter_mm": 22,
  "main_jet": 95,
  "pilot_jet": 17.5,
  "needle_clip": 3,
  "choke_type": "manual",
  "fuel_inlet": "side",
  "mounting_style": "flange"
}
```

### Clutches (Centrifugal)

```json
{
  "engagement_rpm": 3500,
  "max_rpm": 8000,
  "bore_in": 0.75,
  "sprocket_teeth": 12,
  "chain_size": "#35",
  "keyway": "3/16\"",
  "shoes_count": 2,
  "material": "steel"
}
```

### Torque Converters

```json
{
  "series": "TAV2",
  "position": "driver",
  "bore_in": 0.75,
  "belt_width_in": 0.669,
  "engagement_rpm": 1800,
  "max_rpm": 6000,
  "asymmetric": true,
  "keyway": "3/16\""
}
```

### Chains

```json
{
  "chain_size": "#35",
  "pitch_in": 0.375,
  "links": 106,
  "type": "standard",
  "material": "steel",
  "plating": "nickel"
}
```

### Sprockets

```json
{
  "teeth": 60,
  "chain_size": "#35",
  "bore_in": 1.0,
  "hub_type": "split",
  "bolt_pattern": "4-hole",
  "material": "steel",
  "weight_oz": 12
}
```

### Pistons

```json
{
  "bore_mm": 70.0,
  "compression_height_mm": 30.5,
  "pin_diameter_mm": 18.0,
  "ring_count": 2,
  "dome_type": "flat",
  "material": "forged",
  "oversize_mm": 0
}
```

### Camshafts

```json
{
  "duration_int_deg": 260,
  "duration_exh_deg": 260,
  "lift_int_in": 0.320,
  "lift_exh_in": 0.320,
  "lobe_separation": 108,
  "grind_type": "performance",
  "rocker_ratio": 1.2
}
```

### Exhaust Headers

```json
{
  "header_type": "RLV",
  "inlet_diameter_in": 1.0,
  "length_in": 22,
  "material": "steel",
  "coating": "raw",
  "flex_section": false
}
```

---

## Indexing Strategy

### Primary Indexes
- All `id` columns (automatic via PK)
- All `slug` columns (UNIQUE)
- `parts.sku` (UNIQUE)

### Foreign Key Indexes
- `parts.brand_id`
- `parts.category_id`
- `part_compatibility.part_id`
- `part_compatibility.engine_family_id`
- `vendor_listings.part_id`
- `vendor_listings.vendor_id`

### Search Indexes
- `parts.name` (GIN trigram)
- `parts.metadata` (GIN jsonb_path_ops)
- `brands.aliases` (GIN jsonb_path_ops)
- `engine_families.aliases` (GIN jsonb_path_ops)

### Composite Indexes
- `vendor_listings(part_id, vendor_id)` (UNIQUE)
- `part_compatibility(part_id, engine_family_id)` (UNIQUE)

---

## Data Integrity Rules

1. **Parts must have valid category_id** - No orphan parts
2. **Parts metadata must validate against category specs** - See `category-specs.json`
3. **Slugs must be lowercase, hyphenated, URL-safe** - Regex: `^[a-z0-9]+(?:-[a-z0-9]+)*$`
4. **Brand names must be normalized** - Use canonical name from brands table
5. **needs_review flag** - Set automatically when:
   - Required metadata fields are missing
   - Values fall outside expected ranges
   - Brand cannot be matched
   - Duplicate SKU/name detected

---

## Ingestion Agent Contract

The Data Ingestion Agent MUST:

1. Normalize all brand names against `brand-aliases.json`
2. Extract metadata specs using patterns from `extraction-patterns.json`
3. Validate all parts against `category-specs.json`
4. Set `needs_review = true` for any validation failures
5. Generate dry-run reports before committing
6. Log all transformations for audit trail

### Input Formats Accepted
- CSV (with header row)
- JSON (array of objects)
- JSONL (newline-delimited JSON)
- Copy/paste tabular data (TSV)

### Output Modes
- `dry-run`: Validate and report, no database changes
- `commit`: Write validated records to database
- `report-only`: Generate analysis report of input data

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-16 | System | Initial specification |
