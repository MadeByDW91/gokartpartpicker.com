"""
Normalizers for Go-Kart Part Data Ingestion

Handles normalization of:
- Brand names
- Part names
- Category assignments
- Spec values and units
"""

import json
import re
import unicodedata
from pathlib import Path
from typing import Optional, Dict, Any, Tuple
from difflib import SequenceMatcher


class BrandNormalizer:
    """Normalizes brand names using alias mappings."""
    
    def __init__(self, config_path: Optional[Path] = None):
        if config_path is None:
            config_path = Path(__file__).parent / "config" / "brand-aliases.json"
        
        with open(config_path, 'r') as f:
            self.config = json.load(f)
        
        self.brands = self.config.get('brands', {})
        self.rules = self.config.get('matching_rules', {})
        self.unknown = self.config.get('unknown_brand', {})
        
        # Build reverse lookup from aliases to canonical names
        self._alias_map = {}
        for brand_key, brand_data in self.brands.items():
            canonical = brand_data['canonical']
            slug = brand_data['slug']
            for alias in brand_data.get('aliases', []):
                normalized_alias = self._normalize_for_matching(alias)
                self._alias_map[normalized_alias] = {
                    'canonical': canonical,
                    'slug': slug,
                    'key': brand_key
                }
    
    def _normalize_for_matching(self, text: str) -> str:
        """Normalize text for matching (lowercase, strip punctuation, etc.)."""
        if not text:
            return ""
        
        text = text.lower().strip()
        
        if self.rules.get('strip_punctuation', True):
            text = re.sub(r'[^\w\s]', '', text)
        
        if self.rules.get('strip_extra_whitespace', True):
            text = re.sub(r'\s+', ' ', text)
        
        return text
    
    def _fuzzy_match(self, text: str, threshold: float = 0.85) -> Optional[Dict]:
        """Attempt fuzzy matching against known aliases."""
        best_match = None
        best_score = 0
        
        for alias, brand_info in self._alias_map.items():
            score = SequenceMatcher(None, text, alias).ratio()
            if score > best_score and score >= threshold:
                best_score = score
                best_match = {**brand_info, 'match_score': score}
        
        return best_match
    
    def normalize(self, brand_text: str) -> Dict[str, Any]:
        """
        Normalize a brand name.
        
        Returns:
            Dict with keys: canonical, slug, matched, needs_review, original
        """
        if not brand_text:
            return {
                'canonical': self.unknown['canonical'],
                'slug': self.unknown['slug'],
                'matched': False,
                'needs_review': True,
                'original': brand_text,
                'reason': 'empty_input'
            }
        
        normalized = self._normalize_for_matching(brand_text)
        
        # Exact match
        if normalized in self._alias_map:
            info = self._alias_map[normalized]
            return {
                'canonical': info['canonical'],
                'slug': info['slug'],
                'matched': True,
                'needs_review': False,
                'original': brand_text,
                'match_type': 'exact'
            }
        
        # Fuzzy match
        threshold = self.rules.get('fuzzy_threshold', 0.85)
        fuzzy_result = self._fuzzy_match(normalized, threshold)
        
        if fuzzy_result:
            return {
                'canonical': fuzzy_result['canonical'],
                'slug': fuzzy_result['slug'],
                'matched': True,
                'needs_review': True,  # Flag fuzzy matches for review
                'original': brand_text,
                'match_type': 'fuzzy',
                'match_score': fuzzy_result['match_score']
            }
        
        # No match found
        return {
            'canonical': self.unknown['canonical'],
            'slug': self.unknown['slug'],
            'matched': False,
            'needs_review': True,
            'original': brand_text,
            'reason': 'no_match'
        }


