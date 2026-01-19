'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CheckCircle, ThumbsUp, Edit, Trash2, Flag, MoreVertical } from 'lucide-react';
import type { ForumPost } from '@/types/database';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ForumPostCardProps {
  post: ForumPost;
  isAuthor?: boolean;
  isModerator?: boolean;
  onLike?: (postId: string) => void;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onMarkSolution?: (postId: string) => void;
  onReport?: (postId: string) => void;
}

export function ForumPostCard({
  post,
  isAuthor = false,
  isModerator = false,
  onLike,
  onEdit,
  onDelete,
  onMarkSolution,
  onReport,
}: ForumPostCardProps) {
  const canEdit = isAuthor && !post.is_edited;
  const canDelete = isAuthor || isModerator;
  const canMarkSolution = isModerator || (post.topic?.user_id === post.user_id);

  return (
    <Card
      className={cn(
        'bg-olive-800 border-olive-600',
        post.is_solution && 'border-green-500/30 bg-green-500/5'
      )}
    >
      <CardContent className="p-6">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-cream-100 font-bold">
              {post.user?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <p className="font-semibold text-cream-100">
                {post.user?.username || 'Anonymous'}
              </p>
              <div className="flex items-center gap-2 text-xs text-cream-400">
                <span>{formatDate(post.created_at)}</span>
                {post.is_edited && (
                  <>
                    <span>•</span>
                    <span className="italic">edited {formatDate(post.edited_at!)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {post.is_solution && (
              <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle className="w-3 h-3 mr-1" />
                Solution
              </Badge>
            )}
            {isModerator && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReport?.(post.id)}
                icon={<Flag className="w-4 h-4" />}
              />
            )}
          </div>
        </div>

        {/* Post Content */}
        <div
          className="prose prose-invert prose-olive max-w-none text-cream-200 mb-4 whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br>') }}
        />

        {/* Post Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-olive-600">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike?.(post.id)}
              icon={<ThumbsUp className="w-4 h-4" />}
            >
              {post.likes_count > 0 && <span className="ml-1">{post.likes_count}</span>}
            </Button>
            {canMarkSolution && !post.is_solution && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkSolution?.(post.id)}
                icon={<CheckCircle className="w-4 h-4" />}
              >
                Mark Solution
              </Button>
            )}
          </div>

          {(canEdit || canDelete) && (
            <div className="flex items-center gap-2">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit?.(post.id)}
                  icon={<Edit className="w-4 h-4" />}
                >
                  Edit
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete?.(post.id)}
                  icon={<Trash2 className="w-4 h-4" />}
                >
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
