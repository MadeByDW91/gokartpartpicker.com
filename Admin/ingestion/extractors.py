"""
Extractors for Go-Kart Part Data Ingestion

Extracts structured specifications from part names and descriptions:
- Engine family hints
- Bore sizes
- Chain sizes
- Carburetor models
- Torque converter series
- Shaft specs
- And more
"""

import json
import re
from pathlib import Path
from typing import Optional, Dict, Any, List, Tuple
from dataclasses import dataclass, field


@dataclass
class ExtractionResult:
    """Result of a specification extraction."""
    field: str
    value: Any
    confidence: float  # 0.0 to 1.0
    source: str  # 'name', 'description', 'explicit'
    pattern_matched: Optional[str] = None
    raw_match: Optional[str] = None
    needs_review: bool = False
    review_reason: Optional[str] = None


@dataclass
class ExtractionReport:
    """Complete extraction report for a part."""
    extractions: List[ExtractionResult] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    engine_family: Optional[str] = None
    engine_family_confidence: float = 0.0
    needs_review: bool = False
    review_reasons: List[str] = field(default_factory=list)
    
    def add(self, result: ExtractionResult):
        """Add an extraction result."""
        self.extractions.append(result)
        if result.field:
            self.metadata[result.field] = result.value
        if result.needs_review:
            self.needs_review = True
            if result.review_reason:
                self.review_reasons.append(result.review_reason)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            'metadata': self.metadata,
            'engine_family': self.engine_family,
            'engine_family_confidence': self.engine_family_confidence,
            'extractions': [
                {
                    'field': e.field,
                    'value': e.value,
                    'confidence': e.confidence,
                    'source': e.source,
                    'raw_match': e.raw_match
                }
                for e in self.extractions
            ],
            'needs_review': self.needs_review,
            'review_reasons': self.review_reasons
        }