class NameNormalizer:
    """Normalizes part names for consistency."""
    
    # Common abbreviations to expand
    ABBREVIATIONS = {
        'carb': 'Carburetor',
        'carbs': 'Carburetors',
        'conv': 'Converter',
        'tc': 'Torque Converter',
        'pred': 'Predator',
        'hf': 'Harbor Freight',
        'cyl': 'Cylinder',
        'eng': 'Engine',
        'exh': 'Exhaust',
        'hdr': 'Header',
        'int': 'Intake',
        'mfld': 'Manifold',
        'perf': 'Performance',
        'stg': 'Stage',
        'alum': 'Aluminum',
        'ss': 'Stainless Steel',
        'blk': 'Black',
        'chr': 'Chrome',
        'w/': 'with',
        'wo/': 'without',
        'incl': 'Includes',
        'oem': 'OEM',
        'assy': 'Assembly',
    }
    
    def __init__(self, expand_abbreviations: bool = True):
        self.expand_abbreviations = expand_abbreviations
    
    def normalize(self, name: str) -> Dict[str, Any]:
        """
        Normalize a part name.
        
        Returns:
            Dict with keys: normalized, slug, original, changes
        """
        if not name:
            return {
                'normalized': '',
                'slug': '',
                'original': name,
                'changes': []
            }
        
        changes = []
        normalized = name.strip()
        
        # Normalize unicode characters
        normalized = unicodedata.normalize('NFKC', normalized)
        
        # Fix double spaces
        if '  ' in normalized:
            normalized = re.sub(r'\s+', ' ', normalized)
            changes.append('fixed_whitespace')
        
        # Standardize quotes
        normalized = normalized.replace('"', '"').replace('"', '"')
        normalized = normalized.replace(''', "'").replace(''', "'")
        
        # Expand abbreviations if enabled
        if self.expand_abbreviations:
            words = normalized.split()
            new_words = []
            for word in words:
                lower_word = word.lower().rstrip('.,;:')
                if lower_word in self.ABBREVIATIONS:
                    new_words.append(self.ABBREVIATIONS[lower_word])
                    changes.append(f'expanded_{lower_word}')
                else:
                    new_words.append(word)
            normalized = ' '.join(new_words)
        
        # Title case with exceptions
        normalized = self._smart_title_case(normalized)
        
        # Generate slug
        slug = self._generate_slug(normalized)
        
        return {
            'normalized': normalized,
            'slug': slug,
            'original': name,
            'changes': changes
        }
    
    def _smart_title_case(self, text: str) -> str:
        """Title case with awareness of brand names and abbreviations."""
        # Words that should stay uppercase
        uppercase_words = {'OHV', 'OHC', 'GX', 'LO206', 'CC', 'RPM', 'HP', 'ID', 'OD', 'USA', 'CNC'}
        # Words that should stay lowercase (articles, prepositions)
        lowercase_words = {'a', 'an', 'the', 'and', 'or', 'but', 'for', 'with', 'to', 'of', 'in', 'on'}
        
        words = text.split()
        result = []
        
        for i, word in enumerate(words):
            upper = word.upper()
            if upper in uppercase_words:
                result.append(upper)
            elif word.lower() in lowercase_words and i > 0:
                result.append(word.lower())
            elif word.startswith('#'):
                result.append(word.upper())  # Chain sizes like #35
            else:
                result.append(word.capitalize())
        
        return ' '.join(result)
    
    def _generate_slug(self, text: str) -> str:
        """Generate URL-safe slug from text."""
        slug = text.lower()
        slug = re.sub(r'[^\w\s-]', '', slug)
        slug = re.sub(r'[-\s]+', '-', slug)
        slug = slug.strip('-')
        return slug


