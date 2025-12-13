import Link from 'next/link'
import { getContextualVideos } from '@/lib/videoUtils'
import VideoCarousel from '@/components/VideoCarousel'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ignition Timing Basics - Understanding TDC and BTDC | GoKartPartPicker',
  description:
    'Learn the fundamentals of ignition timing, including TDC, BTDC, and how timing affects engine performance.',
}

export default async function IgnitionTimingBasicsPage() {
  const videos = await getContextualVideos({
    category: 'TUNING',
    limit: 6,
  })

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Link
          href="/learn/ignition-timing"
          className="text-garage-orange hover:underline mb-4 inline-block"
        >
          ← Back to Ignition Timing
        </Link>
        <h1 className="text-4xl font-heading font-bold text-garage-dark mb-4">
          Ignition Timing Basics
        </h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
        <h2 className="text-2xl font-heading font-semibold text-garage-dark mb-4">
          What is Top Dead Center (TDC)?
        </h2>
        <p className="text-garage-gray mb-4">
          Top Dead Center (TDC) is the point where the piston reaches the top of its stroke in the
          cylinder. This is a critical reference point for timing measurements.
        </p>
        <p className="text-garage-gray mb-4">
          When we say "20° BTDC," we mean the spark plug fires 20 degrees of crankshaft rotation
          before the piston reaches TDC. This gives the fuel-air mixture time to ignite and build
          pressure before the piston starts its power stroke.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
        <h2 className="text-2xl font-heading font-semibold text-garage-dark mb-4">
          How Advancing Timing Works
        </h2>
        <p className="text-garage-gray mb-4">
          Advancing timing means firing the spark plug earlier (more degrees BTDC). This can
          improve performance at higher RPMs because:
        </p>
        <ul className="list-disc list-inside text-garage-gray space-y-2 mb-4">
          <li>The fuel-air mixture has more time to burn completely</li>
          <li>Peak pressure occurs closer to TDC, maximizing power</li>
          <li>Higher RPM engines need more advance to compensate for faster piston speeds</li>
        </ul>
        <p className="text-garage-gray">
          <strong>Warning:</strong> Too much advance can cause pre-ignition (knock), which can
          damage pistons, rods, and bearings. Always verify timing with a timing light.
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-heading font-semibold text-yellow-800 mb-2">
          Safety First
        </h3>
        <p className="text-yellow-800">
          Never advance timing without proper safety components (billet flywheel, billet rod) if
          you're running high RPMs. Always verify timing specifications with a timing light and
          listen for detonation/knock.
        </p>
      </div>

      {videos.length > 0 && <VideoCarousel videos={videos} />}
    </div>
  )
}

