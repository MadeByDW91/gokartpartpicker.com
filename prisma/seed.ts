import { PrismaClient } from '@prisma/client'

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
  await prisma.storeProduct.deleteMany()

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

  // Create Engines
  const predator212Hemi = await prisma.engine.create({
    data: {
      name: 'Predator 212 Hemi',
      slug: 'predator-212-hemi',
      description: 'The Predator 212 Hemi is a popular 6.5 HP engine with a hemi-style combustion chamber for better performance.',
      baseHpMin: 6.5,
      baseHpMax: 6.5,
      stockRpm: 3600,
      imageUrl: null,
    },
  })

  const predator212NonHemi = await prisma.engine.create({
    data: {
      name: 'Predator 212 Non-Hemi',
      slug: 'predator-212-non-hemi',
      description: 'The Predator 212 Non-Hemi is the standard 6.5 HP engine variant.',
      baseHpMin: 6.5,
      baseHpMax: 6.5,
      stockRpm: 3600,
      imageUrl: null,
    },
  })

  const predator212Ghost = await prisma.engine.create({
    data: {
      name: 'Predator 212 Ghost',
      slug: 'predator-212-ghost',
      description: 'The Predator 212 Ghost is a high-performance variant with increased RPM capability.',
      baseHpMin: 6.5,
      baseHpMax: 7.0,
      stockRpm: 4000,
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

