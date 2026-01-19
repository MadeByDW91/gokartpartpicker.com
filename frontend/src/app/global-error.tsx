'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for debugging
    console.error('Global error boundary caught:', error);
    
    // Track error in error tracking service (client-side only)
    if (typeof window !== 'undefined') {
      import('@/lib/error-tracking').then(({ captureException }) => {
        captureException(error, {
          path: window.location.pathname,
          digest: error.digest,
        });
      }).catch(() => {
        // Silently fail if error tracking can't be loaded
      });
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-olive-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-olive-800 border border-olive-600 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-cream-100 mb-4">Something went wrong!</h2>
          <p className="text-cream-400 mb-6">
            A critical error occurred. Please refresh the page or contact support.
          </p>
          {error.digest && (
            <p className="text-xs text-cream-500 mb-4 font-mono">
              Error ID: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            className="px-4 py-2 bg-orange-500 text-cream-100 rounded-md hover:bg-orange-400 transition-colors"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
