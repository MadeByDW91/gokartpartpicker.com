'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for debugging
    console.error('Error boundary caught:', error);
    
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
    <div className="min-h-screen bg-olive-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-olive-800 border border-olive-600 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-cream-100 mb-4">Something went wrong!</h2>
        <p className="text-cream-400 mb-6">
          We encountered an unexpected error. Please try again or contact support if the problem persists.
        </p>
        {error.digest && (
          <p className="text-xs text-cream-500 mb-4 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex gap-4 justify-center">
          <Button variant="primary" onClick={reset}>
            Try Again
          </Button>
          <Button variant="secondary" onClick={() => window.location.href = '/'}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
