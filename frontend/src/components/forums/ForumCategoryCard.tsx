'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MessageSquare, Lock, ChevronRight, ChevronDown, ArrowRight } from 'lucide-react';
import type { ForumCategory, ForumTopic } from '@/types/database';
import { ForumTopicCard } from './ForumTopicCard';
import { getForumTopics } from '@/actions/forums';
import { cn } from '@/lib/utils';

interface ForumCategoryCardProps {
  category: ForumCategory;
  topicCount?: number;
  postCount?: number;
  lastActivity?: string | null;
}

export function ForumCategoryCard({
  category,
  topicCount = 0,
  postCount = 0,
}: ForumCategoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const iconColor = category.color || 'text-orange-400';

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isExpanded && topics.length === 0) {
      setLoading(true);
      try {
        const result = await getForumTopics({
          category_id: category.id,
          limit: 5,
          sort: 'newest',
        });
        if (result.success) setTopics(result.data as ForumTopic[]);
      } catch (error) {
        console.error('Error fetching topics:', error);
      } finally {
        setLoading(false);
      }
    }
    setIsExpanded(!isExpanded);
  };

  const activityLabel =
    postCount > 0
      ? `${topicCount} topics · ${postCount} replies`
      : topicCount > 0
        ? `${topicCount} topics — start the conversation`
        : 'No topics yet — be the first';

  return (
    <Card
      className={cn(
        'rounded-xl border-l-4 border-olive-600 bg-olive-800/60 hover:bg-olive-800/80 hover:border-orange-500/50 hover:shadow-lg hover:shadow-black/10 transition-all duration-200 group hover:-translate-y-0.5',
        'border border-olive-600/80'
      )}
    >
      <CardContent className="p-5">
        <Link href={`/forums/${category.slug}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-olive-900 rounded-lg -m-1 p-1">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'flex-shrink-0 w-11 h-11 rounded-xl bg-olive-700/80 flex items-center justify-center border border-olive-600/50 group-hover:border-orange-500/30 transition-colors',
                iconColor
              )}
            >
              {category.icon ? (
                <span className="text-xl" aria-hidden>{category.icon}</span>
              ) : (
                <MessageSquare className="w-5 h-5" aria-hidden />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-cream-100 group-hover:text-orange-400 transition-colors leading-tight">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-sm text-cream-400/95 mt-1.5 line-clamp-2 leading-snug">
                      {category.description}
                    </p>
                  )}
                </div>
                <span className="flex-shrink-0 text-cream-500 group-hover:text-orange-400 transition-colors" aria-hidden>
                  <ArrowRight className="w-5 h-5" />
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
                <span className="text-xs text-cream-500/90" aria-label={`Activity: ${activityLabel}`}>
                  {activityLabel}
                </span>
                {category.requires_auth && (
                  <Badge variant="default" className="text-xs">
                    <Lock className="w-3 h-3 mr-1" />
                    Members Only
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Link>

        <div className="mt-3 pt-3 border-t border-olive-600/50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleToggle}
            className="text-xs font-medium text-cream-400 hover:text-orange-400 transition-colors inline-flex items-center gap-1 min-h-[44px] py-2 touch-manipulation"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse topic preview' : 'Preview recent topics'}
          >
            {isExpanded ? (
              <>
                <ChevronDown className="w-4 h-4" />
                Hide preview
              </>
            ) : (
              <>
                <ChevronRight className="w-4 h-4" />
                Preview topics
              </>
            )}
          </button>
          <Link
            href={`/forums/${category.slug}`}
            className="text-xs font-medium text-orange-400 hover:text-orange-300 transition-colors min-h-[44px] inline-flex items-center py-2 touch-manipulation"
          >
            Browse topics
          </Link>
        </div>

        {isExpanded && (
          <div className="mt-4 border-t border-olive-600/50 pt-4">
            <div className="max-h-[320px] overflow-y-auto overflow-x-hidden overscroll-contain pr-1 -mr-1 space-y-2">
              {loading ? (
                <p className="text-sm text-cream-500 py-3 text-center">Loading…</p>
              ) : topics.length > 0 ? (
                topics.map((topic) => (
                  <ForumTopicCard key={topic.id} topic={topic} />
                ))
              ) : (
                <p className="text-sm text-cream-500 py-3 text-center">
                  No topics yet.{' '}
                  <Link href={`/forums/${category.slug}/new`} className="text-orange-400 hover:underline">
                    Start the first one
                  </Link>
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
