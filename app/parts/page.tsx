import Link from 'next/link'
import { Suspense } from 'react'
import PartsFilters from '@/components/PartsFilters'
import PartsList from '@/components/PartsList'

export default function PartsPage({
  searchParams,
}: {
  searchParams: { category?: string; engineId?: string }
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-heading font-bold text-garage-dark mb-8">Parts Catalog</h1>
      <Suspense fallback={<div>Loading filters...</div>}>
        <PartsFilters />
      </Suspense>
      <Suspense fallback={<div>Loading parts...</div>}>
        <PartsList category={searchParams.category} engineId={searchParams.engineId} />
      </Suspense>
    </div>
  )
}

