'use client'

import { useBuildStore } from '@/lib/buildStore'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface AddGuidePartsToBuildProps {
  parts: any[]
}

export default function AddGuidePartsToBuild({ parts }: AddGuidePartsToBuildProps) {
  const router = useRouter()
  const addPart = useBuildStore((state) => state.addPart)
  const [loading, setLoading] = useState(false)

  const handleAddAll = async () => {
    if (parts.length === 0) return

    setLoading(true)
    try {
      // Fetch vendor offers for each part to get the best (Amazon-first) offer
      for (const part of parts) {
        const res = await fetch(`/api/parts/${part.slug}`)
        if (res.ok) {
          const partData = await res.json()
          // Get the first offer (already sorted by vendorSort - Amazon first, then by price)
          const bestOffer = partData.vendorOffers?.[0]
          if (bestOffer) {
            addPart(part, {
              ...bestOffer,
              vendor: bestOffer.vendor,
            })
          } else {
            // Add part without offer if no offers available
            addPart(part, undefined)
          }
        }
      }
      router.push('/build')
    } catch (error) {
      console.error('Error adding parts to build:', error)
      alert('Failed to add some parts to build. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (parts.length === 0) return null

  return (
    <button
      onClick={handleAddAll}
      disabled={loading}
      className="bg-success-green text-white px-6 py-3 rounded-lg font-heading hover:bg-opacity-90 transition disabled:opacity-50"
    >
      {loading ? 'Adding...' : `Add All ${parts.length} Parts to Build`}
    </button>
  )
}

