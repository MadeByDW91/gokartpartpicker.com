import Link from 'next/link'
import { getContextualVideos } from '@/lib/videoUtils'
import VideoCarousel from '@/components/VideoCarousel'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Advanced Timing Keys - Flywheel Key Guide | GoKartPartPicker',
  description:
    'Learn about advanced timing keys (2°, 4°, 6°) and how they advance ignition timing for improved performance.',
}

export default async function FlywheelKeysPage() {
  const videos = await getContextualVideos({
    category: 'INSTALL',
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
          Advanced Timing Keys
        </h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
        <h2 className="text-2xl font-heading font-semibold text-garage-dark mb-4">
          What Are Timing Keys?
        </h2>
        <p className="text-garage-gray mb-4">
          Timing keys are offset keys that replace the stock flywheel key. They rotate the flywheel
          (and thus the magneto) relative to the crankshaft, advancing the ignition timing.
        </p>
        <p className="text-garage-gray mb-4">
          Common timing key degrees:
        </p>
        <ul className="list-disc list-inside text-garage-gray space-y-2 mb-4">
          <li>
            <strong>0° Key:</strong> Stock timing (no change)
          </li>
          <li>
            <strong>2° Key:</strong> Mild advance, safe for most builds
          </li>
          <li>
            <strong>4° Key:</strong> Moderate advance, requires billet flywheel for high RPM
          </li>
          <li>
            <strong>6° Key:</strong> Aggressive advance, requires billet flywheel and billet rod
          </li>
        </ul>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
        <h2 className="text-2xl font-heading font-semibold text-garage-dark mb-4">
          Installation Requirements
        </h2>
        <p className="text-garage-gray mb-4">
          Installing a timing key requires:
        </p>
        <ul className="list-disc list-inside text-garage-gray space-y-2 mb-4">
          <li>Flywheel puller tool</li>
          <li>Torque wrench (to properly torque flywheel nut)</li>
          <li>Impact gun or breaker bar (for flywheel removal)</li>
          <li>Socket set</li>
        </ul>
        <p className="text-garage-gray">
          <strong>Important:</strong> Always use a torque wrench to tighten the flywheel nut to
          specification (typically 50 ft-lb for Predator 212). Never reuse the stock key—always use
          a new timing key.
        </p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-heading font-semibold text-red-800 mb-2">
          Critical Safety Warning
        </h3>
        <p className="text-red-800 mb-2">
          <strong>4° and 6° timing keys require a billet flywheel for safety.</strong> Stock
          flywheels can fail at high RPMs, especially with advanced timing. A failed flywheel can
          cause serious injury or death.
        </p>
        <p className="text-red-800">
          Never use advanced timing keys (4° or 6°) without a billet flywheel, and always verify
          timing with a timing light after installation.
        </p>
      </div>

      {videos.length > 0 && <VideoCarousel videos={videos} />}
    </div>
  )
}

