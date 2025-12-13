import Link from 'next/link'
import AddToBuildButton from '@/components/AddToBuildButton'

async function getPart(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/parts/${slug}`, {
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error('Failed to fetch part')
  }
  return res.json()
}

export default async function PartDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const part = await getPart(slug)

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/parts" className="text-garage-orange hover:underline mb-4 inline-block">
        ← Back to Parts
      </Link>
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <h1 className="text-4xl font-heading font-bold text-garage-dark mb-4">{part.name}</h1>
        <p className="text-sm text-garage-gray mb-2 capitalize">{part.category.replace('_', ' ')}</p>
        <p className="text-lg text-garage-gray mb-6">{part.description}</p>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {part.hpGainMin > 0 || part.hpGainMax > 0 ? (
            <div>
              <p className="text-sm text-garage-gray mb-1">HP Gain Range</p>
              <p className="text-2xl font-semibold">+{part.hpGainMin}-{part.hpGainMax} HP</p>
            </div>
          ) : null}
          {part.rpmLimitDelta !== 0 ? (
            <div>
              <p className="text-sm text-garage-gray mb-1">RPM Limit Delta</p>
              <p className="text-2xl font-semibold">{part.rpmLimitDelta > 0 ? '+' : ''}{part.rpmLimitDelta} RPM</p>
            </div>
          ) : null}
        </div>

        <h2 className="text-2xl font-heading mb-4 mt-8">Vendor Offers</h2>
        {part.vendorOffers.length === 0 ? (
          <p className="text-garage-gray">No vendor offers available for this part.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-garage-cream">
                <tr>
                  <th className="border border-gray-300 p-3 text-left">Vendor</th>
                  <th className="border border-gray-300 p-3 text-left">Price</th>
                  <th className="border border-gray-300 p-3 text-left">Shipping</th>
                  <th className="border border-gray-300 p-3 text-left">Total</th>
                  <th className="border border-gray-300 p-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {part.vendorOffers.map((offer: any) => (
                  <tr key={offer.id}>
                    <td className="border border-gray-300 p-3">{offer.vendor.name}</td>
                    <td className="border border-gray-300 p-3">${offer.priceUsd.toFixed(2)}</td>
                    <td className="border border-gray-300 p-3">${offer.shippingUsd.toFixed(2)}</td>
                    <td className="border border-gray-300 p-3 font-semibold">
                      ${(offer.priceUsd + offer.shippingUsd).toFixed(2)}
                    </td>
                    <td className="border border-gray-300 p-3">
                      <AddToBuildButton type="part" item={part} offer={offer} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

