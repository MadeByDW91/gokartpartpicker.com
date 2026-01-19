"""
Go-Kart Part Picker - Data Ingestion & Normalization Agent

This module provides tools for ingesting, normalizing, extracting specs,
validating, and reporting on go-kart part data.

Main Components:
    - DataIngestionAgent: Main orchestration class
    - BrandNormalizer: Normalizes brand names
    - NameNormalizer: Normalizes part names
    - CategoryNormalizer: Suggests and validates categories
    - SpecExtractor: Extracts specifications from text
    - CategoryValidator: Validates metadata against category-specs
    - ReportGenerator: Generates various report formats

Usage:
    from ingestion import DataIngestionAgent
    
    agent = DataIngestionAgent(mode='dry-run')
    batch = agent.ingest_file(Path('parts.csv'))
    
    # Or programmatically
    from ingestion import normalize_part_data, extract_specs, validate_part_data
    
    normalized = normalize_part_data(name, brand, description)
    specs = extract_specs(name, description)
    validation = validate_part_data(category, specs['metadata'])
"""

__version__ = '1.0.0'
__author__ = 'GoKartPartPicker Team'

# Main ingestion agent
from .ingest import DataIngestionAgent

# Normalizers
from .normalizers import (
    BrandNormalizer,
    NameNormalizer,
    CategoryNormalizer,
    UnitNormalizer,
    normalize_part_data
)

# Extractors
from .extractors import (
    SpecExtractor,
    EngineFamilyMatcher,
    extract_specs,
    identify_engine_family
)

# Validators
from .validators import (
    CategoryValidator,
    PartValidator,
    DuplicateDetector,
    ValidationResult,
    ValidationIssue,
    validate_part_data
)

# Reporters
from .reporters import (
    ReportGenerator,
    ConsoleReporter,
    IngestionBatchReport,
    PartIngestionRecord,
    generate_batch_id
)

__all__ = [
    # Agent
    'DataIngestionAgent',
    
    # Normalizers
    'BrandNormalizer',
    'NameNormalizer', 
    'CategoryNormalizer',
    'UnitNormalizer',
    'normalize_part_data',
    
    # Extractors
    'SpecExtractor',
    'EngineFamilyMatcher',
    'extract_specs',
    'identify_engine_family',
    
    # Validators
    'CategoryValidator',
    'PartValidator',
    'DuplicateDetector',
    'ValidationResult',
    'ValidationIssue',
    'validate_part_data',
    
    # Reporters
    'ReportGenerator',
    'ConsoleReporter',
    'IngestionBatchReport',
    'PartIngestionRecord',
    'generate_batch_id',
]
