"""
Validators for Go-Kart Part Data Ingestion

Validates extracted/normalized data against category-specs.json:
- Required field checks
- Value range validation
- Type validation
- Enum validation
- Cross-field consistency checks
"""

import json
from pathlib import Path
from typing import Optional, Dict, Any, List, Tuple
from dataclasses import dataclass, field
from enum import Enum


class ValidationSeverity(Enum):
    """Severity levels for validation issues."""
    ERROR = "error"      # Must be fixed before commit
    WARNING = "warning"  # Should review but can commit
    INFO = "info"        # Informational only


@dataclass
class ValidationIssue:
    """A single validation issue."""
    field: str
    message: str
    severity: ValidationSeverity
    current_value: Any = None
    expected: Any = None
    suggestion: Optional[str] = None


@dataclass
class ValidationResult:
    """Result of validating a part."""
    is_valid: bool
    issues: List[ValidationIssue] = field(default_factory=list)
    needs_review: bool = False
    validated_metadata: Dict[str, Any] = field(default_factory=dict)
    
    @property
    def errors(self) -> List[ValidationIssue]:
        return [i for i in self.issues if i.severity == ValidationSeverity.ERROR]
    
    @property
    def warnings(self) -> List[ValidationIssue]:
        return [i for i in self.issues if i.severity == ValidationSeverity.WARNING]
    
    @property
    def error_count(self) -> int:
        return len(self.errors)
    
    @property
    def warning_count(self) -> int:
        return len(self.warnings)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'is_valid': self.is_valid,
            'needs_review': self.needs_review,
            'error_count': self.error_count,
            'warning_count': self.warning_count,
            'issues': [
                {
                    'field': i.field,
                    'message': i.message,
                    'severity': i.severity.value,
                    'current_value': i.current_value,
                    'expected': i.expected,
                    'suggestion': i.suggestion
                }
                for i in self.issues
            ],
            'validated_metadata': self.validated_metadata
        }


