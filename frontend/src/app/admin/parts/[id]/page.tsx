'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAdminPart } from '@/actions/admin';
import { PartForm } from '@/components/admin/PartForm';
import { PriceManagement } from '@/components/admin/PriceManagement';
import { VideoSearchAndAdd } from '@/components/admin/VideoSearchAndAdd';
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

      {/* Video Search and Add */}
      <VideoSearchAndAdd
        productType="part"
        productId={part.id}
        productName={part.name}
        productBrand={part.brand}
        suggestedQueries={[
          `${part.brand ? `${part.brand} ` : ''}${part.name} go kart`,
          `${part.name} installation`,
          `${part.name} review`,
          `how to install ${part.name}`,
          `${part.name} tutorial`,
        ]}
        onVideosAdded={() => {
          router.refresh();
        }}
      />

      {/* Form */}
      <PartForm part={part} mode="edit" />

      {/* Price Management */}
      <PriceManagement partId={part.id} />
    </div>
  );
}
