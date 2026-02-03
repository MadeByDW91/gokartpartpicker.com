'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, BookOpen, Filter, Search, ArrowRight, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getGuides } from '@/actions/guides';
import type { Guide } from '@/types/guides';
import { cn } from '@/lib/utils';

const DIFFICULTY_COLORS = {
  beginner: 'success',
  intermediate: 'info',
  advanced: 'warning',
  expert: 'error',
} as const;



function GuideCard({ guide, compact = false }: { guide: Guide; compact?: boolean }) {
  return (
    <Link href={`/guides/${guide.slug}`} className="block h-full">
      <Card className={cn(
        'h-full hover:border-orange-500 transition-all cursor-pointer group border-olive-700/50 bg-olive-800/40',
        compact && 'min-w-[280px]'
      )}>
        {guide.featured_image_url && (
          <div className="relative w-full h-40 bg-olive-800 overflow-hidden rounded-t-lg">
            <Image
              src={guide.featured_image_url}
              alt={guide.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
              unoptimized
            />
          </div>
        )}
        <CardHeader className={compact ? 'p-4' : undefined}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h2 className={cn(
              'font-bold text-cream-100 group-hover:text-orange-400 transition-colors flex-1 line-clamp-2',
              compact ? 'text-base' : 'text-xl'
            )}>
              {guide.title}
            </h2>
            {guide.difficulty_level && (
              <Badge variant={DIFFICULTY_COLORS[guide.difficulty_level] || 'default'} className="flex-shrink-0 text-xs">
                {guide.difficulty_level}
              </Badge>
            )}
          </div>
          {guide.category && (
            <Badge variant="default" className="text-xs mb-2">
              {guide.category}
            </Badge>
          )}
        </CardHeader>
        <CardContent className={compact ? 'p-4 pt-0' : undefined}>
          {guide.excerpt && (
            <p className="text-cream-300 text-sm mb-4 line-clamp-2">
              {guide.excerpt}
            </p>
          )}
          <div className="flex items-center justify-between text-sm text-cream-400">
            {guide.estimated_time_minutes != null && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>~{guide.estimated_time_minutes}m</span>
              </div>
            )}
            <span className="text-orange-400 group-hover:text-orange-300 text-sm font-medium flex items-center gap-1">
              View <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function GuidesList() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getGuides()
      .then((result) => {
        if (cancelled) return;
        if (result.success && result.data) {
          setGuides(result.data);
        } else {
          setError('Failed to load guides');
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load guides');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const allGuidesFiltered = useMemo(() => {
    const list = guides.filter((guide) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        guide.title.toLowerCase().includes(q) ||
        (guide.excerpt?.toLowerCase().includes(q) ?? false) ||
        (guide.tags?.some((t) => t.toLowerCase().includes(q)) ?? false)
      );
    });
    return [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [guides, searchQuery]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-4" />
        <p className="text-cream-400">Loading guides...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-500/30 bg-red-500/10">
        <CardContent className="p-6 text-center">
          <p className="text-red-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const hasActiveFilters = searchQuery.trim() !== '';

  const clearAllFilters = () => setSearchQuery('');

  return (
    <div className="space-y-8">
      {/* Filter Guides – same format as Filter Videos */}
      <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/5 via-olive-800/40 to-olive-800/40">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <Filter className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-cream-100">Filter Guides</h3>
              <p className="text-sm text-cream-400">Search guides below</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
            <Input
              type="text"
              placeholder="Search guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 min-h-[44px] bg-olive-800/70 border-olive-700/50 text-cream-100 placeholder-cream-500 focus:border-purple-500/50"
            />
          </div>

          {/* Active Filters Display – search only */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-olive-700/30">
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-xs text-cream-400">Active:</span>
                {searchQuery.trim() !== '' && (
                  <Badge variant="default" className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs px-2.5 py-1 inline-flex items-center gap-1">
                    &quot;{searchQuery.trim().slice(0, 12)}{searchQuery.trim().length > 12 ? '…' : ''}&quot;
                    <button
                      onClick={() => setSearchQuery('')}
                      className="min-h-[44px] min-w-[44px] -m-1 flex items-center justify-center rounded hover:text-purple-200 touch-manipulation"
                      aria-label="Clear search"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs min-h-[44px] px-3 text-cream-400 hover:text-cream-100 touch-manipulation"
                >
                  Clear all
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All guides – count + scrollable list */}
      <div>
        <h2 className="text-2xl font-bold text-cream-100 mb-1">Guides</h2>
        <p className="text-cream-400 text-sm mb-4">
          {allGuidesFiltered.length} guide{allGuidesFiltered.length !== 1 ? 's' : ''} available
          {searchQuery.trim() && ` matching "${searchQuery}"`}
        </p>

        {/* Scrollable list of all guides */}
        <div className="max-h-[600px] overflow-y-auto rounded-lg border border-olive-700/50 bg-olive-800/20 p-4">
          {allGuidesFiltered.length === 0 ? (
            <div className="py-12 text-center text-cream-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No guides match the current filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allGuidesFiltered.map((guide) => (
                <GuideCard key={guide.id} guide={guide} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
