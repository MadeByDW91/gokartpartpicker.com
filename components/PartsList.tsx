import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import WhyThisPartTooltip from '@/components/WhyThisPartTooltip'

async function getParts(category?: string, engineId?: string) {
  const where: any = {}

  if (category) {
    where.category = category
  }

  if (engineId) {
    where.compatibleEngines = {
      some: {
        engineId: engineId,
      },
    }
  }

  return await prisma.part.findMany({
    where,
    include: {
      vendorOffers: {
        include: {
          vendor: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  })
}

export default async function PartsList({ category, engineId }: { category?: string; engineId?: string }) {
  const parts = await getParts(category, engineId)

  if (parts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-garage-gray dark:text-gray-400 mb-4">No parts found matching your filters.</p>
        <p className="text-sm text-garage-gray dark:text-gray-500 mb-4">
          Try adjusting your filters or browse all parts.
        </p>
        <Link
          href="/parts"
          className="inline-block bg-garage-orange text-white px-6 py-2 rounded-lg font-heading hover:bg-opacity-90 transition text-sm"
        >
          Clear Filters
        </Link>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {parts.map((part: any) => {
        const minPrice = part.vendorOffers.length > 0
          ? Math.min(...part.vendorOffers.map((o: any) => o.priceUsd + o.shippingUsd))
          : null

        return (
          <div key={part.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition">
            <WhyThisPartTooltip part={part}>
              <h2 className="text-xl font-heading mb-2 text-garage-dark dark:text-gray-100 cursor-help">{part.name}</h2>
            </WhyThisPartTooltip>
            <p className="text-sm text-garage-gray dark:text-gray-400 mb-2 capitalize">{part.category.replace('_', ' ')}</p>
            <p className="text-garage-gray dark:text-gray-400 mb-4 line-clamp-2 text-sm">{part.description}</p>
            {part.hpGainMin > 0 || part.hpGainMax > 0 ? (
              <p className="text-sm mb-2">
                HP Gain: <span className="font-semibold">+{part.hpGainMin}-{part.hpGainMax}</span>
              </p>
            ) : null}
            {part.rpmLimitDelta !== 0 ? (
              <p className="text-sm mb-2">
                RPM Delta: <span className="font-semibold">{part.rpmLimitDelta > 0 ? '+' : ''}{part.rpmLimitDelta}</span>
              </p>
            ) : null}
            {minPrice ? (
              <p className="text-lg font-semibold text-garage-orange mb-4">From ${minPrice.toFixed(2)}</p>
            ) : (
              <p className="text-garage-gray dark:text-gray-400 mb-4">No offers available</p>
            )}
            <Link
              href={`/parts/${part.slug}`}
              className="block text-center bg-garage-orange text-white py-2 rounded-lg hover:bg-opacity-90 transition"
            >
              View Details
            </Link>
          </div>
        )
      })}
    </div>
  )
}

