import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getForumTopic, getForumPosts } from '@/actions/forums';
import { ForumPostList } from '@/components/forums/ForumPostList';
import { ForumEditor } from '@/components/forums/ForumEditor';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Pin, Lock, Eye, MessageSquare, User, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { ForumTopicHeader } from '@/components/forums/ForumTopicHeader';

interface TopicPageProps {
  params: Promise<{ 'category-slug': string; 'topic-slug': string }>;
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { 'category-slug': categorySlug, 'topic-slug': topicSlug } = await params;
  const topicResult = await getForumTopic(categorySlug, topicSlug);

  if (!topicResult.success) {
    return {
      title: 'Topic Not Found | GoKartPartPicker Forums',
    };
  }

  const topic = topicResult.data;

  return {
    title: `${topic.title} | GoKartPartPicker Forums`,
    description: topic.content.substring(0, 160),
  };
}

export const dynamic = 'force-dynamic';

/**
 * Forum topic detail page - displays topic and all posts
 */
export default async function ForumTopicPage({ params }: TopicPageProps) {
  const { 'category-slug': categorySlug, 'topic-slug': topicSlug } = await params;

  const topicResult = await getForumTopic(categorySlug, topicSlug);

  if (!topicResult.success) {
    notFound();
  }

  const topic = topicResult.data;
  
  // Get posts for this topic
  const postsResult = await getForumPosts({ 
    topic_id: topic.id, 
    page: 1, 
    limit: 100, 
    sort: 'oldest' 
  });
  const posts = postsResult.success ? postsResult.data : [];

  return (
    <div className="min-h-screen bg-olive-900">
      {/* Header */}
      <div className="bg-olive-800 border-b border-olive-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href={`/forums/${categorySlug}`}
            className="inline-flex items-center gap-2 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Category
          </Link>

          <ForumTopicHeader topic={topic as any} />
        </div>
      </div>

      {/* Posts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ForumPostList 
          topic={topic as any}
          posts={posts as any}
          categorySlug={categorySlug}
        />
      </div>
    </div>
  );
}