class SpecExtractor:
    """Main extractor class that coordinates all spec extraction."""
    
    def __init__(self, config_path: Optional[Path] = None):
        if config_path is None:
            config_path = Path(__file__).parent / "config" / "extraction-patterns.json"
        
        with open(config_path, 'r') as f:
            self.config = json.load(f)
        
        self.fraction_conversions = self.config.get('fraction_conversions', {})
        self.unit_conversions = self.config.get('unit_conversions', {})
        
        # Compile regex patterns for performance
        self._compiled_patterns = {}
        self._compile_patterns()
    
    def _compile_patterns(self):
        """Pre-compile regex patterns for performance."""
        for pattern_group in ['engine_families', 'bore_sizes', 'chain_sizes', 
                              'carburetor_models', 'torque_converter_series',
                              'shaft_specs', 'sprocket_specs', 'clutch_specs',
                              'displacement_cc', 'link_count', 'jet_sizes', 
                              'camshaft_specs']:
            if pattern_group in self.config:
                self._compiled_patterns[pattern_group] = []
                group_config = self.config[pattern_group]
                patterns = group_config.get('patterns', [])
                
                for pattern_info in patterns:
                    if isinstance(pattern_info, dict):
                        # Handle different pattern structures
                        pattern_str = pattern_info.get('pattern') or pattern_info.get('patterns', [None])[0]
                        if pattern_str:
                            try:
                                compiled = re.compile(pattern_str, re.IGNORECASE)
                                self._compiled_patterns[pattern_group].append({
                                    'regex': compiled,
                                    'info': pattern_info
                                })
                            except re.error:
                                pass  # Skip invalid patterns
    
    def extract_all(self, name: str, description: str = '', 
                    existing_data: Optional[Dict] = None) -> ExtractionReport:
        """
        Extract all possible specifications from text.
        
        Args:
            name: Part name
            description: Part description
            existing_data: Any existing data (from CSV columns, etc.)
        
        Returns:
            ExtractionReport with all extracted specs
        """
        report = ExtractionReport()
        combined_text = f"{name} {description}".strip()
        
        # Extract in priority order
        self._extract_engine_family(combined_text, report)
        self._extract_bore_size(combined_text, report)
        self._extract_chain_size(combined_text, report)
        self._extract_carburetor_model(combined_text, report)
        self._extract_torque_converter_series(combined_text, report)
        self._extract_shaft_specs(combined_text, report)
        self._extract_sprocket_specs(combined_text, report)
        self._extract_clutch_specs(combined_text, report)
        self._extract_displacement(combined_text, report)
        self._extract_link_count(combined_text, report)
        self._extract_jet_sizes(combined_text, report)
        self._extract_camshaft_specs(combined_text, report)
        
        # Merge with existing data (existing takes precedence)
        if existing_data:
            for key, value in existing_data.items():
                if value is not None and value != '':
                    report.metadata[key] = value
                    report.add(ExtractionResult(
                        field=key,
                        value=value,
                        confidence=1.0,
                        source='explicit'
                    ))
        
        return report
    
    def _extract_engine_family(self, text: str, report: ExtractionReport):
        """Extract engine family from text."""
        engine_families = self.config.get('engine_families', {})
        patterns = engine_families.get('patterns', [])
        
        best_match = None
        best_priority = -1
        
        for i, family_info in enumerate(patterns):
            family_patterns = family_info.get('patterns', [])
            for pattern_str in family_patterns:
                try:
                    if re.search(pattern_str, text, re.IGNORECASE):
                        # Use order in list as priority (earlier = higher priority)
                        priority = len(patterns) - i
                        if priority > best_priority:
                            best_priority = priority
                            best_match = family_info
                        break
                except re.error:
                    continue
        
        if best_match:
            report.engine_family = best_match.get('family')
            report.engine_family_confidence = 0.9
            
            # Also add displacement if available
            if 'displacement_cc' in best_match:
                report.add(ExtractionResult(
                    field='displacement_cc',
                    value=best_match['displacement_cc'],
                    confidence=0.9,
                    source='engine_family_inference',
                    raw_match=report.engine_family
                ))
            
            # Add variant if available
            if 'variant' in best_match:
                report.add(ExtractionResult(
                    field='variant',
                    value=best_match['variant'],
                    confidence=0.9,
                    source='engine_family_inference',
                    raw_match=report.engine_family
                ))
    
    def _extract_bore_size(self, text: str, report: ExtractionReport):
        """Extract bore size from text."""
        bore_config = self.config.get('bore_sizes', {})
        patterns = bore_config.get('patterns', [])
        
        for pattern_info in patterns:
            pattern_str = pattern_info.get('pattern')
            if not pattern_str:
                continue
            
            try:
                match = re.search(pattern_str, text, re.IGNORECASE)
                if match:
                    capture_group = pattern_info.get('capture_group', 1)
                    value_str = match.group(capture_group)
                    value = float(value_str)
                    field = pattern_info.get('field', 'bore_mm')
                    
                    report.add(ExtractionResult(
                        field=field,
                        value=value,
                        confidence=0.85,
                        source='name' if text == text else 'description',
                        pattern_matched=pattern_str,
                        raw_match=match.group(0)
                    ))
                    break
            except (re.error, ValueError, IndexError):
                continue
    
    def _extract_chain_size(self, text: str, report: ExtractionReport):
        """Extract chain size from text."""
        chain_config = self.config.get('chain_sizes', {})
        patterns = chain_config.get('patterns', [])
        
        for pattern_info in patterns:
            pattern_str = pattern_info.get('pattern')
            if not pattern_str:
                continue
            
            try:
                match = re.search(pattern_str, text, re.IGNORECASE)
                if match:
                    value = pattern_info.get('value')
                    pitch = pattern_info.get('pitch_in')
                    
                    report.add(ExtractionResult(
                        field='chain_size',
                        value=value,
                        confidence=0.95,
                        source='name',
                        pattern_matched=pattern_str,
                        raw_match=match.group(0)
                    ))
                    
                    if pitch:
                        report.add(ExtractionResult(
                            field='pitch_in',
                            value=pitch,
                            confidence=0.95,
                            source='derived',
                            raw_match=f"derived from {value}"
                        ))
                    break
            except re.error:
                continue
    
    def _extract_carburetor_model(self, text: str, report: ExtractionReport):
        """Extract carburetor model from text."""
        carb_config = self.config.get('carburetor_models', {})
        patterns = carb_config.get('patterns', [])
        
        for pattern_info in patterns:
            pattern_str = pattern_info.get('pattern')
            if not pattern_str:
                continue
            
            try:
                match = re.search(pattern_str, text, re.IGNORECASE)
                if match:
                    template = pattern_info.get('template', '')
                    brand = pattern_info.get('brand', '')
                    
                    # Build model name from template
                    model = template
                    for i in range(1, 5):
                        try:
                            model = model.replace(f'{{{i}}}', match.group(i).upper())
                        except (IndexError, AttributeError):
                            break
                    
                    report.add(ExtractionResult(
                        field='carburetor_model',
                        value=model,
                        confidence=0.9,
                        source='name',
                        pattern_matched=pattern_str,
                        raw_match=match.group(0)
                    ))
                    break
            except re.error:
                continue
        
        # Also try to extract throat diameter
        throat_pattern = carb_config.get('throat_diameter_extraction', {}).get('pattern')
        if throat_pattern:
            try:
                match = re.search(throat_pattern, text, re.IGNORECASE)
                if match:
                    value = int(match.group(1))
                    report.add(ExtractionResult(
                        field='throat_diameter_mm',
                        value=value,
                        confidence=0.85,
                        source='name',
                        raw_match=match.group(0)
                    ))
            except (re.error, ValueError, IndexError):
                pass
    
    def _extract_torque_converter_series(self, text: str, report: ExtractionReport):
        """Extract torque converter series from text."""
        tc_config = self.config.get('torque_converter_series', {})
        patterns = tc_config.get('patterns', [])
        
        for pattern_info in patterns:
            pattern_str = pattern_info.get('pattern')
            if not pattern_str:
                continue
            
            try:
                match = re.search(pattern_str, text, re.IGNORECASE)
                if match:
                    series = pattern_info.get('series')
                    
                    report.add(ExtractionResult(
                        field='series',
                        value=series,
                        confidence=0.9,
                        source='name',
                        pattern_matched=pattern_str,
                        raw_match=match.group(0)
                    ))
                    
                    # Add belt number if present
                    belt_number = pattern_info.get('belt_number')
                    if belt_number:
                        report.add(ExtractionResult(
                            field='belt_number',
                            value=belt_number,
                            confidence=0.95,
                            source='name',
                            raw_match=match.group(0)
                        ))
                    break
            except re.error:
                continue
    
    def _extract_shaft_specs(self, text: str, report: ExtractionReport):
        """Extract shaft diameter and keyway from text."""
        shaft_config = self.config.get('shaft_specs', {})
        
        # Extract bore/shaft diameter
        bore_patterns = shaft_config.get('bore_patterns', [])
        for pattern_info in bore_patterns:
            pattern_str = pattern_info.get('pattern')
            if not pattern_str:
                continue
            
            try:
                match = re.search(pattern_str, text, re.IGNORECASE)
                if match:
                    if pattern_info.get('type') == 'fraction':
                        # Handle fractions
                        numerator = int(match.group(1))
                        denominator = int(match.group(2))
                        value = numerator / denominator
                    else:
                        capture_group = pattern_info.get('capture_group', 1)
                        value = float(match.group(capture_group))
                    
                    field = pattern_info.get('field', 'bore_in')
                    
                    # Convert if needed
                    if pattern_info.get('convert_to_inches') and pattern_info.get('unit') == 'mm':
                        value = value * self.unit_conversions.get('mm_to_inches', 0.0393701)
                        field = 'bore_in'
                    
                    report.add(ExtractionResult(
                        field=field,
                        value=round(value, 3),
                        confidence=0.85,
                        source='name',
                        raw_match=match.group(0)
                    ))
                    break
            except (re.error, ValueError, IndexError):
                continue
        
        # Extract keyway
        keyway_patterns = shaft_config.get('keyway_patterns', [])
        for pattern_info in keyway_patterns:
            pattern_str = pattern_info.get('pattern')
            if not pattern_str:
                continue
            
            try:
                match = re.search(pattern_str, text, re.IGNORECASE)
                if match:
                    value = pattern_info.get('value')
                    report.add(ExtractionResult(
                        field='keyway',
                        value=value,
                        confidence=0.9,
                        source='name',
                        raw_match=match.group(0)
                    ))
                    break
            except re.error:
                continue
    
    def _extract_sprocket_specs(self, text: str, report: ExtractionReport):
        """Extract sprocket specifications from text."""
        sprocket_config = self.config.get('sprocket_specs', {})
        patterns = sprocket_config.get('teeth_patterns', [])
        
        for pattern_info in patterns:
            pattern_str = pattern_info.get('pattern')
            if not pattern_str:
                continue
            
            try:
                match = re.search(pattern_str, text, re.IGNORECASE)
                if match:
                    capture_group = pattern_info.get('capture_group', 1)
                    value = int(match.group(capture_group))
                    
                    report.add(ExtractionResult(
                        field='teeth',
                        value=value,
                        confidence=0.9,
                        source='name',
                        raw_match=match.group(0)
                    ))
                    break
            except (re.error, ValueError, IndexError):
                continue
    
    def _extract_clutch_specs(self, text: str, report: ExtractionReport):
        """Extract clutch specifications from text."""
        clutch_config = self.config.get('clutch_specs', {})
        
        # Extract engagement RPM
        engagement_patterns = clutch_config.get('engagement_patterns', [])
        for pattern_info in engagement_patterns:
            pattern_str = pattern_info.get('pattern')
            if not pattern_str:
                continue
            
            try:
                match = re.search(pattern_str, text, re.IGNORECASE)
                if match:
                    capture_group = pattern_info.get('capture_group', 1)
                    value = int(match.group(capture_group))
                    
                    report.add(ExtractionResult(
                        field='engagement_rpm',
                        value=value,
                        confidence=0.85,
                        source='name',
                        raw_match=match.group(0)
                    ))
                    break
            except (re.error, ValueError, IndexError):
                continue
        
        # Extract shoes count
        shoes_patterns = clutch_config.get('shoes_patterns', [])
        for pattern_info in shoes_patterns:
            pattern_str = pattern_info.get('pattern')
            if not pattern_str:
                continue
            
            try:
                match = re.search(pattern_str, text, re.IGNORECASE)
                if match:
                    capture_group = pattern_info.get('capture_group', 1)
                    value = int(match.group(capture_group))
                    
                    report.add(ExtractionResult(
                        field='shoes_count',
                        value=value,
                        confidence=0.9,
                        source='name',
                        raw_match=match.group(0)
                    ))
                    break
            except (re.error, ValueError, IndexError):
                continue
    
    def _extract_displacement(self, text: str, report: ExtractionReport):
        """Extract engine displacement from text."""
        # Skip if already extracted from engine family
        if 'displacement_cc' in report.metadata:
            return
        
        displacement_config = self.config.get('displacement_cc', {})
        patterns = displacement_config.get('patterns', [])
        
        for pattern_info in patterns:
            pattern_str = pattern_info.get('pattern')
            if not pattern_str:
                continue
            
            try:
                match = re.search(pattern_str, text, re.IGNORECASE)
                if match:
                    capture_group = pattern_info.get('capture_group', 1)
                    value = float(match.group(capture_group))
                    
                    # Convert if needed
                    if pattern_info.get('convert_to_cc'):
                        multiplier = pattern_info.get('multiplier', 16.387)
                        value = value * multiplier
                    
                    report.add(ExtractionResult(
                        field='displacement_cc',
                        value=int(value),
                        confidence=0.85,
                        source='name',
                        raw_match=match.group(0)
                    ))
                    break
            except (re.error, ValueError, IndexError):
                continue
    
    def _extract_link_count(self, text: str, report: ExtractionReport):
        """Extract chain link count from text."""
        link_config = self.config.get('link_count', {})
        patterns = link_config.get('patterns', [])
        
        for pattern_info in patterns:
            pattern_str = pattern_info.get('pattern')
            if not pattern_str:
                continue
            
            try:
                match = re.search(pattern_str, text, re.IGNORECASE)
                if match:
                    capture_group = pattern_info.get('capture_group', 1)
                    value = int(match.group(capture_group))
                    
                    report.add(ExtractionResult(
                        field='links',
                        value=value,
                        confidence=0.9,
                        source='name',
                        raw_match=match.group(0)
                    ))
                    break
            except (re.error, ValueError, IndexError):
                continue
    
    def _extract_jet_sizes(self, text: str, report: ExtractionReport):
        """Extract jet sizes from text."""
        jet_config = self.config.get('jet_sizes', {})
        patterns = jet_config.get('patterns', [])
        
        for pattern_info in patterns:
            pattern_str = pattern_info.get('pattern')
            field = pattern_info.get('field')
            if not pattern_str or not field:
                continue
            
            try:
                match = re.search(pattern_str, text, re.IGNORECASE)
                if match:
                    capture_group = pattern_info.get('capture_group', 1)
                    value = float(match.group(capture_group))
                    
                    report.add(ExtractionResult(
                        field=field,
                        value=value,
                        confidence=0.85,
                        source='name',
                        raw_match=match.group(0)
                    ))
            except (re.error, ValueError, IndexError):
                continue
    
    def _extract_camshaft_specs(self, text: str, report: ExtractionReport):
        """Extract camshaft specifications from text."""
        cam_config = self.config.get('camshaft_specs', {})
        patterns = cam_config.get('patterns', [])
        
        for pattern_info in patterns:
            pattern_str = pattern_info.get('pattern')
            field = pattern_info.get('field')
            if not pattern_str or not field:
                continue
            
            try:
                match = re.search(pattern_str, text, re.IGNORECASE)
                if match:
                    capture_group = pattern_info.get('capture_group', 1)
                    value_str = match.group(capture_group)
                    
                    # Handle prefix (e.g., for lift values)
                    prefix = pattern_info.get('prefix', '')
                    if prefix:
                        value = float(prefix + value_str)
                    else:
                        value = float(value_str)
                    
                    report.add(ExtractionResult(
                        field=field,
                        value=value,
                        confidence=0.8,
                        source='name',
                        raw_match=match.group(0)
                    ))
            except (re.error, ValueError, IndexError):
                continue