class UnitNormalizer:
    """Normalizes units and converts between measurement systems."""
    
    # Standard unit representations
    UNIT_MAP = {
        # Length - metric
        'mm': 'mm',
        'millimeter': 'mm',
        'millimeters': 'mm',
        'cm': 'cm',
        'centimeter': 'cm',
        'centimeters': 'cm',
        # Length - imperial
        'in': 'inches',
        'inch': 'inches',
        'inches': 'inches',
        '"': 'inches',
        # Volume
        'cc': 'cc',
        'cubic centimeter': 'cc',
        'cubic centimeters': 'cc',
        'ci': 'ci',
        'cubic inch': 'ci',
        'cubic inches': 'ci',
        # Speed
        'rpm': 'RPM',
        'r.p.m.': 'RPM',
        'revolutions per minute': 'RPM',
        # Angles
        'deg': 'degrees',
        'degree': 'degrees',
        'degrees': 'degrees',
        '°': 'degrees',
        # Weight
        'oz': 'oz',
        'ounce': 'oz',
        'ounces': 'oz',
        'lb': 'lbs',
        'lbs': 'lbs',
        'pound': 'lbs',
        'pounds': 'lbs',
        # Pressure
        'psi': 'PSI',
        # Flow
        'gph': 'GPH',
        'gallons per hour': 'GPH',
    }
    
    # Conversion factors
    CONVERSIONS = {
        ('mm', 'inches'): 0.0393701,
        ('inches', 'mm'): 25.4,
        ('cc', 'ci'): 0.0610237,
        ('ci', 'cc'): 16.387,
        ('cm', 'inches'): 0.393701,
        ('inches', 'cm'): 2.54,
        ('oz', 'grams'): 28.3495,
        ('grams', 'oz'): 0.035274,
    }
    
    def normalize_unit(self, unit: str) -> str:
        """Normalize a unit string to standard representation."""
        if not unit:
            return ''
        
        unit_lower = unit.lower().strip()
        return self.UNIT_MAP.get(unit_lower, unit)
    
    def convert(self, value: float, from_unit: str, to_unit: str) -> Optional[float]:
        """Convert a value between units."""
        from_normalized = self.normalize_unit(from_unit)
        to_normalized = self.normalize_unit(to_unit)
        
        if from_normalized == to_normalized:
            return value
        
        key = (from_normalized, to_normalized)
        if key in self.CONVERSIONS:
            return value * self.CONVERSIONS[key]
        
        return None
    
    def parse_fraction(self, text: str) -> Optional[float]:
        """Parse fractional values like '3/4' or '1-1/8'."""
        if not text:
            return None
        
        text = text.strip().replace('"', '').replace("'", '')
        
        # Pattern for mixed fractions: 1-1/8
        mixed_pattern = r'^(\d+)-(\d+)/(\d+)$'
        match = re.match(mixed_pattern, text)
        if match:
            whole = int(match.group(1))
            numerator = int(match.group(2))
            denominator = int(match.group(3))
            return whole + (numerator / denominator)
        
        # Pattern for simple fractions: 3/4
        simple_pattern = r'^(\d+)/(\d+)$'
        match = re.match(simple_pattern, text)
        if match:
            numerator = int(match.group(1))
            denominator = int(match.group(2))
            return numerator / denominator
        
        # Try to parse as decimal
        try:
            return float(text)
        except ValueError:
            return None


