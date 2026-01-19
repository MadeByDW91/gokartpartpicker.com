'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, ArrowRight, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getGuides } from '@/actions/guides';
import type { Guide } from '@/types/guides';

interface GuidesSectionProps {
  engineId: string;
  limit?: number;
}

const DIFFICULTY_COLORS: Record<string, 'default' | 'success' | 'info' | 'warning' | 'error'> = {
  beginner: 'success',
  intermediate: 'info',
  advanced: 'warning',
  expert: 'error',
};

export function GuidesSection({ engineId, limit = 3 }: GuidesSectionProps) {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGuides() {
      setLoading(true);
      setError(null);
      try {
        const result = await getGuides({ engine_id: engineId });
        if (result.success && result.data) {
          setGuides(result.data.slice(0, limit));
        } else {
          setError(result.success ? 'Unknown error' : (result.error || 'Failed to load guides'));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load guides');
      } finally {
        setLoading(false);
      }
    }
    loadGuides();
  }, [engineId, limit]);

  if (loading) {
    return (
      <Card className="mt-8 bg-olive-800/50 shadow-lg border border-olive-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-orange-400" />
            <h2 className="text-2xl font-bold text-cream-100">Installation Guides</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-olive-700 h-24 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return null; // Don't show error state, just hide the section
  }

  if (guides.length === 0) {
    return null; // Don't show section if no guides
  }

  return (
    <Card className="mt-8 bg-olive-800/50 shadow-lg border border-olive-700">
      <CardHeader className="bg-olive-800/30 border-b border-olive-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-orange-400" />
            <h2 className="text-2xl font-bold text-cream-100">Installation Guides</h2>
          </div>
          {guides.length >= limit && (
            <Link
              href={`/guides?engine_id=${engineId}`}
              className="text-sm text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {guides.map((guide) => (
            <Link
              key={guide.id}
              href={`/guides/${guide.slug}`}
              className="block p-4 bg-olive-700/30 rounded-lg border border-olive-600 hover:border-orange-500 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-cream-100 mb-2 group-hover:text-orange-400 transition-colors">
                    {guide.title}
                  </h3>
                  {guide.excerpt && (
                    <p className="text-sm text-cream-300 mb-3 line-clamp-2">
                      {guide.excerpt}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    {guide.difficulty_level && (
                      <Badge
                        variant={DIFFICULTY_COLORS[guide.difficulty_level] || 'default'}
                        size="sm"
                      >
                        {guide.difficulty_level}
                      </Badge>
                    )}
                    {guide.estimated_time_minutes && (
                      <div className="flex items-center gap-1 text-xs text-cream-400">
                        <Clock className="w-3 h-3" />
                        <span>~{guide.estimated_time_minutes} min</span>
                      </div>
                    )}
                    {guide.category && (
                      <Badge variant="default" size="sm">
                        {guide.category}
                      </Badge>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-cream-400 group-hover:text-orange-400 transition-colors flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
        {guides.length < limit && (
          <div className="mt-4 text-center">
            <Link
              href="/guides"
              className="text-sm text-orange-400 hover:text-orange-300 transition-colors inline-flex items-center gap-1"
            >
              Browse All Guides
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
