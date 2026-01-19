import DOMPurify from 'isomorphic-dompurify';

// ============================================================================
// Content Sanitization
// ============================================================================

/**
 * Sanitize user input to prevent XSS attacks
 * Uses DOMPurify with a whitelist of safe HTML tags
 */
export function sanitizeContent(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'b',
      'i',
      'u',
      'code',
      'pre',
      'ul',
      'ol',
      'li',
      'a',
      'blockquote',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
    ],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: [
      'onerror',
      'onclick',
      'onload',
      'onmouseover',
      'onfocus',
      'onblur',
      'onchange',
      'onsubmit',
    ],
  });
}

/**
 * Sanitize content for display (more permissive for markdown rendering)
 */
export function sanitizeForDisplay(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'b',
      'i',
      'u',
      'code',
      'pre',
      'ul',
      'ol',
      'li',
      'a',
      'blockquote',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'img',
    ],
    ALLOWED_ATTR: ['href', 'title', 'src', 'alt'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: [
      'onerror',
      'onclick',
      'onload',
      'onmouseover',
      'onfocus',
      'onblur',
      'onchange',
      'onsubmit',
    ],
  });
}

// ============================================================================
// URL Validation
// ============================================================================

/**
 * Validate URL to prevent malicious links
 */
export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    
    // Only allow http/https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    
    // Block javascript: and data: URLs
    if (parsed.protocol === 'javascript:' || parsed.protocol === 'data:') {
      return false;
    }
    
    // Optional: Block known malicious domains
    // Add your blacklist here if needed
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize URL by validating and cleaning it
 */
export function sanitizeUrl(url: string): string | null {
  if (!validateUrl(url)) {
    return null;
  }
  
  try {
    const parsed = new URL(url);
    // Return only http/https URLs
    return parsed.href;
  } catch {
    return null;
  }
}

// ============================================================================
// Spam Detection
// ============================================================================

export interface SpamDetectionResult {
  isSpam: boolean;
  reason?: string;
}

/**
 * Basic spam detection based on content patterns
 */
export function detectSpam(content: string): SpamDetectionResult {
  // Check for too many links
  const linkCount = (content.match(/https?:\/\//g) || []).length;
  if (linkCount > 3) {
    return { isSpam: true, reason: 'Too many links' };
  }
  
  // Check for repetitive characters (e.g., "aaaaaa")
  if (/(.)\1{5,}/.test(content)) {
    return { isSpam: true, reason: 'Repetitive content' };
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /(buy|cheap|discount|click here|limited time)/gi,
    /(http|www\.){3,}/gi, // Multiple URLs
    /[A-Z]{20,}/, // All caps spam
  ];
  
  for (const pattern of suspiciousPatterns) {
    const matches = content.match(pattern);
    if (matches && matches.length > 2) {
      return { isSpam: true, reason: 'Suspicious content pattern' };
    }
  }
  
  return { isSpam: false };
}

/**
 * Check for duplicate content (basic check)
 */
export function isDuplicateContent(
  content: string,
  existingContent: string[]
): boolean {
  const normalized = content.trim().toLowerCase();
  return existingContent.some(
    (existing) => existing.trim().toLowerCase() === normalized
  );
}

// ============================================================================
// Profanity Filter (Basic)
// ============================================================================

/**
 * Basic profanity filter
 * In production, consider using a library like 'bad-words' or a service
 */
const PROFANITY_WORDS: string[] = [
  // Add your profanity list here or use a library
  // This is a placeholder - implement proper filtering
];

export function containsProfanity(text: string): boolean {
  const normalized = text.toLowerCase();
  return PROFANITY_WORDS.some((word) => normalized.includes(word));
}

/**
 * Filter profanity from text (replace with asterisks)
 */
export function filterProfanity(text: string): string {
  let filtered = text;
  PROFANITY_WORDS.forEach((word) => {
    const regex = new RegExp(word, 'gi');
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  });
  return filtered;
}
