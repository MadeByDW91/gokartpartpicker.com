'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface SavedBuild {
  id: string
  name: string
  description: string | null
  data?: any
  updatedAt: string
  createdAt: string
}

export default function MyBuildsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [builds, setBuilds] = useState<SavedBuild[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/my-builds')
      return
    }

    if (status === 'authenticated') {
      fetchBuilds()
    }
  }, [status, router])

  const fetchBuilds = async () => {
    try {
      const res = await fetch('/api/builds')
      if (!res.ok) {
        throw new Error('Failed to fetch builds')
      }
      const data = await res.json()
      // Fetch full build data including 'data' field
      const buildsWithData = await Promise.all(
        data.map(async (build: SavedBuild) => {
          const fullRes = await fetch(`/api/builds/${build.id}`)
          if (fullRes.ok) {
            const fullBuild = await fullRes.json()
            return { ...build, data: fullBuild.data }
          }
          return build
        })
      )
      setBuilds(buildsWithData)
    } catch (err) {
      setError('Failed to load builds')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/builds/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete build')
      }

      setBuilds(builds.filter((b) => b.id !== id))
      setDeleteConfirm(null)
    } catch (err) {
      setError('Failed to delete build')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null // Will redirect
  }

  const remainingSlots = 10 - builds.length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-heading font-bold text-garage-dark">My Builds</h1>
        <Link
          href="/build"
          className="bg-garage-orange text-white px-6 py-3 rounded-lg font-heading hover:bg-opacity-90 transition"
        >
          Create New Build
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-800">
          {error}
        </div>
      )}

      <div className="mb-4 p-4 bg-garage-cream rounded-lg">
        <p className="text-sm text-garage-gray">
          <span className="font-semibold">{builds.length}</span> of <span className="font-semibold">10</span> builds saved
          {remainingSlots > 0 && (
            <span className="text-success-green ml-2">({remainingSlots} slots remaining)</span>
          )}
          {remainingSlots === 0 && (
            <span className="text-red-600 ml-2">(Limit reached - delete a build to create a new one)</span>
          )}
        </p>
      </div>

      {builds.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <h2 className="text-2xl font-heading mb-4">No saved builds yet</h2>
          <p className="text-garage-gray mb-6">
            Create and save your first build to get started!
          </p>
          <Link
            href="/build"
            className="inline-block bg-garage-orange text-white px-6 py-3 rounded-lg font-heading hover:bg-opacity-90 transition"
          >
            Create Your First Build
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {builds.map((build) => (
            <div key={build.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-heading mb-2 text-garage-dark">{build.name}</h3>
              {build.description && (
                <p className="text-garage-gray text-sm mb-4 line-clamp-2">{build.description}</p>
              )}
              <p className="text-xs text-garage-gray mb-4">
                Updated: {new Date(build.updatedAt).toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/engines/${(build.data as any)?.engineSlug || 'predator-212-hemi'}?load=${build.id}`}
                  className="flex-1 text-center bg-garage-orange text-white py-2 rounded-lg hover:bg-opacity-90 transition text-sm"
                >
                  Load
                </Link>
                {deleteConfirm === build.id ? (
                  <>
                    <button
                      onClick={() => handleDelete(build.id)}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition text-sm"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition text-sm"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(build.id)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

