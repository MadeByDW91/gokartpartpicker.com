'use client';

import { useEffect } from 'react';
import { X, VideoOff } from 'lucide-react';
import type { Video } from '@/types/database';
import { isEmbeddableVideoUrl } from '@/lib/video-utils';

interface VideoPlayerProps {
  video: Video;
  onClose: () => void;
}

/**
 * Convert various YouTube/Vimeo URLs to embed format
 */
function getEmbedUrl(videoUrl: string): string {
  // YouTube formats
  if (videoUrl.includes('youtube.com/watch?v=')) {
    const videoId = videoUrl.split('v=')[1]?.split('&')[0];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }
  if (videoUrl.includes('youtu.be/')) {
    const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }
  if (videoUrl.includes('youtube.com/embed/')) {
    return videoUrl;
  }
  
  // Vimeo formats
  if (videoUrl.includes('vimeo.com/')) {
    const videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0];
    if (videoId) {
      return `https://player.vimeo.com/video/${videoId}`;
    }
  }
  if (videoUrl.includes('player.vimeo.com/video/')) {
    return videoUrl;
  }
  
  // Direct video file - return as-is
  if (videoUrl.match(/\.(mp4|webm|ogg)$/i)) {
    return videoUrl;
  }
  
  // Fallback - return original URL
  return videoUrl;
}

export function VideoPlayer({ video, onClose }: VideoPlayerProps) {
  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    // Close on Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const canEmbed = isEmbeddableVideoUrl(video.video_url);
  const embedUrl = canEmbed ? getEmbedUrl(video.video_url) : '';
  const isDirectVideo = embedUrl.match(/\.(mp4|webm|ogg)$/i);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-6xl mx-4 bg-olive-800 rounded-lg overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center text-cream-100 transition-colors"
          aria-label="Close video player"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Video container */}
        <div className="relative w-full aspect-video bg-black">
          {!canEmbed ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
              <VideoOff className="w-16 h-16 text-olive-500" />
              <div>
                <p className="text-cream-200 font-medium">This video link isn&apos;t set up yet</p>
                <p className="text-cream-500 text-sm mt-2 max-w-md">
                  The video URL is still a placeholder. In Admin → Videos, replace it with a real YouTube or Vimeo link to enable playback.
                </p>
              </div>
            </div>
          ) : isDirectVideo ? (
            <video
              src={embedUrl}
              controls
              className="w-full h-full"
              autoPlay
            />
          ) : (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={video.title}
            />
          )}
        </div>

        {/* Video info */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-cream-100 mb-2">{video.title}</h2>
          {video.description && (
            <p className="text-cream-400 mb-4">{video.description}</p>
          )}
          {video.channel_name && (
            <div className="flex items-center gap-4 text-sm text-cream-500">
              <span>Channel: {video.channel_name}</span>
              {video.view_count > 0 && (
                <span>{video.view_count.toLocaleString()} views</span>
              )}
              {video.published_date && (
                <span>
                  {new Date(video.published_date).toLocaleDateString()}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
