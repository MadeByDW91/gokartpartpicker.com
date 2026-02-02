'use client';

import { usePathname } from 'next/navigation';
import { useImpersonation } from '@/hooks/use-impersonation';
import { UserX, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ImpersonationBanner() {
  const pathname = usePathname();
  const { active, username, loading, exit } = useImpersonation();

  if (loading || !active) return null;
  if (pathname?.startsWith('/admin')) return null;

  return (
    <div
      className="sticky top-0 z-50 w-full bg-amber-500/15 border-b border-amber-500/40 text-amber-200"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <UserX className="w-4 h-4 text-amber-400" aria-hidden />
          <span>
            Viewing as {username ? `@${username}` : 'test user'}
          </span>
          <span className="text-amber-500/80 text-xs font-normal">
            (View-only • admin mode)
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={exit}
          className="text-amber-200 hover:text-amber-100 hover:bg-amber-500/20"
          icon={<X className="w-4 h-4" />}
        >
          Exit view-as
        </Button>
      </div>
    </div>
  );
}
