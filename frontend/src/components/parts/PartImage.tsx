'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Search, X } from 'lucide-react';

interface PartImageProps {
  imageUrl: string | null;
  alt: string;
  priority?: boolean;
  className?: string;
}

/**
 * Product image for part detail page: framed container, hover zoom cue, click-to-expand lightbox.
 */
export function PartImage({ imageUrl, alt, priority = false, className = '' }: PartImageProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const close = useCallback(() => setLightboxOpen(false), []);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onEscape = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onEscape);
      document.body.style.overflow = '';
    };
  }, [lightboxOpen, close]);

  const src = imageUrl || '/placeholders/placeholder-part-v1.svg';
  const isPlaceholder = !imageUrl;

  return (
    <>
      <div
        className={`group relative w-full overflow-hidden rounded-xl border border-olive-600 bg-olive-800/95 shadow-lg ring-1 ring-olive-700/50 ${className}`}
      >
        {/* Inner frame: soft inset so white product photos feel integrated */}
        <div className="absolute inset-1 rounded-lg bg-olive-900/40 ring-1 ring-inset ring-olive-700/30 pointer-events-none" aria-hidden />
        <div className="relative aspect-square w-full max-h-[min(85vh,720px)] min-h-[320px]">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain p-1.5 sm:p-2"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 640px"
            priority={priority}
          />
          {/* Zoom cue on hover — only for real images */}
          {!isPlaceholder && (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="absolute inset-0 flex items-center justify-center bg-olive-900/0 transition-colors hover:bg-olive-900/30 focus:bg-olive-900/30 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-olive-900"
              aria-label="View full size"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-olive-800/90 text-cream-300 shadow-lg opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <Search className="h-6 w-6" />
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && !isPlaceholder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Full size image"
        >
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-olive-800/90 text-cream-200 hover:bg-olive-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative max-h-full max-w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={alt}
              className="max-h-[90vh] w-auto max-w-full object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
