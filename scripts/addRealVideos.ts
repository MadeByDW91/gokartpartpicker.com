import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Add real YouTube videos to the database
 * These are example videos - you should replace with actual videos relevant to your content
 */
async function addRealVideos() {
  console.log('📹 Adding real YouTube videos...')

  // Get engine IDs
  const engines = await prisma.engine.findMany({
    select: { id: true, slug: true, name: true },
  })

  const predator212Hemi = engines.find(e => e.slug === 'predator-212-hemi')
  const predator212Ghost = engines.find(e => e.slug === 'predator-212-ghost')
  const predator420 = engines.find(e => e.slug === 'predator-420')

  if (!predator212Hemi || !predator212Ghost || !predator420) {
    console.error('❌ Engines not found. Please seed engines first.')
    return
  }

  // Example real YouTube video IDs for Predator 212 content
  // NOTE: These are example IDs - replace with actual video IDs from your research
  // Format: { youtubeId, title, category, tags, engineId, upgradeIds }
  const realVideos = [
    // Predator 212 Hemi - Installation videos
    {
      youtubeId: 'dQw4w9WgXcQ', // Example - replace with real ID
      title: 'Predator 212 Hemi - Complete Installation Guide',
      channelName: 'GoPowerSports',
      durationSeconds: 1200,
      category: 'INSTALL' as const,
      tags: ['installation', 'setup', 'beginner'],
      engineIds: [predator212Hemi.id],
      upgradeIds: null,
      partIds: undefined,
      guideIds: undefined,
    },
    {
      youtubeId: 'jNQXAC9IVRw', // Example - replace with real ID
      title: 'Predator 212 Hemi - Governor Removal Tutorial',
      channelName: 'GoPowerSports',
      durationSeconds: 900,
      category: 'INSTALL' as const,
      tags: ['governor', 'removal', 'mod'],
      engineIds: [predator212Hemi.id],
      upgradeIds: ['governor-delete'],
      partIds: undefined,
      guideIds: undefined,
    },
    // Add more real videos here...
  ]

  // Verify each video before adding
  let added = 0
  let skipped = 0

  for (const video of realVideos) {
    // Check if video already exists
    const existing = await prisma.video.findUnique({
      where: { youtubeId: video.youtubeId },
    })

    if (existing) {
      console.log(`⏭️  Skipping ${video.youtubeId} - already exists`)
      skipped++
      continue
    }

    // Verify video is accessible
    try {
      const thumbnailUrl = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`
      const response = await fetch(thumbnailUrl, { method: 'HEAD' })
      
      if (response.ok) {
        await prisma.video.create({
          data: {
            youtubeId: video.youtubeId,
            title: video.title,
            channelName: video.channelName,
            durationSeconds: video.durationSeconds,
            thumbnailUrl: thumbnailUrl,
            category: video.category,
            tags: video.tags ? JSON.parse(JSON.stringify(video.tags)) : null,
            engineIds: video.engineIds ? JSON.parse(JSON.stringify(video.engineIds)) : null,
            upgradeIds: video.upgradeIds ? JSON.parse(JSON.stringify(video.upgradeIds)) : null,
            partIds: video.partIds ? JSON.parse(JSON.stringify(video.partIds)) : null,
            guideIds: video.guideIds ? JSON.parse(JSON.stringify(video.guideIds)) : null,
          },
        })
        console.log(`✅ Added: ${video.title} (${video.youtubeId})`)
        added++
      } else {
        console.log(`❌ Skipping ${video.youtubeId} - video not accessible`)
        skipped++
      }
    } catch (error) {
      console.log(`❌ Error verifying ${video.youtubeId}:`, error)
      skipped++
    }
  }

  console.log(`\n✅ Added ${added} videos`)
  console.log(`⏭️  Skipped ${skipped} videos`)
}

addRealVideos()
  .then(() => {
    console.log('\n✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })

