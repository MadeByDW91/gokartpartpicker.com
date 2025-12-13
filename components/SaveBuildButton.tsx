'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useBuildStore } from '@/lib/buildStore'

interface SaveBuildButtonProps {
  savedBuildId?: string | null
}

export default function SaveBuildButton({ savedBuildId }: SaveBuildButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const engine = useBuildStore((state) => state.engine)
  const parts = useBuildStore((state) => state.parts)
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const handleSave = async (isNew: boolean) => {
    if (!session) {
      router.push('/login?redirect=/build')
      return
    }

    if (!engine) {
      setError('Please select an engine first')
      return
    }

    if (!name.trim()) {
      setError('Please enter a build name')
      return
    }

    setLoading(true)
    setError('')

    try {
      const buildData = {
        engine,
        parts: parts.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          selectedOffer: p.selectedOffer
            ? {
                id: p.selectedOffer.id,
                vendorId: p.selectedOffer.vendorId,
                priceUsd: p.selectedOffer.priceUsd,
                shippingUsd: p.selectedOffer.shippingUsd,
                vendor: {
                  name: p.selectedOffer.vendor.name,
                  priority: p.selectedOffer.vendor.priority,
                },
              }
            : null,
        })),
      }

      const url = isNew || !savedBuildId ? '/api/builds' : `/api/builds/${savedBuildId}`
      const method = isNew || !savedBuildId ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          data: buildData,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 403 && data.limit) {
          setError(
            `Build limit reached (${data.limit}). You have ${data.current} builds. Delete one to create a new one.`
          )
        } else {
          setError(data.error || 'Failed to save build')
        }
        return
      }

      setShowModal(false)
      setName('')
      setDescription('')
      router.push('/my-builds')
      router.refresh()
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <button
        onClick={() => router.push('/login?redirect=/build')}
        className="w-full bg-garage-orange text-white py-2 rounded-lg hover:bg-opacity-90 transition text-sm"
      >
        Sign In to Save Build
      </button>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-success-green text-white py-2 rounded-lg hover:bg-opacity-90 transition text-sm"
      >
        {savedBuildId ? 'Update Build' : 'Save Build'}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-heading mb-4">
              {savedBuildId ? 'Update Build' : 'Save Build'}
            </h3>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-800 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Build Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={60}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="My Stage 1 Build"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Notes about this build..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleSave(false)}
                  disabled={loading || !name.trim()}
                  className="flex-1 bg-garage-orange text-white py-2 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : savedBuildId ? 'Update' : 'Save'}
                </button>
                {!savedBuildId && (
                  <button
                    onClick={() => handleSave(true)}
                    disabled={loading || !name.trim()}
                    className="flex-1 bg-success-green text-white py-2 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save As New'}
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowModal(false)
                    setError('')
                    setName('')
                    setDescription('')
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


