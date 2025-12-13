'use client'

import { useBuildStore } from '@/lib/buildStore'
import { calcHpRange, calcSafeRpm, calcTotalCost, getWarnings } from '@/lib/calculations'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function BuildPage() {
  const router = useRouter()
  const engine = useBuildStore((state) => state.engine)
  const parts = useBuildStore((state) => state.parts)
  const removePart = useBuildStore((state) => state.removePart)
  const clearBuild = useBuildStore((state) => state.clearBuild)

  const hpRange = calcHpRange(engine, parts)
  const safeRpm = calcSafeRpm(engine, parts)
  const totalCost = calcTotalCost(parts)
  const warnings = getWarnings(engine, parts)

  if (!engine) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <h1 className="text-3xl font-heading mb-4">No Engine Selected</h1>
          <p className="text-garage-gray mb-6">Start by selecting an engine for your build.</p>
          <Link
            href="/engines"
            className="inline-block bg-garage-orange text-white px-6 py-3 rounded-lg font-heading hover:bg-opacity-90 transition"
          >
            Browse Engines
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-heading font-bold text-garage-dark mb-8">Build Workbench</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Engine Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
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
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-heading mb-4">Selected Parts</h2>
            {parts.length === 0 ? (
              <p className="text-garage-gray">No parts added yet. <Link href="/parts" className="text-garage-orange hover:underline">Browse parts</Link></p>
            ) : (
              <div className="space-y-3">
                {parts.map((part) => (
                  <div key={part.id} className="flex justify-between items-center p-3 border border-gray-200 rounded">
                    <div className="flex-1">
                      <p className="font-semibold">{part.name}</p>
                      {part.selectedOffer && (
                        <p className="text-sm text-garage-gray">
                          {part.selectedOffer.vendor.name} - ${(part.selectedOffer.priceUsd + part.selectedOffer.shippingUsd).toFixed(2)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removePart(part.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Warnings Section */}
          {warnings.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-heading mb-4">Warnings</h2>
              <div className="space-y-3">
                {warnings.map((warning, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded ${
                      warning.type === 'error' ? 'bg-red-100 border border-red-300' : 'bg-yellow-100 border border-yellow-300'
                    }`}
                  >
                    <p className={warning.type === 'error' ? 'text-red-800' : 'text-yellow-800'}>
                      {warning.type === 'error' ? '🚨 ' : '⚠️ '}
                      {warning.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
            <h2 className="text-2xl font-heading mb-4">Build Summary</h2>
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-garage-gray mb-1">HP Range</p>
                <p className="text-2xl font-semibold">{hpRange.min}-{hpRange.max} HP</p>
              </div>
              <div>
                <p className="text-sm text-garage-gray mb-1">Safe RPM</p>
                <p className="text-2xl font-semibold">{safeRpm} RPM</p>
              </div>
              <div>
                <p className="text-sm text-garage-gray mb-1">Total Cost</p>
                <p className="text-2xl font-semibold">${totalCost.toFixed(2)}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Link
                href="/build/summary"
                className="block text-center bg-success-green text-white py-3 rounded-lg font-heading hover:bg-opacity-90 transition"
              >
                View Summary
              </Link>
              <button
                onClick={() => {
                  clearBuild()
                  router.push('/engines')
                }}
                className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Clear Build
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

