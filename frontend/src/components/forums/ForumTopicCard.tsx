'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Pin, Lock, MessageSquare, Eye, Clock, User } from 'lucide-react';
import type { ForumTopic } from '@/types/database';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ForumTopicCardProps {
  topic: ForumTopic;
  showCategory?: boolean;
}

export function ForumTopicCard({ topic, showCategory = false }: ForumTopicCardProps) {
  const hasReplies = topic.replies_count > 0;
  const lastActivity = topic.last_reply_at || topic.created_at;

  return (
    <Link href={`/forums/${topic.category?.slug || 'general'}/${topic.slug}`}>
      <Card
        className={cn(
          'bg-olive-800 border-olive-600 hover:border-orange-500/50 transition-all cursor-pointer group',
          topic.is_pinned && 'border-orange-500/30 bg-orange-500/5'
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Status Icons */}
            <div className="flex-shrink-0 flex flex-col items-center gap-2 pt-1">
              {topic.is_pinned && (
                <Pin className="w-4 h-4 text-orange-400 fill-orange-400" />
              )}
              {topic.is_locked && (
                <Lock className="w-4 h-4 text-red-400" />
              )}
              {!topic.is_pinned && !topic.is_locked && (
                <MessageSquare className="w-4 h-4 text-cream-400" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-cream-100 group-hover:text-orange-400 transition-colors line-clamp-2">
                      {topic.title}
                    </h3>
                    {topic.is_pinned && (
                      <Badge variant="default" className="text-xs">
                        Pinned
                      </Badge>
                    )}
                    {topic.is_locked && (
                      <Badge variant="default" className="text-xs bg-red-500/20 text-red-400 border-red-500/30">
                        Locked
                      </Badge>
                    )}
                  </div>
                  {showCategory && topic.category && (
                    <p className="text-xs text-cream-500 mb-1">
                      in {topic.category.name}
                    </p>
                  )}
                  <p className="text-sm text-cream-400 line-clamp-2 mt-1">
                    {topic.content}
                  </p>
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-4 mt-3 text-xs text-cream-500">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{topic.user?.username || 'Anonymous'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(lastActivity)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>{topic.replies_count} replies</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{topic.views_count} views</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