class EngineFamilyMatcher:
    """Specialized matcher for engine families with fuzzy matching."""
    
    def __init__(self, config_path: Optional[Path] = None):
        if config_path is None:
            config_path = Path(__file__).parent / "config" / "extraction-patterns.json"
        
        with open(config_path, 'r') as f:
            config = json.load(f)
        
        self.engine_families = config.get('engine_families', {}).get('patterns', [])
    
    def match(self, text: str) -> Tuple[Optional[str], float, Dict[str, Any]]:
        """
        Match text to an engine family.
        
        Returns:
            Tuple of (family_name, confidence, attributes)
        """
        text_lower = text.lower()
        
        for family_info in self.engine_families:
            patterns = family_info.get('patterns', [])
            for pattern in patterns:
                try:
                    if re.search(pattern, text_lower):
                        attributes = {
                            k: v for k, v in family_info.items()
                            if k not in ['family', 'patterns']
                        }
                        return (
                            family_info.get('family'),
                            0.9,
                            attributes
                        )
                except re.error:
                    continue
        
        return None, 0.0, {}
    
    def get_compatible_parts(self, family_name: str) -> List[str]:
        """Get list of part categories typically compatible with an engine family."""
        # This could be expanded with a compatibility database
        base_categories = [
            'engines/pistons',
            'engines/camshafts',
            'engines/connecting-rods',
            'engines/cylinder-heads',
            'engines/flywheels',
            'carburetors/complete-carburetors',
            'exhaust/headers',
            'air-filtration/air-filters',
        ]
        return base_categories


# Convenience functions
def extract_specs(name: str, description: str = '') -> Dict[str, Any]:
    """
    Convenience function to extract specs from a part name/description.
    
    Returns:
        Dictionary with extracted metadata
    """
    extractor = SpecExtractor()
    report = extractor.extract_all(name, description)
    return report.to_dict()


def identify_engine_family(text: str) -> Tuple[Optional[str], float]:
    """
    Identify engine family from text.
    
    Returns:
        Tuple of (family_name, confidence)
    """
    matcher = EngineFamilyMatcher()
    family, confidence, _ = matcher.match(text)
    return family, confidence
