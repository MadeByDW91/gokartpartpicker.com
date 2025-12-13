'use client'

import { useBuildStore } from '@/lib/buildStore'
import { calcHpRange, calcSafeRpm, calcTotalCost } from '@/lib/calculations'
import Link from 'next/link'

export default function BuildSummaryPage() {
  const engine = useBuildStore((state) => state.engine)
  const parts = useBuildStore((state) => state.parts)

  if (!engine) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <h1 className="text-3xl font-heading mb-4">No Build Found</h1>
          <p className="text-garage-gray mb-6">Start building to see your summary.</p>
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

  const hpRange = calcHpRange(engine, parts)
  const safeRpm = calcSafeRpm(engine, parts)
  const totalCost = calcTotalCost(parts)

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/build" className="text-garage-orange hover:underline mb-4 inline-block">
        ← Back to Build
      </Link>
      <h1 className="text-4xl font-heading font-bold text-garage-dark mb-8">Build Summary</h1>

      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-heading mb-4">Engine</h2>
          <p className="text-xl">{engine.name}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-heading mb-4">Parts</h2>
          {parts.length === 0 ? (
            <p className="text-garage-gray">No parts in build.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-garage-cream">
                  <tr>
                    <th className="border border-gray-300 p-3 text-left">Part</th>
                    <th className="border border-gray-300 p-3 text-left">Vendor</th>
                    <th className="border border-gray-300 p-3 text-right">Price</th>
                    <th className="border border-gray-300 p-3 text-right">Shipping</th>
                    <th className="border border-gray-300 p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {parts.map((part) => (
                    <tr key={part.id}>
                      <td className="border border-gray-300 p-3">{part.name}</td>
                      <td className="border border-gray-300 p-3">
                        {part.selectedOffer ? part.selectedOffer.vendor.name : 'No offer selected'}
                      </td>
                      <td className="border border-gray-300 p-3 text-right">
                        {part.selectedOffer ? `$${part.selectedOffer.priceUsd.toFixed(2)}` : '-'}
                      </td>
                      <td className="border border-gray-300 p-3 text-right">
                        {part.selectedOffer ? `$${part.selectedOffer.shippingUsd.toFixed(2)}` : '-'}
                      </td>
                      <td className="border border-gray-300 p-3 text-right font-semibold">
                        {part.selectedOffer
                          ? `$${(part.selectedOffer.priceUsd + part.selectedOffer.shippingUsd).toFixed(2)}`
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-garage-cream">
                  <tr>
                    <td colSpan={4} className="border border-gray-300 p-3 text-right font-semibold">
                      Total:
                    </td>
                    <td className="border border-gray-300 p-3 text-right font-bold text-lg">
                      ${totalCost.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div>
            <p className="text-sm text-garage-gray mb-1">HP Range</p>
            <p className="text-3xl font-semibold">{hpRange.min}-{hpRange.max} HP</p>
          </div>
          <div>
            <p className="text-sm text-garage-gray mb-1">Safe RPM</p>
            <p className="text-3xl font-semibold">{safeRpm} RPM</p>
          </div>
          <div>
            <p className="text-sm text-garage-gray mb-1">Total Cost</p>
            <p className="text-3xl font-semibold">${totalCost.toFixed(2)}</p>
          </div>
        </div>

        <div className="border-t pt-6">
          <button
            onClick={() => {
              // Placeholder for export functionality
              alert('Export functionality coming soon!')
            }}
            className="bg-garage-orange text-white px-6 py-3 rounded-lg font-heading hover:bg-opacity-90 transition"
          >
            Export Build (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  )
}

