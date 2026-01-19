'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getForumCategory, createForumTopic } from '@/actions/forums';
import { ForumEditor } from '@/components/forums/ForumEditor';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { slugify } from '@/lib/utils';

interface NewTopicPageProps {
  params: Promise<{ 'category-slug': string }>;
}

export default function NewTopicPage({ params }: NewTopicPageProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [categorySlug, setCategorySlug] = useState<string>('');
  const [category, setCategory] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategory() {
      const resolvedParams = await params;
      const slug = resolvedParams['category-slug'];
      setCategorySlug(slug);

      const result = await getForumCategory(slug);
      if (result.success) {
        setCategory(result.data);
      } else {
        setError('Category not found');
      }
      setLoading(false);
    }

    loadCategory();
  }, [params]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`/auth/login?redirect=/forums/${categorySlug}/new`);
    }
  }, [loading, isAuthenticated, router, categorySlug]);

  const handleSubmit = async (editorContent: string) => {
    if (!category || !title.trim()) {
      setError('Title is required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await createForumTopic({
        category_id: category.id,
        title: title.trim(),
        slug: slugify(title),
        content: editorContent,
      });

      if (result.success && result.data) {
        router.push(`/forums/${categorySlug}/${result.data.slug}`);
      } else {
        setError(!result.success ? result.error : 'Failed to create topic');
      }
    } catch (err) {
      setError('Failed to create topic');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-olive-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-olive-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-olive-800 border-olive-600">
            <CardContent className="py-12 text-center">
              <p className="text-red-400">Category not found</p>
              <Link href="/forums">
                <Button variant="secondary" className="mt-4">
                  Back to Forums
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            Back to {category.name}
          </Link>
          <h1 className="text-display text-3xl text-cream-100">Create New Topic</h1>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-olive-800 border-olive-600">
          <CardHeader>
            <CardTitle className="text-cream-100">Topic Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              label="Topic Title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError(null);
              }}
              placeholder="Enter a descriptive title for your topic..."
              required
              maxLength={200}
            />

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <ForumEditor
              onSubmit={handleSubmit}
              placeholder="Write your topic content here..."
              submitLabel="Create Topic"
              isEditing={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
