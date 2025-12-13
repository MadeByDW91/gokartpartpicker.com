import Link from 'next/link'
import AddToBuildButton from '@/components/AddToBuildButton'
import { prisma } from '@/lib/prisma'

async function getEngine(slug: string) {
  const engine = await prisma.engine.findUnique({
    where: { slug },
    include: {
      compatibleParts: {
        include: {
          part: true,
        },
      },
    },
  })

  if (!engine) {
    throw new Error('Engine not found')
  }

  return engine
}

export default async function EngineDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const engine = await getEngine(slug)

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/engines" className="text-garage-orange hover:underline mb-4 inline-block">
        ← Back to Engines
      </Link>
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <h1 className="text-4xl font-heading font-bold text-garage-dark mb-4">{engine.name}</h1>
        <p className="text-lg text-garage-gray mb-6">{engine.description}</p>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-sm text-garage-gray mb-1">Base HP Range</p>
            <p className="text-2xl font-semibold">{engine.baseHpMin}-{engine.baseHpMax} HP</p>
          </div>
          <div>
            <p className="text-sm text-garage-gray mb-1">Stock RPM Limit</p>
            <p className="text-2xl font-semibold">{engine.stockRpm} RPM</p>
          </div>
        </div>
        <AddToBuildButton type="engine" item={engine} />
      </div>
    </div>
  )
}

