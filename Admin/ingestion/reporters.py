"""
Reporters for Go-Kart Part Data Ingestion

Generates various reports:
- Dry-run reports (before committing)
- Commit summaries
- Validation reports
- JSON export reports
- needs_review summaries
"""

import json
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, field, asdict


@dataclass
class PartIngestionRecord:
    """Record of a single part ingestion."""
    original_data: Dict[str, Any]
    normalized_data: Dict[str, Any]
    extracted_specs: Dict[str, Any]
    validation_result: Dict[str, Any]
    status: str  # 'ready', 'needs_review', 'invalid', 'duplicate'
    review_reasons: List[str] = field(default_factory=list)
    row_number: Optional[int] = None
    source_file: Optional[str] = None


@dataclass
class IngestionBatchReport:
    """Report for a batch ingestion operation."""
    batch_id: str
    timestamp: str
    mode: str  # 'dry-run', 'commit', 'report-only'
    source_file: Optional[str]
    total_records: int
    ready_count: int
    needs_review_count: int
    invalid_count: int
    duplicate_count: int
    records: List[PartIngestionRecord]
    summary: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'batch_id': self.batch_id,
            'timestamp': self.timestamp,
            'mode': self.mode,
            'source_file': self.source_file,
            'statistics': {
                'total': self.total_records,
                'ready': self.ready_count,
                'needs_review': self.needs_review_count,
                'invalid': self.invalid_count,
                'duplicate': self.duplicate_count
            },
            'summary': self.summary,
            'records': [asdict(r) for r in self.records]
        }


