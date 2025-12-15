import { Suspense } from 'react'
import AxleWizard from '@/components/AxleWizard'
import AxleCompatibilityResults from '@/components/AxleCompatibilityResults'
import AxleChecklist from '@/components/AxleChecklist'
import { getAxleCompatibility } from '@/lib/axleCompatibility'
import { getContextualVideos } from '@/lib/videoUtils'
import VideoCarousel from '@/components/VideoCarousel'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Live Axle Compatibility Wizard | GoKartPartPicker',
  description: 'Enter your live axle measurements to find compatible bearings, sprockets, hubs, brakes, and wheels.',
}

interface LiveAxlePageProps {
  searchParams: Promise<{
    type?: string
    diameter?: string
    length?: string
    keywayWidth?: string
    keywayHeight?: string
    threadedEnds?: string
    threadSize?: string
    notes?: string
  }>
}

export default async function LiveAxlePage({ searchParams }: LiveAxlePageProps) {
  const params = await searchParams

  // Check if we have axle input parameters
  const hasInput =
    params.diameter && params.length && params.keywayWidth && params.type === 'LIVE'

  let results = null
  let axleInput = null

  if (hasInput) {
    const input: any = {
      type: 'LIVE' as const,
      diameter: parseFloat(params.diameter!),
      length: parseFloat(params.length!),
      keywayWidth: parseFloat(params.keywayWidth!),
    }
    if (params.keywayHeight) {
      input.keywayHeight = parseFloat(params.keywayHeight)
    }
    if (params.threadedEnds === 'true') {
      input.threadedEnds = true
      if (params.threadSize) {
        input.threadSize = params.threadSize
      }
    }
    if (params.notes) {
      input.notes = params.notes
    }
    axleInput = input

    results = await getAxleCompatibility(axleInput)
  }

  // Fetch videos for axle-related content
  const videos = await getContextualVideos({
    category: 'INSTALL',
    limit: 6,
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/axles" className="text-garage-orange hover:underline mb-4 inline-block">
          ← Back to Axle Compatibility
        </Link>
        <h1 className="text-4xl font-heading font-bold text-garage-dark dark:text-gray-100 mb-4">
          Live Axle Compatibility Wizard
        </h1>
        <p className="text-lg text-garage-gray dark:text-gray-300">
          Enter your live axle measurements to find compatible parts for your go-kart.
        </p>
      </div>

      {!hasInput ? (
        <Suspense fallback={<div className="text-center py-12">Loading wizard...</div>}>
          <AxleWizard />
        </Suspense>
      ) : (
        <div className="space-y-8">
          {/* Results Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-heading font-bold text-garage-dark dark:text-gray-100 mb-4">
              Compatibility Results
            </h2>
            <div className="text-sm text-garage-gray dark:text-gray-400 mb-4">
              <p>
                <strong>Axle Diameter:</strong> {axleInput!.diameter}&quot;
              </p>
              <p>
                <strong>Axle Length:</strong> {axleInput!.length}&quot;
              </p>
              <p>
                <strong>Keyway Width:</strong> {axleInput!.keywayWidth}&quot;
              </p>
            </div>
            <Link
              href="/axles/live"
              className="text-garage-orange hover:underline text-sm font-semibold"
            >
              ← Enter Different Measurements
            </Link>
          </div>

          {/* What You Still Need Checklist */}
          {results && <AxleChecklist results={results} />}

          {/* Compatibility Results */}
          {results && (
            <Suspense fallback={<div className="text-center py-12">Loading results...</div>}>
              <AxleCompatibilityResults results={results} axleInput={axleInput!} />
            </Suspense>
          )}

          {/* Useful Videos */}
          {videos.length > 0 && (
            <div className="mt-12">
              <VideoCarousel videos={videos} title="Useful Videos: Axle Measurement & Installation" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

