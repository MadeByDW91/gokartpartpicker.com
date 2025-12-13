'use client'

import { useState } from 'react'
import Link from 'next/link'
import VideoThumbnail from './VideoThumbnail'

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

  // If maxVisible is very high (like 1000), show all videos by default
  const shouldShowAll = maxVisible >= filteredVideos.length
  const visibleVideos = showAll || shouldShowAll ? filteredVideos : filteredVideos.slice(0, maxVisible)
  const hasMore = filteredVideos.length > maxVisible && !shouldShowAll

  if (videos.length === 0) {
    return null
  }

  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-heading font-bold text-garage-dark dark:text-gray-100">{title}</h2>
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
          className={`flex gap-4 pb-4 scrollbar-hide ${
            compact ? 'flex-wrap' : 'overflow-x-auto'
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
              className={`flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition ${
                compact ? 'w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.67rem)]' : 'w-80'
              }`}
            >
              <VideoThumbnail
                youtubeId={video.youtubeId}
                title={video.title}
                durationSeconds={video.durationSeconds}
                category={video.category}
              />
              <div className="p-4">
                <h3 className="font-heading font-semibold text-garage-dark dark:text-gray-100 mb-1 line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-sm text-garage-gray dark:text-gray-400">{video.channelName}</p>
                {video.tags && video.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {video.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded"
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
            className="px-6 py-2 bg-garage-orange text-white rounded-lg hover:bg-orange-600 transition font-semibold shadow-md hover:shadow-lg"
          >
            Show More Videos ({filteredVideos.length - maxVisible} more)
          </button>
        </div>
      )}

      {showAll && hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={() => setShowAll(false)}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-semibold"
          >
            Show Less
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

