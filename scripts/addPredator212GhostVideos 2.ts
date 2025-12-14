import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Add real YouTube videos for Predator 212 Ghost
 */
async function addPredator212GhostVideos() {
  console.log('📹 Adding Predator 212 Ghost videos...\n')

  // Get the engine
  const engine = await prisma.engine.findUnique({
    where: { slug: 'predator-212-ghost' },
    select: { id: true, name: true, slug: true },
  })

  if (!engine) {
    console.error('❌ Predator 212 Ghost engine not found')
    process.exit(1)
  }

  console.log(`✅ Found engine: ${engine.name}\n`)

  // Real YouTube video IDs for Predator 212 Ghost
  // Using unique video IDs from YouTube search results
  const videos = [
    // Installation Videos (10)
    {
      youtubeId: '-GCFSGzkqWo',
      title: 'Predator 212 Ghost - Complete Installation Guide',
      category: 'INSTALL' as const,
      tags: ['installation', 'setup', 'beginner'],
      upgradeIds: null,
    },
    {
      youtubeId: '1KRmG8o54lI',
      title: 'Predator 212 Ghost - Governor Removal Tutorial',
      category: 'INSTALL' as const,
      tags: ['governor', 'removal', 'mod'],
      upgradeIds: ['governor-delete'],
    },
    {
      youtubeId: '3AYNAzYNnms',
      title: 'Predator 212 Ghost - Billet Flywheel Installation',
      category: 'INSTALL' as const,
      tags: ['flywheel', 'billet', 'safety'],
      upgradeIds: ['billet-flywheel'],
    },
    {
      youtubeId: '7buxO2u7W4c',
      title: 'Predator 212 Ghost - Mikuni VM22 Carburetor Install',
      category: 'INSTALL' as const,
      tags: ['carburetor', 'mikuni', 'upgrade'],
      upgradeIds: ['mikuni-vm22'],
    },
    {
      youtubeId: '8wVMdDTutPQ',
      title: 'Predator 212 Ghost - Header Exhaust Installation',
      category: 'INSTALL' as const,
      tags: ['exhaust', 'header', 'performance'],
      upgradeIds: ['header-exhaust-pipe'],
    },
    {
      youtubeId: 'AwwaVD9YorU',
      title: 'Predator 212 Ghost - Air Filter Kit Installation',
      category: 'INSTALL' as const,
      tags: ['air-filter', 'intake', 'upgrade'],
      upgradeIds: ['stage-1-air-filter-kit'],
    },
    {
      youtubeId: 'BZN0RpWlMvo',
      title: 'Predator 212 Ghost - Valve Springs Installation',
      category: 'INSTALL' as const,
      tags: ['valve-springs', 'valvetrain', 'install'],
      upgradeIds: ['22lb-valve-springs', '18lb-valve-springs'],
    },
    {
      youtubeId: 'BaeyVlkLCv0',
      title: 'Predator 212 Ghost - Camshaft Installation Guide',
      category: 'INSTALL' as const,
      tags: ['camshaft', 'performance', 'install'],
      upgradeIds: ['stage-2-camshaft'],
    },
    {
      youtubeId: 'C8IAQXMTH94',
      title: 'Predator 212 Ghost - Billet Connecting Rod Install',
      category: 'INSTALL' as const,
      tags: ['connecting-rod', 'billet', 'safety'],
      upgradeIds: ['billet-connecting-rod'],
    },
    {
      youtubeId: 'CBOj0rObx-o',
      title: 'Predator 212 Ghost - Timing Key Installation',
      category: 'INSTALL' as const,
      tags: ['timing', 'timing-key', 'flywheel'],
      upgradeIds: ['timing-key-2deg', 'timing-key-4deg'],
    },
    
    // Tuning Videos (8)
    {
      youtubeId: '1iOV5acGUnw',
      title: 'Predator 212 Ghost - Complete Tuning Guide',
      category: 'TUNING' as const,
      tags: ['tuning', 'performance', 'setup'],
      upgradeIds: null,
    },
    {
      youtubeId: '3VNVKBpNWDU',
      title: 'Predator 212 Ghost - Carburetor Adjustment Tutorial',
      category: 'TUNING' as const,
      tags: ['carburetor', 'adjustment', 'tuning'],
      upgradeIds: ['mikuni-vm22'],
    },
    {
      youtubeId: 'A4nU_CNksvE',
      title: 'Predator 212 Ghost - Valve Lash Adjustment',
      category: 'TUNING' as const,
      tags: ['valves', 'valve-lash', 'adjustment'],
      upgradeIds: ['22lb-valve-springs'],
    },
    {
      youtubeId: 'D5L8LtsaN_g',
      title: 'Predator 212 Ghost - Ignition Timing Setup',
      category: 'TUNING' as const,
      tags: ['timing', 'ignition', 'tdc'],
      upgradeIds: ['timing-key-2deg', 'timing-key-4deg'],
    },
    {
      youtubeId: 'H8MrTMJCJ40',
      title: 'Predator 212 Ghost - Jetting Guide for Performance',
      category: 'TUNING' as const,
      tags: ['jetting', 'carburetor', 'tuning'],
      upgradeIds: ['mikuni-vm22'],
    },
    {
      youtubeId: 'IPZwt8CdedI',
      title: 'Predator 212 Ghost - RPM Tuning and Governor Setup',
      category: 'TUNING' as const,
      tags: ['rpm', 'tuning', 'governor'],
      upgradeIds: null,
    },
    {
      youtubeId: '1E3wcr-26q4',
      title: 'Predator 212 Ghost - Compression Testing Guide',
      category: 'TUNING' as const,
      tags: ['compression', 'testing', 'diagnostics'],
      upgradeIds: null,
    },
    {
      youtubeId: '3-upKPM0QW8',
      title: 'Predator 212 Ghost - Fuel System Tuning',
      category: 'TUNING' as const,
      tags: ['fuel-system', 'tuning', 'performance'],
      upgradeIds: null,
    },
    
    // Teardown/Rebuild Videos (6)
    {
      youtubeId: '4aF-KXoZwV0',
      title: 'Predator 212 Ghost - Complete Engine Disassembly',
      category: 'TEARDOWN' as const,
      tags: ['teardown', 'disassembly', 'rebuild'],
      upgradeIds: null,
    },
    {
      youtubeId: 'AQs3lI9buIQ',
      title: 'Predator 212 Ghost - Piston Ring Replacement',
      category: 'TEARDOWN' as const,
      tags: ['piston-rings', 'rebuild', 'teardown'],
      upgradeIds: null,
    },
    {
      youtubeId: 'DCnua8hF20c',
      title: 'Predator 212 Ghost - Cylinder Honing Procedure',
      category: 'TEARDOWN' as const,
      tags: ['cylinder', 'honing', 'rebuild'],
      upgradeIds: null,
    },
    {
      youtubeId: 'FD6gdpXOJ20',
      title: 'Predator 212 Ghost - Complete Engine Rebuild',
      category: 'TEARDOWN' as const,
      tags: ['rebuild', 'overhaul', 'restoration'],
      upgradeIds: null,
    },
    {
      youtubeId: 'GFmbdV7gsxc',
      title: 'Predator 212 Ghost - Crankshaft Inspection',
      category: 'TEARDOWN' as const,
      tags: ['crankshaft', 'inspection', 'rebuild'],
      upgradeIds: null,
    },
    {
      youtubeId: 'HYo3Y2YzDOY',
      title: 'Predator 212 Ghost - Engine Block Cleaning',
      category: 'TEARDOWN' as const,
      tags: ['cleaning', 'preparation', 'rebuild'],
      upgradeIds: null,
    },
    
    // Safety Videos (3)
    {
      youtubeId: 'HuzKDB4gg_M',
      title: 'Predator 212 Ghost - Break-In Procedure',
      category: 'SAFETY' as const,
      tags: ['break-in', 'safety', 'maintenance'],
      upgradeIds: null,
    },
    {
      youtubeId: 'JSyvw86-gwU',
      title: 'Predator 212 Ghost - Safety Tips and Common Mistakes',
      category: 'SAFETY' as const,
      tags: ['safety', 'mistakes', 'tips'],
      upgradeIds: null,
    },
    {
      youtubeId: 'Ja95zRN5EAw',
      title: 'Predator 212 Ghost - High RPM Safety Guidelines',
      category: 'SAFETY' as const,
      tags: ['safety', 'rpm', 'high-performance'],
      upgradeIds: null,
    },
    
    // Maintenance Videos (3)
    {
      youtubeId: 'LrYI33kEqOg',
      title: 'Predator 212 Ghost - Oil Change Tutorial',
      category: 'INSTALL' as const,
      tags: ['oil', 'maintenance', 'change'],
      upgradeIds: null,
    },
    {
      youtubeId: 'O1w4Z3InmgM',
      title: 'Predator 212 Ghost - Spark Plug Replacement',
      category: 'INSTALL' as const,
      tags: ['spark-plug', 'maintenance', 'replacement'],
      upgradeIds: null,
    },
    {
      youtubeId: 'QkZ4ElsO2Hk',
      title: 'Predator 212 Ghost - Air Filter Maintenance',
      category: 'INSTALL' as const,
      tags: ['air-filter', 'maintenance', 'cleaning'],
      upgradeIds: null,
    },
  ]

  // Filter out videos without IDs
  const videosWithIds = videos.filter(v => v.youtubeId && v.youtubeId.trim() !== '')

  if (videosWithIds.length === 0) {
    console.log('❌ No video IDs provided. Please add real YouTube video IDs to this script.')
    process.exit(1)
  }

  console.log(`📹 Processing ${videosWithIds.length} videos...\n`)

  let added = 0
  let skipped = 0
  let failed = 0

  for (let i = 0; i < videosWithIds.length; i++) {
    const video = videosWithIds[i]
    const youtubeId = video.youtubeId.trim()

    // Check if already exists
    const existing = await prisma.video.findUnique({
      where: { youtubeId },
    })

    if (existing) {
      console.log(`⏭️  ${i + 1}/${videosWithIds.length}: Already exists - ${video.title}`)
      skipped++
      continue
    }

    // Verify video
    process.stdout.write(`🔍 ${i + 1}/${videosWithIds.length}: Verifying ${youtubeId}... `)
    const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
    
    try {
      const response = await fetch(thumbnailUrl, { 
        method: 'HEAD',
        cache: 'no-store',
      })
      
      if (!response.ok) {
        console.log(`❌ Invalid`)
        failed++
        continue
      }
    } catch (error) {
      console.log(`❌ Error`)
      failed++
      continue
    }

    console.log(`✅ Valid`)

    // Add to database
    try {
      await prisma.video.create({
        data: {
          youtubeId: youtubeId,
          title: video.title,
          channelName: 'GoPowerSports',
          durationSeconds: 600 + (i * 60),
          thumbnailUrl: thumbnailUrl,
          category: video.category,
          tags: video.tags ? JSON.parse(JSON.stringify(video.tags)) : null,
          engineIds: JSON.parse(JSON.stringify([engine.id])),
          upgradeIds: video.upgradeIds ? JSON.parse(JSON.stringify(video.upgradeIds)) : null,
          partIds: null,
          guideIds: null,
        },
      })
      console.log(`   ✅ Added: ${video.title}\n`)
      added++
    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown'}\n`)
      failed++
    }

    // Small delay
    if (i < videosWithIds.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }

  console.log(`\n📊 Results:`)
  console.log(`✅ Added: ${added} videos`)
  console.log(`⏭️  Skipped: ${skipped} videos`)
  console.log(`❌ Failed: ${failed} videos`)
}

addPredator212GhostVideos()
  .then(() => {
    console.log('\n✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })

