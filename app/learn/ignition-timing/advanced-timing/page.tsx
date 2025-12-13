import Link from 'next/link'
import { getContextualVideos } from '@/lib/videoUtils'
import VideoCarousel from '@/components/VideoCarousel'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Advanced Timing Optimization - Performance Timing Guide | GoKartPartPicker',
  description:
    'Learn how to optimize ignition timing for maximum performance, including timing curves and RPM considerations.',
}

export default async function AdvancedTimingPage() {
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
          Advanced Timing Optimization
        </h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
        <h2 className="text-2xl font-heading font-semibold text-garage-dark mb-4">
          Timing and RPM Relationship
        </h2>
        <p className="text-garage-gray mb-4">
          Higher RPM engines typically benefit from more advanced timing because:
        </p>
        <ul className="list-disc list-inside text-garage-gray space-y-2 mb-4">
          <li>Piston speed increases, requiring earlier ignition for complete combustion</li>
          <li>More advance helps maintain power at peak RPM</li>
          <li>Proper timing can prevent power drop-off at high RPM</li>
        </ul>
        <p className="text-garage-gray">
          However, too much advance at low RPM can cause issues. This is why some engines use
          variable timing or why you may need to tune based on your RPM range.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
        <h2 className="text-2xl font-heading font-semibold text-garage-dark mb-4">
          Timing Key Selection Guide
        </h2>
        <div className="space-y-4">
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold text-garage-dark mb-1">2° Key - Conservative</h3>
            <p className="text-garage-gray text-sm">
              Best for: Street builds, moderate RPM (up to 5000 RPM). Safe with stock flywheel if
              RPM stays below 4000.
            </p>
          </div>
          <div className="border-l-4 border-yellow-500 pl-4">
            <h3 className="font-semibold text-garage-dark mb-1">4° Key - Moderate</h3>
            <p className="text-garage-gray text-sm">
              Best for: Performance builds, higher RPM (5000-6000 RPM).{' '}
              <strong>Requires billet flywheel.</strong>
            </p>
          </div>
          <div className="border-l-4 border-red-500 pl-4">
            <h3 className="font-semibold text-garage-dark mb-1">6° Key - Aggressive</h3>
            <p className="text-garage-gray text-sm">
              Best for: Race builds, very high RPM (6000+ RPM).{' '}
              <strong>Requires billet flywheel and billet rod.</strong> Use with caution and
              proper safety components.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-heading font-semibold text-yellow-800 mb-2">
          Verification Required
        </h3>
        <p className="text-yellow-800">
          Always verify your actual timing with a timing light after installing a timing key. The
          key degree is approximate—actual timing may vary based on engine condition, flywheel
          position, and other factors.
        </p>
      </div>

      {videos.length > 0 && <VideoCarousel videos={videos} />}
    </div>
  )
}

