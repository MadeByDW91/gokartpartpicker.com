'use client'

import { useState, useEffect } from 'react'
import { isPlaceholderId } from '@/lib/videoVerification'

interface VideoThumbnailProps {
  youtubeId: string
  title: string
  durationSeconds: number
  category: 'INSTALL' | 'TEARDOWN' | 'TUNING' | 'SAFETY'
}

const categoryColors = {
  INSTALL: 'bg-blue-100 text-blue-800',
  TEARDOWN: 'bg-purple-100 text-purple-800',
  TUNING: 'bg-green-100 text-green-800',
  SAFETY: 'bg-red-100 text-red-800',
}

const categoryLabels = {
  INSTALL: 'Install',
  TEARDOWN: 'Teardown',
  TUNING: 'Tuning',
  SAFETY: 'Safety',
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function VideoThumbnail({ youtubeId, title, durationSeconds, category }: VideoThumbnailProps) {
  const [imageError, setImageError] = useState(false)
  const [triedFallback, setTriedFallback] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)

  // Check if this is a placeholder ID
  const isPlaceholder = isPlaceholderId(youtubeId)

  // Verify video on mount
  useEffect(() => {
    if (isPlaceholder) {
      setIsValid(false)
      return
    }

    // Try to verify the video by loading the thumbnail
    const img = new Image()
    img.onload = () => setIsValid(true)
    img.onerror = () => setIsValid(false)
    img.src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
  }, [youtubeId, isPlaceholder])

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement
    
    // If we haven't tried the fallback yet and it's not a placeholder, try maxresdefault
    if (!triedFallback && !isPlaceholder && !target.src.includes('maxresdefault')) {
      setTriedFallback(true)
      target.src = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
      return
    }
    
    // If maxresdefault also failed or it's a placeholder, show our custom placeholder
    if (!imageError) {
      setImageError(true)
      target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"%3E%3Crect fill="%23d1d5db" width="320" height="180"/%3Ccircle cx="160" cy="90" r="30" fill="%23ef4444" opacity="0.9"/%3Cpath d="M150 80 L150 100 L170 90 Z" fill="white"/%3Ctext x="160" y="130" text-anchor="middle" fill="%236b7280" font-family="Arial, sans-serif" font-size="12"%3EVideo Preview%3C/text%3E%3C/svg%3E'
      // Prevent infinite loop
      target.onerror = null
    }
  }

  const getImageSrc = () => {
    // If we know it's a placeholder, invalid, or had an error, show placeholder immediately
    if (isPlaceholder || imageError || isValid === false) {
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"%3E%3Crect fill="%23d1d5db" width="320" height="180"/%3Ccircle cx="160" cy="90" r="30" fill="%23ef4444" opacity="0.9"/%3Cpath d="M150 80 L150 100 L170 90 Z" fill="white"/%3Ctext x="160" y="130" text-anchor="middle" fill="%236b7280" font-family="Arial, sans-serif" font-size="12"%3EVideo Preview%3C/text%3E%3C/svg%3E'
    }
    // Try maxresdefault first for better quality, fallback to hqdefault
    if (triedFallback) {
      return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
    }
    return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
  }

  return (
    <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
      <img
        src={getImageSrc()}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
        onError={handleError}
      />
      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-20 transition">
        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center opacity-80 hover:opacity-100 transition">
          <svg
            className="w-8 h-8 text-white ml-1"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
        {formatDuration(durationSeconds)}
      </div>
      <div
        className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold ${categoryColors[category]}`}
      >
        {categoryLabels[category]}
      </div>
    </div>
  )
}

