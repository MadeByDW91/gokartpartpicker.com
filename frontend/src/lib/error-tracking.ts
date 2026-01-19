/**
 * Error tracking utilities
 * Integrates with Sentry or similar error tracking service
 */

export type ErrorContext = {
  userId?: string;
  userEmail?: string;
  path?: string;
  buildId?: string;
  engineId?: string;
  partId?: string;
  [key: string]: unknown;
};

/**
 * Initialize error tracking
 * Note: Sentry integration is optional. Install @sentry/nextjs to enable.
 */
export function initErrorTracking() {
  if (typeof window === 'undefined') return;
  
  // Sentry initialization (optional - only if DSN is provided and package is installed)
  // To enable Sentry, install: npm install @sentry/nextjs
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // Use dynamic import with eval to prevent build-time analysis
    // This allows the code to work even if Sentry is not installed
    try {
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const loadSentry = new Function('return import("@sentry/nextjs")');
      loadSentry()
        .then((Sentry: any) => {
          if (Sentry && typeof Sentry.init === 'function') {
            Sentry.init({
              dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
              environment: process.env.NODE_ENV || 'development',
              tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
              beforeSend(event: any, hint: any) {
                // Filter out known non-critical errors
                if (event.exception) {
                  const error = hint.originalException;
                  if (error instanceof Error) {
                    // Ignore network errors (they're handled gracefully)
                    if (error.message.includes('Failed to fetch') || 
                        error.message.includes('NetworkError')) {
                      return null;
                    }
                  }
                }
                return event;
              },
            });
          }
        })
        .catch(() => {
          // Silently fail if Sentry can't be loaded (package not installed)
          if (process.env.NODE_ENV === 'development') {
            console.log('[Error Tracking] Sentry not installed - skipping initialization');
          }
        });
    } catch {
      // Silently fail if dynamic import is not supported
    }
  }
}

/**
 * Capture an exception
 */
export function captureException(
  error: Error,
  context?: ErrorContext
) {
  if (typeof window === 'undefined') return;
  
  // Sentry
  if (window.Sentry) {
    window.Sentry.captureException(error, {
      contexts: {
        custom: context || {},
      },
    });
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error Tracking]', error, context);
  }
}

/**
 * Capture a message
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: ErrorContext
) {
  if (typeof window === 'undefined') return;
  
  // Sentry
  if (window.Sentry) {
    window.Sentry.captureMessage(message, {
      level,
      contexts: {
        custom: context || {},
      },
    });
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Error Tracking] ${level.toUpperCase()}:`, message, context);
  }
}

/**
 * Set user context for error tracking
 */
export function setUserContext(userId: string, email?: string) {
  if (typeof window === 'undefined') return;
  
  if (window.Sentry) {
    window.Sentry.setUser({
      id: userId,
      email,
    });
  }
}

/**
 * Clear user context
 */
export function clearUserContext() {
  if (typeof window === 'undefined') return;
  
  if (window.Sentry) {
    window.Sentry.setUser(null);
  }
}

// TypeScript declarations
declare global {
  interface Window {
    Sentry?: {
      init: (config: unknown) => void;
      captureException: (error: Error, context?: unknown) => void;
      captureMessage: (message: string, options?: unknown) => void;
      setUser: (user: { id: string; email?: string } | null) => void;
    };
  }
}
