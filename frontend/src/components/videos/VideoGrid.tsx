'use client';

import { VideoCard } from './VideoCard';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Video } from '@/types/database';

interface VideoGridProps {
  videos: Video[];
  loading?: boolean;
  onVideoClick?: (video: Video) => void;
}

export function VideoGrid({ videos, loading = false, onVideoClick }: VideoGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <VideoSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-cream-400 text-lg">No videos available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {videos.map((video) => (
        <VideoCard 
          key={video.id} 
          video={video} 
          onClick={onVideoClick}
        />
      ))}
    </div>
  );
}

function VideoSkeleton() {
  return (
    <div className="bg-olive-700 border border-olive-600 rounded-lg overflow-hidden">
      <Skeleton className="h-40 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}
