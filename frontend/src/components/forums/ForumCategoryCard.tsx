'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MessageSquare, Lock, ChevronRight, ChevronDown } from 'lucide-react';
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
  lastActivity,
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
        if (result.success) {
          setTopics(result.data as ForumTopic[]);
        }
      } catch (error) {
        console.error('Error fetching topics:', error);
      } finally {
        setLoading(false);
      }
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className="bg-olive-800 border-olive-600 hover:border-orange-500/50 transition-all group">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={cn('flex-shrink-0 w-12 h-12 rounded-lg bg-olive-700 flex items-center justify-center', iconColor)}>
            {category.icon ? (
              <span className="text-2xl">{category.icon}</span>
            ) : (
              <MessageSquare className="w-6 h-6" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Link 
                    href={`/forums/${category.slug}`}
                    className="text-lg font-semibold text-cream-100 group-hover:text-orange-400 transition-colors"
                  >
                    {category.name}
                  </Link>
                  <button
                    onClick={handleToggle}
                    className="text-cream-400 hover:text-orange-400 transition-colors"
                    aria-label={isExpanded ? 'Collapse topics' : 'Expand topics'}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {category.description && (
                  <p className="text-sm text-cream-400 mt-1 line-clamp-2">
                    {category.description}
                  </p>
                )}
              </div>
            </div>

            {/* Stats and Badges */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2 text-sm text-cream-400">
                <span className="font-medium text-cream-300">{topicCount}</span>
                <span>topics</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-cream-400">
                <span className="font-medium text-cream-300">{postCount}</span>
                <span>replies</span>
              </div>
              {category.requires_auth && (
                <Badge variant="default" className="text-xs">
                  <Lock className="w-3 h-3 mr-1" />
                  Members Only
                </Badge>
              )}
            </div>

            {/* Expanded Topics List */}
            {isExpanded && (
              <div className="mt-4 space-y-2 border-t border-olive-600 pt-4">
                {loading ? (
                  <div className="text-sm text-cream-400 py-4 text-center">Loading topics...</div>
                ) : topics.length > 0 ? (
                  topics.map((topic) => (
                    <ForumTopicCard key={topic.id} topic={topic} />
                  ))
                ) : (
                  <div className="text-sm text-cream-400 py-4 text-center">
                    No topics yet. <Link href={`/forums/${category.slug}/new`} className="text-orange-400 hover:underline">Create the first one!</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