class ReportGenerator:
    """Generates various report formats."""
    
    def __init__(self, output_dir: Optional[Path] = None):
        if output_dir is None:
            output_dir = Path(__file__).parent / "output"
        
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def generate_dry_run_report(self, batch: IngestionBatchReport) -> str:
        """
        Generate a dry-run report showing what would be ingested.
        
        Returns:
            Path to the generated report file
        """
        report_lines = [
            "=" * 80,
            "DRY RUN INGESTION REPORT",
            "=" * 80,
            f"",
            f"Batch ID:    {batch.batch_id}",
            f"Timestamp:   {batch.timestamp}",
            f"Source:      {batch.source_file or 'N/A'}",
            f"Mode:        {batch.mode}",
            f"",
            "-" * 80,
            "SUMMARY",
            "-" * 80,
            f"",
            f"Total Records:    {batch.total_records}",
            f"Ready to Commit:  {batch.ready_count}",
            f"Needs Review:     {batch.needs_review_count}",
            f"Invalid:          {batch.invalid_count}",
            f"Duplicates:       {batch.duplicate_count}",
            f"",
        ]
        
        # Category breakdown
        categories = {}
        brands = {}
        for record in batch.records:
            cat = record.normalized_data.get('category', {}).get('slug', 'uncategorized')
            brand = record.normalized_data.get('brand', {}).get('canonical', 'Unknown')
            
            categories[cat] = categories.get(cat, 0) + 1
            brands[brand] = brands.get(brand, 0) + 1
        
        report_lines.extend([
            "-" * 80,
            "BY CATEGORY",
            "-" * 80,
            ""
        ])
        for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
            report_lines.append(f"  {cat}: {count}")
        
        report_lines.extend([
            "",
            "-" * 80,
            "BY BRAND",
            "-" * 80,
            ""
        ])
        for brand, count in sorted(brands.items(), key=lambda x: -x[1]):
            report_lines.append(f"  {brand}: {count}")
        
        # Needs review section
        if batch.needs_review_count > 0:
            report_lines.extend([
                "",
                "-" * 80,
                "ITEMS NEEDING REVIEW",
                "-" * 80,
                ""
            ])
            
            for record in batch.records:
                if record.status == 'needs_review':
                    name = record.normalized_data.get('name', {}).get('normalized', 'Unknown')
                    reasons = ', '.join(record.review_reasons) if record.review_reasons else 'Unknown reason'
                    row = f"Row {record.row_number}: " if record.row_number else ""
                    report_lines.append(f"  {row}{name}")
                    report_lines.append(f"    Reasons: {reasons}")
                    report_lines.append("")
        
        # Invalid items section
        if batch.invalid_count > 0:
            report_lines.extend([
                "-" * 80,
                "INVALID ITEMS",
                "-" * 80,
                ""
            ])
            
            for record in batch.records:
                if record.status == 'invalid':
                    name = record.original_data.get('name', 'Unknown')
                    errors = record.validation_result.get('issues', [])
                    error_msgs = [e.get('message', '') for e in errors if e.get('severity') == 'error']
                    
                    row = f"Row {record.row_number}: " if record.row_number else ""
                    report_lines.append(f"  {row}{name}")
                    for msg in error_msgs:
                        report_lines.append(f"    - {msg}")
                    report_lines.append("")
        
        # Sample of ready items
        ready_items = [r for r in batch.records if r.status == 'ready']
        if ready_items:
            report_lines.extend([
                "-" * 80,
                f"READY TO COMMIT (showing first 10 of {len(ready_items)})",
                "-" * 80,
                ""
            ])
            
            for record in ready_items[:10]:
                name = record.normalized_data.get('name', {}).get('normalized', 'Unknown')
                brand = record.normalized_data.get('brand', {}).get('canonical', 'Unknown')
                cat = record.normalized_data.get('category', {}).get('slug', 'Unknown')
                
                report_lines.append(f"  • {name}")
                report_lines.append(f"    Brand: {brand} | Category: {cat}")
                
                # Show extracted specs
                specs = record.extracted_specs.get('metadata', {})
                if specs:
                    spec_str = ', '.join([f"{k}={v}" for k, v in list(specs.items())[:5]])
                    report_lines.append(f"    Specs: {spec_str}")
                report_lines.append("")
        
        report_lines.extend([
            "=" * 80,
            "END OF REPORT",
            "=" * 80
        ])
        
        # Write report
        report_content = '\n'.join(report_lines)
        report_path = self.output_dir / f"dry-run-{batch.batch_id}.txt"
        
        with open(report_path, 'w') as f:
            f.write(report_content)
        
        return str(report_path)
    
    def generate_json_report(self, batch: IngestionBatchReport) -> str:
        """
        Generate a JSON report with full details.
        
        Returns:
            Path to the generated report file
        """
        report_path = self.output_dir / f"report-{batch.batch_id}.json"
        
        with open(report_path, 'w') as f:
            json.dump(batch.to_dict(), f, indent=2, default=str)
        
        return str(report_path)
    
    def generate_needs_review_report(self, batch: IngestionBatchReport) -> str:
        """
        Generate a CSV-style report of items needing review.
        
        Returns:
            Path to the generated report file
        """
        lines = [
            "row,name,brand,category,status,reasons,suggested_fixes"
        ]
        
        for record in batch.records:
            if record.status in ('needs_review', 'invalid'):
                row = record.row_number or ''
                name = record.normalized_data.get('name', {}).get('normalized', '')
                name = name.replace('"', '""')  # Escape quotes for CSV
                brand = record.normalized_data.get('brand', {}).get('canonical', '')
                cat = record.normalized_data.get('category', {}).get('slug', '')
                reasons = '; '.join(record.review_reasons)
                
                # Collect suggestions
                suggestions = []
                for issue in record.validation_result.get('issues', []):
                    if issue.get('suggestion'):
                        suggestions.append(issue['suggestion'])
                suggestion_str = '; '.join(suggestions)
                
                lines.append(
                    f'{row},"{name}","{brand}","{cat}",{record.status},"{reasons}","{suggestion_str}"'
                )
        
        report_path = self.output_dir / f"needs-review-{batch.batch_id}.csv"
        
        with open(report_path, 'w') as f:
            f.write('\n'.join(lines))
        
        return str(report_path)
    
    def generate_commit_summary(self, batch: IngestionBatchReport, 
                                 committed_ids: List[str]) -> str:
        """
        Generate a summary report after committing to database.
        
        Returns:
            Path to the generated report file
        """
        report_lines = [
            "=" * 80,
            "COMMIT SUMMARY REPORT",
            "=" * 80,
            f"",
            f"Batch ID:    {batch.batch_id}",
            f"Timestamp:   {batch.timestamp}",
            f"Source:      {batch.source_file or 'N/A'}",
            f"",
            "-" * 80,
            "RESULTS",
            "-" * 80,
            f"",
            f"Successfully Committed: {len(committed_ids)}",
            f"Skipped (Invalid):      {batch.invalid_count}",
            f"Skipped (Duplicate):    {batch.duplicate_count}",
            f"Flagged for Review:     {batch.needs_review_count}",
            f"",
        ]
        
        if committed_ids:
            report_lines.extend([
                "-" * 80,
                "COMMITTED PART IDs",
                "-" * 80,
                ""
            ])
            for pid in committed_ids[:50]:
                report_lines.append(f"  {pid}")
            
            if len(committed_ids) > 50:
                report_lines.append(f"  ... and {len(committed_ids) - 50} more")
        
        report_lines.extend([
            "",
            "=" * 80,
            "END OF COMMIT SUMMARY",
            "=" * 80
        ])
        
        report_content = '\n'.join(report_lines)
        report_path = self.output_dir / f"commit-{batch.batch_id}.txt"
        
        with open(report_path, 'w') as f:
            f.write(report_content)
        
        return str(report_path)
    
    def generate_extraction_analysis(self, batch: IngestionBatchReport) -> str:
        """
        Generate an analysis of extracted specifications.
        
        Returns:
            Path to the generated report file
        """
        # Collect extraction statistics
        field_counts = {}
        field_values = {}
        engine_families = {}
        confidence_levels = {'high': 0, 'medium': 0, 'low': 0}
        
        for record in batch.records:
            specs = record.extracted_specs
            
            # Count extracted fields
            for field, value in specs.get('metadata', {}).items():
                field_counts[field] = field_counts.get(field, 0) + 1
                
                if field not in field_values:
                    field_values[field] = {}
                
                value_str = str(value)
                field_values[field][value_str] = field_values[field].get(value_str, 0) + 1
            
            # Count engine families
            ef = specs.get('engine_family')
            if ef:
                engine_families[ef] = engine_families.get(ef, 0) + 1
            
            # Track confidence levels
            for extraction in specs.get('extractions', []):
                conf = extraction.get('confidence', 0)
                if conf >= 0.9:
                    confidence_levels['high'] += 1
                elif conf >= 0.7:
                    confidence_levels['medium'] += 1
                else:
                    confidence_levels['low'] += 1
        
        report_lines = [
            "=" * 80,
            "EXTRACTION ANALYSIS REPORT",
            "=" * 80,
            f"",
            f"Batch ID: {batch.batch_id}",
            f"Total Records Analyzed: {batch.total_records}",
            f"",
            "-" * 80,
            "EXTRACTION CONFIDENCE",
            "-" * 80,
            f"",
            f"High Confidence (≥90%):   {confidence_levels['high']}",
            f"Medium Confidence (70-89%): {confidence_levels['medium']}",
            f"Low Confidence (<70%):      {confidence_levels['low']}",
            f"",
            "-" * 80,
            "FIELDS EXTRACTED (by frequency)",
            "-" * 80,
            f""
        ]
        
        for field, count in sorted(field_counts.items(), key=lambda x: -x[1]):
            pct = (count / batch.total_records * 100) if batch.total_records > 0 else 0
            report_lines.append(f"  {field}: {count} ({pct:.1f}%)")
        
        if engine_families:
            report_lines.extend([
                f"",
                "-" * 80,
                "ENGINE FAMILIES DETECTED",
                "-" * 80,
                f""
            ])
            for family, count in sorted(engine_families.items(), key=lambda x: -x[1]):
                report_lines.append(f"  {family}: {count}")
        
        # Top values for each field
        report_lines.extend([
            f"",
            "-" * 80,
            "TOP VALUES BY FIELD",
            "-" * 80,
            f""
        ])
        
        for field, values in field_values.items():
            report_lines.append(f"  {field}:")
            top_values = sorted(values.items(), key=lambda x: -x[1])[:5]
            for value, count in top_values:
                report_lines.append(f"    {value}: {count}")
            report_lines.append("")
        
        report_lines.extend([
            "=" * 80,
            "END OF ANALYSIS",
            "=" * 80
        ])
        
        report_content = '\n'.join(report_lines)
        report_path = self.output_dir / f"analysis-{batch.batch_id}.txt"
        
        with open(report_path, 'w') as f:
            f.write(report_content)
        
        return str(report_path)


