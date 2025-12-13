'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export type VideoCategory = 'INSTALL' | 'TEARDOWN' | 'TUNING' | 'SAFETY'

export interface Video {
  id: string
  youtubeId: string
  title: string
  channelName: string
  durationSeconds: number
  thumbnailUrl: string
  category: VideoCategory
  tags?: string[]
}

interface VideoCarouselProps {
  videos: Video[]
  title?: string
  showFilters?: boolean
  compact?: boolean
  maxVisible?: number
}

const categoryColors: Record<VideoCategory, string> = {
  INSTALL: 'bg-blue-100 text-blue-800',
  TEARDOWN: 'bg-purple-100 text-purple-800',
  TUNING: 'bg-green-100 text-green-800',
  SAFETY: 'bg-red-100 text-red-800',
}

const categoryLabels: Record<VideoCategory, string> = {
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

export default function VideoCarousel({
  videos,
  title = 'Useful Videos',
  showFilters = false,
  compact = false,
  maxVisible = 6,
}: VideoCarouselProps) {
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory | 'ALL'>('ALL')
  const [showAll, setShowAll] = useState(false)

  const filteredVideos =
    selectedCategory === 'ALL'
      ? videos
      : videos.filter((v) => v.category === selectedCategory)

  const visibleVideos = showAll ? filteredVideos : filteredVideos.slice(0, maxVisible)
  const hasMore = filteredVideos.length > maxVisible

  if (videos.length === 0) {
    return null
  }

  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-heading font-bold text-garage-dark">{title}</h2>
        {showFilters && (
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1 rounded text-sm transition ${
                selectedCategory === 'ALL'
                  ? 'bg-garage-orange text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            {(Object.keys(categoryLabels) as VideoCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded text-sm transition ${
                  selectedCategory === cat
                    ? 'bg-garage-orange text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <div
          className={`flex gap-4 overflow-x-auto pb-4 scrollbar-hide ${
            compact ? 'flex-wrap' : ''
          }`}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {visibleVideos.map((video) => (
            <Link
              key={video.id}
              href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-shrink-0 bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition ${
                compact ? 'w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.67rem)]' : 'w-80'
              }`}
            >
              <div className="relative aspect-video bg-gray-100">
                <img
                  src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                  alt={video.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to default thumbnail if image fails
                    const target = e.target as HTMLImageElement
                    target.src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`
                  }}
                />
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(video.durationSeconds)}
                </div>
                <div
                  className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold ${categoryColors[video.category]}`}
                >
                  {categoryLabels[video.category]}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-heading font-semibold text-garage-dark mb-1 line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-sm text-garage-gray">{video.channelName}</p>
                {video.tags && video.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {video.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {hasMore && !showAll && (
        <div className="text-center mt-6">
          <button
            onClick={() => setShowAll(true)}
            className="px-6 py-2 bg-garage-orange text-white rounded-lg hover:bg-orange-600 transition font-semibold"
          >
            Show More Videos ({filteredVideos.length - maxVisible} more)
          </button>
        </div>
      )}

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

