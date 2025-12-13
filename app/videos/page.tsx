import Link from 'next/link'
import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import VideoCarousel from '@/components/VideoCarousel'
import VideoFilters from '@/components/VideoFilters'
import VideoThumbnail from '@/components/VideoThumbnail'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Useful Videos | GoKartPartPicker',
  description: 'Browse helpful installation, tuning, teardown, and safety videos for go-kart engines.',
}

async function getAllVideos() {
  return await prisma.video.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200, // Limit to reasonable number
  })
}

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; engine?: string; search?: string }>
}) {
  const params = await searchParams
  const allVideos = await getAllVideos()

  // Filter videos based on search params
  let filteredVideos = allVideos

  if (params.category) {
    filteredVideos = filteredVideos.filter((v) => v.category === params.category)
  }

  if (params.engine) {
    // Get engine ID from slug
    const engine = await prisma.engine.findUnique({
      where: { slug: params.engine },
      select: { id: true },
    })
    if (engine) {
      filteredVideos = filteredVideos.filter((video) => {
        const engineIds = (video.engineIds as string[] | null) || []
        return engineIds.includes(engine.id)
      })
    }
  }

  if (params.search) {
    const searchLower = params.search.toLowerCase()
    filteredVideos = filteredVideos.filter(
      (v) =>
        v.title.toLowerCase().includes(searchLower) ||
        v.channelName.toLowerCase().includes(searchLower) ||
        ((v.tags as string[] | null) || []).some((tag) => tag.toLowerCase().includes(searchLower))
    )
  }

  // Convert to VideoCarousel format
  const videos = filteredVideos.map((video) => ({
    id: video.id,
    youtubeId: video.youtubeId,
    title: video.title,
    channelName: video.channelName,
    durationSeconds: video.durationSeconds,
    thumbnailUrl: video.thumbnailUrl,
    category: video.category as 'INSTALL' | 'TEARDOWN' | 'TUNING' | 'SAFETY',
    tags: (video.tags as string[] | null) || undefined,
  }))

  // Get engines for filter
  const engines = await prisma.engine.findMany({
    select: { id: true, slug: true, name: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/" className="text-garage-orange hover:underline mb-4 inline-block">
          ← Back to Home
        </Link>
        <h1 className="text-4xl font-heading font-bold text-garage-dark dark:text-gray-100 mb-4">
          Useful Videos
        </h1>
        <p className="text-lg text-garage-gray dark:text-gray-300 mb-6">
          Browse helpful installation, tuning, teardown, and safety videos for go-kart engines.
        </p>
      </div>

      {/* Filters */}
      <VideoFilters
        currentCategory={params.category}
        currentEngine={params.engine}
        currentSearch={params.search}
        engines={engines}
      />

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-garage-gray dark:text-gray-400">
          Showing {videos.length} video{videos.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Videos Grid */}
      <Suspense fallback={<div className="text-center py-12">Loading videos...</div>}>
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <Link
                key={video.id}
                href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition"
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
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-garage-gray dark:text-gray-400 text-lg">
              No videos found. Try adjusting your filters.
            </p>
          </div>
        )}
      </Suspense>
    </div>
  )
}

