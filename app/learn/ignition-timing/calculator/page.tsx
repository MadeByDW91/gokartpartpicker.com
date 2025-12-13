import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import IgnitionTimingCalculator from '@/components/IgnitionTimingCalculator'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ignition Timing Calculator - Advanced Timing Key Calculator | GoKartPartPicker',
  description:
    'Calculate optimal ignition timing for your go-kart engine build. See HP impact, risk levels, and safety warnings for advanced timing keys.',
}

async function getEngines() {
  return await prisma.engine.findMany({
    orderBy: { name: 'asc' },
  })
}

export default async function TimingCalculatorPage() {
  const engines = await getEngines()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Link
          href="/learn/ignition-timing"
          className="text-garage-orange hover:underline mb-4 inline-block"
        >
          ← Back to Ignition Timing
        </Link>
        <h1 className="text-4xl font-heading font-bold text-garage-dark mb-4">
          Ignition Timing Calculator
        </h1>
        <p className="text-xl text-garage-gray max-w-3xl">
          Calculate the effective ignition timing for your build. Select your engine, base timing,
          and timing key to see the results, HP impact, and safety warnings.
        </p>
      </div>

      <IgnitionTimingCalculator engines={engines} />
    </div>
  )
}