class CategoryNormalizer:
    """Normalizes and validates category assignments."""
    
    def __init__(self, config_path: Optional[Path] = None):
        if config_path is None:
            config_path = Path(__file__).parent / "config" / "category-specs.json"
        
        with open(config_path, 'r') as f:
            self.config = json.load(f)
        
        self.categories = self.config.get('categories', {})
        
        # Build keyword-to-category mapping
        self._keyword_map = self._build_keyword_map()
    
    def _build_keyword_map(self) -> Dict[str, str]:
        """Build mapping of keywords to category slugs."""
        keyword_map = {}
        
        # Category keywords
        category_keywords = {
            'engines/complete-engines': ['engine', 'motor', '212cc', '224cc', '301cc', '420cc', 'predator', 'gx200', 'gx390'],
            'engines/pistons': ['piston', 'piston ring', 'wrist pin'],
            'engines/camshafts': ['cam', 'camshaft', 'duration', 'lift'],
            'engines/connecting-rods': ['rod', 'connecting rod', 'con rod', 'billet rod'],
            'engines/cylinder-heads': ['head', 'cylinder head', 'combustion chamber'],
            'engines/crankshafts': ['crank', 'crankshaft'],
            'engines/flywheels': ['flywheel', 'fly wheel', 'billet flywheel'],
            'engines/valve-train': ['valve', 'spring', 'retainer', 'rocker', 'pushrod'],
            'carburetors/complete-carburetors': ['carburetor', 'carb', 'mikuni', 'vm22', 'vm26', 'pwk', 'tillotson'],
            'carburetors/jets': ['jet', 'main jet', 'pilot jet', 'slow jet'],
            'carburetors/carburetor-kits': ['carb kit', 'rebuild kit', 'jet kit'],
            'clutches/centrifugal-clutches': ['clutch', 'centrifugal'],
            'clutches/clutch-drums': ['drum', 'clutch drum'],
            'clutches/clutch-shoes': ['shoe', 'clutch shoe'],
            'clutches/clutch-springs': ['clutch spring'],
            'torque-converters/driver-units': ['driver', 'drive pulley', 'tav driver'],
            'torque-converters/driven-units': ['driven', 'driven pulley', 'tav driven'],
            'torque-converters/belts': ['belt', 'tc belt', 'torque converter belt', 'comet belt'],
            'chains-sprockets/chains': ['chain', '#35 chain', '#40 chain', '#41 chain'],
            'chains-sprockets/axle-sprockets': ['axle sprocket', 'rear sprocket', '60 tooth', '66 tooth'],
            'chains-sprockets/clutch-sprockets': ['clutch sprocket', 'driver sprocket', '12 tooth', '10 tooth'],
            'exhaust/headers': ['header', 'exhaust header', 'rlv header', 'stinger'],
            'exhaust/mufflers': ['muffler', 'silencer'],
            'ignition/coils': ['coil', 'ignition coil'],
            'ignition/stators': ['stator', 'charging coil'],
            'air-filtration/air-filters': ['air filter', 'filter', 'foam filter', 'velocity stack'],
            'fuel-system/fuel-pumps': ['fuel pump', 'pulse pump'],
            'fuel-system/fuel-filters': ['fuel filter', 'inline filter'],
        }
        
        for category, keywords in category_keywords.items():
            for keyword in keywords:
                keyword_lower = keyword.lower()
                if keyword_lower not in keyword_map:
                    keyword_map[keyword_lower] = category
        
        return keyword_map
    
    def suggest_category(self, name: str, description: str = '') -> Tuple[Optional[str], float]:
        """
        Suggest a category based on part name and description.
        
        Returns:
            Tuple of (category_slug, confidence_score)
        """
        text = f"{name} {description}".lower()
        
        matches = {}
        for keyword, category in self._keyword_map.items():
            if keyword in text:
                if category not in matches:
                    matches[category] = 0
                # Weight longer keyword matches higher
                matches[category] += len(keyword)
        
        if not matches:
            return None, 0.0
        
        # Return category with highest score
        best_category = max(matches.items(), key=lambda x: x[1])
        
        # Calculate confidence (0-1 scale)
        confidence = min(best_category[1] / 20.0, 1.0)
        
        return best_category[0], confidence
    
    def validate_category(self, category_slug: str) -> bool:
        """Check if a category slug is valid."""
        return category_slug in self.categories
    
    def get_required_specs(self, category_slug: str) -> list:
        """Get list of required specs for a category."""
        if category_slug in self.categories:
            return self.categories[category_slug].get('required', [])
        return []
    
    def get_optional_specs(self, category_slug: str) -> list:
        """Get list of optional specs for a category."""
        if category_slug in self.categories:
            return self.categories[category_slug].get('optional', [])
        return []


# Convenience function for quick normalization
def normalize_part_data(
    name: str,
    brand: str,
    description: str = '',
    category: str = ''
) -> Dict[str, Any]:
    """
    Convenience function to normalize all aspects of a part.
    
    Returns:
        Dict with normalized name, brand, suggested category, and flags
    """
    brand_normalizer = BrandNormalizer()
    name_normalizer = NameNormalizer()
    category_normalizer = CategoryNormalizer()
    
    brand_result = brand_normalizer.normalize(brand)
    name_result = name_normalizer.normalize(name)
    
    # Suggest category if not provided
    if not category:
        suggested_category, confidence = category_normalizer.suggest_category(name, description)
    else:
        suggested_category = category
        confidence = 1.0 if category_normalizer.validate_category(category) else 0.0
    
    needs_review = (
        brand_result.get('needs_review', False) or
        confidence < 0.5 or
        not suggested_category
    )
    
    return {
        'name': name_result,
        'brand': brand_result,
        'category': {
            'slug': suggested_category,
            'confidence': confidence,
            'valid': category_normalizer.validate_category(suggested_category) if suggested_category else False
        },
        'needs_review': needs_review,
        'review_reasons': _collect_review_reasons(brand_result, name_result, suggested_category, confidence)
    }


def _collect_review_reasons(brand_result, name_result, category, confidence) -> list:
    """Collect all reasons why a part might need review."""
    reasons = []
    
    if brand_result.get('needs_review'):
        if brand_result.get('reason') == 'no_match':
            reasons.append('unknown_brand')
        elif brand_result.get('match_type') == 'fuzzy':
            reasons.append('fuzzy_brand_match')
    
    if not category:
        reasons.append('no_category_match')
    elif confidence < 0.5:
        reasons.append('low_category_confidence')
    
    return reasons
