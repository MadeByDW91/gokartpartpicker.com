import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.buildTodoItem.deleteMany()
  await prisma.buildPart.deleteMany()
  await prisma.build.deleteMany()
  await prisma.todoTemplatePart.deleteMany()
  await prisma.todoTemplateStep.deleteMany()
  await prisma.todoTemplate.deleteMany()
  await prisma.guidePart.deleteMany()
  await prisma.guideEngine.deleteMany()
  await prisma.guideStep.deleteMany()
  await prisma.guide.deleteMany()
  await prisma.vendorOffer.deleteMany()
  await prisma.vendor.deleteMany()
  await prisma.partCompatibility.deleteMany()
  await prisma.part.deleteMany()
  await prisma.engine.deleteMany()
  await prisma.digitalDownloadToken.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.video.deleteMany()

  // Create Vendors
  const amazon = await prisma.vendor.create({
    data: {
      name: 'Amazon',
      priority: 0,
      websiteUrl: 'https://amazon.com',
    },
  })

  const gopowersports = await prisma.vendor.create({
    data: {
      name: 'GoPowerSports',
      priority: 1,
      websiteUrl: 'https://gopowersports.com',
    },
  })

  console.log('✅ Created vendors')

  // Create Engines with full specs
  const predator212Hemi = await prisma.engine.create({
    data: {
      name: 'Predator 212 Hemi',
      slug: 'predator-212-hemi',
      description: 'The Predator 212 Hemi is a popular 6.5 HP engine with a hemi-style combustion chamber for better performance.',
      manufacturer: 'Harbor Freight',
      displacementCc: 212,
      boreMm: 70.0,
      strokeMm: 55.0,
      compressionRatio: 8.5,
      baseHpMin: 6.5,
      baseHpMax: 6.5,
      stockHp: 6.5,
      stockRpm: 3600,
      stockRpmLimit: 3600,
      stockTimingDegBtdc: 22.0,
      oilCapacityOz: 20,
      oilType: 'SAE 10W-30',
      imageUrl: null,
    },
  })

  const predator212NonHemi = await prisma.engine.create({
    data: {
      name: 'Predator 212 Non-Hemi',
      slug: 'predator-212-non-hemi',
      description: 'The Predator 212 Non-Hemi is the standard 6.5 HP engine variant.',
      manufacturer: 'Harbor Freight',
      displacementCc: 212,
      boreMm: 70.0,
      strokeMm: 55.0,
      compressionRatio: 8.5,
      baseHpMin: 6.5,
      baseHpMax: 6.5,
      stockHp: 6.5,
      stockRpm: 3600,
      stockRpmLimit: 3600,
      stockTimingDegBtdc: 22.0,
      oilCapacityOz: 20,
      oilType: 'SAE 10W-30',
      imageUrl: null,
    },
  })

  const predator212Ghost = await prisma.engine.create({
    data: {
      name: 'Predator 212 Ghost',
      slug: 'predator-212-ghost',
      description: 'The Predator 212 Ghost is a high-performance variant with increased RPM capability.',
      manufacturer: 'Harbor Freight',
      displacementCc: 212,
      boreMm: 70.0,
      strokeMm: 55.0,
      compressionRatio: 8.5,
      baseHpMin: 6.5,
      baseHpMax: 7.0,
      stockHp: 6.75,
      stockRpm: 4000,
      stockRpmLimit: 4000,
      stockTimingDegBtdc: 23.0,
      oilCapacityOz: 20,
      oilType: 'SAE 10W-30',
      imageUrl: null,
    },
  })

  const predator420 = await prisma.engine.create({
    data: {
      name: 'Predator 420',
      slug: 'predator-420',
      description: 'The Predator 420 is a 13 HP engine with more displacement for higher torque.',
      baseHpMin: 13.0,
      baseHpMax: 13.0,
      stockRpm: 3600,
      imageUrl: null,
    },
  })

  const predator670 = await prisma.engine.create({
    data: {
      name: 'Predator 670',
      slug: 'predator-670',
      description: 'The Predator 670 is a 22 HP V-twin engine for larger karts.',
      baseHpMin: 22.0,
      baseHpMax: 22.0,
      stockRpm: 3600,
      imageUrl: null,
    },
  })

  console.log('✅ Created engines')

  // Create Parts
  const parts = [
    {
      name: 'Stage 1 Air Filter Kit',
      slug: 'stage-1-air-filter-kit',
      description: 'High-flow air filter with adapter plate for improved airflow.',
      category: 'intake',
      hpGainMin: 0.5,
      hpGainMax: 1.0,
      rpmLimitDelta: 0,
    },
    {
      name: 'Mikuni VM22 Carburetor',
      slug: 'mikuni-vm22-carburetor',
      description: 'Performance carburetor for increased fuel delivery.',
      category: 'intake',
      hpGainMin: 1.0,
      hpGainMax: 2.0,
      rpmLimitDelta: 0,
    },
    {
      name: 'Header Exhaust Pipe',
      slug: 'header-exhaust-pipe',
      description: 'Straight-through exhaust header for reduced backpressure.',
      category: 'exhaust',
      hpGainMin: 0.5,
      hpGainMax: 1.5,
      rpmLimitDelta: 0,
    },
    {
      name: 'Muffler Delete Kit',
      slug: 'muffler-delete-kit',
      description: 'Removes restrictive muffler for maximum flow.',
      category: 'exhaust',
      hpGainMin: 0.3,
      hpGainMax: 0.8,
      rpmLimitDelta: 0,
    },
    {
      name: '18lb Valve Springs',
      slug: '18lb-valve-springs',
      description: 'Upgraded valve springs for higher RPM operation.',
      category: 'springs',
      hpGainMin: 0,
      hpGainMax: 0,
      rpmLimitDelta: 200,
    },
    {
      name: '22lb Valve Springs',
      slug: '22lb-valve-springs',
      description: 'Heavy-duty valve springs for aggressive cams.',
      category: 'springs',
      hpGainMin: 0,
      hpGainMax: 0,
      rpmLimitDelta: 400,
    },
    {
      name: 'Stage 1 Camshaft',
      slug: 'stage-1-camshaft',
      description: 'Mild performance cam with increased lift and duration.',
      category: 'cam',
      hpGainMin: 1.5,
      hpGainMax: 2.5,
      rpmLimitDelta: 300,
    },
    {
      name: 'Stage 2 Camshaft',
      slug: 'stage-2-camshaft',
      description: 'Aggressive cam for high RPM builds.',
      category: 'cam',
      hpGainMin: 2.0,
      hpGainMax: 3.5,
      rpmLimitDelta: 600,
    },
    {
      name: 'Billet Flywheel',
      slug: 'billet-flywheel',
      description: 'Lightweight billet flywheel for higher RPM safety.',
      category: 'flywheel',
      hpGainMin: 0,
      hpGainMax: 0,
      rpmLimitDelta: 0, // Safety component, not performance
    },
    {
      name: 'Billet Connecting Rod',
      slug: 'billet-connecting-rod',
      description: 'Heavy-duty billet rod for high RPM reliability.',
      category: 'rod',
      hpGainMin: 0,
      hpGainMax: 0,
      rpmLimitDelta: 0, // Safety component
    },
    {
      name: 'Governor Delete Kit',
      slug: 'governor-delete-kit',
      description: 'Removes RPM limiter for unrestricted performance.',
      category: 'governor_delete',
      hpGainMin: 0,
      hpGainMax: 0,
      rpmLimitDelta: 0, // Removes limiter, doesn't add RPM capability
    },
    {
      name: 'Oil Sensor Delete',
      slug: 'oil-sensor-delete',
      description: 'Removes low-oil shutdown sensor.',
      category: 'oil_sensor_delete',
      hpGainMin: 0,
      hpGainMax: 0,
      rpmLimitDelta: 0,
    },
    {
      name: '30 Series Torque Converter',
      slug: '30-series-torque-converter',
      description: 'CVT transmission for automatic gearing.',
      category: 'torque_converter',
      hpGainMin: 0,
      hpGainMax: 0,
      rpmLimitDelta: 0,
    },
    // Timing Keys
    {
      name: '2° Advanced Timing Key',
      slug: 'timing-key-2deg',
      description: 'Mild timing advance for improved performance. Safe for most builds up to 5000 RPM.',
      category: 'ignition',
      hpGainMin: 0.3,
      hpGainMax: 0.8,
      rpmLimitDelta: 0,
    },
    {
      name: '4° Advanced Timing Key',
      description: 'Moderate timing advance for performance builds. Requires billet flywheel for safety.',
      slug: 'timing-key-4deg',
      category: 'ignition',
      hpGainMin: 0.5,
      hpGainMax: 1.2,
      rpmLimitDelta: 0,
    },
    {
      name: '6° Advanced Timing Key',
      description: 'Aggressive timing advance for race builds. Requires billet flywheel and billet rod for safety.',
      slug: 'timing-key-6deg',
      category: 'ignition',
      hpGainMin: 0.8,
      hpGainMax: 1.5,
      rpmLimitDelta: 0,
    },
  ]

  const createdParts = await Promise.all(
    parts.map(part => prisma.part.create({ data: part }))
  )

  console.log('✅ Created parts')

  // Create Part Compatibility (all parts compatible with 212 engines)
  const predator212Engines = [predator212Hemi.id, predator212NonHemi.id, predator212Ghost.id]
  
  for (const part of createdParts) {
    for (const engineId of predator212Engines) {
      await prisma.partCompatibility.create({
        data: {
          partId: part.id,
          engineId: engineId,
        },
      })
    }
  }

  console.log('✅ Created part compatibility')

  // Create Vendor Offers
  const offers = [
    // Stage 1 Air Filter Kit
    { part: createdParts[0], vendor: amazon, price: 24.99, shipping: 0, affiliateUrl: 'https://amazon.com/dp/STAGE1FILTER' },
    { part: createdParts[0], vendor: gopowersports, price: 22.99, shipping: 5.99, affiliateUrl: 'https://gopowersports.com/stage1-filter' },
    
    // Mikuni VM22
    { part: createdParts[1], vendor: amazon, price: 89.99, shipping: 0, affiliateUrl: 'https://amazon.com/dp/VM22' },
    { part: createdParts[1], vendor: gopowersports, price: 79.99, shipping: 8.99, affiliateUrl: 'https://gopowersports.com/vm22' },
    
    // Header Exhaust
    { part: createdParts[2], vendor: amazon, price: 34.99, shipping: 0, affiliateUrl: 'https://amazon.com/dp/HEADER' },
    { part: createdParts[2], vendor: gopowersports, price: 32.99, shipping: 6.99, affiliateUrl: 'https://gopowersports.com/header' },
    
    // Muffler Delete
    { part: createdParts[3], vendor: amazon, price: 19.99, shipping: 0, affiliateUrl: 'https://amazon.com/dp/MUFFLERDEL' },
    { part: createdParts[3], vendor: gopowersports, price: 18.99, shipping: 5.99, affiliateUrl: 'https://gopowersports.com/muffler-delete' },
    
    // 18lb Springs
    { part: createdParts[4], vendor: amazon, price: 29.99, shipping: 0, affiliateUrl: 'https://amazon.com/dp/18LBSPRINGS' },
    { part: createdParts[4], vendor: gopowersports, price: 27.99, shipping: 5.99, affiliateUrl: 'https://gopowersports.com/18lb-springs' },
    
    // 22lb Springs
    { part: createdParts[5], vendor: amazon, price: 34.99, shipping: 0, affiliateUrl: 'https://amazon.com/dp/22LBSPRINGS' },
    { part: createdParts[5], vendor: gopowersports, price: 32.99, shipping: 5.99, affiliateUrl: 'https://gopowersports.com/22lb-springs' },
    
    // Stage 1 Cam
    { part: createdParts[6], vendor: amazon, price: 49.99, shipping: 0, affiliateUrl: 'https://amazon.com/dp/STAGE1CAM' },
    { part: createdParts[6], vendor: gopowersports, price: 44.99, shipping: 6.99, affiliateUrl: 'https://gopowersports.com/stage1-cam' },
    
    // Stage 2 Cam
    { part: createdParts[7], vendor: amazon, price: 59.99, shipping: 0, affiliateUrl: 'https://amazon.com/dp/STAGE2CAM' },
    { part: createdParts[7], vendor: gopowersports, price: 54.99, shipping: 6.99, affiliateUrl: 'https://gopowersports.com/stage2-cam' },
    
    // Billet Flywheel
    { part: createdParts[8], vendor: amazon, price: 89.99, shipping: 0, affiliateUrl: 'https://amazon.com/dp/BILLETFLY' },
    { part: createdParts[8], vendor: gopowersports, price: 79.99, shipping: 8.99, affiliateUrl: 'https://gopowersports.com/billet-flywheel' },
    
    // Billet Rod
    { part: createdParts[9], vendor: amazon, price: 99.99, shipping: 0, affiliateUrl: 'https://amazon.com/dp/BILLETROD' },
    { part: createdParts[9], vendor: gopowersports, price: 89.99, shipping: 8.99, affiliateUrl: 'https://gopowersports.com/billet-rod' },
    
    // Governor Delete
    { part: createdParts[10], vendor: amazon, price: 14.99, shipping: 0, affiliateUrl: 'https://amazon.com/dp/GOVDEL' },
    { part: createdParts[10], vendor: gopowersports, price: 12.99, shipping: 4.99, affiliateUrl: 'https://gopowersports.com/governor-delete' },
    
    // Oil Sensor Delete
    { part: createdParts[11], vendor: amazon, price: 9.99, shipping: 0, affiliateUrl: 'https://amazon.com/dp/OILDEL' },
    { part: createdParts[11], vendor: gopowersports, price: 8.99, shipping: 4.99, affiliateUrl: 'https://gopowersports.com/oil-sensor-delete' },
    
    // Torque Converter
    { part: createdParts[12], vendor: amazon, price: 149.99, shipping: 0, affiliateUrl: 'https://amazon.com/dp/TORQCONV' },
    { part: createdParts[12], vendor: gopowersports, price: 139.99, shipping: 12.99, affiliateUrl: 'https://gopowersports.com/torque-converter' },
    
    // Timing Keys
    { part: createdParts[13], vendor: amazon, price: 8.99, shipping: 0, affiliateUrl: 'https://amazon.com/dp/TIMING2DEG' },
    { part: createdParts[13], vendor: gopowersports, price: 7.99, shipping: 4.99, affiliateUrl: 'https://gopowersports.com/timing-key-2deg' },
    
    { part: createdParts[14], vendor: amazon, price: 9.99, shipping: 0, affiliateUrl: 'https://amazon.com/dp/TIMING4DEG' },
    { part: createdParts[14], vendor: gopowersports, price: 8.99, shipping: 4.99, affiliateUrl: 'https://gopowersports.com/timing-key-4deg' },
    
    { part: createdParts[15], vendor: amazon, price: 10.99, shipping: 0, affiliateUrl: 'https://amazon.com/dp/TIMING6DEG' },
    { part: createdParts[15], vendor: gopowersports, price: 9.99, shipping: 4.99, affiliateUrl: 'https://gopowersports.com/timing-key-6deg' },
  ]

  await Promise.all(
    offers.map(offer =>
      prisma.vendorOffer.create({
        data: {
          partId: offer.part.id,
          vendorId: offer.vendor.id,
          priceUsd: offer.price,
          shippingUsd: offer.shipping,
          affiliateUrl: offer.affiliateUrl,
          inStock: true,
        },
      })
    )
  )

  console.log('✅ Created vendor offers')

  // Create Guides
  const governorRemovalGuide = await prisma.guide.create({
    data: {
      title: 'How to Remove the Governor on a Predator 212',
      slug: 'remove-governor-predator-212',
      description: 'Step-by-step guide to safely remove the RPM limiter from your Predator 212 engine.',
      difficulty: 'intermediate',
      estimatedTimeMinutes: 60,
      steps: {
        create: [
          {
            stepNumber: 1,
            title: 'Remove the Engine from the Kart',
            content: 'Disconnect all cables, fuel lines, and mounting bolts. Carefully lift the engine out and place it on a clean work surface.',
          },
          {
            stepNumber: 2,
            title: 'Remove the Side Cover',
            content: 'Remove the bolts holding the side cover. The governor assembly is located behind this cover.',
          },
          {
            stepNumber: 3,
            title: 'Locate the Governor Gear',
            content: 'The governor gear is a small gear connected to the crankshaft. It will be visible once the side cover is removed.',
          },
          {
            stepNumber: 4,
            title: 'Remove the Governor Gear',
            content: 'Carefully remove the governor gear. You may need to remove the connecting rod cap to access it fully.',
            warning: 'Be careful not to damage the crankshaft or connecting rod during removal.',
          },
          {
            stepNumber: 5,
            title: 'Remove Governor Linkage',
            content: 'Remove the external governor linkage that connects to the carburetor. This prevents the throttle from being limited.',
          },
          {
            stepNumber: 6,
            title: 'Reassemble the Engine',
            content: 'Reinstall the side cover and all components. Make sure all bolts are properly torqued.',
          },
          {
            stepNumber: 7,
            title: 'Install Governor Delete Kit (Optional)',
            content: 'For a cleaner installation, use a governor delete kit that includes a block-off plate and proper hardware.',
          },
        ],
      },
      engines: {
        create: [
          { engineId: predator212Hemi.id },
          { engineId: predator212NonHemi.id },
          { engineId: predator212Ghost.id },
        ],
      },
      parts: {
        create: [
          { partId: createdParts[10].id }, // Governor Delete Kit
        ],
      },
    },
  })

  const oilSensorDeleteGuide = await prisma.guide.create({
    data: {
      title: 'Oil Sensor Delete Installation',
      slug: 'oil-sensor-delete-installation',
      description: 'Remove the low-oil shutdown sensor to prevent engine shutdown during hard cornering.',
      difficulty: 'beginner',
      estimatedTimeMinutes: 15,
      steps: {
        create: [
          {
            stepNumber: 1,
            title: 'Locate the Oil Sensor',
            content: 'The oil sensor is located on the side of the engine block, near the oil fill port.',
          },
          {
            stepNumber: 2,
            title: 'Disconnect the Wire',
            content: 'Unplug the wire connector from the oil sensor.',
          },
          {
            stepNumber: 3,
            title: 'Remove the Sensor',
            content: 'Unscrew the oil sensor from the engine block. Be prepared for a small amount of oil to leak out.',
          },
          {
            stepNumber: 4,
            title: 'Install Block-Off Plug',
            content: 'Install the block-off plug from your delete kit. Use thread sealant to prevent leaks.',
          },
        ],
      },
      engines: {
        create: [
          { engineId: predator212Hemi.id },
          { engineId: predator212NonHemi.id },
          { engineId: predator212Ghost.id },
        ],
      },
      parts: {
        create: [
          { partId: createdParts[11].id }, // Oil Sensor Delete
        ],
      },
    },
  })

  const stage1BuildGuide = await prisma.guide.create({
    data: {
      title: 'Stage 1 Performance Build Guide',
      slug: 'stage-1-performance-build',
      description: 'Complete guide to building a Stage 1 performance engine with intake, exhaust, and governor removal.',
      difficulty: 'intermediate',
      estimatedTimeMinutes: 120,
      steps: {
        create: [
          {
            stepNumber: 1,
            title: 'Remove Governor',
            content: 'Follow the governor removal guide to remove the RPM limiter.',
          },
          {
            stepNumber: 2,
            title: 'Install Air Filter Kit',
            content: 'Remove the stock air filter and install the Stage 1 high-flow air filter with adapter plate.',
          },
          {
            stepNumber: 3,
            title: 'Install Header Exhaust',
            content: 'Remove the stock exhaust and install the performance header. Ensure proper clearance from the frame.',
          },
          {
            stepNumber: 4,
            title: 'Rejet the Carburetor',
            content: 'Install a larger main jet to accommodate the increased airflow. Typically a #90-95 jet works well.',
          },
          {
            stepNumber: 5,
            title: 'Break-In Period',
            content: 'Run the engine at varying RPMs for the first hour. Avoid sustained high RPM operation initially.',
          },
        ],
      },
      engines: {
        create: [
          { engineId: predator212Hemi.id },
          { engineId: predator212NonHemi.id },
        ],
      },
      parts: {
        create: [
          { partId: createdParts[0].id }, // Air Filter
          { partId: createdParts[2].id }, // Header
          { partId: createdParts[10].id }, // Governor Delete
        ],
      },
    },
  })

  const camInstallGuide = await prisma.guide.create({
    data: {
      title: 'Camshaft Installation Guide',
      slug: 'camshaft-installation',
      description: 'How to install a performance camshaft in your Predator 212 engine.',
      difficulty: 'advanced',
      estimatedTimeMinutes: 180,
      steps: {
        create: [
          {
            stepNumber: 1,
            title: 'Remove the Engine Head',
            content: 'Remove the head bolts and carefully lift off the cylinder head. Keep track of the head gasket.',
          },
          {
            stepNumber: 2,
            title: 'Remove Valve Springs',
            content: 'Use a valve spring compressor to remove the valve springs. Keep the valves from falling into the cylinder.',
          },
          {
            stepNumber: 3,
            title: 'Remove Stock Cam',
            content: 'Remove the camshaft retaining plate and carefully extract the stock camshaft.',
          },
          {
            stepNumber: 4,
            title: 'Install Performance Cam',
            content: 'Install the new camshaft, ensuring proper timing alignment with the crankshaft.',
            warning: 'Make sure the cam timing marks align correctly. Incorrect timing can cause engine damage.',
          },
          {
            stepNumber: 5,
            title: 'Install Upgraded Springs',
            content: 'Install upgraded valve springs (18lb or 22lb) to match the cam profile.',
          },
          {
            stepNumber: 6,
            title: 'Reinstall Head',
            content: 'Install a new head gasket and reinstall the cylinder head. Torque bolts in the correct sequence.',
          },
          {
            stepNumber: 7,
            title: 'Adjust Valve Lash',
            content: 'Set valve lash according to cam manufacturer specifications. Typically 0.003-0.005" for intake and exhaust.',
          },
        ],
      },
      engines: {
        create: [
          { engineId: predator212Hemi.id },
          { engineId: predator212NonHemi.id },
          { engineId: predator212Ghost.id },
        ],
      },
      parts: {
        create: [
          { partId: createdParts[6].id }, // Stage 1 Cam
          { partId: createdParts[7].id }, // Stage 2 Cam
          { partId: createdParts[4].id }, // 18lb Springs
          { partId: createdParts[5].id }, // 22lb Springs
        ],
      },
    },
  })

  const billetFlywheelGuide = await prisma.guide.create({
    data: {
      title: 'Billet Flywheel Installation',
      slug: 'billet-flywheel-installation',
      description: 'Critical safety upgrade for high-RPM builds. A billet flywheel prevents catastrophic failure.',
      difficulty: 'advanced',
      estimatedTimeMinutes: 90,
      steps: {
        create: [
          {
            stepNumber: 1,
            title: 'Remove the Stock Flywheel',
            content: 'Remove the flywheel nut and use a flywheel puller to remove the stock cast flywheel.',
            warning: 'NEVER use a hammer or pry bar on the flywheel. Always use a proper puller.',
          },
          {
            stepNumber: 2,
            title: 'Inspect the Crankshaft',
            content: 'Check the crankshaft keyway for damage. Replace the key if necessary.',
          },
          {
            stepNumber: 3,
            title: 'Install Billet Flywheel',
            content: 'Slide the billet flywheel onto the crankshaft, aligning the keyway. Install the flywheel nut.',
          },
          {
            stepNumber: 4,
            title: 'Torque the Flywheel Nut',
            content: 'Torque the flywheel nut to manufacturer specifications (typically 50-60 ft-lbs).',
            warning: 'Proper torque is critical for safety. An improperly torqued flywheel can come loose at high RPM.',
          },
          {
            stepNumber: 5,
            title: 'Install Coil and Timing',
            content: 'Reinstall the ignition coil and set the timing gap (typically 0.010-0.012").',
          },
        ],
      },
      engines: {
        create: [
          { engineId: predator212Hemi.id },
          { engineId: predator212NonHemi.id },
          { engineId: predator212Ghost.id },
        ],
      },
      parts: {
        create: [
          { partId: createdParts[8].id }, // Billet Flywheel
        ],
      },
    },
  })

  console.log('✅ Created guides')

  // Create Todo Templates
  const governorTodoTemplate = await prisma.todoTemplate.create({
    data: {
      title: 'Governor Removal Checklist',
      description: 'Required steps for removing the governor from your engine.',
      engineId: predator212Hemi.id,
      steps: {
        create: [
          {
            stepNumber: 1,
            title: 'Remove engine from kart',
            content: 'Disconnect all connections and remove mounting bolts.',
          },
          {
            stepNumber: 2,
            title: 'Remove side cover',
            content: 'Remove bolts and side cover to access governor assembly.',
          },
          {
            stepNumber: 3,
            title: 'Remove governor gear',
            content: 'Carefully remove the governor gear from the crankshaft.',
          },
          {
            stepNumber: 4,
            title: 'Remove governor linkage',
            content: 'Remove external linkage connected to carburetor.',
          },
          {
            stepNumber: 5,
            title: 'Install delete kit',
            content: 'Install block-off plate and reassemble engine.',
          },
        ],
      },
      parts: {
        create: [
          { partId: createdParts[10].id }, // Governor Delete Kit
        ],
      },
    },
  })

  const oilSensorTodoTemplate = await prisma.todoTemplate.create({
    data: {
      title: 'Oil Sensor Delete Checklist',
      description: 'Steps to remove the low-oil shutdown sensor.',
      engineId: predator212Hemi.id,
      steps: {
        create: [
          {
            stepNumber: 1,
            title: 'Locate oil sensor',
            content: 'Find the sensor on the engine block near the oil fill port.',
          },
          {
            stepNumber: 2,
            title: 'Disconnect wire',
            content: 'Unplug the wire connector.',
          },
          {
            stepNumber: 3,
            title: 'Remove sensor',
            content: 'Unscrew the sensor from the block.',
          },
          {
            stepNumber: 4,
            title: 'Install block-off plug',
            content: 'Install plug with thread sealant.',
          },
        ],
      },
      parts: {
        create: [
          { partId: createdParts[11].id }, // Oil Sensor Delete
        ],
      },
    },
  })

  console.log('✅ Created todo templates')

  // ===== Engine Pages v1 Data =====

  // Clear new models (if they exist)
  await prisma.upgradeTool.deleteMany().catch(() => {})
  await prisma.tool.deleteMany().catch(() => {})
  await prisma.engineUpgrade.deleteMany().catch(() => {})
  await prisma.upgrade.deleteMany().catch(() => {})
  await prisma.torqueSpec.deleteMany().catch(() => {})
  await prisma.engineSchematic.deleteMany().catch(() => {})

  // Create Torque Specs (same specs apply to all Predator 212 variants)
  const torqueSpecs212 = [
    { fastener: 'Head Bolts', spec: '17', unit: 'ft-lb', category: 'Top end', notes: 'Tighten in sequence' },
    { fastener: 'Rocker Arm Bolts', spec: '7', unit: 'ft-lb', category: 'Top end' },
    { fastener: 'Valve Cover Bolts', spec: '5', unit: 'ft-lb', category: 'Top end' },
    { fastener: 'Connecting Rod Bolts', spec: '12', unit: 'ft-lb', category: 'Bottom end', notes: 'Use new bolts' },
    { fastener: 'Flywheel Nut', spec: '50', unit: 'ft-lb', category: 'Bottom end', notes: 'Use thread locker' },
    { fastener: 'Crankcase Bolts', spec: '8', unit: 'ft-lb', category: 'Bottom end' },
    { fastener: 'Side Cover Bolts', spec: '6', unit: 'ft-lb', category: 'Bottom end' },
    { fastener: 'Oil Drain Plug', spec: '10', unit: 'ft-lb', category: 'Bottom end' },
  ]

  // Add torque specs to all Predator 212 variants
  const predator212EnginesForTorque = [predator212Hemi.id, predator212NonHemi.id, predator212Ghost.id]
  for (const engineId of predator212EnginesForTorque) {
    for (const spec of torqueSpecs212) {
      await prisma.torqueSpec.create({
        data: {
          engineId,
          ...spec,
        },
      })
    }
  }

  // Add torque specs for Predator 420
  const torqueSpecs420 = [
    { fastener: 'Head Bolts', spec: '22', unit: 'ft-lb', category: 'Top end', notes: 'Tighten in sequence' },
    { fastener: 'Rocker Arm Bolts', spec: '8', unit: 'ft-lb', category: 'Top end' },
    { fastener: 'Valve Cover Bolts', spec: '6', unit: 'ft-lb', category: 'Top end' },
    { fastener: 'Connecting Rod Bolts', spec: '15', unit: 'ft-lb', category: 'Bottom end', notes: 'Use new bolts' },
    { fastener: 'Flywheel Nut', spec: '55', unit: 'ft-lb', category: 'Bottom end', notes: 'Use thread locker' },
    { fastener: 'Crankcase Bolts', spec: '10', unit: 'ft-lb', category: 'Bottom end' },
    { fastener: 'Side Cover Bolts', spec: '7', unit: 'ft-lb', category: 'Bottom end' },
    { fastener: 'Oil Drain Plug', spec: '12', unit: 'ft-lb', category: 'Bottom end' },
  ]

  for (const spec of torqueSpecs420) {
    await prisma.torqueSpec.create({
      data: {
        engineId: predator420.id,
        ...spec,
      },
    })
  }

  // Add torque specs for Predator 670
  const torqueSpecs670 = [
    { fastener: 'Head Bolts', spec: '25', unit: 'ft-lb', category: 'Top end', notes: 'Tighten in sequence' },
    { fastener: 'Rocker Arm Bolts', spec: '10', unit: 'ft-lb', category: 'Top end' },
    { fastener: 'Valve Cover Bolts', spec: '7', unit: 'ft-lb', category: 'Top end' },
    { fastener: 'Connecting Rod Bolts', spec: '18', unit: 'ft-lb', category: 'Bottom end', notes: 'Use new bolts' },
    { fastener: 'Flywheel Nut', spec: '60', unit: 'ft-lb', category: 'Bottom end', notes: 'Use thread locker' },
    { fastener: 'Crankcase Bolts', spec: '12', unit: 'ft-lb', category: 'Bottom end' },
    { fastener: 'Side Cover Bolts', spec: '8', unit: 'ft-lb', category: 'Bottom end' },
    { fastener: 'Oil Drain Plug', spec: '15', unit: 'ft-lb', category: 'Bottom end' },
  ]

  for (const spec of torqueSpecs670) {
    await prisma.torqueSpec.create({
      data: {
        engineId: predator670.id,
        ...spec,
      },
    })
  }

  // Create Schematics
  await prisma.engineSchematic.create({
    data: {
      engineId: predator212Hemi.id,
      title: 'Predator 212 Hemi Exploded View',
      imageUrl: '/images/schematics/predator-212-hemi-exploded.png',
      notes: 'Complete parts breakdown for Predator 212 Hemi engine',
    },
  })

  await prisma.engineSchematic.create({
    data: {
      engineId: predator212NonHemi.id,
      title: 'Predator 212 Non-Hemi Exploded View',
      imageUrl: '/images/schematics/predator-212-non-hemi-exploded.png',
      notes: 'Complete parts breakdown for Predator 212 Non-Hemi engine',
    },
  })

  console.log('✅ Created torque specs and schematics')

  // Create Upgrades
  const upgrades = [
    {
      slug: 'stage-1-air-filter',
      name: 'Stage 1 Air Filter Kit',
      category: 'intake',
      description: 'High-flow air filter with adapter plate',
      hpGainMin: 0.5,
      hpGainMax: 1.0,
      rpmDelta: 0,
      riskLevel: 'LOW' as const,
      requires: null,
      conflicts: null,
    },
    {
      slug: 'mikuni-vm22',
      name: 'Mikuni VM22 Carburetor',
      category: 'intake',
      description: 'Performance carburetor for increased airflow',
      hpGainMin: 1.5,
      hpGainMax: 2.5,
      rpmDelta: 0,
      riskLevel: 'MED' as const,
      requires: null,
      conflicts: null,
    },
    {
      slug: 'header-exhaust',
      name: 'Header Exhaust',
      category: 'exhaust',
      description: 'Performance exhaust header',
      hpGainMin: 0.5,
      hpGainMax: 1.0,
      rpmDelta: 0,
      riskLevel: 'LOW' as const,
      requires: null,
      conflicts: null,
    },
    {
      slug: '18lb-valve-springs',
      name: '18lb Valve Springs',
      category: 'valvetrain',
      description: 'Heavy-duty valve springs for higher RPM',
      hpGainMin: 0,
      hpGainMax: 0,
      rpmDelta: 500,
      riskLevel: 'LOW' as const,
      requires: null,
      conflicts: ['22lb-valve-springs'],
    },
    {
      slug: '22lb-valve-springs',
      name: '22lb Valve Springs',
      category: 'valvetrain',
      description: 'Extra heavy-duty valve springs for very high RPM',
      hpGainMin: 0,
      hpGainMax: 0,
      rpmDelta: 1000,
      riskLevel: 'MED' as const,
      requires: null,
      conflicts: ['18lb-valve-springs'],
    },
    {
      slug: 'billet-rod',
      name: 'Billet Connecting Rod',
      category: 'bottom-end',
      description: 'Stronger connecting rod for high RPM',
      hpGainMin: 0,
      hpGainMax: 0,
      rpmDelta: 0,
      riskLevel: 'LOW' as const,
      requires: null,
      conflicts: null,
      notes: 'Required for RPM above 5500',
    },
    {
      slug: 'billet-flywheel',
      name: 'Billet Flywheel',
      category: 'bottom-end',
      description: 'Safety flywheel for high RPM',
      hpGainMin: 0,
      hpGainMax: 0,
      rpmDelta: 0,
      riskLevel: 'LOW' as const,
      requires: null,
      conflicts: null,
      notes: 'Required for RPM above 5500',
    },
    {
      slug: 'governor-delete',
      name: 'Governor Delete',
      category: 'bottom-end',
      description: 'Remove governor for unlimited RPM',
      hpGainMin: 0,
      hpGainMax: 0,
      rpmDelta: 0,
      riskLevel: 'HIGH' as const,
      requires: ['billet-rod', 'billet-flywheel'],
      conflicts: null,
      notes: 'DANGER: Only with proper safety mods',
    },
    {
      slug: 'stage-2-cam',
      name: 'Stage 2 Camshaft',
      category: 'valvetrain',
      description: 'Performance camshaft for more lift and duration',
      hpGainMin: 2.0,
      hpGainMax: 3.5,
      rpmDelta: 500,
      riskLevel: 'MED' as const,
      requires: ['22lb-valve-springs'],
      conflicts: null,
    },
    {
      slug: 'high-compression-head',
      name: 'High Compression Head',
      category: 'top-end',
      description: 'Modified head with higher compression',
      hpGainMin: 1.5,
      hpGainMax: 2.5,
      rpmDelta: 0,
      riskLevel: 'MED' as const,
      requires: null,
      conflicts: null,
    },
  ]

  const createdUpgrades = []
  for (const upgrade of upgrades) {
    const created = await prisma.upgrade.create({
      data: {
        ...upgrade,
        requires: upgrade.requires ? JSON.stringify(upgrade.requires) : undefined,
        conflicts: upgrade.conflicts ? JSON.stringify(upgrade.conflicts) : undefined,
      },
    })
    createdUpgrades.push(created)
  }

  // Link upgrades to engines (all upgrades work with Predator 212 variants)
  const predator212EngineIds = [predator212Hemi.id, predator212NonHemi.id, predator212Ghost.id]
  for (const engineId of predator212EngineIds) {
    for (const upgrade of createdUpgrades) {
      await prisma.engineUpgrade.create({
        data: {
          engineId,
          upgradeId: upgrade.id,
        },
      })
    }
  }

  console.log('✅ Created upgrades and engine-upgrade links')

  // Create Tools
  const tools = [
    {
      slug: 'torque-wrench',
      name: 'Torque Wrench (10-150 ft-lb)',
      description: 'Essential for proper bolt tightening',
      affiliateUrl: 'https://amazon.com/dp/B001A0YV7W',
      vendor: 'Amazon',
      priceHint: '$25-50',
    },
    {
      slug: 'feeler-gauge',
      name: 'Feeler Gauge Set',
      description: 'For setting valve clearance',
      affiliateUrl: 'https://amazon.com/dp/B000NPPATS',
      vendor: 'Amazon',
      priceHint: '$8-15',
    },
    {
      slug: 'valve-spring-compressor',
      name: 'Valve Spring Compressor',
      description: 'For removing/installing valve springs',
      affiliateUrl: 'https://amazon.com/dp/B0002SRCQ8',
      vendor: 'Amazon',
      priceHint: '$15-30',
    },
    {
      slug: 'piston-ring-compressor',
      name: 'Piston Ring Compressor',
      description: 'For installing pistons',
      affiliateUrl: 'https://amazon.com/dp/B0002SRCQ9',
      vendor: 'Amazon',
      priceHint: '$10-20',
    },
    {
      slug: 'flywheel-puller',
      name: 'Flywheel Puller',
      description: 'For removing flywheel',
      affiliateUrl: 'https://amazon.com/dp/B001A0YV7X',
      vendor: 'Amazon',
      priceHint: '$15-25',
    },
    {
      slug: 'gasket-set',
      name: 'Engine Gasket Set',
      description: 'Complete gasket set for rebuild',
      affiliateUrl: 'https://amazon.com/dp/B001A0YV7Y',
      vendor: 'Amazon',
      priceHint: '$15-25',
    },
    {
      slug: 'carburetor-jet-kit',
      name: 'Carburetor Jet Kit',
      description: 'Various jet sizes for tuning',
      affiliateUrl: 'https://amazon.com/dp/B001A0YV7Z',
      vendor: 'Amazon',
      priceHint: '$10-20',
    },
    {
      slug: 'compression-tester',
      name: 'Compression Tester',
      description: 'For checking engine compression',
      affiliateUrl: 'https://amazon.com/dp/B001A0YV80',
      vendor: 'Amazon',
      priceHint: '$20-40',
    },
  ]

  const createdTools = []
  for (const tool of tools) {
    const created = await prisma.tool.create({
      data: tool,
    })
    createdTools.push(created)
  }

  // Link tools to upgrades
  const toolMap: Record<string, string[]> = {
    'stage-1-air-filter': ['torque-wrench'],
    'mikuni-vm22': ['torque-wrench', 'carburetor-jet-kit'],
    'header-exhaust': ['torque-wrench'],
    '18lb-valve-springs': ['valve-spring-compressor', 'feeler-gauge'],
    '22lb-valve-springs': ['valve-spring-compressor', 'feeler-gauge'],
    'billet-rod': ['piston-ring-compressor', 'gasket-set'],
    'billet-flywheel': ['flywheel-puller', 'torque-wrench'],
    'governor-delete': ['flywheel-puller', 'torque-wrench', 'gasket-set'],
    'stage-2-cam': ['valve-spring-compressor', 'feeler-gauge'],
    'high-compression-head': ['torque-wrench', 'compression-tester', 'gasket-set'],
  }

  for (const upgrade of createdUpgrades) {
    const requiredTools = toolMap[upgrade.slug] || []
    for (const toolSlug of requiredTools) {
      const tool = createdTools.find((t) => t.slug === toolSlug)
      if (tool) {
        await prisma.upgradeTool.create({
          data: {
            upgradeId: upgrade.id,
            toolId: tool.id,
            isRequired: true,
          },
        })
      }
    }
  }

  console.log('✅ Created tools and upgrade-tool links')

  // Seed Store Products
  console.log('🌱 Seeding store products...')
  await prisma.product.deleteMany().catch(() => {})

  // Product 1: Digital PDF
  const product1 = await prisma.product.create({
    data: {
      slug: 'predator-212-stage-1-checklist',
      name: 'Predator 212 Stage 1 Checklist (PDF)',
      description:
        'A comprehensive PDF checklist for performing a Stage 1 upgrade on your Predator 212 engine. Includes step-by-step instructions, torque specs, and safety warnings.',
      type: 'DIGITAL',
      priceCents: 999, // $9.99
      currency: 'USD',
      images: ['/images/products/predator-212-checklist.png'],
      isActive: true,
      digitalAssetPath: 'assets/sample/predator-212-stage-1-checklist.pdf',
    },
  })

  // Product 2: Digital STL Pack
  const product2 = await prisma.product.create({
    data: {
      slug: 'tool-tray-stl-pack',
      name: 'Go-Kart Tool Tray STL Pack (Download)',
      description:
        '3D printable STL files for a custom tool tray designed to fit in your go-kart. Includes multiple sizes and mounting options. Perfect for organizing your tools on the track.',
      type: 'DIGITAL',
      priceCents: 1499, // $14.99
      currency: 'USD',
      images: ['/images/products/tool-tray-stl.png'],
      isActive: true,
      digitalAssetPath: 'assets/sample/tool-tray-stl-pack.zip',
    },
  })

  // Product 3: Physical 3D Printed Item
  const product3 = await prisma.product.create({
    data: {
      slug: 'carb-jet-organizer',
      name: '3D Printed Carb Jet Organizer',
      description:
        'A precision 3D printed organizer for Mikuni VM22 carburetor jets. Keeps your jets organized and labeled. Made-to-order with high-quality PLA material. Perfect for tuners who work with multiple jet sizes.',
      type: 'PHYSICAL',
      priceCents: 2499, // $24.99
      currency: 'USD',
      images: ['/images/products/carb-jet-organizer.png'],
      isActive: true,
      weightOz: 2,
    },
  })

  console.log('✅ Created store products')

  // Seed Videos - 30 videos per engine
  console.log('🌱 Seeding videos...')
  
  // Get engine IDs for video linking
  const predator212HemiId = predator212Hemi.id
  const predator212NonHemiId = predator212NonHemi.id
  const predator212GhostId = predator212Ghost.id
  const predator420Id = predator420.id
  const predator670Id = predator670.id
  
  // Clear existing videos first
  await prisma.video.deleteMany()
  
  // Global counter for unique video IDs
  let videoIdCounter = 0
  
  // Helper function to generate videos for a specific engine
  const generateEngineVideos = (
    engineId: string,
    engineName: string,
    engineSlug: string
  ) => {
    const videos: any[] = []
    
    // Generate 30 unique video IDs (in production, these should be real YouTube IDs)
    const generateVideoId = () => {
      // Create a unique ID using a simple counter
      // NOTE: These are PLACEHOLDERS - replace with real YouTube video IDs
      // Format: 11 characters (YouTube video ID format)
      const counter = videoIdCounter++
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
      let id = ''
      // Simple sequential ID generation
      let num = counter
      for (let i = 0; i < 11; i++) {
        id += chars[num % chars.length]
        num = Math.floor(num / chars.length)
      }
      return id
    }
    
    const videoTemplates = [
      // Installation Videos (10)
      { title: `${engineName} - Complete Installation Guide`, category: 'INSTALL' as const, tags: ['installation', 'setup', 'beginner'], upgradeIds: null },
      { title: `${engineName} - Governor Removal Tutorial`, category: 'INSTALL' as const, tags: ['governor', 'removal', 'mod'], upgradeIds: ['governor-delete'] },
      { title: `${engineName} - Billet Flywheel Installation`, category: 'INSTALL' as const, tags: ['flywheel', 'billet', 'safety'], upgradeIds: ['billet-flywheel'] },
      { title: `${engineName} - Mikuni VM22 Carburetor Install`, category: 'INSTALL' as const, tags: ['carburetor', 'mikuni', 'upgrade'], upgradeIds: ['mikuni-vm22'] },
      { title: `${engineName} - Header Exhaust Installation`, category: 'INSTALL' as const, tags: ['exhaust', 'header', 'performance'], upgradeIds: ['header-exhaust-pipe'] },
      { title: `${engineName} - Air Filter Kit Installation`, category: 'INSTALL' as const, tags: ['air-filter', 'intake', 'upgrade'], upgradeIds: ['stage-1-air-filter-kit'] },
      { title: `${engineName} - Valve Springs Installation`, category: 'INSTALL' as const, tags: ['valve-springs', 'valvetrain', 'install'], upgradeIds: ['22lb-valve-springs', '18lb-valve-springs'] },
      { title: `${engineName} - Camshaft Installation Guide`, category: 'INSTALL' as const, tags: ['camshaft', 'performance', 'install'], upgradeIds: ['stage-2-camshaft'] },
      { title: `${engineName} - Billet Connecting Rod Install`, category: 'INSTALL' as const, tags: ['connecting-rod', 'billet', 'safety'], upgradeIds: ['billet-connecting-rod'] },
      { title: `${engineName} - Timing Key Installation`, category: 'INSTALL' as const, tags: ['timing', 'timing-key', 'flywheel'], upgradeIds: ['timing-key-2deg', 'timing-key-4deg'] },
      
      // Tuning Videos (8)
      { title: `${engineName} - Complete Tuning Guide`, category: 'TUNING' as const, tags: ['tuning', 'performance', 'setup'], upgradeIds: null },
      { title: `${engineName} - Carburetor Adjustment Tutorial`, category: 'TUNING' as const, tags: ['carburetor', 'adjustment', 'tuning'], upgradeIds: ['mikuni-vm22'] },
      { title: `${engineName} - Valve Lash Adjustment`, category: 'TUNING' as const, tags: ['valves', 'valve-lash', 'adjustment'], upgradeIds: ['22lb-valve-springs'] },
      { title: `${engineName} - Ignition Timing Setup`, category: 'TUNING' as const, tags: ['timing', 'ignition', 'tdc'], upgradeIds: ['timing-key-2deg', 'timing-key-4deg'] },
      { title: `${engineName} - Jetting Guide for Performance`, category: 'TUNING' as const, tags: ['jetting', 'carburetor', 'tuning'], upgradeIds: ['mikuni-vm22'] },
      { title: `${engineName} - RPM Tuning and Governor Setup`, category: 'TUNING' as const, tags: ['rpm', 'tuning', 'governor'], upgradeIds: null },
      { title: `${engineName} - Compression Testing Guide`, category: 'TUNING' as const, tags: ['compression', 'testing', 'diagnostics'], upgradeIds: null },
      { title: `${engineName} - Fuel System Tuning`, category: 'TUNING' as const, tags: ['fuel-system', 'tuning', 'performance'], upgradeIds: null },
      
      // Teardown/Rebuild Videos (6)
      { title: `${engineName} - Complete Engine Disassembly`, category: 'TEARDOWN' as const, tags: ['teardown', 'disassembly', 'rebuild'], upgradeIds: null },
      { title: `${engineName} - Piston Ring Replacement`, category: 'TEARDOWN' as const, tags: ['piston-rings', 'rebuild', 'teardown'], upgradeIds: null },
      { title: `${engineName} - Cylinder Honing Procedure`, category: 'TEARDOWN' as const, tags: ['cylinder', 'honing', 'rebuild'], upgradeIds: null },
      { title: `${engineName} - Complete Engine Rebuild`, category: 'TEARDOWN' as const, tags: ['rebuild', 'overhaul', 'restoration'], upgradeIds: null },
      { title: `${engineName} - Crankshaft Inspection`, category: 'TEARDOWN' as const, tags: ['crankshaft', 'inspection', 'rebuild'], upgradeIds: null },
      { title: `${engineName} - Engine Block Cleaning`, category: 'TEARDOWN' as const, tags: ['cleaning', 'preparation', 'rebuild'], upgradeIds: null },
      
      // Safety Videos (3)
      { title: `${engineName} - Break-In Procedure`, category: 'SAFETY' as const, tags: ['break-in', 'safety', 'maintenance'], upgradeIds: null },
      { title: `${engineName} - Safety Tips and Common Mistakes`, category: 'SAFETY' as const, tags: ['safety', 'mistakes', 'tips'], upgradeIds: null },
      { title: `${engineName} - High RPM Safety Guidelines`, category: 'SAFETY' as const, tags: ['safety', 'rpm', 'high-performance'], upgradeIds: null },
      
      // Maintenance Videos (3)
      { title: `${engineName} - Oil Change Tutorial`, category: 'INSTALL' as const, tags: ['oil', 'maintenance', 'change'], upgradeIds: null },
      { title: `${engineName} - Spark Plug Replacement`, category: 'INSTALL' as const, tags: ['spark-plug', 'maintenance', 'replacement'], upgradeIds: null },
      { title: `${engineName} - Air Filter Maintenance`, category: 'INSTALL' as const, tags: ['air-filter', 'maintenance', 'cleaning'], upgradeIds: null },
    ]
    
    videoTemplates.forEach((template, index) => {
      const videoId = generateVideoId() // Generate unique ID
      videos.push({
        youtubeId: videoId, // PLACEHOLDER - replace with real YouTube ID
        title: template.title,
        channelName: 'GoPowerSports',
        durationSeconds: 600 + (index * 60), // Varies from 10-40 minutes
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        category: template.category,
        tags: template.tags,
        engineIds: [engineId],
        upgradeIds: template.upgradeIds,
        partIds: null,
        guideIds: null,
      })
    })
    
    return videos
  }
  
  // IMPORTANT: Videos are NOT automatically generated anymore
  // All placeholder videos have been removed to prevent showing invalid content
  // 
  // To add real videos:
  // 1. Use the script: npx tsx scripts/addRealVideos.ts
  // 2. Or use the API: POST /api/videos/verify/all to verify existing videos
  // 3. Or manually add videos through Prisma Studio or the database
  //
  // Video format:
  // - youtubeId: Real 11-character YouTube video ID
  // - title: Video title
  // - channelName: Channel name
  // - durationSeconds: Video duration in seconds
  // - category: INSTALL | TUNING | TEARDOWN | SAFETY
  // - tags: Array of tag strings
  // - engineIds: Array of engine IDs this video relates to
  // - upgradeIds: Array of upgrade slugs this video relates to
  
  console.log('📹 Video seeding skipped - use scripts/addRealVideos.ts to add real videos')
  console.log('   All placeholder videos have been removed from the database')
  
  // DISABLED: Placeholder video generation
  // const videos = [
  //   ...generateEngineVideos(predator212HemiId, 'Predator 212 Hemi', 'predator-212-hemi'),
  //   ...generateEngineVideos(predator212NonHemiId, 'Predator 212 Non-Hemi', 'predator-212-non-hemi'),
  //   ...generateEngineVideos(predator212GhostId, 'Predator 212 Ghost', 'predator-212-ghost'),
  //   ...generateEngineVideos(predator420Id, 'Predator 420', 'predator-420'),
  //   ...generateEngineVideos(predator670Id, 'Predator 670', 'predator-670'),
  // ]

  // Seed Axle Parts
  console.log('🌱 Seeding axle parts...')

  // Clear existing axle parts
  await prisma.axleCompatibilityRule.deleteMany()
  await prisma.axlePart.deleteMany()

  // Create axle parts for 1" live axle
  const axleParts = [
    // Bearings
    {
      slug: 'pillow-block-bearing-1in',
      name: '1" Pillow Block Bearing',
      description: 'Pillow block bearing with 1" bore, perfect for live axles. Includes mounting bracket.',
      category: 'BEARING' as const,
      specs: {
        boreDiameter: 1,
        keywayWidth: 0.25,
        mountingStyle: 'Pillow Block',
      },
      affiliateUrl: 'https://example.com/pillow-block-1in',
      compatibilityRules: [
        {
          axleType: 'LIVE' as const,
          minAxleDiameter: 0.99,
          maxAxleDiameter: 1.01,
          keywayWidth: 0.25,
          status: 'FITS' as const,
          notes: null,
        },
      ],
    },
    {
      slug: 'flanged-bearing-1in',
      name: '1" Flanged Bearing',
      description: 'Flanged bearing with 1" bore. Mounts directly to frame with flange.',
      category: 'BEARING' as const,
      specs: {
        boreDiameter: 1,
        keywayWidth: 0.25,
        mountingStyle: 'Flanged',
      },
      affiliateUrl: 'https://example.com/flanged-bearing-1in',
      compatibilityRules: [
        {
          axleType: 'LIVE' as const,
          minAxleDiameter: 0.99,
          maxAxleDiameter: 1.01,
          keywayWidth: 0.25,
          status: 'FITS' as const,
          notes: null,
        },
      ],
    },
    {
      slug: 'pillow-block-bearing-075in',
      name: '3/4" Pillow Block Bearing',
      description: 'Pillow block bearing with 3/4" bore. Not compatible with 1" axle.',
      category: 'BEARING' as const,
      specs: {
        boreDiameter: 0.75,
        keywayWidth: 0.1875,
        mountingStyle: 'Pillow Block',
      },
      affiliateUrl: null,
      compatibilityRules: [
        {
          axleType: 'LIVE' as const,
          minAxleDiameter: 0.74,
          maxAxleDiameter: 0.76,
          keywayWidth: 0.1875,
          status: 'NOT_COMPATIBLE' as const,
          notes: 'Bore diameter (3/4") does not match 1" axle. Requires different axle or bushing.',
        },
      ],
    },
    // Sprockets
    {
      slug: 'sprocket-1in-35-chain',
      name: '1" Bore #35 Chain Sprocket',
      description: 'Steel sprocket with 1" bore and #35 chain compatibility. 10 tooth.',
      category: 'SPROCKET' as const,
      specs: {
        boreDiameter: 1,
        keywayWidth: 0.25,
        chainSize: '#35',
        toothCount: 10,
      },
      affiliateUrl: 'https://example.com/sprocket-1in-35',
      compatibilityRules: [
        {
          axleType: 'LIVE' as const,
          minAxleDiameter: 0.99,
          maxAxleDiameter: 1.01,
          keywayWidth: 0.25,
          status: 'FITS' as const,
          notes: null,
        },
      ],
    },
    {
      slug: 'sprocket-1in-41-chain',
      name: '1" Bore #41 Chain Sprocket',
      description: 'Steel sprocket with 1" bore and #41 chain compatibility. 12 tooth.',
      category: 'SPROCKET' as const,
      specs: {
        boreDiameter: 1,
        keywayWidth: 0.25,
        chainSize: '#41',
        toothCount: 12,
      },
      affiliateUrl: 'https://example.com/sprocket-1in-41',
      compatibilityRules: [
        {
          axleType: 'LIVE' as const,
          minAxleDiameter: 0.99,
          maxAxleDiameter: 1.01,
          keywayWidth: 0.25,
          status: 'FITS' as const,
          notes: null,
        },
      ],
    },
    {
      slug: 'sprocket-1in-35-chain-close',
      name: '1.05" Bore #35 Chain Sprocket',
      description: 'Sprocket with slightly larger bore. May require shimming for 1" axle.',
      category: 'SPROCKET' as const,
      specs: {
        boreDiameter: 1.05,
        keywayWidth: 0.25,
        chainSize: '#35',
        toothCount: 10,
      },
      affiliateUrl: 'https://example.com/sprocket-105in-35',
      compatibilityRules: [
        {
          axleType: 'LIVE' as const,
          minAxleDiameter: 1.04,
          maxAxleDiameter: 1.06,
          keywayWidth: 0.25,
          status: 'FITS_WITH_NOTES' as const,
          notes: 'Bore is slightly larger (1.05" vs 1"). May require shimming or bushing for proper fit.',
        },
      ],
    },
    // Hubs
    {
      slug: 'wheel-hub-1in',
      name: '1" Wheel Hub',
      description: 'Wheel hub with 1" bore. Compatible with 4-bolt wheel pattern.',
      category: 'HUB' as const,
      specs: {
        boreDiameter: 1,
        keywayWidth: 0.25,
        boltPattern: '4x4"',
        hubType: 'Wheel',
      },
      affiliateUrl: 'https://example.com/wheel-hub-1in',
      compatibilityRules: [
        {
          axleType: 'LIVE' as const,
          minAxleDiameter: 0.99,
          maxAxleDiameter: 1.01,
          keywayWidth: 0.25,
          status: 'FITS' as const,
          notes: null,
        },
      ],
    },
    {
      slug: 'sprocket-hub-1in',
      name: '1" Sprocket Hub',
      description: 'Hub adapter for mounting sprockets to 1" axle.',
      category: 'HUB' as const,
      specs: {
        boreDiameter: 1,
        keywayWidth: 0.25,
        hubType: 'Sprocket',
      },
      affiliateUrl: 'https://example.com/sprocket-hub-1in',
      compatibilityRules: [
        {
          axleType: 'LIVE' as const,
          minAxleDiameter: 0.99,
          maxAxleDiameter: 1.01,
          keywayWidth: 0.25,
          status: 'FITS' as const,
          notes: null,
        },
      ],
    },
    {
      slug: 'brake-hub-1in',
      name: '1" Brake Hub',
      description: 'Hub for mounting brake rotor to 1" axle.',
      category: 'HUB' as const,
      specs: {
        boreDiameter: 1,
        keywayWidth: 0.25,
        hubType: 'Brake',
      },
      affiliateUrl: 'https://example.com/brake-hub-1in',
      compatibilityRules: [
        {
          axleType: 'LIVE' as const,
          minAxleDiameter: 0.99,
          maxAxleDiameter: 1.01,
          keywayWidth: 0.25,
          status: 'FITS' as const,
          notes: null,
        },
      ],
    },
    // Brake Rotors
    {
      slug: 'brake-rotor-6in',
      name: '6" Brake Rotor',
      description: '6" diameter brake rotor. Requires brake hub for mounting.',
      category: 'BRAKE_ROTOR' as const,
      specs: {
        diameter: 6,
        boltPattern: '4x4"',
        thickness: 0.25,
      },
      affiliateUrl: 'https://example.com/brake-rotor-6in',
      compatibilityRules: [
        {
          axleType: 'LIVE' as const,
          status: 'FITS_WITH_NOTES' as const,
          notes: 'Requires compatible brake hub. Verify hub bolt pattern matches (4x4").',
        },
      ],
    },
    // Brake Calipers
    {
      slug: 'brake-caliper-mechanical',
      name: 'Mechanical Brake Caliper',
      description: 'Mechanical brake caliper for 6" rotors. Includes mounting bracket.',
      category: 'BRAKE_CALIPER' as const,
      specs: {
        rotorSize: '6"',
        type: 'Mechanical',
      },
      affiliateUrl: 'https://example.com/brake-caliper-mech',
      compatibilityRules: [
        {
          axleType: 'LIVE' as const,
          status: 'FITS_WITH_NOTES' as const,
          notes: 'Requires compatible brake rotor and proper mounting bracket. Verify frame mounting points.',
        },
      ],
    },
    // Wheels
    {
      slug: 'wheel-10x5-4bolt',
      name: '10x5" Wheel - 4 Bolt Pattern',
      description: '10" diameter, 5" wide wheel with 4-bolt pattern. Compatible with 1" wheel hub.',
      category: 'WHEEL' as const,
      specs: {
        diameter: 10,
        width: 5,
        boltPattern: '4x4"',
      },
      affiliateUrl: 'https://example.com/wheel-10x5',
      compatibilityRules: [
        {
          axleType: 'LIVE' as const,
          status: 'FITS_WITH_NOTES' as const,
          notes: 'Requires compatible wheel hub with matching bolt pattern (4x4").',
        },
      ],
    },
    // Hardware
    {
      slug: 'key-stock-025x025',
      name: '1/4" x 1/4" Key Stock',
      description: 'Steel key stock for 1/4" keyway. Cut to length as needed.',
      category: 'HARDWARE' as const,
      specs: {
        width: 0.25,
        height: 0.25,
        material: 'Steel',
      },
      affiliateUrl: 'https://example.com/key-stock-025',
      compatibilityRules: [
        {
          axleType: 'LIVE' as const,
          keywayWidth: 0.25,
          status: 'FITS' as const,
          notes: 'Standard 1/4" key stock. Cut to length based on hub/sprocket requirements.',
        },
      ],
    },
    {
      slug: 'shaft-collar-1in',
      name: '1" Shaft Collar',
      description: 'Shaft collar for 1" diameter axle. Used for spacing and positioning.',
      category: 'HARDWARE' as const,
      specs: {
        boreDiameter: 1,
        type: 'Set Screw',
      },
      affiliateUrl: 'https://example.com/shaft-collar-1in',
      compatibilityRules: [
        {
          axleType: 'LIVE' as const,
          minAxleDiameter: 0.99,
          maxAxleDiameter: 1.01,
          status: 'FITS' as const,
          notes: null,
        },
      ],
    },
  ]

  for (const partData of axleParts) {
    const { compatibilityRules, ...partFields } = partData
    const part = await prisma.axlePart.create({
      data: partFields,
    })

    // Create compatibility rules
    for (const ruleData of compatibilityRules) {
      await prisma.axleCompatibilityRule.create({
        data: {
          ...ruleData,
          axlePartId: part.id,
        },
      })
    }
  }

  console.log(`✅ Created ${axleParts.length} axle parts with compatibility rules`)

  console.log('✅ Seeding complete!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

