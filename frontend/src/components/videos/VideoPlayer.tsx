'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, VideoOff } from 'lucide-react';
import type { Video } from '@/types/database';
import { isEmbeddableVideoUrl, getYouTubeVideoId } from '@/lib/video-utils';

interface VideoPlayerProps {
  video: Video;
  onClose: () => void;
}

/**
 * Convert various YouTube/Vimeo URLs to embed format.
 * Uses the same regex pattern as video-utils.ts for consistency.
 * YouTube: autoplay=1 for better UX when modal opens.
 * Returns null if URL cannot be converted to a valid embed URL.
 */
function getEmbedUrl(videoUrl: string): string | null {
  const autoplay = 'autoplay=1';
  
  // Try to extract YouTube video ID using the same regex as video-utils.ts
  const youtubeId = getYouTubeVideoId(videoUrl);
  if (youtubeId) {
    return `https://www.youtube-nocookie.com/embed/${youtubeId}?${autoplay}`;
  }
  
  // Handle YouTube embed URLs (already in embed format)
  if (videoUrl.includes('youtube.com/embed/') || videoUrl.includes('youtube-nocookie.com/embed/')) {
    const base = videoUrl.split('?')[0];
    const existing = videoUrl.includes('?') ? videoUrl.split('?')[1] : '';
    const params = new URLSearchParams(existing);
    params.set('autoplay', '1');
    return `${base}?${params.toString()}`;
  }

  // Vimeo formats
  if (videoUrl.includes('vimeo.com/')) {
    const videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0];
    if (videoId && !videoId.includes('/')) {
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }
  }
  if (videoUrl.includes('player.vimeo.com/video/')) {
    const hasParams = videoUrl.includes('?');
    return hasParams ? `${videoUrl}&autoplay=1` : `${videoUrl}?autoplay=1`;
  }

  // Direct video file - return as-is
  if (videoUrl.match(/\.(mp4|webm|ogg)$/i)) {
    return videoUrl;
  }

  // If we can't convert it, return null (not the original URL)
  return null;
}

export function VideoPlayer({ video, onClose }: VideoPlayerProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const canEmbed = isEmbeddableVideoUrl(video.video_url);
  const embedUrl = canEmbed ? getEmbedUrl(video.video_url || '') : null;
  const isDirectVideo = embedUrl ? embedUrl.match(/\.(mp4|webm|ogg)$/i) : false;
  
  // embedUrl is null if getEmbedUrl couldn't convert the URL to a valid embed format
  const isValidEmbedUrl = embedUrl !== null && (
    embedUrl.includes('youtube-nocookie.com/embed/') ||
    embedUrl.includes('player.vimeo.com/video/') ||
    isDirectVideo
  );

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Video player"
    >
      <div
        className="relative w-full max-w-4xl bg-olive-900 rounded-xl overflow-hidden shadow-2xl border border-olive-600 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-cream-100 transition-colors"
          aria-label="Close video"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Video area: fixed 16:9, no thumbnail overlay */}
        <div className="relative w-full flex-shrink-0" style={{ aspectRatio: '16/9' }}>
          {!canEmbed || !isValidEmbedUrl ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 bg-olive-800 text-center">
              <VideoOff className="w-14 h-14 text-olive-500" />
              <p className="text-cream-200 font-medium">This video link isn&apos;t set up yet</p>
              <p className="text-cream-500 text-sm max-w-sm">
                Replace the placeholder URL in Admin → Videos with a real YouTube or Vimeo link.
              </p>
            </div>
          ) : isDirectVideo && embedUrl ? (
            <video
              src={embedUrl}
              controls
              autoPlay
              className="absolute inset-0 w-full h-full object-contain bg-black"
            />
          ) : embedUrl ? (
            <iframe
              src={embedUrl}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title={video.title}
              className="absolute inset-0 w-full h-full border-0 bg-black"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 bg-olive-800 text-center">
              <VideoOff className="w-14 h-14 text-olive-500" />
              <p className="text-cream-200 font-medium">This video link isn&apos;t set up yet</p>
              <p className="text-cream-500 text-sm max-w-sm">
                Replace the placeholder URL in Admin → Videos with a real YouTube or Vimeo link.
              </p>
            </div>
          )}
        </div>

        {/* Info strip */}
        <div className="flex-shrink-0 p-4 sm:p-5 bg-olive-800/80 border-t border-olive-600">
          <h2 className="text-lg sm:text-xl font-bold text-cream-100 mb-1 line-clamp-2">
            {video.title}
          </h2>
          {video.description && (
            <p className="text-sm text-cream-400 mb-3 line-clamp-2">{video.description}</p>
          )}
          {(video.channel_name || video.view_count || video.published_date) && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-cream-500">
              {video.channel_name && <span>Channel: {video.channel_name}</span>}
              {video.view_count != null && video.view_count > 0 && (
                <span>{video.view_count.toLocaleString()} views</span>
              )}
              {video.published_date && (
                <span>{new Date(video.published_date).toLocaleDateString()}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modal, document.body);
}