class ConsoleReporter:
    """Outputs reports to console with formatting."""
    
    COLORS = {
        'red': '\033[91m',
        'green': '\033[92m',
        'yellow': '\033[93m',
        'blue': '\033[94m',
        'magenta': '\033[95m',
        'cyan': '\033[96m',
        'reset': '\033[0m',
        'bold': '\033[1m'
    }
    
    def __init__(self, use_color: bool = True):
        self.use_color = use_color
    
    def _color(self, text: str, color: str) -> str:
        if not self.use_color:
            return text
        return f"{self.COLORS.get(color, '')}{text}{self.COLORS['reset']}"
    
    def print_summary(self, batch: IngestionBatchReport):
        """Print a summary to console."""
        print()
        print(self._color("=" * 60, 'cyan'))
        print(self._color("  INGESTION SUMMARY", 'bold'))
        print(self._color("=" * 60, 'cyan'))
        print()
        
        print(f"  Batch ID:  {batch.batch_id}")
        print(f"  Mode:      {batch.mode}")
        print(f"  Source:    {batch.source_file or 'N/A'}")
        print()
        
        print(self._color("-" * 60, 'cyan'))
        print()
        
        # Stats with colors
        total = batch.total_records
        ready_pct = (batch.ready_count / total * 100) if total > 0 else 0
        review_pct = (batch.needs_review_count / total * 100) if total > 0 else 0
        invalid_pct = (batch.invalid_count / total * 100) if total > 0 else 0
        
        print(f"  Total Records:    {self._color(str(total), 'bold')}")
        print(f"  Ready to Commit:  {self._color(str(batch.ready_count), 'green')} ({ready_pct:.1f}%)")
        print(f"  Needs Review:     {self._color(str(batch.needs_review_count), 'yellow')} ({review_pct:.1f}%)")
        print(f"  Invalid:          {self._color(str(batch.invalid_count), 'red')} ({invalid_pct:.1f}%)")
        print(f"  Duplicates:       {batch.duplicate_count}")
        print()
        
        if batch.needs_review_count > 0 and batch.mode == 'dry-run':
            print(self._color("  ⚠ Review items flagged before committing", 'yellow'))
        
        if batch.invalid_count > 0:
            print(self._color("  ✗ Invalid items will be skipped", 'red'))
        
        if batch.ready_count > 0 and batch.mode == 'dry-run':
            print(self._color(f"  ✓ {batch.ready_count} items ready for commit", 'green'))
        
        print()
        print(self._color("=" * 60, 'cyan'))
        print()
    
    def print_validation_issues(self, batch: IngestionBatchReport, max_items: int = 10):
        """Print validation issues to console."""
        issues_found = False
        count = 0
        
        for record in batch.records:
            if record.status in ('needs_review', 'invalid') and count < max_items:
                if not issues_found:
                    print()
                    print(self._color("VALIDATION ISSUES:", 'yellow'))
                    print()
                    issues_found = True
                
                name = record.normalized_data.get('name', {}).get('normalized', 'Unknown')
                status_color = 'red' if record.status == 'invalid' else 'yellow'
                
                print(f"  {self._color('•', status_color)} {name}")
                
                for issue in record.validation_result.get('issues', []):
                    severity = issue.get('severity', 'info')
                    msg = issue.get('message', '')
                    
                    if severity == 'error':
                        print(f"      {self._color('ERROR:', 'red')} {msg}")
                    elif severity == 'warning':
                        print(f"      {self._color('WARN:', 'yellow')} {msg}")
                
                count += 1
        
        if count >= max_items:
            remaining = sum(1 for r in batch.records if r.status in ('needs_review', 'invalid')) - count
            if remaining > 0:
                print(f"\n  ... and {remaining} more items with issues")
        
        if issues_found:
            print()


def generate_batch_id() -> str:
    """Generate a unique batch ID."""
    import uuid
    timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
    short_uuid = str(uuid.uuid4())[:8]
    return f"{timestamp}-{short_uuid}"


def get_timestamp() -> str:
    """Get current timestamp in ISO format."""
    return datetime.now().isoformat()
