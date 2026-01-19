import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getForumCategory, getForumTopics } from '@/actions/forums';
import { ForumTopicList } from '@/components/forums/ForumTopicList';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, MessageSquare, Plus } from 'lucide-react';

interface CategoryPageProps {
  params: Promise<{ 'category-slug': string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { 'category-slug': slug } = await params;
  const categoryResult = await getForumCategory(slug);

  if (!categoryResult.success) {
    return {
      title: 'Category Not Found | GoKartPartPicker Forums',
    };
  }

  const category = categoryResult.data;

  return {
    title: `${category.name} | GoKartPartPicker Forums`,
    description: category.description || `Browse topics in ${category.name}`,
  };
}

export const dynamic = 'force-dynamic';

/**
 * Forum category page - displays topics in a category
 */
export default async function ForumCategoryPage({ params }: CategoryPageProps) {
  const { 'category-slug': slug } = await params;

  const categoryResult = await getForumCategory(slug);

  if (!categoryResult.success) {
    notFound();
  }

  const category = categoryResult.data;
  const topicsResult = await getForumTopics({ category_id: category.id, page: 1, limit: 50, sort: 'newest' });
  const topics = topicsResult.success ? topicsResult.data : [];

  return (
    <div className="min-h-screen bg-olive-900">
      {/* Header */}
      <div className="bg-olive-800 border-b border-olive-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/forums"
            className="inline-flex items-center gap-2 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Forums
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {category.icon && (
                <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <span className="text-2xl">{category.icon}</span>
                </div>
              )}
              <div>
                <h1 className="text-display text-3xl text-cream-100">{category.name}</h1>
                {category.description && (
                  <p className="text-cream-400 mt-1">{category.description}</p>
                )}
              </div>
            </div>

            <Link href={`/forums/${slug}/new`}>
              <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
                New Topic
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Topics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ForumTopicList
          topics={topics.map(t => ({ ...t, category }))}
          categorySlug={slug}
        />
      </div>
    </div>
  );
}
