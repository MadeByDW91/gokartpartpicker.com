import { Metadata } from 'next';
import { ForumCategoryList } from '@/components/forums/ForumCategoryList';
import { PageHero } from '@/components/layout/PageHero';
import type { ForumCategory } from '@/types/database';
import { MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Forums | GoKartPartPicker',
  description: 'Join the GoKartPartPicker community! Discuss engines, parts, builds, and get help from fellow go-kart enthusiasts.',
};

// Uses server Supabase client (cookies) — render at request time to avoid static/cookie warning
export const dynamic = 'force-dynamic';

/**
 * Main forums page - displays all forum categories.
 * Uses dynamic import for getForumCategories so module load failures don't 500 the page.
 */
export default async function ForumsPage() {
  let categories: (ForumCategory & { topic_count?: number; post_count?: number })[] = [];
  try {
    const { getForumCategories } = await import('@/actions/forums');
    const categoriesResult = await getForumCategories();
    categories = categoriesResult.success ? categoriesResult.data : [];
  } catch (err) {
    console.error('[ForumsPage] Failed to load categories:', err);
    categories = [];
  }

  return (
    <div className="min-h-screen bg-olive-900">
      <PageHero
        eyebrow="Community"
        icon={<MessageSquare className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />}
        title="Community Forums"
        subtitle="Connect with fellow go-kart enthusiasts. Share builds, ask questions, and get help from the community."
      />

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ForumCategoryList categories={categories} />
      </div>
    </div>
  );
}
