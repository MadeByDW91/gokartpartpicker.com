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
      <Card className="bg-olive-800 border-olive-600">
        <CardContent className="py-12 text-center">
          <MessageSquare className="w-16 h-16 text-cream-400 mx-auto mb-4 opacity-50" />
          <p className="text-cream-300 text-lg mb-2">Forums Coming Soon</p>
          <p className="text-cream-400 text-sm mb-4">
            Forum categories will appear here once they are created. The database migration may need to be run.
          </p>
          <p className="text-cream-500 text-xs">
            If you're an admin, please run the forums schema migration in Supabase.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <ForumCategoryCard 
          key={category.id} 
          category={category}
          topicCount={(category as any).topic_count || 0}
          postCount={(category as any).post_count || 0}
        />
      ))}
    </div>
  );
}
