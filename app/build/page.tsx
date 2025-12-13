'use client'

import { useBuildStore } from '@/lib/buildStore'
import { calcHpRange, calcSafeRpm, calcTotalCost, getWarnings } from '@/lib/calculations'
import { decodeBuild } from '@/lib/buildEncoder'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import SaveBuildButton from '@/components/SaveBuildButton'
import ShareBuildButton from '@/components/ShareBuildButton'
import LocalBuildsModal from '@/components/LocalBuildsModal'
import CompatibilityWarnings from '@/components/CompatibilityWarnings'
import InstallChecklist from '@/components/InstallChecklist'
import WhyThisPartTooltip from '@/components/WhyThisPartTooltip'
import BuildPageLoading from './loading'

function BuildPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const engine = useBuildStore((state) => state.engine)
  const parts = useBuildStore((state) => state.parts)
  const removePart = useBuildStore((state) => state.removePart)
  const clearBuild = useBuildStore((state) => state.clearBuild)
  const loadBuild = useBuildStore((state) => state.loadBuild)
  const currentSavedBuildId = useBuildStore((state) => state.currentSavedBuildId)
  const setSavedBuildId = useBuildStore((state) => state.setSavedBuildId)
  const [loading, setLoading] = useState(false)
  const [showLocalBuilds, setShowLocalBuilds] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // Handle loading a saved build from URL (?load=id)
  useEffect(() => {
    const loadId = searchParams.get('load')
    if (loadId && loadId !== currentSavedBuildId) {
      loadSavedBuild(loadId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Handle shareable build links (?b=encoded)
  useEffect(() => {
    const encoded = searchParams.get('b')
    if (encoded && !loading) {
      loadSharedBuild(encoded)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const loadSavedBuild = async (id: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/builds/${id}`)
      if (!res.ok) {
        throw new Error('Failed to load build')
      }
      const build = await res.json()
      const buildData = build.data

      // Load engine and parts from saved data
      loadBuild(buildData.engine, buildData.parts || [], id)
      setSavedBuildId(id)

      // Remove load param from URL
      router.replace('/build', { scroll: false })
    } catch (err) {
      console.error('Error loading build:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadSharedBuild = async (encoded: string) => {
    setLoading(true)
    try {
      const decoded = decodeBuild(encoded)
      if (!decoded) {
        console.error('Failed to decode build')
        return
      }

      // Fetch engine by slug
      let engineData = null
      if (decoded.e) {
        const res = await fetch(`/api/engines/${decoded.e}`)
        if (res.ok) {
          engineData = await res.json()
        }
      }

      // Fetch parts by slugs
      const partsData: any[] = []
      for (const partSlug of decoded.p) {
        try {
          const res = await fetch(`/api/parts/${partSlug}`)
          if (res.ok) {
            const part = await res.json()
            // If we have offer mappings, find the matching offer
            let selectedOffer = null
            if (decoded.o && decoded.o[part.id]) {
              const offerId = decoded.o[part.id]
              selectedOffer = part.vendorOffers?.find((o: any) => o.id === offerId)
            }
            partsData.push({ ...part, selectedOffer })
          }
        } catch (err) {
          console.error(`Failed to load part ${partSlug}:`, err)
        }
      }

      loadBuild(engineData, partsData)

      // Remove b param from URL
      router.replace('/build', { scroll: false })

      // Show prompt to save
      if (confirm('Build loaded! Would you like to save it to your local builds?')) {
        setShowLocalBuilds(true)
      }
    } catch (err) {
      console.error('Error loading shared build:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClearBuild = () => {
    if (showResetConfirm) {
      clearBuild()
      setShowResetConfirm(false)
      router.push('/engines')
    } else {
      setShowResetConfirm(true)
    }
  }

  const hpRange = calcHpRange(engine, parts)
  const safeRpm = calcSafeRpm(engine, parts)
  const totalCost = calcTotalCost(parts)
  const warnings = getWarnings(engine, parts)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!engine) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-heading mb-4">No Engine Selected</h1>
          <p className="text-garage-gray mb-6">
            Start building by selecting an engine. Then add compatible parts to customize your build.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/engines"
              className="inline-block bg-garage-orange text-white px-6 py-3 rounded-lg font-heading hover:bg-opacity-90 transition"
            >
              Browse Engines
            </Link>
            <button
              onClick={() => setShowLocalBuilds(true)}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-heading hover:bg-gray-300 transition"
            >
              Load Saved Build
            </button>
          </div>
          <LocalBuildsModal isOpen={showLocalBuilds} onClose={() => setShowLocalBuilds(false)} />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-heading font-bold text-garage-dark dark:text-gray-100 mb-8">Build Workbench</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Engine Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-heading mb-4">Selected Engine</h2>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{engine.name}</h3>
                <p className="text-garage-gray text-sm">{engine.baseHpMin}-{engine.baseHpMax} HP @ {engine.stockRpm} RPM</p>
              </div>
              <Link
                href={`/engines/${engine.slug}`}
                className="text-garage-orange hover:underline text-sm"
              >
                Change
              </Link>
            </div>
          </div>

          {/* Parts Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-heading mb-4">Selected Parts</h2>
            {parts.length === 0 ? (
              <div className="text-center py-8 bg-garage-cream rounded-lg">
                <p className="text-garage-gray mb-4">No parts added yet.</p>
                <p className="text-sm text-garage-gray mb-4">
                  Browse compatible parts for your {engine.name} or search for specific upgrades.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href={`/parts?engineId=${engine.id}`}
                    className="inline-block bg-garage-orange text-white px-6 py-2 rounded-lg font-heading hover:bg-opacity-90 transition text-sm"
                  >
                    Browse Compatible Parts
                  </Link>
                  <Link
                    href="/parts"
                    className="inline-block bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-heading hover:bg-gray-300 transition text-sm"
                  >
                    Browse All Parts
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {parts.map((part) => (
                  <div key={part.id} className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded">
                    <div className="flex-1">
                      <WhyThisPartTooltip part={part}>
                        <p className="font-semibold cursor-help">{part.name}</p>
                      </WhyThisPartTooltip>
                      {part.selectedOffer && (
                        <p className="text-sm text-garage-gray dark:text-gray-400">
                          {part.selectedOffer.vendor.name} - ${(part.selectedOffer.priceUsd + part.selectedOffer.shippingUsd).toFixed(2)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removePart(part.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Compatibility Warnings */}
          <CompatibilityWarnings engine={engine} parts={parts} />

          {/* Warnings Section */}
          {warnings.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-heading mb-4">Warnings</h2>
              <div className="space-y-3">
                {warnings.map((warning, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded ${
                      warning.type === 'error' ? 'bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700' : 'bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700'
                    }`}
                  >
                    <p className={warning.type === 'error' ? 'text-red-800 dark:text-red-200' : 'text-yellow-800 dark:text-yellow-200'}>
                      {warning.type === 'error' ? '🚨 ' : '⚠️ '}
                      {warning.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Installation Checklist */}
          <InstallChecklist engine={engine} parts={parts} />
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-4">
            <h2 className="text-2xl font-heading mb-4">Build Summary</h2>
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-garage-gray dark:text-gray-400 mb-1">HP Range</p>
                <p className="text-2xl font-semibold text-garage-dark dark:text-gray-100">{hpRange.min}-{hpRange.max} HP</p>
              </div>
              <div>
                <p className="text-sm text-garage-gray dark:text-gray-400 mb-1">Safe RPM</p>
                <p className="text-2xl font-semibold text-garage-dark dark:text-gray-100">{safeRpm} RPM</p>
              </div>
              <div>
                <p className="text-sm text-garage-gray dark:text-gray-400 mb-1">Total Cost</p>
                <p className="text-2xl font-semibold text-garage-dark dark:text-gray-100">${totalCost.toFixed(2)}</p>
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => setShowLocalBuilds(true)}
                className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                My Builds
              </button>
              <ShareBuildButton />
              <SaveBuildButton savedBuildId={currentSavedBuildId} />
              <Link
                href="/build/summary"
                className="block text-center bg-success-green text-white py-3 rounded-lg font-heading hover:bg-opacity-90 transition"
              >
                View Summary
              </Link>
              {showResetConfirm ? (
                <div className="space-y-2">
                  <p className="text-sm text-red-600 mb-2">Are you sure? This will clear your current build.</p>
                  <button
                    onClick={handleClearBuild}
                    className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Confirm Clear
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleClearBuild}
                  className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Clear Build
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <LocalBuildsModal isOpen={showLocalBuilds} onClose={() => setShowLocalBuilds(false)} />
    </div>
  )
}

export default function BuildPage() {
  return (
    <Suspense fallback={<BuildPageLoading />}>
      <BuildPageContent />
    </Suspense>
  )
}



