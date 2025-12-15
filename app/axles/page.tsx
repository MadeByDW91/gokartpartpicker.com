import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Axle Compatibility | GoKartPartPicker',
  description: 'Find compatible bearings, sprockets, hubs, brakes, and wheels for your go-kart axle.',
}

export default function AxlesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/" className="text-garage-orange hover:underline mb-4 inline-block">
          ← Back to Home
        </Link>
        <h1 className="text-4xl font-heading font-bold text-garage-dark dark:text-gray-100 mb-4">
          Axle Compatibility
        </h1>
        <p className="text-lg text-garage-gray dark:text-gray-300 mb-6">
          Find compatible parts for your go-kart axle. Enter your axle measurements to see which bearings, sprockets,
          hubs, brakes, and wheels will fit.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-heading font-semibold text-garage-dark dark:text-gray-100 mb-4">
            Live Axle Compatibility
          </h2>
          <p className="text-garage-gray dark:text-gray-400 mb-4">
            For live axles (axles that rotate with the wheels). Enter your axle diameter, length, and keyway
            measurements to find compatible parts.
          </p>
          <Link
            href="/axles/live"
            className="inline-block bg-garage-orange text-white px-6 py-3 rounded-lg font-heading hover:bg-opacity-90 transition"
          >
            Start Live Axle Wizard →
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 opacity-50">
          <h2 className="text-2xl font-heading font-semibold text-garage-dark dark:text-gray-100 mb-4">
            Dead Axle Compatibility
          </h2>
          <p className="text-garage-gray dark:text-gray-400 mb-4">
            Coming soon: Support for dead axles (stationary axles where wheels rotate independently).
          </p>
          <button
            disabled
            className="inline-block bg-gray-400 text-white px-6 py-3 rounded-lg font-heading cursor-not-allowed"
          >
            Coming Soon
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-heading font-semibold text-garage-dark dark:text-gray-100 mb-4">
          How It Works
        </h2>
        <ol className="space-y-3 text-garage-gray dark:text-gray-400">
          <li className="flex gap-3">
            <span className="font-heading font-bold text-garage-orange">1.</span>
            <span>Enter your axle measurements (diameter, length, keyway width)</span>
          </li>
          <li className="flex gap-3">
            <span className="font-heading font-bold text-garage-orange">2.</span>
            <span>Our system matches your axle specs with compatible parts in our database</span>
          </li>
          <li className="flex gap-3">
            <span className="font-heading font-bold text-garage-orange">3.</span>
            <span>
              See results grouped by category: bearings, sprockets, hubs, brakes, wheels, and hardware
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-heading font-bold text-garage-orange">4.</span>
            <span>Each part shows fitment status: ✅ Fits, ⚠️ Fits with notes, or ❌ Not compatible</span>
          </li>
        </ol>
      </div>
    </div>
  )
}