class CategoryValidator:
    """Validates part data against category specifications."""
    
    def __init__(self, config_path: Optional[Path] = None):
        if config_path is None:
            config_path = Path(__file__).parent / "config" / "category-specs.json"
        
        with open(config_path, 'r') as f:
            self.config = json.load(f)
        
        self.categories = self.config.get('categories', {})
        self.validation_rules = self.config.get('validation_rules', {})
    
    def validate(self, category_slug: str, metadata: Dict[str, Any]) -> ValidationResult:
        """
        Validate metadata against category specifications.
        
        Args:
            category_slug: The category to validate against
            metadata: The metadata dictionary to validate
        
        Returns:
            ValidationResult with issues and validation status
        """
        result = ValidationResult(is_valid=True)
        result.validated_metadata = metadata.copy()
        
        # Check if category exists
        if category_slug not in self.categories:
            result.issues.append(ValidationIssue(
                field='category',
                message=f"Unknown category: {category_slug}",
                severity=ValidationSeverity.ERROR,
                current_value=category_slug
            ))
            result.is_valid = False
            result.needs_review = True
            return result
        
        category_spec = self.categories[category_slug]
        required_fields = category_spec.get('required', [])
        optional_fields = category_spec.get('optional', [])
        specs = category_spec.get('specs', {})
        
        # Check required fields
        for field_name in required_fields:
            if field_name not in metadata or metadata[field_name] is None:
                result.issues.append(ValidationIssue(
                    field=field_name,
                    message=f"Required field '{field_name}' is missing",
                    severity=ValidationSeverity.ERROR,
                    expected=f"Value of type {specs.get(field_name, {}).get('type', 'unknown')}"
                ))
                result.is_valid = False
                result.needs_review = True
        
        # Validate all provided fields
        all_valid_fields = set(required_fields) | set(optional_fields)
        
        for field_name, value in metadata.items():
            if value is None:
                continue
            
            # Check if field is recognized
            if field_name not in all_valid_fields:
                result.issues.append(ValidationIssue(
                    field=field_name,
                    message=f"Unrecognized field '{field_name}' for category '{category_slug}'",
                    severity=ValidationSeverity.WARNING,
                    current_value=value
                ))
                result.needs_review = True
                continue
            
            # Get field spec
            field_spec = specs.get(field_name, {})
            if not field_spec:
                continue
            
            # Validate the field value
            field_issues = self._validate_field(field_name, value, field_spec)
            for issue in field_issues:
                result.issues.append(issue)
                if issue.severity == ValidationSeverity.ERROR:
                    result.is_valid = False
                result.needs_review = True
        
        return result
    
    def _validate_field(self, field_name: str, value: Any, 
                        spec: Dict[str, Any]) -> List[ValidationIssue]:
        """Validate a single field against its specification."""
        issues = []
        field_type = spec.get('type')
        
        # Type validation
        type_issue = self._validate_type(field_name, value, field_type)
        if type_issue:
            issues.append(type_issue)
            return issues  # Skip other validations if type is wrong
        
        # Range validation for numeric types
        if field_type in ('integer', 'decimal'):
            range_issues = self._validate_range(field_name, value, spec)
            issues.extend(range_issues)
        
        # Enum validation
        if field_type == 'enum':
            enum_issue = self._validate_enum(field_name, value, spec)
            if enum_issue:
                issues.append(enum_issue)
        
        # Pattern validation for strings
        if field_type == 'string' and 'pattern' in spec:
            pattern_issue = self._validate_pattern(field_name, value, spec)
            if pattern_issue:
                issues.append(pattern_issue)
        
        # Check for uncommon values
        common_values = spec.get('common_values', [])
        if common_values and value not in common_values:
            issues.append(ValidationIssue(
                field=field_name,
                message=f"Uncommon value for '{field_name}'",
                severity=ValidationSeverity.INFO,
                current_value=value,
                expected=f"Common values: {common_values}",
                suggestion="Verify this is correct"
            ))
        
        return issues
    
    def _validate_type(self, field_name: str, value: Any, 
                       expected_type: str) -> Optional[ValidationIssue]:
        """Validate that a value matches the expected type."""
        type_checks = {
            'integer': lambda v: isinstance(v, int) or (isinstance(v, float) and v.is_integer()),
            'decimal': lambda v: isinstance(v, (int, float)),
            'string': lambda v: isinstance(v, str),
            'boolean': lambda v: isinstance(v, bool),
            'enum': lambda v: True,  # Enum validation done separately
        }
        
        checker = type_checks.get(expected_type)
        if checker and not checker(value):
            return ValidationIssue(
                field=field_name,
                message=f"Invalid type for '{field_name}'",
                severity=ValidationSeverity.ERROR,
                current_value=f"{value} ({type(value).__name__})",
                expected=expected_type
            )
        return None
    
    def _validate_range(self, field_name: str, value: Any,
                        spec: Dict[str, Any]) -> List[ValidationIssue]:
        """Validate that a numeric value is within expected range."""
        issues = []
        
        min_val = spec.get('min')
        max_val = spec.get('max')
        
        if min_val is not None and value < min_val:
            issues.append(ValidationIssue(
                field=field_name,
                message=f"Value below minimum for '{field_name}'",
                severity=ValidationSeverity.WARNING,
                current_value=value,
                expected=f">= {min_val}",
                suggestion=f"Check if {value} is correct, minimum is {min_val}"
            ))
        
        if max_val is not None and value > max_val:
            issues.append(ValidationIssue(
                field=field_name,
                message=f"Value above maximum for '{field_name}'",
                severity=ValidationSeverity.WARNING,
                current_value=value,
                expected=f"<= {max_val}",
                suggestion=f"Check if {value} is correct, maximum is {max_val}"
            ))
        
        return issues
    
    def _validate_enum(self, field_name: str, value: Any,
                       spec: Dict[str, Any]) -> Optional[ValidationIssue]:
        """Validate that a value is in the allowed enum values."""
        allowed_values = spec.get('values', [])
        nullable = spec.get('nullable', False)
        
        if value is None and nullable:
            return None
        
        if value not in allowed_values:
            return ValidationIssue(
                field=field_name,
                message=f"Invalid enum value for '{field_name}'",
                severity=ValidationSeverity.ERROR,
                current_value=value,
                expected=f"One of: {allowed_values}",
                suggestion=f"Use one of the allowed values"
            )
        return None
    
    def _validate_pattern(self, field_name: str, value: str,
                          spec: Dict[str, Any]) -> Optional[ValidationIssue]:
        """Validate that a string matches the expected pattern."""
        import re
        
        pattern = spec.get('pattern')
        if not pattern:
            return None
        
        try:
            if not re.match(pattern, value):
                return ValidationIssue(
                    field=field_name,
                    message=f"Value doesn't match expected pattern for '{field_name}'",
                    severity=ValidationSeverity.WARNING,
                    current_value=value,
                    expected=f"Pattern: {pattern}"
                )
        except re.error:
            pass
        
        return None
    
    def get_category_fields(self, category_slug: str) -> Tuple[List[str], List[str]]:
        """Get required and optional fields for a category."""
        if category_slug not in self.categories:
            return [], []
        
        category_spec = self.categories[category_slug]
        return (
            category_spec.get('required', []),
            category_spec.get('optional', [])
        )


