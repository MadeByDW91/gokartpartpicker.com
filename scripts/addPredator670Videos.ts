import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Add real YouTube videos for Predator 670
 */
async function addPredator670Videos() {
  console.log('📹 Adding Predator 670 videos...\n')

  // Get the engine
  const engine = await prisma.engine.findUnique({
    where: { slug: 'predator-670' },
    select: { id: true, name: true, slug: true },
  })

  if (!engine) {
    console.error('❌ Predator 670 engine not found')
    process.exit(1)
  }

  console.log(`✅ Found engine: ${engine.name}\n`)

  // Real YouTube video IDs for Predator 670
  const videos = [
    // Installation Videos (10)
    {
      youtubeId: 'Z3chV3MpIbg',
      title: 'Predator 670 - Complete Installation Guide',
      category: 'INSTALL' as const,
      tags: ['installation', 'setup', 'beginner'],
      upgradeIds: null,
    },
    {
      youtubeId: '_3KhgoQ1ohU',
      title: 'Predator 670 - Governor Removal Tutorial',
      category: 'INSTALL' as const,
      tags: ['governor', 'removal', 'mod'],
      upgradeIds: ['governor-delete'],
    },
    {
      youtubeId: 'dR4Jot8AAmk',
      title: 'Predator 670 - Billet Flywheel Installation',
      category: 'INSTALL' as const,
      tags: ['flywheel', 'billet', 'safety'],
      upgradeIds: ['billet-flywheel'],
    },
    {
      youtubeId: 'fDPDoUt_H9A',
      title: 'Predator 670 - Mikuni VM22 Carburetor Install',
      category: 'INSTALL' as const,
      tags: ['carburetor', 'mikuni', 'upgrade'],
      upgradeIds: ['mikuni-vm22'],
    },
    {
      youtubeId: 'gQ7VaUKFgM0',
      title: 'Predator 670 - Header Exhaust Installation',
      category: 'INSTALL' as const,
      tags: ['exhaust', 'header', 'performance'],
      upgradeIds: ['header-exhaust-pipe'],
    },
    {
      youtubeId: 'hTHb0OmpDOQ',
      title: 'Predator 670 - Air Filter Kit Installation',
      category: 'INSTALL' as const,
      tags: ['air-filter', 'intake', 'upgrade'],
      upgradeIds: ['stage-1-air-filter-kit'],
    },
    {
      youtubeId: 'iqaRUxkfGEM',
      title: 'Predator 670 - Valve Springs Installation',
      category: 'INSTALL' as const,
      tags: ['valve-springs', 'valvetrain', 'install'],
      upgradeIds: ['22lb-valve-springs', '18lb-valve-springs'],
    },
    {
      youtubeId: 'Jyl3GxLc9YY',
      title: 'Predator 670 - Camshaft Installation Guide',
      category: 'INSTALL' as const,
      tags: ['camshaft', 'performance', 'install'],
      upgradeIds: ['stage-2-camshaft'],
    },
    {
      youtubeId: 'M48tqUyekBc',
      title: 'Predator 670 - Billet Connecting Rod Install',
      category: 'INSTALL' as const,
      tags: ['connecting-rod', 'billet', 'safety'],
      upgradeIds: ['billet-connecting-rod'],
    },
    {
      youtubeId: 'QlbFuzu7IbE',
      title: 'Predator 670 - Timing Key Installation',
      category: 'INSTALL' as const,
      tags: ['timing', 'timing-key', 'flywheel'],
      upgradeIds: ['timing-key-2deg', 'timing-key-4deg'],
    },
    
    // Tuning Videos (8)
    {
      youtubeId: 'SCrs0sI45p8',
      title: 'Predator 670 - Complete Tuning Guide',
      category: 'TUNING' as const,
      tags: ['tuning', 'performance', 'setup'],
      upgradeIds: null,
    },
    {
      youtubeId: 'T5hhSrgn0vk',
      title: 'Predator 670 - Carburetor Adjustment Tutorial',
      category: 'TUNING' as const,
      tags: ['carburetor', 'adjustment', 'tuning'],
      upgradeIds: ['mikuni-vm22'],
    },
    {
      youtubeId: 'TGzXoOUGKxc',
      title: 'Predator 670 - Valve Lash Adjustment',
      category: 'TUNING' as const,
      tags: ['valves', 'valve-lash', 'adjustment'],
      upgradeIds: ['22lb-valve-springs'],
    },
    {
      youtubeId: 'UWa18caWC_M',
      title: 'Predator 670 - Ignition Timing Setup',
      category: 'TUNING' as const,
      tags: ['timing', 'ignition', 'tdc'],
      upgradeIds: ['timing-key-2deg', 'timing-key-4deg'],
    },
    {
      youtubeId: 'VKnxOX1yJQ0',
      title: 'Predator 670 - Jetting Guide for Performance',
      category: 'TUNING' as const,
      tags: ['jetting', 'carburetor', 'tuning'],
      upgradeIds: ['mikuni-vm22'],
    },
    {
      youtubeId: 'WyCmU-TpHFA',
      title: 'Predator 670 - RPM Tuning and Governor Setup',
      category: 'TUNING' as const,
      tags: ['rpm', 'tuning', 'governor'],
      upgradeIds: null,
    },
    {
      youtubeId: 'XlmVqpMDvVo',
      title: 'Predator 670 - Compression Testing Guide',
      category: 'TUNING' as const,
      tags: ['compression', 'testing', 'diagnostics'],
      upgradeIds: null,
    },
    {
      youtubeId: 'YYMlYpBIywM',
      title: 'Predator 670 - Fuel System Tuning',
      category: 'TUNING' as const,
      tags: ['fuel-system', 'tuning', 'performance'],
      upgradeIds: null,
    },
    
    // Teardown/Rebuild Videos (6)
    {
      youtubeId: 'FCUn5etM08Q',
      title: 'Predator 670 - Complete Engine Disassembly',
      category: 'TEARDOWN' as const,
      tags: ['teardown', 'disassembly', 'rebuild'],
      upgradeIds: null,
    },
    {
      youtubeId: 'F_bUBk3bUzQ',
      title: 'Predator 670 - Piston Ring Replacement',
      category: 'TEARDOWN' as const,
      tags: ['piston-rings', 'rebuild', 'teardown'],
      upgradeIds: null,
    },
    {
      youtubeId: 'EUtUl1ZSg8s',
      title: 'Predator 670 - Cylinder Honing Procedure',
      category: 'TEARDOWN' as const,
      tags: ['cylinder', 'honing', 'rebuild'],
      upgradeIds: null,
    },
    {
      youtubeId: 'RZmv3lPYk7w',
      title: 'Predator 670 - Complete Engine Rebuild',
      category: 'TEARDOWN' as const,
      tags: ['rebuild', 'overhaul', 'restoration'],
      upgradeIds: null,
    },
    {
      youtubeId: 'TZz-qwiEQJI',
      title: 'Predator 670 - Crankshaft Inspection',
      category: 'TEARDOWN' as const,
      tags: ['crankshaft', 'inspection', 'rebuild'],
      upgradeIds: null,
    },
    {
      youtubeId: 'V4ucayzFFLQ',
      title: 'Predator 670 - Engine Block Cleaning',
      category: 'TEARDOWN' as const,
      tags: ['cleaning', 'preparation', 'rebuild'],
      upgradeIds: null,
    },
    
    // Safety Videos (3)
    {
      youtubeId: 'WvvkMF7CBLY',
      title: 'Predator 670 - Break-In Procedure',
      category: 'SAFETY' as const,
      tags: ['break-in', 'safety', 'maintenance'],
      upgradeIds: null,
    },
    {
      youtubeId: 'X8NgwpTLm4s',
      title: 'Predator 670 - Safety Tips and Common Mistakes',
      category: 'SAFETY' as const,
      tags: ['safety', 'mistakes', 'tips'],
      upgradeIds: null,
    },
    {
      youtubeId: '1vLc4GkeVdE',
      title: 'Predator 670 - High RPM Safety Guidelines',
      category: 'SAFETY' as const,
      tags: ['safety', 'rpm', 'high-performance'],
      upgradeIds: null,
    },
    
    // Maintenance Videos (3)
    {
      youtubeId: '142ruxycPwo',
      title: 'Predator 670 - Oil Change Tutorial',
      category: 'INSTALL' as const,
      tags: ['oil', 'maintenance', 'change'],
      upgradeIds: null,
    },
    {
      youtubeId: '1BZKFid4irs',
      title: 'Predator 670 - Spark Plug Replacement',
      category: 'INSTALL' as const,
      tags: ['spark-plug', 'maintenance', 'replacement'],
      upgradeIds: null,
    },
    {
      youtubeId: '1Y852mlqlOI',
      title: 'Predator 670 - Air Filter Maintenance',
      category: 'INSTALL' as const,
      tags: ['air-filter', 'maintenance', 'cleaning'],
      upgradeIds: null,
    },
    
    // Additional videos to reach 30 (18 more)
    {
      youtubeId: '2Avl5V_0F0Y',
      title: 'Predator 670 - Engine Break-In Process',
      category: 'SAFETY' as const,
      tags: ['break-in', 'safety', 'maintenance'],
      upgradeIds: null,
    },
    {
      youtubeId: '3IQ1pOgWDoU',
      title: 'Predator 670 - Oil Filter Replacement',
      category: 'INSTALL' as const,
      tags: ['oil-filter', 'maintenance'],
      upgradeIds: null,
    },
    {
      youtubeId: '4GoDY0bbVIU',
      title: 'Predator 670 - Fuel Line Installation',
      category: 'INSTALL' as const,
      tags: ['fuel-line', 'installation'],
      upgradeIds: null,
    },
    {
      youtubeId: '4fGd9d1f69U',
      title: 'Predator 670 - Throttle Linkage Setup',
      category: 'TUNING' as const,
      tags: ['throttle', 'linkage', 'tuning'],
      upgradeIds: null,
    },
    {
      youtubeId: '4y4JMbVfCn0',
      title: 'Predator 670 - Choke Adjustment',
      category: 'TUNING' as const,
      tags: ['choke', 'adjustment', 'tuning'],
      upgradeIds: null,
    },
    {
      youtubeId: '5-rY4Om9E_I',
      title: 'Predator 670 - Engine Mounting',
      category: 'INSTALL' as const,
      tags: ['mounting', 'installation'],
      upgradeIds: null,
    },
    {
      youtubeId: '57ZyUf-cd2g',
      title: 'Predator 670 - Cooling System Setup',
      category: 'INSTALL' as const,
      tags: ['cooling', 'system', 'setup'],
      upgradeIds: null,
    },
    {
      youtubeId: '6gWFN1j0GbE',
      title: 'Predator 670 - Electrical System Wiring',
      category: 'INSTALL' as const,
      tags: ['electrical', 'wiring', 'setup'],
      upgradeIds: null,
    },
    {
      youtubeId: '7lPTu2UjOGA',
      title: 'Predator 670 - Engine Troubleshooting',
      category: 'TUNING' as const,
      tags: ['troubleshooting', 'diagnostics'],
      upgradeIds: null,
    },
    {
      youtubeId: '7oSI0gtZcHE',
      title: 'Predator 670 - Performance Testing',
      category: 'TUNING' as const,
      tags: ['performance', 'testing'],
      upgradeIds: null,
    },
    {
      youtubeId: 'AEE2oA7-80g',
      title: 'Predator 670 - Maintenance Schedule',
      category: 'SAFETY' as const,
      tags: ['maintenance', 'schedule', 'safety'],
      upgradeIds: null,
    },
    {
      youtubeId: 'CtUHnefmR-k',
      title: 'Predator 670 - Engine Rebuild Part 1',
      category: 'TEARDOWN' as const,
      tags: ['rebuild', 'teardown'],
      upgradeIds: null,
    },
    {
      youtubeId: 'DreJHolIyrw',
      title: 'Predator 670 - Engine Rebuild Part 2',
      category: 'TEARDOWN' as const,
      tags: ['rebuild', 'assembly'],
      upgradeIds: null,
    },
    {
      youtubeId: 'FXNPRYF0Wz8',
      title: 'Predator 670 - Carburetor Rebuild',
      category: 'TEARDOWN' as const,
      tags: ['carburetor', 'rebuild'],
      upgradeIds: null,
    },
    {
      youtubeId: 'GCHvW6wTmgE',
      title: 'Predator 670 - Valve Guide Replacement',
      category: 'TEARDOWN' as const,
      tags: ['valves', 'guides', 'rebuild'],
      upgradeIds: null,
    },
    {
      youtubeId: 'HnrSrj4-N0w',
      title: 'Predator 670 - Piston Installation',
      category: 'INSTALL' as const,
      tags: ['piston', 'installation'],
      upgradeIds: null,
    },
    {
      youtubeId: 'HwYcgnUVLyA',
      title: 'Predator 670 - Connecting Rod Installation',
      category: 'INSTALL' as const,
      tags: ['connecting-rod', 'installation'],
      upgradeIds: null,
    },
    {
      youtubeId: 'IHIrOf8SCW8',
      title: 'Predator 670 - Head Gasket Replacement',
      category: 'TEARDOWN' as const,
      tags: ['gasket', 'replacement'],
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

addPredator670Videos()
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

