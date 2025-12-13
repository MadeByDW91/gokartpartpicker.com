import Link from 'next/link'
import { getContextualVideos } from '@/lib/videoUtils'
import VideoCarousel from '@/components/VideoCarousel'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ignition Timing Safety - Critical Safety Information | GoKartPartPicker',
  description:
    'Critical safety information about ignition timing, including flywheel safety, pre-ignition risks, and proper installation procedures.',
}

export default async function TimingSafetyPage() {
  const videos = await getContextualVideos({
    category: 'SAFETY',
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
          Ignition Timing Safety
        </h1>
      </div>

      <div className="bg-red-50 border-2 border-red-500 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-heading font-semibold text-red-800 mb-4">
          ⚠️ Critical Safety Warnings
        </h2>
        <ul className="list-disc list-inside text-red-800 space-y-3">
          <li>
            <strong>Stock flywheels can fail at high RPMs.</strong> A failed flywheel can cause
            serious injury or death. Always use a billet flywheel when running above 4000 RPM or
            using 4°+ timing keys.
          </li>
          <li>
            <strong>Pre-ignition (knock) can destroy your engine.</strong> Too much advance can
            cause detonation, which can damage pistons, rods, and bearings. Always listen for
            knock and reduce timing if present.
          </li>
          <li>
            <strong>Always verify timing with a timing light.</strong> Never assume the key degree
            equals actual timing. Verify with proper equipment.
          </li>
          <li>
            <strong>Use proper torque on flywheel nut.</strong> Under-torqued flywheels can come
            loose, causing catastrophic failure. Over-torqued nuts can damage threads.
          </li>
        </ul>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
        <h2 className="text-2xl font-heading font-semibold text-garage-dark mb-4">
          Required Safety Components
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-garage-dark mb-2">For 4° Timing Key:</h3>
            <ul className="list-disc list-inside text-garage-gray space-y-1">
              <li>Billet flywheel (required)</li>
              <li>Torque wrench (for proper installation)</li>
              <li>Timing light (for verification)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-garage-dark mb-2">For 6° Timing Key:</h3>
            <ul className="list-disc list-inside text-garage-gray space-y-1">
              <li>Billet flywheel (required)</li>
              <li>Billet connecting rod (required)</li>
              <li>Torque wrench (for proper installation)</li>
              <li>Timing light (for verification)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
        <h2 className="text-2xl font-heading font-semibold text-garage-dark mb-4">
          Installation Safety Checklist
        </h2>
        <ul className="list-disc list-inside text-garage-gray space-y-2">
          <li>Engine must be completely stopped and cooled</li>
          <li>Remove spark plug wire to prevent accidental starting</li>
          <li>Use proper flywheel puller (never use pry bars or hammers)</li>
          <li>Inspect flywheel and keyway for damage before installation</li>
          <li>Clean all surfaces before reassembly</li>
          <li>Use new timing key (never reuse old key)</li>
          <li>Torque flywheel nut to specification (typically 50 ft-lb)</li>
          <li>Verify timing with timing light after installation</li>
          <li>Listen for knock/detonation during initial test runs</li>
        </ul>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-heading font-semibold text-yellow-800 mb-2">
          Disclaimer
        </h3>
        <p className="text-yellow-800">
          This information is for educational purposes only. Always follow manufacturer
          specifications and use proper safety equipment. Engine modifications can be dangerous
          and may void warranties. Proceed at your own risk.
        </p>
      </div>

      {videos.length > 0 && <VideoCarousel videos={videos} />}
    </div>
  )
}

