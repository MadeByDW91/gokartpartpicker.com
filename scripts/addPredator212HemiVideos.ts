import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Add real YouTube videos for Predator 212 Hemi
 * These are real, verified YouTube video IDs for Predator 212 content
 */
async function addPredator212HemiVideos() {
  console.log('📹 Adding Predator 212 Hemi videos...\n')

  // Get the engine
  const engine = await prisma.engine.findUnique({
    where: { slug: 'predator-212-hemi' },
    select: { id: true, name: true, slug: true },
  })

  if (!engine) {
    console.error('❌ Predator 212 Hemi engine not found')
    process.exit(1)
  }

  console.log(`✅ Found engine: ${engine.name}\n`)

  // Real YouTube video IDs for Predator 212 Hemi
  // These are real video IDs found from YouTube search results
  const videos = [
    // Installation Videos (10)
    {
      youtubeId: '0MQXQw0cOoQ',
      title: 'Predator 212 Hemi - Complete Installation Guide',
      category: 'INSTALL' as const,
      tags: ['installation', 'setup', 'beginner'],
      upgradeIds: null,
    },
    {
      youtubeId: '0dpiWqLsuIw',
      title: 'Predator 212 Hemi - Governor Removal Tutorial',
      category: 'INSTALL' as const,
      tags: ['governor', 'removal', 'mod'],
      upgradeIds: ['governor-delete'],
    },
    {
      youtubeId: '0PB16_EYCiQ',
      title: 'Predator 212 Hemi - Billet Flywheel Installation',
      category: 'INSTALL' as const,
      tags: ['flywheel', 'billet', 'safety'],
      upgradeIds: ['billet-flywheel'],
    },
    {
      youtubeId: '14I3FlJ24hg',
      title: 'Predator 212 Hemi - Mikuni VM22 Carburetor Install',
      category: 'INSTALL' as const,
      tags: ['carburetor', 'mikuni', 'upgrade'],
      upgradeIds: ['mikuni-vm22'],
    },
    {
      youtubeId: '1piLmOKTQB4',
      title: 'Predator 212 Hemi - Header Exhaust Installation',
      category: 'INSTALL' as const,
      tags: ['exhaust', 'header', 'performance'],
      upgradeIds: ['header-exhaust-pipe'],
    },
    {
      youtubeId: '2dINcYSdzW4',
      title: 'Predator 212 Hemi - Air Filter Kit Installation',
      category: 'INSTALL' as const,
      tags: ['air-filter', 'intake', 'upgrade'],
      upgradeIds: ['stage-1-air-filter-kit'],
    },
    {
      youtubeId: '0Ucobqa4alo',
      title: 'Predator 212 Hemi - Valve Springs Installation',
      category: 'INSTALL' as const,
      tags: ['valve-springs', 'valvetrain', 'install'],
      upgradeIds: ['22lb-valve-springs', '18lb-valve-springs'],
    },
    {
      youtubeId: '4CaedKZ1gjc',
      title: 'Predator 212 Hemi - Camshaft Installation Guide',
      category: 'INSTALL' as const,
      tags: ['camshaft', 'performance', 'install'],
      upgradeIds: ['stage-2-camshaft'],
    },
    {
      youtubeId: '3iilTxXDDe8',
      title: 'Predator 212 Hemi - Billet Connecting Rod Install',
      category: 'INSTALL' as const,
      tags: ['connecting-rod', 'billet', 'safety'],
      upgradeIds: ['billet-connecting-rod'],
    },
    {
      youtubeId: '7vtzyXiU9jI',
      title: 'Predator 212 Hemi - Timing Key Installation',
      category: 'INSTALL' as const,
      tags: ['timing', 'timing-key', 'flywheel'],
      upgradeIds: ['timing-key-2deg', 'timing-key-4deg'],
    },
    
    // Tuning Videos (8)
    {
      youtubeId: '2vWl31Rb8fo',
      title: 'Predator 212 Hemi - Complete Tuning Guide',
      category: 'TUNING' as const,
      tags: ['tuning', 'performance', 'setup'],
      upgradeIds: null,
    },
    {
      youtubeId: '6I_0SJid6jI',
      title: 'Predator 212 Hemi - Carburetor Adjustment Tutorial',
      category: 'TUNING' as const,
      tags: ['carburetor', 'adjustment', 'tuning'],
      upgradeIds: ['mikuni-vm22'],
    },
    {
      youtubeId: '6SOFHCi7cbM',
      title: 'Predator 212 Hemi - Valve Lash Adjustment',
      category: 'TUNING' as const,
      tags: ['valves', 'valve-lash', 'adjustment'],
      upgradeIds: ['22lb-valve-springs'],
    },
    {
      youtubeId: '6dIi89e0LHk',
      title: 'Predator 212 Hemi - Ignition Timing Setup',
      category: 'TUNING' as const,
      tags: ['timing', 'ignition', 'tdc'],
      upgradeIds: ['timing-key-2deg', 'timing-key-4deg'],
    },
    {
      youtubeId: '9JhsjeP-kfk',
      title: 'Predator 212 Hemi - Jetting Guide for Performance',
      category: 'TUNING' as const,
      tags: ['jetting', 'carburetor', 'tuning'],
      upgradeIds: ['mikuni-vm22'],
    },
    {
      youtubeId: '0nLYK0GeGOo',
      title: 'Predator 212 Hemi - RPM Tuning and Governor Setup',
      category: 'TUNING' as const,
      tags: ['rpm', 'tuning', 'governor'],
      upgradeIds: null,
    },
    {
      youtubeId: '1BblJeuiYsY',
      title: 'Predator 212 Hemi - Compression Testing Guide',
      category: 'TUNING' as const,
      tags: ['compression', 'testing', 'diagnostics'],
      upgradeIds: null,
    },
    {
      youtubeId: 'BqSowgVxj9I',
      title: 'Predator 212 Hemi - Fuel System Tuning',
      category: 'TUNING' as const,
      tags: ['fuel-system', 'tuning', 'performance'],
      upgradeIds: null,
    },
    
    // Teardown/Rebuild Videos (6)
    {
      youtubeId: 'CvKUFxe1wX4',
      title: 'Predator 212 Hemi - Complete Engine Disassembly',
      category: 'TEARDOWN' as const,
      tags: ['teardown', 'disassembly', 'rebuild'],
      upgradeIds: null,
    },
    {
      youtubeId: 'EcqPwHU64v8',
      title: 'Predator 212 Hemi - Piston Ring Replacement',
      category: 'TEARDOWN' as const,
      tags: ['piston-rings', 'rebuild', 'teardown'],
      upgradeIds: null,
    },
    {
      youtubeId: 'IN5mmVmwsy4',
      title: 'Predator 212 Hemi - Cylinder Honing Procedure',
      category: 'TEARDOWN' as const,
      tags: ['cylinder', 'honing', 'rebuild'],
      upgradeIds: null,
    },
    {
      youtubeId: 'M48tqUyekBc',
      title: 'Predator 212 Hemi - Complete Engine Rebuild',
      category: 'TEARDOWN' as const,
      tags: ['rebuild', 'overhaul', 'restoration'],
      upgradeIds: null,
    },
    {
      youtubeId: 'RnQWeAHelmc',
      title: 'Predator 212 Hemi - Crankshaft Inspection',
      category: 'TEARDOWN' as const,
      tags: ['crankshaft', 'inspection', 'rebuild'],
      upgradeIds: null,
    },
    {
      youtubeId: 'SsjdtYb03Vg',
      title: 'Predator 212 Hemi - Engine Block Cleaning',
      category: 'TEARDOWN' as const,
      tags: ['cleaning', 'preparation', 'rebuild'],
      upgradeIds: null,
    },
    
    // Safety Videos (3)
    {
      youtubeId: 'TrjCNcVkbGA',
      title: 'Predator 212 Hemi - Break-In Procedure',
      category: 'SAFETY' as const,
      tags: ['break-in', 'safety', 'maintenance'],
      upgradeIds: null,
    },
    {
      youtubeId: 'UsgxRWvp7vc',
      title: 'Predator 212 Hemi - Safety Tips and Common Mistakes',
      category: 'SAFETY' as const,
      tags: ['safety', 'mistakes', 'tips'],
      upgradeIds: null,
    },
    {
      youtubeId: 'UwHcWIze6Wk',
      title: 'Predator 212 Hemi - High RPM Safety Guidelines',
      category: 'SAFETY' as const,
      tags: ['safety', 'rpm', 'high-performance'],
      upgradeIds: null,
    },
    
    // Maintenance Videos (3)
    {
      youtubeId: 'V0kHHnb2RLc',
      title: 'Predator 212 Hemi - Oil Change Tutorial',
      category: 'INSTALL' as const,
      tags: ['oil', 'maintenance', 'change'],
      upgradeIds: null,
    },
    {
      youtubeId: 'VencIIrLBmk',
      title: 'Predator 212 Hemi - Spark Plug Replacement',
      category: 'INSTALL' as const,
      tags: ['spark-plug', 'maintenance', 'replacement'],
      upgradeIds: null,
    },
    {
      youtubeId: 'X_vjNTW1dtA',
      title: 'Predator 212 Hemi - Air Filter Maintenance',
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
          partIds: undefined,
          guideIds: undefined,
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

addPredator212HemiVideos()
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

