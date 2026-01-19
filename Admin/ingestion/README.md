# Data Ingestion & Normalization Agent

The Data Ingestion Agent handles all data import operations for GoKartPartPicker.com. It processes CSV files, vendor data feeds, and copy/paste content to produce normalized, validated, and spec-enriched part records.

## Features

- **Multi-format Input**: CSV, JSON, JSONL, TSV, and stdin (copy/paste)
- **Brand Normalization**: Matches brand names against known aliases with fuzzy matching
- **Spec Extraction**: Automatically extracts specifications from part names/descriptions:
  - Engine family detection (Predator 212, Honda GX200, etc.)
  - Bore sizes
  - Chain sizes (#35, #40, #41, etc.)
  - Carburetor models (Mikuni VM22, PWK28, etc.)
  - Torque converter series (TAV2, Comet 30, etc.)
  - And many more...
- **Category Validation**: Validates extracted metadata against `category-specs.json`
- **Duplicate Detection**: Identifies potential duplicate parts
- **Comprehensive Reporting**: Dry-run reports, commit summaries, needs_review flags

## Quick Start

### Command Line Usage

```bash
# Dry run (preview what would be imported)
python ingest.py --file parts.csv --mode dry-run

# Commit data to database
python ingest.py --file parts.csv --mode commit

# Read from stdin (copy/paste data)
cat vendor_export.tsv | python ingest.py --stdin --format tsv --mode dry-run

# Report only (analysis without commit)
python ingest.py --file parts.csv --mode report-only --output-dir ./reports
```

### Python API Usage

```python
from pathlib import Path
from ingestion import DataIngestionAgent

# Initialize agent
agent = DataIngestionAgent(mode='dry-run', verbose=True)

# Ingest from file
batch = agent.ingest_file(Path('parts.csv'))

# Check results
print(f"Ready: {batch.ready_count}")
print(f"Needs Review: {batch.needs_review_count}")
print(f"Invalid: {batch.invalid_count}")

# Or process data directly
data = [
    {"name": "Predator 212 Hemi Billet Rod", "brand": "ARC Racing"},
    {"name": "Mikuni VM22 Carburetor 26mm", "brand": "Mikuni"},
]
batch = agent.ingest_data(data)
```

### Individual Components

```python
from ingestion import (
    normalize_part_data,
    extract_specs,
    validate_part_data,
    identify_engine_family
)

# Normalize a part
normalized = normalize_part_data(
    name="pred 212 hemi rod",
    brand="arc racing",
    description="Billet connecting rod for predator 212 hemi"
)
# Returns: {'name': {...}, 'brand': {...}, 'category': {...}, 'needs_review': False}

# Extract specs from text
specs = extract_specs(
    name="70mm Bore Forged Piston for Predator 212",
    description="+0.5mm oversize"
)
# Returns: {'metadata': {'bore_mm': 70.0, 'displacement_cc': 212, ...}, ...}

# Validate against category specs
result = validate_part_data(
    category='engines/pistons',
    metadata={'bore_mm': 70.0, 'material': 'forged'}
)
# Returns: {'is_valid': True, 'issues': [...], ...}

# Identify engine family
family, confidence = identify_engine_family("Predator 212 Hemi Racing Engine")
# Returns: ('Predator 212 Hemi', 0.9)
```

## Input File Formats

### CSV

Standard CSV with header row. Supports flexible column names:

```csv
name,brand,category,description,price
Predator 212 Hemi,Predator,engines/complete-engines,212cc OHV Engine,299.99
```

Supported column name aliases:
- **name**: `name`, `part_name`, `title`, `product_name`, `Name`, `Title`
- **brand**: `brand`, `manufacturer`, `Brand`, `Manufacturer`, `mfg`
- **category**: `category`, `cat`, `Category`, `product_category`, `type`
- **description**: `description`, `desc`, `Description`, `product_description`
- **sku**: `sku`, `SKU`, `part_number`, `part_no`, `item_number`

### JSON

Array of objects:

```json
[
  {
    "name": "Predator 212 Hemi",
    "brand": "Predator",
    "category": "engines/complete-engines",
    "description": "212cc OHV Engine"
  }
]
```

### JSONL

One JSON object per line:

```jsonl
{"name": "Predator 212 Hemi", "brand": "Predator"}
{"name": "Mikuni VM22", "brand": "Mikuni"}
```

### TSV / Copy-Paste

Tab-separated with header row (great for copy/paste from spreadsheets):

```
name	brand	category
Predator 212 Hemi	Predator	engines/complete-engines
```

## Output Reports

All reports are written to the `output/` directory (or custom `--output-dir`).

### Dry Run Report (`dry-run-{batch_id}.txt`)

Human-readable summary showing:
- Record counts by status
- Category breakdown
- Brand breakdown
- Items needing review (with reasons)
- Invalid items (with errors)
- Sample of ready items

### JSON Report (`report-{batch_id}.json`)

Complete structured data including:
- All original data
- Normalized values
- Extracted specifications
- Validation results
- Status and review reasons

### Needs Review CSV (`needs-review-{batch_id}.csv`)

Spreadsheet-friendly list of items requiring attention:

```csv
row,name,brand,category,status,reasons,suggested_fixes
```

### Extraction Analysis (`analysis-{batch_id}.txt`)

Analysis of extraction patterns:
- Extraction confidence distribution
- Fields extracted by frequency
- Engine families detected
- Top values for each field

### Commit Summary (`commit-{batch_id}.txt`)

Post-commit report showing:
- Successfully committed IDs
- Skipped records
- Flagged items

## Configuration Files

### `config/category-specs.json`

Defines required and optional fields per category, with validation rules:

```json
{
  "categories": {
    "engines/complete-engines": {
      "required": ["displacement_cc", "valve_config", "shaft_diameter_in"],
      "optional": ["bore_mm", "stroke_mm", "variant", ...],
      "specs": {
        "displacement_cc": {
          "type": "integer",
          "min": 50,
          "max": 1000,
          "unit": "cc"
        }
      }
    }
  }
}
```

### `config/brand-aliases.json`

Maps brand aliases to canonical names:

```json
{
  "brands": {
    "predator": {
      "canonical": "Predator",
      "slug": "predator",
      "aliases": ["predator", "harbor freight predator", "hf predator", "pred"]
    }
  }
}
```

### `config/extraction-patterns.json`

Regex patterns for extracting specifications:

```json
{
  "engine_families": {
    "patterns": [
      {
        "family": "Predator 212 Hemi",
        "patterns": ["predator\\s*212\\s*hemi"],
        "displacement_cc": 212,
        "variant": "Hemi"
      }
    ]
  }
}
```

## Modes

### `dry-run` (default)

- Processes all records
- Validates and extracts specs
- Generates all reports
- **Does NOT write to database**
- Use to preview before committing

### `commit`

- Processes all records
- Validates and extracts specs
- **Writes valid records to database**
- Generates commit summary
- Skips invalid/duplicate records
- Flags items needing review

### `report-only`

- Processes all records
- Generates analysis reports
- No database interaction
- Use for data quality analysis

## Exit Codes

- `0`: Success, all records valid and ready
- `1`: Some records flagged for review
- `2`: Some records invalid
- `3`: Error during processing

## Architecture

```
ingestion/
├── ingest.py           # Main entry point & orchestration
├── normalizers.py      # Brand, name, category normalization
├── extractors.py       # Spec extraction from text
├── validators.py       # Validation against category-specs
├── reporters.py        # Report generation
├── __init__.py         # Package exports
├── config/
│   ├── category-specs.json     # Validation rules
│   ├── brand-aliases.json      # Brand normalization
│   └── extraction-patterns.json # Regex patterns
├── input/              # Drop files here for processing
├── output/             # Generated reports
└── README.md           # This file
```

## Integration with db-spec.md

This agent produces data conforming to the schema in `/docs/db-spec.md`:

- `parts` table: Normalized name, brand_id, category_id, metadata JSONB
- `brands` table: Uses canonical names from brand-aliases.json
- `engine_families`: Detected and linked via compatibility
- Validation ensures metadata matches category requirements

## Specification Key Mapping

The ingestion system uses canonical key names in the `specifications` JSONB field. These keys are used by both the database and frontend compatibility engine.

### Category Path to Enum Mapping

Ingestion uses hierarchical paths, while the database uses flat enums:

| Ingestion Path | Database Enum |
|----------------|---------------|
| `engines/complete-engines` | `other` (or specific category) |
| `engines/pistons` | `piston` |
| `engines/camshafts` | `camshaft` |
| `clutches/centrifugal-clutches` | `clutch` |
| `torque-converters/driver-units` | `torque_converter` |
| `chains-sprockets/chains` | `chain` |
| `chains-sprockets/axle-sprockets` | `sprocket` |
| `exhaust/headers` | `header` |
| `carburetors/complete-carburetors` | `carburetor` |
| `air-filtration/air-filters` | `air_filter` |
| `ignition/coils` | `ignition` |
| `fuel-system/fuel-pumps` | `fuel_system` |

### Canonical Specification Keys

These are the standard key names stored in `parts.specifications`:

| Key | Type | Unit | Used By |
|-----|------|------|---------|
| `bore_in` | decimal | inches | Clutches, TCs, Sprockets |
| `bore_mm` | decimal | mm | Pistons, Cylinders |
| `chain_size` | enum | #35/#40/#41/#420 | Chains, Clutches, Sprockets |
| `pitch_in` | decimal | inches | Chains (derived from chain_size) |
| `engagement_rpm` | integer | RPM | Clutches, TCs |
| `teeth` | integer | count | Sprockets |
| `displacement_cc` | integer | cc | Engines |
| `throat_diameter_mm` | integer | mm | Carburetors |
| `series` | enum | TAV2/Comet 30/etc | Torque Converters |
| `keyway` | enum | 3/16"/1/4"/5mm/6mm | Shafts, Clutches |

### Frontend Compatibility Keys

The frontend compatibility engine (`use-compatibility.ts`) expects these keys in `part.specifications`:

| Frontend Key | Ingestion Key | Notes |
|--------------|---------------|-------|
| `bore_diameter` | `bore_in` | Alias - either works |
| `pitch` | `chain_size` | Frontend uses chain_size string |
| `wheel_diameter` | `diameter` | Wheels |
| `bolt_pattern` | `bolt_pattern` | Same |

**Note:** The compatibility engine handles both key variants for backwards compatibility.

## Adding New Categories

1. Add category to `config/category-specs.json` with required/optional specs
2. Add keyword mappings in `normalizers.py` → `CategoryNormalizer._build_keyword_map()`
3. Add extraction patterns to `config/extraction-patterns.json` if needed

## Adding New Brands

1. Add brand entry to `config/brand-aliases.json`
2. Include all known aliases/misspellings
3. Fuzzy matching (85% threshold) handles minor variations automatically

## Troubleshooting

### "Unknown brand" warnings

Brand not recognized. Options:
1. Add brand to `brand-aliases.json`
2. Review and fix manually after import

### "Missing required field" errors

Category requires certain specs that weren't extracted or provided. Options:
1. Add data to source file
2. Add extraction pattern if data is in name/description
3. Import without category and assign manually

### Low category confidence

Category couldn't be reliably determined. Provide explicit category in source data.
