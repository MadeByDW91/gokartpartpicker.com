'use client';

import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

export default function ForumsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-olive-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-olive-800 border border-olive-600 rounded-xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-olive-700 flex items-center justify-center mx-auto mb-6">
          <MessageSquare className="w-7 h-7 text-cream-400" aria-hidden />
        </div>
        <h2 className="text-xl font-bold text-cream-100 mb-2">Forums temporarily unavailable</h2>
        <p className="text-cream-400 text-sm mb-6">
          We couldn&apos;t load the forums right now. This is often temporary. Try again or head back home.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="px-4 py-2.5 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-400 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-4 py-2.5 rounded-lg border border-olive-600 text-cream-200 font-medium hover:bg-olive-700 transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
