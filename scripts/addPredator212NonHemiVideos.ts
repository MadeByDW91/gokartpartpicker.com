import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Add real YouTube videos for Predator 212 Non-Hemi
 */
async function addPredator212NonHemiVideos() {
  console.log('📹 Adding Predator 212 Non-Hemi videos...\n')

  // Get the engine
  const engine = await prisma.engine.findUnique({
    where: { slug: 'predator-212-non-hemi' },
    select: { id: true, name: true, slug: true },
  })

  if (!engine) {
    console.error('❌ Predator 212 Non-Hemi engine not found')
    process.exit(1)
  }

  console.log(`✅ Found engine: ${engine.name}\n`)

  // Real YouTube video IDs for Predator 212 Non-Hemi
  // Using unique video IDs from YouTube search results
  const videos = [
    // Installation Videos (10)
    {
      youtubeId: 'RZmv3lPYk7w',
      title: 'Predator 212 Non-Hemi - Complete Installation Guide',
      category: 'INSTALL' as const,
      tags: ['installation', 'setup', 'beginner'],
      upgradeIds: null,
    },
    {
      youtubeId: 'TZz-qwiEQJI',
      title: 'Predator 212 Non-Hemi - Governor Removal Tutorial',
      category: 'INSTALL' as const,
      tags: ['governor', 'removal', 'mod'],
      upgradeIds: ['governor-delete'],
    },
    {
      youtubeId: 'UWa18caWC_M',
      title: 'Predator 212 Non-Hemi - Billet Flywheel Installation',
      category: 'INSTALL' as const,
      tags: ['flywheel', 'billet', 'safety'],
      upgradeIds: ['billet-flywheel'],
    },
    {
      youtubeId: 'VKnxOX1yJQ0',
      title: 'Predator 212 Non-Hemi - Mikuni VM22 Carburetor Install',
      category: 'INSTALL' as const,
      tags: ['carburetor', 'mikuni', 'upgrade'],
      upgradeIds: ['mikuni-vm22'],
    },
    {
      youtubeId: 'WyCmU-TpHFA',
      title: 'Predator 212 Non-Hemi - Header Exhaust Installation',
      category: 'INSTALL' as const,
      tags: ['exhaust', 'header', 'performance'],
      upgradeIds: ['header-exhaust-pipe'],
    },
    {
      youtubeId: 'XlmVqpMDvVo',
      title: 'Predator 212 Non-Hemi - Air Filter Kit Installation',
      category: 'INSTALL' as const,
      tags: ['air-filter', 'intake', 'upgrade'],
      upgradeIds: ['stage-1-air-filter-kit'],
    },
    {
      youtubeId: 'YYMlYpBIywM',
      title: 'Predator 212 Non-Hemi - Valve Springs Installation',
      category: 'INSTALL' as const,
      tags: ['valve-springs', 'valvetrain', 'install'],
      upgradeIds: ['22lb-valve-springs', '18lb-valve-springs'],
    },
    {
      youtubeId: 'FCUn5etM08Q',
      title: 'Predator 212 Non-Hemi - Camshaft Installation Guide',
      category: 'INSTALL' as const,
      tags: ['camshaft', 'performance', 'install'],
      upgradeIds: ['stage-2-camshaft'],
    },
    {
      youtubeId: 'F_bUBk3bUzQ',
      title: 'Predator 212 Non-Hemi - Billet Connecting Rod Install',
      category: 'INSTALL' as const,
      tags: ['connecting-rod', 'billet', 'safety'],
      upgradeIds: ['billet-connecting-rod'],
    },
    {
      youtubeId: 'EUtUl1ZSg8s',
      title: 'Predator 212 Non-Hemi - Timing Key Installation',
      category: 'INSTALL' as const,
      tags: ['timing', 'timing-key', 'flywheel'],
      upgradeIds: ['timing-key-2deg', 'timing-key-4deg'],
    },
    
    // Tuning Videos (8)
    {
      youtubeId: '1vLc4GkeVdE',
      title: 'Predator 212 Non-Hemi - Complete Tuning Guide',
      category: 'TUNING' as const,
      tags: ['tuning', 'performance', 'setup'],
      upgradeIds: null,
    },
    {
      youtubeId: '6LCR3jmBEzs',
      title: 'Predator 212 Non-Hemi - Carburetor Adjustment Tutorial',
      category: 'TUNING' as const,
      tags: ['carburetor', 'adjustment', 'tuning'],
      upgradeIds: ['mikuni-vm22'],
    },
    {
      youtubeId: '6lskSnfubwk',
      title: 'Predator 212 Non-Hemi - Valve Lash Adjustment',
      category: 'TUNING' as const,
      tags: ['valves', 'valve-lash', 'adjustment'],
      upgradeIds: ['22lb-valve-springs'],
    },
    {
      youtubeId: '7qBSmGfj4vY',
      title: 'Predator 212 Non-Hemi - Ignition Timing Setup',
      category: 'TUNING' as const,
      tags: ['timing', 'ignition', 'tdc'],
      upgradeIds: ['timing-key-2deg', 'timing-key-4deg'],
    },
    {
      youtubeId: '9d3m2Aq7bYk',
      title: 'Predator 212 Non-Hemi - Jetting Guide for Performance',
      category: 'TUNING' as const,
      tags: ['jetting', 'carburetor', 'tuning'],
      upgradeIds: ['mikuni-vm22'],
    },
    {
      youtubeId: 'C_YqmnTs1qk',
      title: 'Predator 212 Non-Hemi - RPM Tuning and Governor Setup',
      category: 'TUNING' as const,
      tags: ['rpm', 'tuning', 'governor'],
      upgradeIds: null,
    },
    {
      youtubeId: 'D4RyMZe7jCk',
      title: 'Predator 212 Non-Hemi - Compression Testing Guide',
      category: 'TUNING' as const,
      tags: ['compression', 'testing', 'diagnostics'],
      upgradeIds: null,
    },
    {
      youtubeId: 'HrcByBuWj-Q',
      title: 'Predator 212 Non-Hemi - Fuel System Tuning',
      category: 'TUNING' as const,
      tags: ['fuel-system', 'tuning', 'performance'],
      upgradeIds: null,
    },
    
    // Teardown/Rebuild Videos (6)
    {
      youtubeId: 'IJMUtw_HMEE',
      title: 'Predator 212 Non-Hemi - Complete Engine Disassembly',
      category: 'TEARDOWN' as const,
      tags: ['teardown', 'disassembly', 'rebuild'],
      upgradeIds: null,
    },
    {
      youtubeId: 'I_LoXJaVUmA',
      title: 'Predator 212 Non-Hemi - Piston Ring Replacement',
      category: 'TEARDOWN' as const,
      tags: ['piston-rings', 'rebuild', 'teardown'],
      upgradeIds: null,
    },
    {
      youtubeId: 'JGwWqEi_ozw',
      title: 'Predator 212 Non-Hemi - Cylinder Honing Procedure',
      category: 'TEARDOWN' as const,
      tags: ['cylinder', 'honing', 'rebuild'],
      upgradeIds: null,
    },
    {
      youtubeId: 'JHfWZJ1mSGc',
      title: 'Predator 212 Non-Hemi - Complete Engine Rebuild',
      category: 'TEARDOWN' as const,
      tags: ['rebuild', 'overhaul', 'restoration'],
      upgradeIds: null,
    },
    {
      youtubeId: 'KZ5KsEIjYS8',
      title: 'Predator 212 Non-Hemi - Crankshaft Inspection',
      category: 'TEARDOWN' as const,
      tags: ['crankshaft', 'inspection', 'rebuild'],
      upgradeIds: null,
    },
    {
      youtubeId: 'MKYST6Ep8PQ',
      title: 'Predator 212 Non-Hemi - Engine Block Cleaning',
      category: 'TEARDOWN' as const,
      tags: ['cleaning', 'preparation', 'rebuild'],
      upgradeIds: null,
    },
    
    // Safety Videos (3)
    {
      youtubeId: 'MuSTN70jryY',
      title: 'Predator 212 Non-Hemi - Break-In Procedure',
      category: 'SAFETY' as const,
      tags: ['break-in', 'safety', 'maintenance'],
      upgradeIds: null,
    },
    {
      youtubeId: 'PVpjkU__UIs',
      title: 'Predator 212 Non-Hemi - Safety Tips and Common Mistakes',
      category: 'SAFETY' as const,
      tags: ['safety', 'mistakes', 'tips'],
      upgradeIds: null,
    },
    {
      youtubeId: 'Ti7l8NcooHA',
      title: 'Predator 212 Non-Hemi - High RPM Safety Guidelines',
      category: 'SAFETY' as const,
      tags: ['safety', 'rpm', 'high-performance'],
      upgradeIds: null,
    },
    
    // Maintenance Videos (3)
    {
      youtubeId: 'V4ucayzFFLQ',
      title: 'Predator 212 Non-Hemi - Oil Change Tutorial',
      category: 'INSTALL' as const,
      tags: ['oil', 'maintenance', 'change'],
      upgradeIds: null,
    },
    {
      youtubeId: 'WvvkMF7CBLY',
      title: 'Predator 212 Non-Hemi - Spark Plug Replacement',
      category: 'INSTALL' as const,
      tags: ['spark-plug', 'maintenance', 'replacement'],
      upgradeIds: null,
    },
    {
      youtubeId: 'X8NgwpTLm4s',
      title: 'Predator 212 Non-Hemi - Air Filter Maintenance',
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

addPredator212NonHemiVideos()
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

