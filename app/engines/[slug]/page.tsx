import Link from 'next/link'
import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import EnginePageClient from '@/components/EnginePageClient'
import { getContextualVideos } from '@/lib/videoUtils'

async function getEngine(slug: string) {
  try {
    const engine = await prisma.engine.findUnique({
      where: { slug },
      include: {
        schematics: {
          orderBy: { createdAt: 'asc' },
        },
        torqueSpecs: {
          orderBy: [
            { category: 'asc' },
            { fastener: 'asc' },
          ],
        },
        upgrades: {
          include: {
            upgrade: {
              include: {
                tools: {
                  include: {
                    tool: true,
                  },
                },
              },
            },
          },
        },
        compatibleParts: {
          include: {
            part: true,
          },
        },
      },
    })

    if (!engine) {
      throw new Error('Engine not found')
    }

    return engine as any // Type will be correct after Prisma client regeneration
  } catch (error) {
    console.error('Error fetching engine:', error)
    throw error
  }
}

export default async function EngineDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const engine = await getEngine(slug)
  
  // Fetch context-aware videos for this engine
  const videos = await getContextualVideos({
    engineId: engine.id,
    engineSlug: engine.slug,
    limit: 12,
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/engines" className="text-garage-orange hover:underline mb-4 inline-block">
        ← Back to Engines
      </Link>
      <Suspense fallback={
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-garage-gray">Loading...</p>
        </div>
      }>
        <EnginePageClient engine={engine} videos={videos} />
      </Suspense>
    </div>
  )
}
