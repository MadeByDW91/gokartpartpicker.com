import Link from 'next/link'
import { prisma } from '@/lib/prisma'

async function getEngines() {
  return await prisma.engine.findMany({
    orderBy: { name: 'asc' },
  })
}

export default async function EnginesPage() {
  const engines = await getEngines()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-heading font-bold text-garage-dark mb-8">Engines</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {engines.map((engine: any) => (
          <div key={engine.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition">
            <h2 className="text-2xl font-heading mb-2 text-garage-dark">{engine.name}</h2>
            <p className="text-garage-gray mb-4 line-clamp-2">{engine.description}</p>
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-garage-gray">HP Range</p>
                <p className="font-semibold">{engine.baseHpMin}-{engine.baseHpMax} HP</p>
              </div>
              <div>
                <p className="text-sm text-garage-gray">Stock RPM</p>
                <p className="font-semibold">{engine.stockRpm} RPM</p>
              </div>
            </div>
            <Link
              href={`/engines/${engine.slug}`}
              className="block text-center bg-garage-orange text-white py-2 rounded-lg hover:bg-opacity-90 transition"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

