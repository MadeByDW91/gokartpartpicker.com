'use client';

import { useState, useEffect } from 'react';
import { Play, Clock, Film } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import type { Video, VideoCategory } from '@/types/database';
import { VideoPlayer } from './VideoPlayer';
import { getYouTubeThumbnailUrl } from '@/lib/video-utils';

interface VideoCardProps {
  video: Video;
  onClick?: (video: Video) => void;
  /** Smaller layout for preview (3-across) */
  compact?: boolean;
}

const CATEGORY_LABELS: Record<VideoCategory, string> = {
  unboxing: 'Unboxing',
  installation: 'Installation',
  maintenance: 'Maintenance',
  modification: 'Modification',
  troubleshooting: 'Troubleshooting',
  tutorial: 'Tutorial',
  review: 'Review',
  tips: 'Tips',
};

function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function VideoCard({ video, onClick, compact = false }: VideoCardProps) {
  const [showPlayer, setShowPlayer] = useState(false);
  const [thumbError, setThumbError] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  const thumbUrl = video.thumbnail_url || getYouTubeThumbnailUrl(video.video_url) || null;
  const showThumb = !!thumbUrl && !thumbError;

  useEffect(() => {
    setImgSrc(thumbUrl);
    setThumbError(false);
  }, [thumbUrl, video.id]);

  const handleThumbError = () => {
    if (!imgSrc?.includes('i.ytimg.com')) {
      setThumbError(true);
      return;
    }
    if (imgSrc.includes('hqdefault')) {
      setImgSrc(imgSrc.replace('hqdefault.jpg', 'mqdefault.jpg'));
      return;
    }
    if (imgSrc.includes('mqdefault')) {
      setImgSrc(imgSrc.replace('mqdefault.jpg', 'default.jpg'));
      return;
    }
    setThumbError(true);
  };

  const handleClick = () => {
    if (onClick) {
      onClick(video);
    } else {
      setShowPlayer(true);
    }
  };

  const categoryLabel = CATEGORY_LABELS[video.category];

  return (
    <>
      <Card
        variant="default"
        hoverable
        className="overflow-hidden group cursor-pointer rounded-xl border border-olive-600/60 bg-olive-800/80 shadow-sm hover:shadow-md hover:border-orange-500/40 transition-all duration-300"
        onClick={handleClick}
      >
        {/* 16:9 thumbnail container */}
        <div className="relative w-full aspect-video bg-olive-700 overflow-hidden">
          {showThumb ? (
            <img
              src={imgSrc ?? thumbUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
              referrerPolicy="no-referrer"
              loading="lazy"
              onError={handleThumbError}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Film className="w-12 h-12 text-olive-500" />
            </div>
          )}

          {/* Subtle bottom gradient for duration readability */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"
            aria-hidden
          />

          {/* Play overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="rounded-full bg-orange-500 p-4 shadow-lg ring-4 ring-white/20 group-hover:scale-110 transition-transform duration-200">
              <Play className="w-6 h-6 text-white fill-white ml-0.5" />
            </div>
          </div>

          {/* Featured: only when true, subtle */}
          {video.is_featured && (
            <span
              className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-orange-500/90 text-white shadow"
              aria-hidden
            >
              Featured
            </span>
          )}

          {/* Duration — bottom-right only */}
          {video.duration_seconds && (
            <span
              className="absolute bottom-2 right-2 flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-black/75 text-cream-100"
              aria-hidden
            >
              <Clock className="w-3 h-3 opacity-80" />
              {formatDuration(video.duration_seconds)}
            </span>
          )}
        </div>

        {/* Card body — category moved here, no thumbnail clutter */}
        <CardContent
          className={`border-t border-olive-600/40 bg-olive-800/60 ${compact ? 'p-3' : 'p-4'}`}
        >
          <h3
            className={`font-semibold text-cream-100 group-hover:text-orange-400 transition-colors leading-snug ${compact ? 'text-sm line-clamp-1' : 'text-base line-clamp-2'} ${compact ? 'mb-1' : 'mb-2'}`}
          >
            {video.title}
          </h3>

          {(categoryLabel || video.channel_name || (video.view_count != null && video.view_count > 0)) && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-cream-400">
              {categoryLabel && (
                <span className="text-cream-500">{categoryLabel}</span>
              )}
              {categoryLabel && video.channel_name && (
                <span className="text-olive-500" aria-hidden>·</span>
              )}
              {video.channel_name && (
                <span>{video.channel_name}</span>
              )}
              {(categoryLabel || video.channel_name) && video.view_count != null && video.view_count > 0 && (
                <span className="text-olive-500" aria-hidden>·</span>
              )}
              {video.view_count != null && video.view_count > 0 && (
                <span>{video.view_count.toLocaleString()} views</span>
              )}
            </div>
          )}

          {!compact && video.description && (
            <p className="mt-2 text-sm text-cream-400/90 line-clamp-2 leading-relaxed">
              {video.description}
            </p>
          )}
        </CardContent>
      </Card>

      {showPlayer && (
        <VideoPlayer video={video} onClose={() => setShowPlayer(false)} />
      )}
    </>
  );
}
