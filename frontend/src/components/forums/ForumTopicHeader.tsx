'use client';

import { Badge } from '@/components/ui/Badge';
import { Pin, Lock, Eye, MessageSquare, User, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { ForumTopic } from '@/types/database';

interface ForumTopicHeaderProps {
  topic: ForumTopic;
}

export function ForumTopicHeader({ topic }: ForumTopicHeaderProps) {
  return (
    <div>
      <div className="flex items-start gap-3 mb-4">
        {topic.is_pinned && (
          <Badge variant="default" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
            <Pin className="w-3 h-3 mr-1" />
            Pinned
          </Badge>
        )}
        {topic.is_locked && (
          <Badge variant="default" className="bg-red-500/20 text-red-400 border-red-500/30">
            <Lock className="w-3 h-3 mr-1" />
            Locked
          </Badge>
        )}
      </div>

      <h1 className="text-display text-3xl sm:text-4xl text-cream-100 mb-4">
        {topic.title}
      </h1>

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-cream-400">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span className="text-cream-200 font-medium">{topic.user?.username || 'Anonymous'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{formatDate(topic.created_at)}</span>
        </div>
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          <span>{topic.replies_count} replies</span>
        </div>
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          <span>{topic.views_count} views</span>
        </div>
      </div>
    </div>
  );
}
