import Link from 'next/link';
import { Button } from '@/components/ui/Button';

/**
 * Custom 404 Not Found page
 * Shown when a page doesn't exist
 */
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-16">
      <div className="text-center max-w-md space-y-6">
        {/* 404 Badge */}
        <div className="inline-block px-4 py-2 rounded-lg bg-background-card border border-border text-accent font-display text-2xl">
          404
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-display text-foreground">
          Page Not Found
        </h1>

        {/* Message */}
        <p className="text-foreground-muted text-lg">
          Oops! This page doesn&apos;t exist. It may have been moved or removed.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link href="/">
            <Button variant="primary">Go Home</Button>
          </Link>
          <Link href="/engines">
            <Button variant="secondary">Browse Engines</Button>
          </Link>
          <Link href="/parts">
            <Button variant="secondary">Browse Parts</Button>
          </Link>
        </div>

        {/* Search Suggestion */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-foreground-muted mb-2">
            Looking for something specific?
          </p>
          <Link
            href="/builder"
            className="text-accent hover:text-accent-hover transition-colors underline"
          >
            Try our Builder →
          </Link>
        </div>
      </div>
    </div>
  );
}
