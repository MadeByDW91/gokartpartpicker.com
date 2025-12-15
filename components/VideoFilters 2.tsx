'use client'

import { useRouter } from 'next/navigation'
import { FormEvent } from 'react'

interface Engine {
  id: string
  slug: string
  name: string
}

interface VideoFiltersProps {
  currentCategory?: string
  currentEngine?: string
  currentSearch?: string
  engines: Engine[]
}

export default function VideoFilters({
  currentCategory,
  currentEngine,
  currentSearch,
  engines,
}: VideoFiltersProps) {
  const router = useRouter()

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(window.location.search)
    if (category === 'ALL') {
      params.delete('category')
    } else {
      params.set('category', category)
    }
    router.push(`/videos?${params.toString()}`)
  }

  const handleEngineChange = (engine: string) => {
    const params = new URLSearchParams(window.location.search)
    if (engine === 'ALL') {
      params.delete('engine')
    } else {
      params.set('engine', engine)
    }
    router.push(`/videos?${params.toString()}`)
  }

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const search = formData.get('search') as string
    const params = new URLSearchParams(window.location.search)
    if (search) {
      params.set('search', search)
    } else {
      params.delete('search')
    }
    router.push(`/videos?${params.toString()}`)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
      <div className="grid md:grid-cols-3 gap-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-semibold text-garage-dark dark:text-gray-200 mb-2">
            Category
          </label>
          <select
            value={currentCategory || 'ALL'}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-garage-dark dark:text-gray-200"
          >
            <option value="ALL">All Categories</option>
            <option value="INSTALL">Install</option>
            <option value="TUNING">Tuning</option>
            <option value="TEARDOWN">Teardown</option>
            <option value="SAFETY">Safety</option>
          </select>
        </div>

        {/* Engine Filter */}
        <div>
          <label className="block text-sm font-semibold text-garage-dark dark:text-gray-200 mb-2">
            Engine
          </label>
          <select
            value={currentEngine || 'ALL'}
            onChange={(e) => handleEngineChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-garage-dark dark:text-gray-200"
          >
            <option value="ALL">All Engines</option>
            {engines.map((engine) => (
              <option key={engine.id} value={engine.slug}>
                {engine.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="block text-sm font-semibold text-garage-dark dark:text-gray-200 mb-2">
            Search
          </label>
          <form onSubmit={handleSearch}>
            <input
              type="text"
              name="search"
              defaultValue={currentSearch || ''}
              placeholder="Search videos..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-garage-dark dark:text-gray-200"
            />
          </form>
        </div>
      </div>
    </div>
  )
}

