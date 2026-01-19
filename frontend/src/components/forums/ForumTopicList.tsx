'use client';

import { ForumTopicCard } from './ForumTopicCard';
import type { ForumTopic } from '@/types/database';
import { Card, CardContent } from '@/components/ui/Card';
import { MessageSquare } from 'lucide-react';

interface ForumTopicListProps {
  topics: ForumTopic[];
  categorySlug?: string;
}

export function ForumTopicList({ topics, categorySlug }: ForumTopicListProps) {
  if (topics.length === 0) {
    return (
      <Card className="bg-olive-800 border-olive-600">
        <CardContent className="py-12 text-center">
          <MessageSquare className="w-16 h-16 text-cream-400 mx-auto mb-4 opacity-50" />
          <p className="text-cream-300 text-lg mb-2">No topics yet</p>
          <p className="text-cream-400 text-sm mb-4">
            Be the first to start a discussion in this category!
          </p>
          {categorySlug && (
            <a
              href={`/forums/${categorySlug}/new`}
              className="inline-block px-4 py-2 bg-orange-500 text-cream-100 rounded-md hover:bg-orange-400 transition-colors"
            >
              Create First Topic
            </a>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {topics.map((topic) => (
        <ForumTopicCard key={topic.id} topic={topic} showCategory={false} />
      ))}
    </div>
  );
}
