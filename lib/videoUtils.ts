import { prisma } from './prisma'
import { VideoCategory } from '@/components/VideoCarousel'
import { isPlaceholderId } from './videoVerification'

export interface VideoData {
  id: string
  youtubeId: string
  title: string
  channelName: string
  durationSeconds: number
  thumbnailUrl: string
  category: VideoCategory
  tags?: string[]
}

/**
 * Fetch videos contextually based on engine, upgrade, or part
 */
export async function getContextualVideos(options: {
  engineId?: string
  engineSlug?: string
  upgradeId?: string
  upgradeSlug?: string
  partId?: string
  partSlug?: string
  guideId?: string
  guideSlug?: string
  category?: VideoCategory
  limit?: number
}): Promise<VideoData[]> {
  const { engineId, engineSlug, upgradeId, upgradeSlug, partId, partSlug, guideId, guideSlug, category, limit = 20 } = options

  // Build where clause
  const where: any = {}

  // If we have specific IDs/slugs, we need to match them in the JSON arrays
  // For now, we'll fetch all videos and filter in memory (simple approach)
  // In production, you might want to use PostgreSQL JSON operators

  // Build where clause for Prisma query
  const whereClause: any = {}
  
  if (category) {
    whereClause.category = category
  }

  let allVideos = await prisma.video.findMany({
    where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
    orderBy: { createdAt: 'desc' },
    take: limit * 5, // Fetch more to filter
  })

  // Filter out placeholder IDs
  allVideos = allVideos.filter((video) => !isPlaceholderId(video.youtubeId))

  // If no context provided, return all videos
  const hasContext = engineId || engineSlug || upgradeId || upgradeSlug || partId || partSlug || guideId || guideSlug
  
  let matchingVideos: typeof allVideos = []
  
  if (!hasContext) {
    // No context - return all videos
    matchingVideos = allVideos
  } else {
    // Filter videos based on context
    matchingVideos = allVideos.filter((video) => {
      let matches = false

      // Match by engine
      if (engineId || engineSlug) {
        const engineIds = (video.engineIds as string[] | null) || []
        if (engineId && engineIds.includes(engineId)) matches = true
        // Note: engineIds in video are stored as IDs, not slugs
        // For slug matching, we'd need to look up the engine ID first
      }

      // Match by upgrade (stored as slugs in upgradeIds)
      if (upgradeId || upgradeSlug) {
        const upgradeIds = (video.upgradeIds as string[] | null) || []
        if (upgradeSlug && upgradeIds.includes(upgradeSlug)) matches = true
        if (upgradeId && upgradeIds.includes(upgradeId)) matches = true
      }

      // Match by part (stored as slugs in partIds)
      if (partId || partSlug) {
        const partIds = (video.partIds as string[] | null) || []
        if (partSlug && partIds.includes(partSlug)) matches = true
        if (partId && partIds.includes(partId)) matches = true
      }

      // Match by guide (stored as slugs in guideIds)
      if (guideId || guideSlug) {
        const guideIds = (video.guideIds as string[] | null) || []
        if (guideSlug && guideIds.includes(guideSlug)) matches = true
        if (guideId && guideIds.includes(guideId)) matches = true
      }

      return matches
    })

    // IMPORTANT: Only return videos that match the specific engine/upgrade/part/guide
    // Do NOT fall back to all videos - this was causing wrong videos to show on engine pages
    // If no matches found, return empty array (no videos for this context)
  }

  return matchingVideos.slice(0, limit).map((video) => ({
    id: video.id,
    youtubeId: video.youtubeId,
    title: video.title,
    channelName: video.channelName,
    durationSeconds: video.durationSeconds,
    thumbnailUrl: video.thumbnailUrl,
    category: video.category as VideoCategory,
    tags: (video.tags as string[] | null) || undefined,
  }))
}

