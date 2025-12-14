import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Verify if a YouTube video is accessible by checking the thumbnail
 */
async function verifyYouTubeVideo(youtubeId: string): Promise<boolean> {
  try {
    const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
    const response = await fetch(thumbnailUrl, { method: 'HEAD' })
    
    // YouTube returns 200 for valid videos, 404 for invalid ones
    // Sometimes it returns 200 even for invalid IDs, so we also check content-type
    if (response.ok) {
      const contentType = response.headers.get('content-type')
      // Valid YouTube thumbnails are images
      return contentType?.startsWith('image/') ?? false
    }
    return false
  } catch (error) {
    console.error(`Error verifying ${youtubeId}:`, error)
    return false
  }
}

/**
 * Verify all videos in the database and mark invalid ones
 */
async function verifyAllVideos() {
  console.log('🔍 Starting video verification...')
  
  const videos = await prisma.video.findMany({
    select: {
      id: true,
      youtubeId: true,
      title: true,
    },
  })

  console.log(`📹 Found ${videos.length} videos to verify\n`)

  const results = {
    valid: [] as string[],
    invalid: [] as { id: string; youtubeId: string; title: string }[],
  }

  // Verify videos in batches to avoid rate limiting
  for (let i = 0; i < videos.length; i++) {
    const video = videos[i]
    const isValid = await verifyYouTubeVideo(video.youtubeId)
    
    if (isValid) {
      results.valid.push(video.youtubeId)
      process.stdout.write(`✅ ${i + 1}/${videos.length}: ${video.youtubeId} - Valid\n`)
    } else {
      results.invalid.push({
        id: video.id,
        youtubeId: video.youtubeId,
        title: video.title,
      })
      process.stdout.write(`❌ ${i + 1}/${videos.length}: ${video.youtubeId} - Invalid\n`)
    }

    // Small delay to avoid rate limiting
    if (i < videos.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  console.log(`\n\n📊 Verification Results:`)
  console.log(`✅ Valid videos: ${results.valid.length}`)
  console.log(`❌ Invalid videos: ${results.invalid.length}`)

  // Delete invalid videos
  if (results.invalid.length > 0) {
    console.log(`\n🗑️  Deleting ${results.invalid.length} invalid videos...`)
    const invalidIds = results.invalid.map(v => v.id)
    await prisma.video.deleteMany({
      where: {
        id: {
          in: invalidIds,
        },
      },
    })
    console.log('✅ Invalid videos deleted')
  }

  return results
}

// Run verification
verifyAllVideos()
  .then(() => {
    console.log('\n✅ Verification complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error during verification:', error)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })

