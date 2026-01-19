'use client';

import { useState, useEffect } from 'react';
import { Play, Clock, Film } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
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

/**
 * Format duration from seconds to MM:SS
 */
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
  const [triedFallback, setTriedFallback] = useState(false);

  const thumbUrl = video.thumbnail_url || getYouTubeThumbnailUrl(video.video_url) || null;
  const showThumb = !!thumbUrl && !thumbError;

  // Sync img src when video or thumbUrl changes; reset error and fallback state
  useEffect(() => {
    setImgSrc(thumbUrl);
    setThumbError(false);
    setTriedFallback(false);
  }, [thumbUrl, video.id]);

  const handleThumbError = () => {
    if (!triedFallback && imgSrc?.includes('mqdefault')) {
      setTriedFallback(true);
      setImgSrc(imgSrc.replace('mqdefault.jpg', 'default.jpg'));
    } else {
      setThumbError(true);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(video);
    } else {
      setShowPlayer(true);
    }
  };

  return (
    <>
      <Card 
        variant="default" 
        hoverable 
        className="overflow-hidden group cursor-pointer bg-olive-800 border-olive-600 shadow-md hover:shadow-lg hover:border-orange-500/50 transition-all duration-300"
        onClick={handleClick}
      >
        {/* Thumbnail: use thumbnail_url, or derive from YouTube video_url, or placeholder. Plain img for reliable loading. */}
        <div className={`relative bg-olive-800 overflow-hidden ${compact ? 'h-28' : 'h-40'}`}>
          {showThumb ? (
            <img
              src={imgSrc ?? thumbUrl}
              alt={video.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              referrerPolicy="no-referrer"
              loading="lazy"
              onError={handleThumbError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-olive-700">
              <Film className={`text-olive-500 ${compact ? 'w-8 h-8' : 'w-12 h-12'}`} />
            </div>
          )}
          
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-olive-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className={`bg-orange-500/90 rounded-full flex items-center justify-center shadow-lg ${compact ? 'w-10 h-10' : 'w-14 h-14'}`}>
              <Play className={`text-cream-100 ml-0.5 fill-current ${compact ? 'w-5 h-5' : 'w-7 h-7'}`} fill="currentColor" />
            </div>
          </div>
          
          {/* Featured badge */}
          {video.is_featured && (
            <Badge className="absolute top-1.5 left-1.5 z-10" variant="warning" size="sm">
              Featured
            </Badge>
          )}
          
          {/* Category badge */}
          <Badge className={`absolute z-10 bg-olive-800/90 backdrop-blur-sm border border-olive-600 ${compact ? 'top-1.5 right-1.5' : 'top-2 right-2'}`} size="sm">
            {CATEGORY_LABELS[video.category]}
          </Badge>
          
          {/* Duration badge */}
          {video.duration_seconds && (
            <div className={`absolute flex items-center gap-1 bg-black/80 backdrop-blur-sm rounded text-cream-100 font-medium ${compact ? 'bottom-1 right-1 px-1.5 py-0.5 text-[10px]' : 'bottom-2 right-2 px-2 py-1 text-xs'}`}>
              <Clock className={compact ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
              {formatDuration(video.duration_seconds)}
            </div>
          )}
        </div>
        
        {/* Card Content with distinct background */}
        <CardContent className={`bg-olive-700/50 border-t border-olive-600/50 ${compact ? 'p-3' : 'p-4'}`}>
          {/* Title */}
          <h3 className={`font-bold text-cream-100 group-hover:text-orange-400 transition-colors leading-tight ${compact ? 'text-sm line-clamp-1 mb-1' : 'text-base line-clamp-2 mb-2'}`}>
            {video.title}
          </h3>
          
          {/* Description with better contrast */}
          {video.description && !compact && (
            <div className="mb-3">
              <p className="text-sm text-cream-300 line-clamp-2 leading-relaxed">
                {video.description}
              </p>
            </div>
          )}
          
          {/* Channel: YouTube channel that published the video */}
          {video.channel_name && (
            <div className={`flex items-center justify-between text-xs border-t border-olive-600/50 ${compact ? 'pt-1.5 mt-1.5' : 'pt-2 mt-2'}`}>
              <span className="text-cream-400">
                <span className="text-cream-500">Channel: </span>
                <span className="font-medium">{video.channel_name}</span>
              </span>
              {video.view_count > 0 && (
                <span className="text-cream-500">{video.view_count.toLocaleString()} views</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Video Player Modal */}
      {showPlayer && (
        <VideoPlayer 
          video={video} 
          onClose={() => setShowPlayer(false)} 
        />
      )}
    </>
  );
}
