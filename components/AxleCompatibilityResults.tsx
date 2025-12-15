'use client'

import { GroupedResults } from '@/lib/axleCompatibility'
import { useState } from 'react'

interface AxleCompatibilityResultsProps {
  results: GroupedResults
  axleInput: {
    type: 'LIVE' | 'DEAD'
    diameter: number
    length: number
    keywayWidth: number
  }
}

const categoryLabels: Record<string, string> = {
  BEARING: 'Bearings',
  SPROCKET: 'Sprockets',
  HUB: 'Hubs',
  BRAKE_ROTOR: 'Brake Rotors',
  BRAKE_CALIPER: 'Brake Calipers',
  WHEEL: 'Wheels/Tires',
  HARDWARE: 'Hardware & Accessories',
}

const statusIcons: Record<string, string> = {
  FITS: '✅',
  FITS_WITH_NOTES: '⚠️',
  NOT_COMPATIBLE: '❌',
}

const statusColors: Record<string, string> = {
  FITS: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  FITS_WITH_NOTES: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  NOT_COMPATIBLE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

export default function AxleCompatibilityResults({
  results,
  axleInput,
}: AxleCompatibilityResultsProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(Object.keys(results)))

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const categoryOrder = [
    'BEARING',
    'SPROCKET',
    'BRAKE_ROTOR',
    'BRAKE_CALIPER',
    'HUB',
    'WHEEL',
    'HARDWARE',
  ]

  return (
    <div className="space-y-6">
      {categoryOrder.map((category) => {
        const categoryResults = results[category]
        if (!categoryResults || categoryResults.length === 0) return null

        const isExpanded = expandedCategories.has(category)
        const fitsCount = categoryResults.filter((r) => r.status === 'FITS').length
        const fitsWithNotesCount = categoryResults.filter((r) => r.status === 'FITS_WITH_NOTES').length
        const notCompatibleCount = categoryResults.filter((r) => r.status === 'NOT_COMPATIBLE').length

        return (
          <div
            key={category}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <button
              onClick={() => toggleCategory(category)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-heading font-semibold text-garage-dark dark:text-gray-100">
                  {categoryLabels[category] || category}
                </h3>
                <span className="text-sm text-garage-gray dark:text-gray-400">
                  ({categoryResults.length} part{categoryResults.length !== 1 ? 's' : ''})
                </span>
                {fitsCount > 0 && (
                  <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded">
                    {fitsCount} Fits
                  </span>
                )}
                {fitsWithNotesCount > 0 && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 px-2 py-1 rounded">
                    {fitsWithNotesCount} With Notes
                  </span>
                )}
              </div>
              <span className="text-garage-gray dark:text-gray-400">
                {isExpanded ? '▼' : '▶'}
              </span>
            </button>

            {isExpanded && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid md:grid-cols-2 gap-4">
                  {categoryResults.map((result) => (
                    <div
                      key={result.axlePart.id}
                      className={`border rounded-lg p-4 ${
                        result.status === 'FITS'
                          ? 'border-green-200 dark:border-green-800'
                          : result.status === 'FITS_WITH_NOTES'
                            ? 'border-yellow-200 dark:border-yellow-800'
                            : 'border-red-200 dark:border-red-800'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{statusIcons[result.status]}</span>
                            <h4 className="font-heading font-semibold text-garage-dark dark:text-gray-100">
                              {result.axlePart.name}
                            </h4>
                          </div>
                          <span
                            className={`inline-block text-xs px-2 py-1 rounded font-semibold ${
                              statusColors[result.status]
                            }`}
                          >
                            {result.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>

                      {result.axlePart.description && (
                        <p className="text-sm text-garage-gray dark:text-gray-400 mb-2">
                          {result.axlePart.description}
                        </p>
                      )}

                      {/* Key Specs */}
                      {result.axlePart.specs && (
                        <div className="text-xs text-garage-gray dark:text-gray-400 mb-2 space-y-1">
                          {result.axlePart.specs.boreDiameter && (
                            <div>
                              <span className="font-semibold">Bore:</span> {result.axlePart.specs.boreDiameter}&quot;
                            </div>
                          )}
                          {result.axlePart.specs.keywayWidth && (
                            <div>
                              <span className="font-semibold">Keyway:</span> {result.axlePart.specs.keywayWidth}&quot;
                            </div>
                          )}
                          {result.axlePart.specs.chainSize && (
                            <div>
                              <span className="font-semibold">Chain:</span> {result.axlePart.specs.chainSize}
                            </div>
                          )}
                          {result.axlePart.specs.boltPattern && (
                            <div>
                              <span className="font-semibold">Bolt Pattern:</span> {result.axlePart.specs.boltPattern}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Match Reason */}
                      <p className="text-xs text-garage-gray dark:text-gray-400 mb-2 italic">
                        {result.matchReason}
                      </p>

                      {/* Notes */}
                      {result.notes && (
                        <div
                          className={`text-xs p-2 rounded mb-2 ${
                            result.status === 'FITS_WITH_NOTES'
                              ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                          }`}
                        >
                          <strong>Note:</strong> {result.notes}
                        </div>
                      )}

                      {/* Affiliate Link */}
                      {result.axlePart.affiliateUrl && result.status !== 'NOT_COMPATIBLE' && (
                        <a
                          href={result.axlePart.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 bg-garage-orange text-white px-4 py-2 rounded-lg text-sm font-heading hover:bg-opacity-90 transition"
                        >
                          View Product →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

