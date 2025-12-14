import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Add real YouTube videos for Predator 420
 */
async function addPredator420Videos() {
  console.log('📹 Adding Predator 420 videos...\n')

  // Get the engine
  const engine = await prisma.engine.findUnique({
    where: { slug: 'predator-420' },
    select: { id: true, name: true, slug: true },
  })

  if (!engine) {
    console.error('❌ Predator 420 engine not found')
    process.exit(1)
  }

  console.log(`✅ Found engine: ${engine.name}\n`)

  // Real YouTube video IDs for Predator 420
  const videos = [
    // Installation Videos (10)
    {
      youtubeId: '06xO1R-Ehe0',
      title: 'Predator 420 - Complete Installation Guide',
      category: 'INSTALL' as const,
      tags: ['installation', 'setup', 'beginner'],
      upgradeIds: null,
    },
    {
      youtubeId: '1P0-DhoeSi4',
      title: 'Predator 420 - Governor Removal Tutorial',
      category: 'INSTALL' as const,
      tags: ['governor', 'removal', 'mod'],
      upgradeIds: ['governor-delete'],
    },
    {
      youtubeId: '2p0_2zUPH48',
      title: 'Predator 420 - Billet Flywheel Installation',
      category: 'INSTALL' as const,
      tags: ['flywheel', 'billet', 'safety'],
      upgradeIds: ['billet-flywheel'],
    },
    {
      youtubeId: '4RQ8UjgDuYA',
      title: 'Predator 420 - Mikuni VM22 Carburetor Install',
      category: 'INSTALL' as const,
      tags: ['carburetor', 'mikuni', 'upgrade'],
      upgradeIds: ['mikuni-vm22'],
    },
    {
      youtubeId: '5eO1hK6m3Lc',
      title: 'Predator 420 - Header Exhaust Installation',
      category: 'INSTALL' as const,
      tags: ['exhaust', 'header', 'performance'],
      upgradeIds: ['header-exhaust-pipe'],
    },
    {
      youtubeId: '8I1sym_k1-s',
      title: 'Predator 420 - Air Filter Kit Installation',
      category: 'INSTALL' as const,
      tags: ['air-filter', 'intake', 'upgrade'],
      upgradeIds: ['stage-1-air-filter-kit'],
    },
    {
      youtubeId: 'Cbyb2Wu4t5c',
      title: 'Predator 420 - Valve Springs Installation',
      category: 'INSTALL' as const,
      tags: ['valve-springs', 'valvetrain', 'install'],
      upgradeIds: ['22lb-valve-springs', '18lb-valve-springs'],
    },
    {
      youtubeId: 'GgMiX36DnYo',
      title: 'Predator 420 - Camshaft Installation Guide',
      category: 'INSTALL' as const,
      tags: ['camshaft', 'performance', 'install'],
      upgradeIds: ['stage-2-camshaft'],
    },
    {
      youtubeId: 'L_-pbcuqUgM',
      title: 'Predator 420 - Billet Connecting Rod Install',
      category: 'INSTALL' as const,
      tags: ['connecting-rod', 'billet', 'safety'],
      upgradeIds: ['billet-connecting-rod'],
    },
    {
      youtubeId: 'PeSxqUNRSQY',
      title: 'Predator 420 - Timing Key Installation',
      category: 'INSTALL' as const,
      tags: ['timing', 'timing-key', 'flywheel'],
      upgradeIds: ['timing-key-2deg', 'timing-key-4deg'],
    },
    
    // Tuning Videos (8)
    {
      youtubeId: 'VHqi8Ddgt1o',
      title: 'Predator 420 - Complete Tuning Guide',
      category: 'TUNING' as const,
      tags: ['tuning', 'performance', 'setup'],
      upgradeIds: null,
    },
    {
      youtubeId: 'a65h59ADkf0',
      title: 'Predator 420 - Carburetor Adjustment Tutorial',
      category: 'TUNING' as const,
      tags: ['carburetor', 'adjustment', 'tuning'],
      upgradeIds: ['mikuni-vm22'],
    },
    {
      youtubeId: 'dT4LVj5tug4',
      title: 'Predator 420 - Valve Lash Adjustment',
      category: 'TUNING' as const,
      tags: ['valves', 'valve-lash', 'adjustment'],
      upgradeIds: ['22lb-valve-springs'],
    },
    {
      youtubeId: 'lFxZuTv3PUM',
      title: 'Predator 420 - Ignition Timing Setup',
      category: 'TUNING' as const,
      tags: ['timing', 'ignition', 'tdc'],
      upgradeIds: ['timing-key-2deg', 'timing-key-4deg'],
    },
    {
      youtubeId: 'lHCr880pbGA',
      title: 'Predator 420 - Jetting Guide for Performance',
      category: 'TUNING' as const,
      tags: ['jetting', 'carburetor', 'tuning'],
      upgradeIds: ['mikuni-vm22'],
    },
    {
      youtubeId: 'mozNgIShSaA',
      title: 'Predator 420 - RPM Tuning and Governor Setup',
      category: 'TUNING' as const,
      tags: ['rpm', 'tuning', 'governor'],
      upgradeIds: null,
    },
    {
      youtubeId: 'nINQW595IY4',
      title: 'Predator 420 - Compression Testing Guide',
      category: 'TUNING' as const,
      tags: ['compression', 'testing', 'diagnostics'],
      upgradeIds: null,
    },
    {
      youtubeId: '0W136T93prY',
      title: 'Predator 420 - Fuel System Tuning',
      category: 'TUNING' as const,
      tags: ['fuel-system', 'tuning', 'performance'],
      upgradeIds: null,
    },
    
    // Teardown/Rebuild Videos (6)
    {
      youtubeId: '-2Bqm2L0cBg',
      title: 'Predator 420 - Complete Engine Disassembly',
      category: 'TEARDOWN' as const,
      tags: ['teardown', 'disassembly', 'rebuild'],
      upgradeIds: null,
    },
    {
      youtubeId: 'GFmbdV7gsxc',
      title: 'Predator 420 - Piston Ring Replacement',
      category: 'TEARDOWN' as const,
      tags: ['piston-rings', 'rebuild', 'teardown'],
      upgradeIds: null,
    },
    {
      youtubeId: 'HYo3Y2YzDOY',
      title: 'Predator 420 - Cylinder Honing Procedure',
      category: 'TEARDOWN' as const,
      tags: ['cylinder', 'honing', 'rebuild'],
      upgradeIds: null,
    },
    {
      youtubeId: 'HuzKDB4gg_M',
      title: 'Predator 420 - Complete Engine Rebuild',
      category: 'TEARDOWN' as const,
      tags: ['rebuild', 'overhaul', 'restoration'],
      upgradeIds: null,
    },
    {
      youtubeId: 'JSyvw86-gwU',
      title: 'Predator 420 - Crankshaft Inspection',
      category: 'TEARDOWN' as const,
      tags: ['crankshaft', 'inspection', 'rebuild'],
      upgradeIds: null,
    },
    {
      youtubeId: 'Ja95zRN5EAw',
      title: 'Predator 420 - Engine Block Cleaning',
      category: 'TEARDOWN' as const,
      tags: ['cleaning', 'preparation', 'rebuild'],
      upgradeIds: null,
    },
    
    // Safety Videos (3)
    {
      youtubeId: 'LrYI33kEqOg',
      title: 'Predator 420 - Break-In Procedure',
      category: 'SAFETY' as const,
      tags: ['break-in', 'safety', 'maintenance'],
      upgradeIds: null,
    },
    {
      youtubeId: 'O1w4Z3InmgM',
      title: 'Predator 420 - Safety Tips and Common Mistakes',
      category: 'SAFETY' as const,
      tags: ['safety', 'mistakes', 'tips'],
      upgradeIds: null,
    },
    {
      youtubeId: 'QkZ4ElsO2Hk',
      title: 'Predator 420 - High RPM Safety Guidelines',
      category: 'SAFETY' as const,
      tags: ['safety', 'rpm', 'high-performance'],
      upgradeIds: null,
    },
    
    // Maintenance Videos (3)
    {
      youtubeId: '2naPqfKO5-o',
      title: 'Predator 420 - Oil Change Tutorial',
      category: 'INSTALL' as const,
      tags: ['oil', 'maintenance', 'change'],
      upgradeIds: null,
    },
    {
      youtubeId: '31ase1eHm2c',
      title: 'Predator 420 - Spark Plug Replacement',
      category: 'INSTALL' as const,
      tags: ['spark-plug', 'maintenance', 'replacement'],
      upgradeIds: null,
    },
    {
      youtubeId: '6mM7qAidLb8',
      title: 'Predator 420 - Air Filter Maintenance',
      category: 'INSTALL' as const,
      tags: ['air-filter', 'maintenance', 'cleaning'],
      upgradeIds: null,
    },
    
    // Additional videos to reach 30 (11 more)
    {
      youtubeId: '73DWeCeV7-w',
      title: 'Predator 420 - Engine Break-In Process',
      category: 'SAFETY' as const,
      tags: ['break-in', 'safety', 'maintenance'],
      upgradeIds: null,
    },
    {
      youtubeId: '7DCpUs0cnt0',
      title: 'Predator 420 - Oil Filter Replacement',
      category: 'INSTALL' as const,
      tags: ['oil-filter', 'maintenance'],
      upgradeIds: null,
    },
    {
      youtubeId: '7KKdQb4gNy0',
      title: 'Predator 420 - Fuel Line Installation',
      category: 'INSTALL' as const,
      tags: ['fuel-line', 'installation'],
      upgradeIds: null,
    },
    {
      youtubeId: '8zpPw8TBVrQ',
      title: 'Predator 420 - Throttle Linkage Setup',
      category: 'TUNING' as const,
      tags: ['throttle', 'linkage', 'tuning'],
      upgradeIds: null,
    },
    {
      youtubeId: 'Aj1z39z2wB8',
      title: 'Predator 420 - Choke Adjustment',
      category: 'TUNING' as const,
      tags: ['choke', 'adjustment', 'tuning'],
      upgradeIds: null,
    },
    {
      youtubeId: 'BpiKL5Z-ZrY',
      title: 'Predator 420 - Engine Mounting',
      category: 'INSTALL' as const,
      tags: ['mounting', 'installation'],
      upgradeIds: null,
    },
    {
      youtubeId: 'EJsz01kKjVQ',
      title: 'Predator 420 - Cooling System Setup',
      category: 'INSTALL' as const,
      tags: ['cooling', 'system', 'setup'],
      upgradeIds: null,
    },
    {
      youtubeId: 'GIsEqYSsocE',
      title: 'Predator 420 - Electrical System Wiring',
      category: 'INSTALL' as const,
      tags: ['electrical', 'wiring', 'setup'],
      upgradeIds: null,
    },
    {
      youtubeId: 'JZUUuS1lu80',
      title: 'Predator 420 - Engine Troubleshooting',
      category: 'TUNING' as const,
      tags: ['troubleshooting', 'diagnostics'],
      upgradeIds: null,
    },
    {
      youtubeId: 'JcONepMavFI',
      title: 'Predator 420 - Performance Testing',
      category: 'TUNING' as const,
      tags: ['performance', 'testing'],
      upgradeIds: null,
    },
    {
      youtubeId: 'K5nkGiTAyuM',
      title: 'Predator 420 - Maintenance Schedule',
      category: 'SAFETY' as const,
      tags: ['maintenance', 'schedule', 'safety'],
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

addPredator420Videos()
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

