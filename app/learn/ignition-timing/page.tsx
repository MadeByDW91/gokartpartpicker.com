import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import VideoCarousel from '@/components/VideoCarousel'
import { getContextualVideos } from '@/lib/videoUtils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ignition Timing Guide - Go-Kart Engine Timing Explained | GoKartPartPicker',
  description:
    'Learn about ignition timing, TDC/BTDC, advanced timing keys, and how to safely optimize timing for your go-kart engine build.',
}

const sections = [
  {
    slug: 'basics',
    title: 'Basics',
    description: 'Understanding ignition timing fundamentals',
  },
  {
    slug: 'flywheel-keys',
    title: 'Flywheel Keys',
    description: 'How advanced timing keys work',
  },
  {
    slug: 'advanced-timing',
    title: 'Advanced Timing',
    description: 'Optimizing timing for performance',
  },
  {
    slug: 'safety',
    title: 'Safety',
    description: 'Important safety considerations',
  },
  {
    slug: 'calculator',
    title: 'Calculator',
    description: 'Interactive timing calculator',
  },
]

export default async function IgnitionTimingPage() {
  const videos = await getContextualVideos({
    category: 'TUNING',
    limit: 8,
  })

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Link
          href="/learn"
          className="text-garage-orange hover:underline mb-4 inline-block"
        >
          ← Back to Learn
        </Link>
        <h1 className="text-4xl font-heading font-bold text-garage-dark mb-4">
          Ignition Timing
        </h1>
        <p className="text-xl text-garage-gray max-w-3xl">
          Ignition timing is critical for engine performance and safety. Learn how timing works,
          how to adjust it safely, and how to use advanced timing keys to optimize your build.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-12">
        <h2 className="text-2xl font-heading font-semibold text-garage-dark mb-4">
          What is Ignition Timing?
        </h2>
        <p className="text-garage-gray mb-4">
          Ignition timing refers to when the spark plug fires in relation to the piston position.
          Timing is measured in degrees Before Top Dead Center (BTDC). Stock engines typically fire
          around 20-25° BTDC, but advancing timing can improve performance at higher RPMs.
        </p>
        <p className="text-garage-gray mb-4">
          <strong>Important:</strong> Advancing timing too far can cause pre-ignition (knock),
          which can damage your engine. Always verify timing with a timing light and follow
          manufacturer specifications.
        </p>
      </div>

      <div className="mb-12">
        <h2 className="text-3xl font-heading font-bold text-garage-dark mb-6">Topics</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section) => (
            <Link
              key={section.slug}
              href={`/learn/ignition-timing/${section.slug}`}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition"
            >
              <h3 className="text-xl font-heading font-semibold text-garage-dark mb-2">
                {section.title}
              </h3>
              <p className="text-garage-gray text-sm">{section.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {videos.length > 0 && <VideoCarousel videos={videos} title="Timing-Related Videos" />}
    </div>
  )
}

