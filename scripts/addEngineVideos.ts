import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

/**
 * Verify if a YouTube video is accessible by checking the thumbnail
 */
async function verifyYouTubeVideo(youtubeId: string): Promise<boolean> {
  try {
    const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
    const response = await fetch(thumbnailUrl, { 
      method: 'HEAD',
      cache: 'no-store',
    })
    
    if (response.ok) {
      const contentType = response.headers.get('content-type')
      return contentType?.startsWith('image/') ?? false
    }
    return false
  } catch (error) {
    return false
  }
}

/**
 * Add 30 videos for a specific engine
 * Usage: npx tsx scripts/addEngineVideos.ts <engine-slug>
 * Example: npx tsx scripts/addEngineVideos.ts predator-212-hemi
 */
async function addEngineVideos() {
  const engineSlug = process.argv[2]

  if (!engineSlug) {
    console.error('❌ Error: Engine slug is required')
    console.log('\nUsage: npx tsx scripts/addEngineVideos.ts <engine-slug>')
    console.log('Example: npx tsx scripts/addEngineVideos.ts predator-212-hemi')
    console.log('\nAvailable engines:')
    const engines = await prisma.engine.findMany({
      select: { slug: true, name: true },
      orderBy: { name: 'asc' },
    })
    engines.forEach(e => console.log(`  - ${e.slug} (${e.name})`))
    process.exit(1)
  }

  console.log(`📹 Adding videos for engine: ${engineSlug}\n`)

  // Get the engine
  const engine = await prisma.engine.findUnique({
    where: { slug: engineSlug },
    select: { id: true, name: true, slug: true },
  })

  if (!engine) {
    console.error(`❌ Engine not found: ${engineSlug}`)
    process.exit(1)
  }

  console.log(`✅ Found engine: ${engine.name} (${engine.slug})\n`)

  // Try to load video data from JSON file first
  const videoDataPath = path.join(__dirname, 'video-data.json')
  let videoTemplates: any[] = []

  if (fs.existsSync(videoDataPath)) {
    try {
      const videoData = JSON.parse(fs.readFileSync(videoDataPath, 'utf-8'))
      if (videoData[engineSlug] && Array.isArray(videoData[engineSlug])) {
        videoTemplates = videoData[engineSlug].map((v: any) => ({
          title: v.title,
          category: v.category,
          tags: v.tags,
          upgradeIds: v.upgradeIds,
          youtubeId: v.youtubeId || '',
        }))
        console.log(`📄 Loaded ${videoTemplates.length} video templates from video-data.json\n`)
      }
    } catch (error) {
      console.log(`⚠️  Could not load video-data.json, using default templates\n`)
    }
  }

  // Fallback to default templates if JSON file doesn't exist or doesn't have data
  if (videoTemplates.length === 0) {
    videoTemplates = [
    // Installation Videos (10)
    { 
      title: `${engine.name} - Complete Installation Guide`, 
      category: 'INSTALL' as const, 
      tags: ['installation', 'setup', 'beginner'], 
      upgradeIds: null,
      youtubeId: '', // ADD REAL YOUTUBE ID HERE
    },
    { 
      title: `${engine.name} - Governor Removal Tutorial`, 
      category: 'INSTALL' as const, 
      tags: ['governor', 'removal', 'mod'], 
      upgradeIds: ['governor-delete'],
      youtubeId: '', // ADD REAL YOUTUBE ID HERE
    },
    { 
      title: `${engine.name} - Billet Flywheel Installation`, 
      category: 'INSTALL' as const, 
      tags: ['flywheel', 'billet', 'safety'], 
      upgradeIds: ['billet-flywheel'],
      youtubeId: '', // ADD REAL YOUTUBE ID HERE
    },
    { 
      title: `${engine.name} - Mikuni VM22 Carburetor Install`, 
      category: 'INSTALL' as const, 
      tags: ['carburetor', 'mikuni', 'upgrade'], 
      upgradeIds: ['mikuni-vm22'],
      youtubeId: '', // ADD REAL YOUTUBE ID HERE
    },
    { 
      title: `${engine.name} - Header Exhaust Installation`, 
      category: 'INSTALL' as const, 
      tags: ['exhaust', 'header', 'performance'], 
      upgradeIds: ['header-exhaust-pipe'],
      youtubeId: '', // ADD REAL YOUTUBE ID HERE
    },
    { 
      title: `${engine.name} - Air Filter Kit Installation`, 
      category: 'INSTALL' as const, 
      tags: ['air-filter', 'intake', 'upgrade'], 
      upgradeIds: ['stage-1-air-filter-kit'],
      youtubeId: '', // ADD REAL YOUTUBE ID HERE
    },
    { 
      title: `${engine.name} - Valve Springs Installation`, 
      category: 'INSTALL' as const, 
      tags: ['valve-springs', 'valvetrain', 'install'], 
      upgradeIds: ['22lb-valve-springs', '18lb-valve-springs'],
      youtubeId: '', // ADD REAL YOUTUBE ID HERE
    },
    { 
      title: `${engine.name} - Camshaft Installation Guide`, 
      category: 'INSTALL' as const, 
      tags: ['camshaft', 'performance', 'install'], 
      upgradeIds: ['stage-2-camshaft'],
      youtubeId: '', // ADD REAL YOUTUBE ID HERE
    },
    { 
      title: `${engine.name} - Billet Connecting Rod Install`, 
      category: 'INSTALL' as const, 
      tags: ['connecting-rod', 'billet', 'safety'], 
      upgradeIds: ['billet-connecting-rod'],
      youtubeId: '', // ADD REAL YOUTUBE ID HERE
    },
    { 
      title: `${engine.name} - Timing Key Installation`, 
      category: 'INSTALL' as const, 
      tags: ['timing', 'timing-key', 'flywheel'], 
      upgradeIds: ['timing-key-2deg', 'timing-key-4deg'],
      youtubeId: '', // ADD REAL YOUTUBE ID HERE
    },
    
    // Tuning Videos (8)
    { 
      title: `${engine.name} - Complete Tuning Guide`, 
      category: 'TUNING' as const, 
      tags: ['tuning', 'performance', 'setup'], 
      upgradeIds: null,
      youtubeId: '', // ADD REAL YOUTUBE ID HERE
    },
    { 
      title: `${engine.name} - Carburetor Adjustment Tutorial`, 
      category: 'TUNING' as const, 
      tags: ['carburetor', 'adjustment', 'tuning'], 
      upgradeIds: ['mikuni-vm22'],
      youtubeId: '', // ADD REAL YOUTUBE ID HERE
    },
    { 
      title: `${engine.name} - Valve Lash Adjustment`, 
      category: 'TUNING' as const, 
      tags: ['valves', 'valve-lash', 'adjustment'], 
      upgradeIds: ['22lb-valve-springs'],
      youtubeId: '', // ADD REAL YOUTUBE ID HERE
    },
    { 
      title: `${engine.name} - Ignition Timing Setup`, 
      category: 'TUNING' as const, 
      tags: ['timing', 'ignition', 'tdc'], 
      upgradeIds: ['timing-key-2deg', 'timing-key-4deg'],
      youtubeId: '', // ADD REAL YOUTUBE ID HERE
    },
    { 
      title: `${engine.name} - Jetting Guide for Performance`, 
      category: 'TUNING' as const, 
      tags: ['jetting', 'carburetor', 'tuning'], 
      upgradeIds: ['mikuni-vm22'],
      youtubeId: '', // ADD REAL YOUTUBE ID HERE
    },
    { 
      title: `${engine.name} - RPM Tuning and Governor Setup`, 
      category: 'TUNING' as const, 
      tags: ['rpm', 'tuning', 'governor'], 
      upgradeIds: null,
      youtubeId: '', // ADD REAL YOUTUBE ID HERE
    },
    { 
      title: `${engine.name} - Compression Testing Guide`, 
      category: 'TUNING' as const, 
      tags: ['compression', 'testing', 'diagnostics'], 
      upgradeIds: null,
      youtubeId: '', // ADD REAL YOUTUBE ID HERE
    },
    { 
      title: `${engine.name} - Fuel System Tuning`, 
      category: 'TUNING' as const, 
      tags: ['fuel-system', 'tuning', 'performance'], 
      upgradeIds: null,
      youtubeId: '', // ADD REAL YOUTUBE ID HERE
    },
    
    // Teardown/Rebuild Videos (6)
    { 
      title: `${engine.name} - Complete Engine Disassembly`, 
      category: 'TEARDOWN' as const, 
      tags: ['teardown', 'disassembly', 'rebuild'], 
      upgradeIds: null,
      youtubeId: '', // ADD REAL YOUTUBE ID HERE
    },
    { 
      title: `${engine.name} - Piston Ring Replacement`, 
      category: 'TEARDOWN' as const, 
      tags: ['piston-rings', 'rebuild', 'teardown'], 
      upgradeIds: null,
      youtubeId: '', // ADD REAL YOUTUBE ID HERE
    },
    { 
      title: `${engine.name} - Cylinder Honing Procedure`, 
      category: 'TEARDOWN' as const, 
      tags: ['cylinder', 'honing', 'rebuild'], 
      upgradeIds: null,
      youtubeId: '', // ADD REAL YOUTUBE ID HERE
    },
    { 
      title: `${engine.name} - Complete Engine Rebuild`, 
      category: 'TEARDOWN' as const, 
      tags: ['rebuild', 'overhaul', 'restoration'], 
      upgradeIds: null,
      youtubeId: '', // ADD REAL YOUTUBE ID HERE
    },
    { 
      title: `${engine.name} - Crankshaft Inspection`, 
      category: 'TEARDOWN' as const, 
      tags: ['crankshaft', 'inspection', 'rebuild'], 
      upgradeIds: null,
      youtubeId: '', // ADD REAL YOUTUBE ID HERE
    },
    { 
      title: `${engine.name} - Engine Block Cleaning`, 
      category: 'TEARDOWN' as const, 
      tags: ['cleaning', 'preparation', 'rebuild'], 
      upgradeIds: null,
      youtubeId: '', // ADD REAL YOUTUBE ID HERE
    },
    
    // Safety Videos (3)
    { 
      title: `${engine.name} - Break-In Procedure`, 
      category: 'SAFETY' as const, 
      tags: ['break-in', 'safety', 'maintenance'], 
      upgradeIds: null,
      youtubeId: '', // ADD REAL YOUTUBE ID HERE
    },
    { 
      title: `${engine.name} - Safety Tips and Common Mistakes`, 
      category: 'SAFETY' as const, 
      tags: ['safety', 'mistakes', 'tips'], 
      upgradeIds: null,
      youtubeId: '', // ADD REAL YOUTUBE ID HERE
    },
    { 
      title: `${engine.name} - High RPM Safety Guidelines`, 
      category: 'SAFETY' as const, 
      tags: ['safety', 'rpm', 'high-performance'], 
      upgradeIds: null,
      youtubeId: '', // ADD REAL YOUTUBE ID HERE
    },
    
    // Maintenance Videos (3)
    { 
      title: `${engine.name} - Oil Change Tutorial`, 
      category: 'INSTALL' as const, 
      tags: ['oil', 'maintenance', 'change'], 
      upgradeIds: null,
      youtubeId: '', // ADD REAL YOUTUBE ID HERE
    },
    { 
      title: `${engine.name} - Spark Plug Replacement`, 
      category: 'INSTALL' as const, 
      tags: ['spark-plug', 'maintenance', 'replacement'], 
      upgradeIds: null,
      youtubeId: '', // ADD REAL YOUTUBE ID HERE
    },
    { 
      title: `${engine.name} - Air Filter Maintenance`, 
      category: 'INSTALL' as const, 
      tags: ['air-filter', 'maintenance', 'cleaning'], 
      upgradeIds: null,
      youtubeId: '', // ADD REAL YOUTUBE ID HERE
    },
    ]
  }

  // Check how many videos already have YouTube IDs
  const videosWithIds = videoTemplates.filter(v => v.youtubeId && v.youtubeId.trim() !== '')
  const videosNeedingIds = videoTemplates.filter(v => !v.youtubeId || v.youtubeId.trim() === '')

  if (videosNeedingIds.length > 0) {
    console.log(`⚠️  Warning: ${videosNeedingIds.length} videos need YouTube IDs`)
    console.log('\nVideos needing YouTube IDs:')
    videosNeedingIds.forEach((v, i) => {
      console.log(`  ${i + 1}. ${v.title}`)
    })
    console.log('\n💡 To add videos:')
    console.log('   1. Edit this file: scripts/addEngineVideos.ts')
    console.log('   2. Find each video template above')
    console.log('   3. Replace the empty youtubeId with a real YouTube video ID')
    console.log('   4. Run this script again\n')
  }

  if (videosWithIds.length === 0) {
    console.log('❌ No YouTube IDs provided. Please add YouTube video IDs to the video templates above.')
    process.exit(1)
  }

  console.log(`\n📹 Processing ${videosWithIds.length} videos with YouTube IDs...\n`)

  let added = 0
  let skipped = 0
  let failed = 0

  for (let i = 0; i < videosWithIds.length; i++) {
    const template = videosWithIds[i]
    const youtubeId = template.youtubeId.trim()

    // Check if video already exists
    const existing = await prisma.video.findUnique({
      where: { youtubeId },
    })

    if (existing) {
      console.log(`⏭️  ${i + 1}/${videosWithIds.length}: ${template.title}`)
      console.log(`    Skipped - already exists (${youtubeId})`)
      skipped++
      continue
    }

    // Verify video is accessible
    process.stdout.write(`🔍 ${i + 1}/${videosWithIds.length}: Verifying ${youtubeId}... `)
    const isValid = await verifyYouTubeVideo(youtubeId)

    if (!isValid) {
      console.log(`❌ Invalid`)
      console.log(`   ${template.title}`)
      failed++
      continue
    }

    console.log(`✅ Valid`)

    // Add video to database
    try {
      await prisma.video.create({
        data: {
          youtubeId: youtubeId,
          title: template.title,
          channelName: 'GoPowerSports', // Default, can be updated later
          durationSeconds: 600 + (i * 60), // Placeholder duration, can be updated
          thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
          category: template.category,
          tags: template.tags ? JSON.parse(JSON.stringify(template.tags)) : null,
          engineIds: JSON.parse(JSON.stringify([engine.id])),
          upgradeIds: template.upgradeIds ? JSON.parse(JSON.stringify(template.upgradeIds)) : null,
          partIds: undefined,
          guideIds: undefined,
        },
      })
      console.log(`   ✅ Added: ${template.title}`)
      added++
    } catch (error) {
      console.log(`   ❌ Error adding video: ${error instanceof Error ? error.message : 'Unknown error'}`)
      failed++
    }

    // Small delay to avoid rate limiting
    if (i < videosWithIds.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }

  console.log(`\n\n📊 Results:`)
  console.log(`✅ Added: ${added} videos`)
  console.log(`⏭️  Skipped: ${skipped} videos (already exist)`)
  console.log(`❌ Failed: ${failed} videos (invalid or error)`)
  console.log(`\n💡 To add more videos, edit scripts/addEngineVideos.ts and add YouTube IDs`)
}

addEngineVideos()
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

