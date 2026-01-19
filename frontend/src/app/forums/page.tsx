import { Metadata } from 'next';
import { getForumCategories } from '@/actions/forums';
import { ForumCategoryList } from '@/components/forums/ForumCategoryList';
import { MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Forums | GoKartPartPicker',
  description: 'Join the GoKartPartPicker community! Discuss engines, parts, builds, and get help from fellow go-kart enthusiasts.',
};

export const dynamic = 'force-dynamic';

/**
 * Main forums page - displays all forum categories
 */
export default async function ForumsPage() {
  const categoriesResult = await getForumCategories();

  // Handle errors gracefully - if tables don't exist, show empty state
  const categories = categoriesResult.success ? categoriesResult.data : [];

  return (
    <div className="min-h-screen bg-olive-900">
      {/* Header */}
      <div className="bg-olive-800 border-b border-olive-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-orange-400" />
            </div>
            <div>
              <h1 className="text-display text-4xl text-cream-100">Community Forums</h1>
              <p className="text-cream-400 mt-2 max-w-2xl">
                Connect with fellow go-kart enthusiasts. Share builds, ask questions, and get help from the community.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ForumCategoryList categories={categories} />
      </div>
    </div>
  );
}
