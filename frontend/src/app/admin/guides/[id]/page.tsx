'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { GuideForm } from '@/components/admin/GuideForm';
import { getGuideById } from '@/actions/admin-guides';
import type { GuideWithSteps } from '@/types/guides';

export default function EditGuidePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [guide, setGuide] = useState<GuideWithSteps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGuide() {
      setLoading(true);
      setError(null);
      try {
        const result = await getGuideById(id);
        if (result.success && result.data) {
          setGuide(result.data);
        } else if (!result.success) {
          setError(result.error || 'Guide not found');
        } else {
          setError('Guide not found');
        }
      } catch (err) {
        console.error('Error fetching guide:', err);
        setError('Failed to load guide');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchGuide();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <p className="text-cream-300">Loading guide...</p>
        </div>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="space-y-6">
        <div>
          <Link
            href="/admin/guides"
            className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Guides
          </Link>
          <h1 className="text-display text-3xl text-cream-100">Edit Guide</h1>
        </div>
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error || 'Guide not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/guides"
          className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Guides
        </Link>
        <h1 className="text-display text-3xl text-cream-100">Edit Guide</h1>
        <p className="text-cream-300 mt-1">
          {guide.title}
        </p>
      </div>

      {/* Form */}
      <GuideForm guide={guide} mode="edit" />
    </div>
  );
}
