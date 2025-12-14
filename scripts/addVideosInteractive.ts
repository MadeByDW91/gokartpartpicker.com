import { PrismaClient } from '@prisma/client'
import * as readline from 'readline'

const prisma = new PrismaClient()

/**
 * Interactive script to add YouTube videos one at a time
 * This makes it easier to verify each video as you add it
 */
async function addVideosInteractive() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve)
    })
  }

  console.log('📹 Interactive Video Adder\n')
  console.log('This script helps you add YouTube videos one at a time.\n')

  // Get engine
  const engineSlug = await question('Enter engine slug (predator-212-hemi, predator-212-ghost, etc.): ')
  const engine = await prisma.engine.findUnique({
    where: { slug: engineSlug },
    select: { id: true, name: true, slug: true },
  })

  if (!engine) {
    console.error(`❌ Engine not found: ${engineSlug}`)
    rl.close()
    process.exit(1)
  }

  console.log(`\n✅ Found engine: ${engine.name}\n`)

  let continueAdding = true
  let added = 0

  while (continueAdding) {
    console.log('--- New Video ---')
    const youtubeId = await question('YouTube Video ID (or "done" to finish): ')
    
    if (youtubeId.toLowerCase() === 'done') {
      break
    }

    if (!youtubeId || youtubeId.trim() === '') {
      console.log('⚠️  Empty ID, skipping...\n')
      continue
    }

    // Check if already exists
    const existing = await prisma.video.findUnique({
      where: { youtubeId: youtubeId.trim() },
    })

    if (existing) {
      console.log(`⏭️  Video already exists: ${existing.title}\n`)
      continue
    }

    // Verify video
    console.log('🔍 Verifying video...')
    const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId.trim()}/hqdefault.jpg`
    try {
      const response = await fetch(thumbnailUrl, { method: 'HEAD' })
      if (!response.ok) {
        console.log('❌ Video not found or invalid\n')
        continue
      }
    } catch (error) {
      console.log('❌ Error verifying video\n')
      continue
    }

    // Get video details
    const title = await question('Video title: ')
    const category = await question('Category (INSTALL/TUNING/TEARDOWN/SAFETY): ') as 'INSTALL' | 'TUNING' | 'TEARDOWN' | 'SAFETY'
    const tagsInput = await question('Tags (comma-separated): ')
    const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t)

    // Add to database
    try {
      await prisma.video.create({
        data: {
          youtubeId: youtubeId.trim(),
          title: title || `Video ${youtubeId.trim()}`,
          channelName: 'GoPowerSports',
          durationSeconds: 600, // Default, can be updated later
          thumbnailUrl: thumbnailUrl,
          category: category || 'INSTALL',
          tags: tags.length > 0 ? JSON.parse(JSON.stringify(tags)) : null,
          engineIds: JSON.parse(JSON.stringify([engine.id])),
          upgradeIds: undefined,
          partIds: undefined,
          guideIds: undefined,
        },
      })
      console.log(`✅ Added video: ${title || youtubeId.trim()}\n`)
      added++
    } catch (error) {
      console.log(`❌ Error adding video: ${error instanceof Error ? error.message : 'Unknown error'}\n`)
    }
  }

  console.log(`\n✅ Done! Added ${added} videos for ${engine.name}`)
  rl.close()
  prisma.$disconnect()
}

addVideosInteractive().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})

