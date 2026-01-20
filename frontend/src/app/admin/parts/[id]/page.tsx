'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAdminPart } from '@/actions/admin';
import { PartForm } from '@/components/admin/PartForm';
import { autoSearchAndAddVideosForPart } from '@/actions/admin/auto-video-linker';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, Loader2, Video, CheckCircle, AlertCircle } from 'lucide-react';
import type { Part } from '@/types/database';

interface AdminPart extends Part {
  slug: string;
  category_id: string | null;
  description: string | null;
  is_active: boolean;
  updated_at: string;
}

export default function EditPartPage() {
  const params = useParams();
  const router = useRouter();
  const [part, setPart] = useState<AdminPart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingVideos, setAddingVideos] = useState(false);
  const [videoStatus, setVideoStatus] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const fetchPart = async () => {
      if (!params.id || typeof params.id !== 'string') {
        setError('Invalid part ID');
        setLoading(false);
        return;
      }

      try {
        const result = await getAdminPart(params.id);
        
        if (result.success) {
          setPart(result.data as AdminPart);
        } else {
          setError(result.error || 'Failed to load part');
        }
      } catch (err) {
        console.error('Error fetching part:', err);
        setError(err instanceof Error ? err.message : 'Failed to load part');
      } finally {
        setLoading(false);
      }
    };

    fetchPart();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (error || !part) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/parts"
          className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Parts
        </Link>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <p className="text-red-400">{error || 'Part not found'}</p>
          <button
            onClick={() => router.push('/admin/parts')}
            className="mt-4 text-sm text-cream-400 hover:text-cream-100"
          >
            Return to parts list
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/parts"
          className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Parts
        </Link>
        <h1 className="text-display text-3xl text-cream-100">Edit Part</h1>
        <p className="text-cream-300 mt-1">
          {part.name}
        </p>
      </div>

      {/* Auto-Add Videos Button */}
      <div className="bg-olive-800 border border-olive-600 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-cream-100 mb-1">Auto-Add Videos</h3>
            <p className="text-sm text-cream-400">
              Automatically search YouTube and add relevant videos for this part
            </p>
            {videoStatus && (
              <div className={`mt-3 flex items-center gap-2 text-sm ${
                videoStatus.success ? 'text-green-400' : 'text-red-400'
              }`}>
                {videoStatus.success ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span>{videoStatus.message}</span>
              </div>
            )}
          </div>
          <Button
            variant="primary"
            icon={<Video className="w-4 h-4" />}
            onClick={async () => {
              if (!part) return;
              setAddingVideos(true);
              setVideoStatus(null);
              
              const result = await autoSearchAndAddVideosForPart(
                part.id,
                part.name,
                part.brand,
                part.category,
                5 // Max 5 videos
              );
              
              if (result.success) {
                setVideoStatus({
                  success: true,
                  message: `Successfully added ${result.data.added} video(s)! ${result.data.errors.length > 0 ? `(${result.data.errors.length} errors)` : ''}`
                });
                // Refresh the page to show new videos
                setTimeout(() => {
                  router.refresh();
                }, 2000);
              } else {
                setVideoStatus({
                  success: false,
                  message: result.error || 'Failed to add videos'
                });
              }
              
              setAddingVideos(false);
            }}
            disabled={addingVideos}
          >
            {addingVideos ? 'Searching...' : 'Auto-Add Videos'}
          </Button>
        </div>
      </div>

      {/* Form */}
      <PartForm part={part} mode="edit" />
    </div>
  );
}
