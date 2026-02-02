import { Metadata } from 'next';
import { getForumCategories } from '@/actions/forums';
import { ForumCategoryList } from '@/components/forums/ForumCategoryList';
import { PageHero } from '@/components/layout/PageHero';
import { MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Forums | GoKartPartPicker',
  description: 'Join the GoKartPartPicker community! Discuss engines, parts, builds, and get help from fellow go-kart enthusiasts.',
};

// ISR: revalidate every 5 min (forum categories change infrequently)
export const revalidate = 300;

/**
 * Main forums page - displays all forum categories
 */
export default async function ForumsPage() {
  const categoriesResult = await getForumCategories();

  // Handle errors gracefully - if tables don't exist, show empty state
  const categories = categoriesResult.success ? categoriesResult.data : [];

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
