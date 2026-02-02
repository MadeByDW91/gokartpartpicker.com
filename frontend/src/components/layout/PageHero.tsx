'use client';

import { cn } from '@/lib/utils';

export interface PageHeroProps {
  /** Small uppercase label above the title (e.g. "Catalog", "Builder") */
  eyebrow?: string;
  /** Icon element — will be wrapped in the standard container; use orange-400 for color */
  icon: React.ReactNode;
  /** Main page title */
  title: string;
  /** Short description below the title */
  subtitle?: string;
  /** Optional content on the right (badges, static text) — hidden on small screens */
  rightSlot?: React.ReactNode;
  /** Optional actions (buttons, dropdowns) — on lg+ shown on the right; on smaller screens shown below title */
  actions?: React.ReactNode;
  /** Content below the title block (e.g. Power Source selector, search + filters) */
  children?: React.ReactNode;
  /** Whether the header is sticky */
  sticky?: boolean;
  className?: string;
}

/**
 * Shared page header for a consistent look across Parts, Engines, Builder, Forums, Tools.
 * Uses design tokens: olive backgrounds, cream text, orange accent, same icon container and typography.
 */
export function PageHero({
  eyebrow,
  icon,
  title,
  subtitle,
  rightSlot,
  actions,
  children,
  sticky = false,
  className,
}: PageHeroProps) {
  return (
    <header
      className={cn(
        'relative overflow-hidden border-b border-olive-700/50',
        sticky && 'sticky top-0 z-40',
        className
      )}
    >
      {/* Subtle gradient and depth — same on every page */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-olive-900 via-olive-800/30 to-olive-900"
        aria-hidden
      />
      <div
        className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
        aria-hidden
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            {eyebrow && (
              <p className="text-xs sm:text-sm uppercase tracking-widest text-cream-400 mb-2 font-medium">
                {eyebrow}
              </p>
            )}
            <div className="flex items-center gap-4 mb-3">
              {/* Consistent icon container — olive, rounded-xl, border */}
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-xl border border-olive-600 bg-olive-800/90 shadow-sm text-orange-400 [&>svg]:h-6 [&>svg]:w-6 sm:[&>svg]:h-7 sm:[&>svg]:w-7">
                {icon}
              </div>
              <h1 className="text-display text-3xl sm:text-4xl lg:text-5xl text-cream-100 tracking-tight">
                {title}
              </h1>
            </div>
            {subtitle && (
              <p className="text-base sm:text-lg text-cream-200 max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
          {rightSlot && !actions && (
            <div className="hidden lg:flex items-center gap-6 text-sm text-cream-400 border-l border-olive-600 pl-6 shrink-0">
              {rightSlot}
            </div>
          )}
          {actions && (
            <>
              <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
                {actions}
              </div>
              <div className="lg:hidden flex items-center gap-2 flex-wrap">
                {actions}
              </div>
            </>
          )}
        </div>
        {children && <div className="mt-6">{children}</div>}
      </div>
    </header>
  );
}
