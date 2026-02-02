/**
 * Secure logging utility
 * Sanitizes PII (Personally Identifiable Information) before logging
 */

/**
 * Sanitize email address for logging
 * Example: user@example.com → us***@example.com
 */
export function sanitizeEmail(email: string | null | undefined): string {
  if (!email || !email.includes('@')) return '***';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return '***@' + domain;
  return local.substring(0, 2) + '***@' + domain;
}

/**
 * Sanitize user ID for logging
 * Example: 12345678-1234-1234-1234-123456789abc → 12345678...
 */
export function sanitizeUserId(id: string | null | undefined): string {
  if (!id || id.length < 8) return '***';
  return id.substring(0, 8) + '...';
}

/**
 * Sanitize any string that might contain PII
 */
export function sanitizeString(str: string | null | undefined, maxLength = 50): string {
  if (!str) return '***';
  if (str.length <= maxLength) return str.substring(0, 2) + '***';
  return str.substring(0, 2) + '***' + str.substring(str.length - 2);
}

/**
 * Sanitize an object for logging (removes PII fields)
 */
export function sanitizeLogData(data: any): any {
  if (!data || typeof data !== 'object') return data;
  
  const sanitized: any = Array.isArray(data) ? [] : {};
  
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    
    // Never log passwords or tokens
    if (lowerKey.includes('password') || lowerKey.includes('token') || lowerKey.includes('secret')) {
      sanitized[key] = '***REDACTED***';
      continue;
    }
    
    // Sanitize email fields
    if (lowerKey.includes('email') && typeof value === 'string') {
      sanitized[key] = sanitizeEmail(value);
      continue;
    }
    
    // Sanitize user ID fields
    if ((lowerKey.includes('userid') || lowerKey === 'id' || lowerKey === 'user_id') && typeof value === 'string') {
      sanitized[key] = sanitizeUserId(value);
      continue;
    }
    
    // Recursively sanitize nested objects
    if (value && typeof value === 'object') {
      sanitized[key] = sanitizeLogData(value);
      continue;
    }
    
    // Keep other values as-is
    sanitized[key] = value;
  }
  
  return sanitized;
}

/**
 * Secure console.log - sanitizes PII before logging
 */
export function secureLog(level: 'log' | 'error' | 'warn' | 'info', message: string, data?: any): void {
  const sanitized = data ? sanitizeLogData(data) : undefined;
  
  if (sanitized) {
    console[level](message, sanitized);
  } else {
    console[level](message);
  }
}

/**
 * Secure console.error - sanitizes PII
 */
export function secureError(message: string, error?: any): void {
  if (error) {
    const sanitized = sanitizeLogData({
      message: error?.message || String(error),
      stack: error?.stack ? '***REDACTED***' : undefined,
      ...(typeof error === 'object' ? error : {}),
    });
    console.error(message, sanitized);
  } else {
    console.error(message);
  }
}
