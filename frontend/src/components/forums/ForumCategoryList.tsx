'use client';

import { ForumCategoryCard } from './ForumCategoryCard';
import type { ForumCategory } from '@/types/database';
import { Card, CardContent } from '@/components/ui/Card';
import { MessageSquare } from 'lucide-react';

interface ForumCategoryListProps {
  categories: ForumCategory[];
}

export function ForumCategoryList({ categories }: ForumCategoryListProps) {
  if (categories.length === 0) {
    return (
      <Card className="bg-olive-800/80 border-olive-600 rounded-xl">
        <CardContent className="py-16 text-center">
          <MessageSquare className="w-16 h-16 text-cream-400 mx-auto mb-4 opacity-50" />
          <p className="text-cream-200 text-lg font-semibold mb-2">Forums Coming Soon</p>
          <p className="text-cream-400 text-sm mb-4 max-w-md mx-auto">
            Forum categories will appear here once they are created. The database migration may need to be run.
          </p>
          <p className="text-cream-500 text-xs">
            If you&apos;re an admin, please run the forums schema migration in Supabase.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-8" aria-label="Forum categories">
      <div className="max-w-2xl">
        <h2 className="text-lg font-semibold text-cream-100 mb-1.5">Browse by category</h2>
        <p className="text-sm text-cream-300/90">
          Choose a category to read discussions or start your own. Every category is open to the community.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {categories.map((category) => (
          <ForumCategoryCard
            key={category.id}
            category={category}
            topicCount={(category as ForumCategory & { topic_count?: number }).topic_count ?? 0}
            postCount={(category as ForumCategory & { post_count?: number }).post_count ?? 0}
          />
        ))}
      </div>
    </section>
  );
}
