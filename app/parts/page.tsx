import Link from 'next/link'
import { Suspense } from 'react'
import PartsFilters from '@/components/PartsFilters'
import PartsList from '@/components/PartsList'

export default async function PartsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; engineId?: string; minHp?: string; maxHp?: string; minRpm?: string; maxBudget?: string; beginnerSafe?: string }>
}) {
  const params = await searchParams
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-heading font-bold text-garage-dark dark:text-gray-100 mb-8">Parts Catalog</h1>
      <Suspense fallback={<div>Loading filters...</div>}>
        <PartsFilters />
      </Suspense>
      <Suspense fallback={<div>Loading parts...</div>}>
        <PartsList category={params.category} engineId={params.engineId} />
      </Suspense>
    </div>
  )
}

