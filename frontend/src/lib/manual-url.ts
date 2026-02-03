/**
 * Resolves engine manual URLs to absolute, working URLs.
 * Relative paths like /manuals/file.pdf 404 when requested from the app (no file in public/manuals/).
 * We resolve them to either Supabase storage or our /api/manual proxy so "Open in new tab" doesn't 404.
 */

const SUPABASE_MANUAL_BUCKET_PATH = '/storage/v1/object/public/engine-manuals';
const API_MANUAL_PREFIX = '/api/manual';

function getSupabaseUrl(): string | undefined {
  if (typeof process === 'undefined') return undefined;
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
}

/** Normalize path to "manuals/xxx" for storage/API */
function toManualsPath(trimmed: string): string | null {
  if (trimmed.startsWith('/manuals/')) return trimmed.slice(1); // "manuals/xxx"
  if (trimmed.startsWith('manuals/')) return trimmed;
  if (trimmed.includes('..')) return null;
  return null;
}

/**
 * Returns an absolute URL suitable for viewing/downloading the manual.
 * - Full http(s) URLs to our own origin with path /manuals/* are rewritten so they don't 404.
 * - Full http(s) URLs to other origins are returned as-is.
 * - Relative paths /manuals/* or manuals/* are resolved to Supabase or /api/manual so they don't 404.
 * - Other relative paths are resolved against the current origin.
 */
export function getAbsoluteManualUrl(url: string): string {
  const trimmed = (url || '').trim();
  if (!trimmed) return url;

  // Already absolute
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      // Same-origin /manuals/* -> rewrite so "Open in new tab" doesn't hit our app (404)
      if (typeof window !== 'undefined' && parsed.origin === window.location.origin) {
        const manualsPath = toManualsPath(parsed.pathname);
        if (manualsPath) {
          const supabaseUrl = getSupabaseUrl();
          if (supabaseUrl) {
            const base = supabaseUrl.replace(/\/$/, '');
            return `${base}${SUPABASE_MANUAL_BUCKET_PATH}/${manualsPath}`;
          }
          return `${window.location.origin}${API_MANUAL_PREFIX}/${manualsPath}`;
        }
      }
      return parsed.toString();
    } catch {
      return trimmed;
    }
  }

  // Relative path under manuals/
  const manualsPath = toManualsPath(trimmed.startsWith('/') ? trimmed : `/${trimmed}`);
  if (manualsPath) {
    const supabaseUrl = getSupabaseUrl();
    if (supabaseUrl) {
      const base = supabaseUrl.replace(/\/$/, '');
      return `${base}${SUPABASE_MANUAL_BUCKET_PATH}/${manualsPath}`;
    }
    // No Supabase URL (e.g. client env not set) -> use API route so server can redirect
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${API_MANUAL_PREFIX}/${manualsPath}`;
    }
    // Server-side without Supabase URL: return path for API route
    return `${API_MANUAL_PREFIX}/${manualsPath}`;
  }

  // Bare filename like "69730.pdf" -> treat as manuals/69730.pdf when we have a way to serve it
  if (trimmed.includes('/') === false && /\.(pdf|doc|docx)$/i.test(trimmed)) {
    const manualsPath = `manuals/${trimmed}`;
    const supabaseUrl = getSupabaseUrl();
    if (supabaseUrl) {
      const base = supabaseUrl.replace(/\/$/, '');
      return `${base}${SUPABASE_MANUAL_BUCKET_PATH}/${manualsPath}`;
    }
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${API_MANUAL_PREFIX}/${manualsPath}`;
    }
    return `${API_MANUAL_PREFIX}/${manualsPath}`;
  }

  // Other relative paths: resolve against current origin (client only)
  if (typeof window !== 'undefined') {
    const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${window.location.origin}${path}`;
  }

  return trimmed;
}