class PartValidator:
    """Complete part validation including name, brand, and metadata."""
    
    def __init__(self):
        self.category_validator = CategoryValidator()
    
    def validate_part(self, part_data: Dict[str, Any]) -> ValidationResult:
        """
        Validate a complete part record.
        
        Args:
            part_data: Dictionary with name, brand, category, metadata, etc.
        
        Returns:
            ValidationResult
        """
        result = ValidationResult(is_valid=True)
        
        # Validate required top-level fields
        required_fields = ['name', 'category_id']
        for field_name in required_fields:
            if field_name not in part_data or not part_data[field_name]:
                result.issues.append(ValidationIssue(
                    field=field_name,
                    message=f"Required field '{field_name}' is missing",
                    severity=ValidationSeverity.ERROR
                ))
                result.is_valid = False
        
        # Validate name
        if 'name' in part_data:
            name = part_data['name']
            if len(name) < 3:
                result.issues.append(ValidationIssue(
                    field='name',
                    message="Part name is too short",
                    severity=ValidationSeverity.ERROR,
                    current_value=name,
                    expected="At least 3 characters"
                ))
                result.is_valid = False
            elif len(name) > 255:
                result.issues.append(ValidationIssue(
                    field='name',
                    message="Part name is too long",
                    severity=ValidationSeverity.WARNING,
                    current_value=f"{name[:50]}... ({len(name)} chars)",
                    expected="Maximum 255 characters"
                ))
        
        # Validate category and metadata
        category_slug = part_data.get('category_id') or part_data.get('category')
        metadata = part_data.get('metadata', {})
        
        if category_slug and metadata:
            cat_result = self.category_validator.validate(category_slug, metadata)
            result.issues.extend(cat_result.issues)
            result.validated_metadata = cat_result.validated_metadata
            if not cat_result.is_valid:
                result.is_valid = False
            if cat_result.needs_review:
                result.needs_review = True
        
        # Check for potential duplicates (basic check)
        # In production, this would query the database
        
        return result
    
    def validate_batch(self, parts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Validate a batch of parts.
        
        Returns:
            Summary with individual results
        """
        results = []
        valid_count = 0
        invalid_count = 0
        review_count = 0
        
        for i, part in enumerate(parts):
            result = self.validate_part(part)
            results.append({
                'index': i,
                'name': part.get('name', f'Part {i}'),
                'result': result.to_dict()
            })
            
            if result.is_valid:
                valid_count += 1
            else:
                invalid_count += 1
            
            if result.needs_review:
                review_count += 1
        
        return {
            'total': len(parts),
            'valid': valid_count,
            'invalid': invalid_count,
            'needs_review': review_count,
            'results': results
        }


class DuplicateDetector:
    """Detects potential duplicate parts."""
    
    def __init__(self, existing_parts: Optional[List[Dict]] = None):
        self.existing_parts = existing_parts or []
        self._index = self._build_index()
    
    def _build_index(self) -> Dict[str, List[int]]:
        """Build index of existing parts by normalized name."""
        index = {}
        for i, part in enumerate(self.existing_parts):
            name = self._normalize_for_matching(part.get('name', ''))
            if name not in index:
                index[name] = []
            index[name].append(i)
        return index
    
    def _normalize_for_matching(self, text: str) -> str:
        """Normalize text for duplicate matching."""
        import re
        text = text.lower().strip()
        text = re.sub(r'[^\w\s]', '', text)
        text = re.sub(r'\s+', ' ', text)
        return text
    
    def find_duplicates(self, name: str, brand: str = '', 
                        sku: str = '') -> List[Dict[str, Any]]:
        """
        Find potential duplicates.
        
        Returns:
            List of potential matches with similarity scores
        """
        from difflib import SequenceMatcher
        
        normalized = self._normalize_for_matching(name)
        matches = []
        
        # Exact match
        if normalized in self._index:
            for idx in self._index[normalized]:
                matches.append({
                    'index': idx,
                    'part': self.existing_parts[idx],
                    'similarity': 1.0,
                    'match_type': 'exact'
                })
        
        # Fuzzy match
        for existing_name, indices in self._index.items():
            if existing_name == normalized:
                continue
            
            similarity = SequenceMatcher(None, normalized, existing_name).ratio()
            if similarity > 0.85:
                for idx in indices:
                    matches.append({
                        'index': idx,
                        'part': self.existing_parts[idx],
                        'similarity': similarity,
                        'match_type': 'fuzzy'
                    })
        
        # Sort by similarity
        matches.sort(key=lambda x: x['similarity'], reverse=True)
        
        return matches[:5]  # Return top 5 matches


# Convenience function
def validate_part_data(category: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convenience function to validate part metadata.
    
    Returns:
        Dictionary with validation results
    """
    validator = CategoryValidator()
    result = validator.validate(category, metadata)
    return result.to_dict()
