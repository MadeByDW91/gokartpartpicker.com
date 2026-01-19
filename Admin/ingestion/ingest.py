#!/usr/bin/env python3
"""
Go-Kart Part Picker - Data Ingestion Agent

Main entry point for ingesting part data from various sources:
- CSV files
- Vendor lists (JSON/JSONL)
- Copy/paste tabular data (TSV)

Usage:
    python ingest.py --file parts.csv --mode dry-run
    python ingest.py --file parts.csv --mode commit
    python ingest.py --file parts.csv --mode report-only
    python ingest.py --stdin --format tsv --mode dry-run

Output:
    - Dry-run reports (what would be ingested)
    - Commit summaries (what was ingested)
    - needs_review flags and reports
    - JSON reports with full details
"""

import argparse
import csv
import json
import sys
from pathlib import Path
from typing import Optional, Dict, Any, List, Generator
from io import StringIO

# Local imports
from normalizers import BrandNormalizer, NameNormalizer, CategoryNormalizer, UnitNormalizer
from extractors import SpecExtractor
from validators import CategoryValidator, PartValidator, DuplicateDetector
from reporters import (
    ReportGenerator, ConsoleReporter, 
    IngestionBatchReport, PartIngestionRecord,
    generate_batch_id, get_timestamp
)


class DataIngestionAgent:
    """
    Main ingestion agent that orchestrates the ingestion pipeline.
    
    Pipeline stages:
    1. Parse input data
    2. Normalize (brands, names, categories)
    3. Extract specifications
    4. Validate against category-specs
    5. Detect duplicates
    6. Generate reports
    7. Commit (if mode=commit)
    """
    
    def __init__(self, mode: str = 'dry-run', verbose: bool = True):
        """
        Initialize the ingestion agent.
        
        Args:
            mode: One of 'dry-run', 'commit', 'report-only'
            verbose: Whether to print progress to console
        """
        self.mode = mode
        self.verbose = verbose
        
        # Initialize components
        self.brand_normalizer = BrandNormalizer()
        self.name_normalizer = NameNormalizer()
        self.category_normalizer = CategoryNormalizer()
        self.unit_normalizer = UnitNormalizer()
        self.spec_extractor = SpecExtractor()
        self.category_validator = CategoryValidator()
        self.part_validator = PartValidator()
        
        # Report generators
        self.report_generator = ReportGenerator()
        self.console_reporter = ConsoleReporter()
        
        # Duplicate detector (would be populated from DB in production)
        self.duplicate_detector = DuplicateDetector([])
    
    def ingest_file(self, file_path: Path, file_format: Optional[str] = None) -> IngestionBatchReport:
        """
        Ingest a file.
        
        Args:
            file_path: Path to the input file
            file_format: Force format (csv, json, jsonl, tsv). Auto-detected if None.
        
        Returns:
            IngestionBatchReport
        """
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        # Auto-detect format
        if file_format is None:
            suffix = file_path.suffix.lower()
            format_map = {
                '.csv': 'csv',
                '.json': 'json',
                '.jsonl': 'jsonl',
                '.tsv': 'tsv',
                '.txt': 'tsv'  # Assume TSV for txt files
            }
            file_format = format_map.get(suffix, 'csv')
        
        if self.verbose:
            print(f"\n📂 Loading file: {file_path}")
            print(f"   Format: {file_format}")
        
        # Parse the file
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        records = list(self._parse_content(content, file_format))
        
        if self.verbose:
            print(f"   Found {len(records)} records")
        
        return self._process_records(records, source_file=str(file_path))
    
    def ingest_stdin(self, file_format: str = 'tsv') -> IngestionBatchReport:
        """
        Ingest from stdin (for copy/paste data).
        
        Args:
            file_format: Format of input data
        
        Returns:
            IngestionBatchReport
        """
        if self.verbose:
            print("\n📋 Reading from stdin...")
        
        content = sys.stdin.read()
        records = list(self._parse_content(content, file_format))
        
        if self.verbose:
            print(f"   Found {len(records)} records")
        
        return self._process_records(records, source_file='stdin')
    
    def ingest_data(self, data: List[Dict[str, Any]], source: str = 'direct') -> IngestionBatchReport:
        """
        Ingest data directly from a list of dictionaries.
        
        Args:
            data: List of part dictionaries
            source: Source identifier
        
        Returns:
            IngestionBatchReport
        """
        if self.verbose:
            print(f"\n📥 Processing {len(data)} records from {source}...")
        
        return self._process_records(data, source_file=source)
    
    def _parse_content(self, content: str, file_format: str) -> Generator[Dict[str, Any], None, None]:
        """Parse content based on format."""
        if file_format == 'csv':
            yield from self._parse_csv(content)
        elif file_format == 'tsv':
            yield from self._parse_tsv(content)
        elif file_format == 'json':
            yield from self._parse_json(content)
        elif file_format == 'jsonl':
            yield from self._parse_jsonl(content)
        else:
            raise ValueError(f"Unknown format: {file_format}")
    
    def _parse_csv(self, content: str) -> Generator[Dict[str, Any], None, None]:
        """Parse CSV content."""
        reader = csv.DictReader(StringIO(content))
        for row in reader:
            yield {k: v.strip() if v else '' for k, v in row.items()}
    
    def _parse_tsv(self, content: str) -> Generator[Dict[str, Any], None, None]:
        """Parse TSV content."""
        reader = csv.DictReader(StringIO(content), delimiter='\t')
        for row in reader:
            yield {k: v.strip() if v else '' for k, v in row.items()}
    
    def _parse_json(self, content: str) -> Generator[Dict[str, Any], None, None]:
        """Parse JSON content (array of objects)."""
        data = json.loads(content)
        if isinstance(data, list):
            yield from data
        else:
            yield data
    
    def _parse_jsonl(self, content: str) -> Generator[Dict[str, Any], None, None]:
        """Parse JSONL content (one JSON object per line)."""
        for line in content.strip().split('\n'):
            if line.strip():
                yield json.loads(line)
    
    def _process_records(self, records: List[Dict[str, Any]], 
                         source_file: str) -> IngestionBatchReport:
        """Process a list of records through the ingestion pipeline."""
        batch_id = generate_batch_id()
        timestamp = get_timestamp()
        
        processed_records: List[PartIngestionRecord] = []
        ready_count = 0
        needs_review_count = 0
        invalid_count = 0
        duplicate_count = 0
        
        for i, record in enumerate(records):
            if self.verbose and (i + 1) % 100 == 0:
                print(f"   Processing record {i + 1}/{len(records)}...")
            
            processed = self._process_single_record(record, row_number=i + 1, source_file=source_file)
            processed_records.append(processed)
            
            if processed.status == 'ready':
                ready_count += 1
            elif processed.status == 'needs_review':
                needs_review_count += 1
            elif processed.status == 'invalid':
                invalid_count += 1
            elif processed.status == 'duplicate':
                duplicate_count += 1
        
        batch = IngestionBatchReport(
            batch_id=batch_id,
            timestamp=timestamp,
            mode=self.mode,
            source_file=source_file,
            total_records=len(records),
            ready_count=ready_count,
            needs_review_count=needs_review_count,
            invalid_count=invalid_count,
            duplicate_count=duplicate_count,
            records=processed_records
        )
        
        # Generate reports
        self._generate_reports(batch)
        
        # Print console summary
        if self.verbose:
            self.console_reporter.print_summary(batch)
            if batch.needs_review_count > 0 or batch.invalid_count > 0:
                self.console_reporter.print_validation_issues(batch)
        
        # Commit if in commit mode
        if self.mode == 'commit':
            self._commit_records(batch)
        
        return batch
    
    def _process_single_record(self, record: Dict[str, Any], 
                                row_number: int,
                                source_file: str) -> PartIngestionRecord:
        """Process a single record through the pipeline."""
        # Get input fields (support various column name formats)
        name = self._get_field(record, ['name', 'part_name', 'title', 'product_name', 'Name', 'Title'])
        brand = self._get_field(record, ['brand', 'manufacturer', 'Brand', 'Manufacturer', 'mfg'])
        description = self._get_field(record, ['description', 'desc', 'Description', 'product_description'])
        category = self._get_field(record, ['category', 'cat', 'Category', 'product_category', 'type'])
        sku = self._get_field(record, ['sku', 'SKU', 'part_number', 'part_no', 'item_number'])
        price = self._get_field(record, ['price', 'Price', 'cost', 'msrp'])
        
        # Stage 1: Normalize
        normalized_name = self.name_normalizer.normalize(name)
        normalized_brand = self.brand_normalizer.normalize(brand)
        
        # Stage 2: Suggest category if not provided
        if not category:
            suggested_cat, confidence = self.category_normalizer.suggest_category(name, description)
            category_result = {
                'slug': suggested_cat,
                'confidence': confidence,
                'suggested': True
            }
        else:
            category_result = {
                'slug': category.lower().replace(' ', '-'),
                'confidence': 1.0 if self.category_normalizer.validate_category(category) else 0.5,
                'suggested': False
            }
        
        # Stage 3: Extract specifications
        extraction_report = self.spec_extractor.extract_all(
            name=name,
            description=description,
            existing_data=self._extract_existing_specs(record)
        )
        
        # Stage 4: Validate
        validation_result = {'is_valid': True, 'issues': [], 'needs_review': False}
        if category_result['slug']:
            val_result = self.category_validator.validate(
                category_result['slug'],
                extraction_report.metadata
            )
            validation_result = val_result.to_dict()
        
        # Stage 5: Check for duplicates
        duplicates = self.duplicate_detector.find_duplicates(name, brand, sku)
        is_duplicate = len(duplicates) > 0 and duplicates[0].get('similarity', 0) > 0.95
        
        # Determine status
        review_reasons = []
        
        if not validation_result.get('is_valid', True):
            status = 'invalid'
        elif is_duplicate:
            status = 'duplicate'
            review_reasons.append('duplicate_detected')
        elif (normalized_brand.get('needs_review') or 
              extraction_report.needs_review or
              validation_result.get('needs_review') or
              category_result.get('confidence', 0) < 0.7):
            status = 'needs_review'
            
            if normalized_brand.get('needs_review'):
                review_reasons.append(normalized_brand.get('reason', 'brand_issue'))
            if extraction_report.needs_review:
                review_reasons.extend(extraction_report.review_reasons)
            if category_result.get('confidence', 0) < 0.7:
                review_reasons.append('low_category_confidence')
        else:
            status = 'ready'
        
        return PartIngestionRecord(
            original_data=record,
            normalized_data={
                'name': normalized_name,
                'brand': normalized_brand,
                'category': category_result,
                'sku': sku,
                'description': description,
                'price': price
            },
            extracted_specs=extraction_report.to_dict(),
            validation_result=validation_result,
            status=status,
            review_reasons=review_reasons,
            row_number=row_number,
            source_file=source_file
        )
    
    def _get_field(self, record: Dict[str, Any], field_names: List[str]) -> str:
        """Get a field value trying multiple possible column names."""
        for name in field_names:
            if name in record and record[name]:
                value = record[name]
                if isinstance(value, str):
                    return value.strip()
                return str(value)
        return ''
    
    def _extract_existing_specs(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """Extract any pre-existing specs from the record."""
        specs = {}
        
        # Map common column names to spec fields
        spec_columns = {
            'bore': 'bore_mm',
            'bore_mm': 'bore_mm',
            'bore_in': 'bore_in',
            'displacement': 'displacement_cc',
            'displacement_cc': 'displacement_cc',
            'cc': 'displacement_cc',
            'chain': 'chain_size',
            'chain_size': 'chain_size',
            'teeth': 'teeth',
            'sprocket_teeth': 'teeth',
            'engagement_rpm': 'engagement_rpm',
            'throat_diameter': 'throat_diameter_mm',
            'series': 'series',
        }
        
        for col, spec_field in spec_columns.items():
            if col in record and record[col]:
                value = record[col]
                # Try to convert to number if appropriate
                try:
                    if '.' in str(value):
                        value = float(value)
                    else:
                        value = int(value)
                except (ValueError, TypeError):
                    pass
                specs[spec_field] = value
        
        return specs
    
    def _generate_reports(self, batch: IngestionBatchReport):
        """Generate all applicable reports."""
        if self.verbose:
            print("\n📄 Generating reports...")
        
        reports = []
        
        # Always generate JSON report
        json_path = self.report_generator.generate_json_report(batch)
        reports.append(('JSON Report', json_path))
        
        if self.mode == 'dry-run':
            dry_run_path = self.report_generator.generate_dry_run_report(batch)
            reports.append(('Dry Run Report', dry_run_path))
        
        if batch.needs_review_count > 0 or batch.invalid_count > 0:
            review_path = self.report_generator.generate_needs_review_report(batch)
            reports.append(('Needs Review CSV', review_path))
        
        # Extraction analysis
        analysis_path = self.report_generator.generate_extraction_analysis(batch)
        reports.append(('Extraction Analysis', analysis_path))
        
        if self.verbose:
            for report_type, path in reports:
                print(f"   ✓ {report_type}: {path}")
    
    def _commit_records(self, batch: IngestionBatchReport):
        """Commit records to database (placeholder for actual DB integration)."""
        if self.verbose:
            print("\n💾 Committing to database...")
        
        committed_ids = []
        
        for record in batch.records:
            if record.status == 'ready':
                # In production, this would insert into the database
                # For now, we'll just generate a fake ID
                import uuid
                part_id = str(uuid.uuid4())
                committed_ids.append(part_id)
        
        if self.verbose:
            print(f"   ✓ Committed {len(committed_ids)} records")
        
        # Generate commit summary
        commit_path = self.report_generator.generate_commit_summary(batch, committed_ids)
        if self.verbose:
            print(f"   ✓ Commit Summary: {commit_path}")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='Go-Kart Part Picker - Data Ingestion Agent',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Dry run with a CSV file
  python ingest.py --file parts.csv --mode dry-run
  
  # Commit data from JSON
  python ingest.py --file vendor-data.json --mode commit
  
  # Read TSV from stdin (copy/paste)
  cat data.tsv | python ingest.py --stdin --format tsv --mode dry-run
  
  # Report only (no commit, just analysis)
  python ingest.py --file parts.csv --mode report-only
        """
    )
    
    # Input source
    input_group = parser.add_mutually_exclusive_group(required=True)
    input_group.add_argument('--file', '-f', type=Path,
                             help='Input file path (CSV, JSON, JSONL, TSV)')
    input_group.add_argument('--stdin', action='store_true',
                             help='Read from stdin (for copy/paste data)')
    
    # Options
    parser.add_argument('--format', choices=['csv', 'json', 'jsonl', 'tsv'],
                        help='Force input format (auto-detected for files)')
    parser.add_argument('--mode', '-m', 
                        choices=['dry-run', 'commit', 'report-only'],
                        default='dry-run',
                        help='Ingestion mode (default: dry-run)')
    parser.add_argument('--quiet', '-q', action='store_true',
                        help='Suppress console output')
    parser.add_argument('--output-dir', '-o', type=Path,
                        help='Output directory for reports')
    
    args = parser.parse_args()
    
    # Initialize agent
    agent = DataIngestionAgent(
        mode=args.mode,
        verbose=not args.quiet
    )
    
    if args.output_dir:
        agent.report_generator.output_dir = args.output_dir
        args.output_dir.mkdir(parents=True, exist_ok=True)
    
    # Run ingestion
    try:
        if args.stdin:
            batch = agent.ingest_stdin(file_format=args.format or 'tsv')
        else:
            batch = agent.ingest_file(args.file, file_format=args.format)
        
        # Exit with appropriate code
        if batch.invalid_count > 0:
            sys.exit(2)  # Some records invalid
        elif batch.needs_review_count > 0:
            sys.exit(1)  # Some records need review
        else:
            sys.exit(0)  # All good
            
    except Exception as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        if not args.quiet:
            import traceback
            traceback.print_exc()
        sys.exit(3)


if __name__ == '__main__':
    main()
