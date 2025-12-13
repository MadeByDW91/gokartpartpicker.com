'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-heading font-bold text-garage-dark mb-8">Search</h1>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search engines, parts, guides..."
            className="flex-1 p-3 border border-gray-300 rounded-lg"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-garage-orange text-white px-8 py-3 rounded-lg font-heading hover:bg-opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {results && (
        <div className="space-y-8">
          {results.engines.length > 0 && (
            <div>
              <h2 className="text-2xl font-heading mb-4">Engines ({results.engines.length})</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {results.engines.map((engine: any) => (
                  <Link
                    key={engine.id}
                    href={`/engines/${engine.slug}`}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition"
                  >
                    <h3 className="text-xl font-heading mb-2">{engine.name}</h3>
                    <p className="text-garage-gray text-sm line-clamp-2">{engine.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.parts.length > 0 && (
            <div>
              <h2 className="text-2xl font-heading mb-4">Parts ({results.parts.length})</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {results.parts.map((part: any) => (
                  <Link
                    key={part.id}
                    href={`/parts/${part.slug}`}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition"
                  >
                    <h3 className="text-xl font-heading mb-2">{part.name}</h3>
                    <p className="text-garage-gray text-sm line-clamp-2">{part.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.guides.length > 0 && (
            <div>
              <h2 className="text-2xl font-heading mb-4">Guides ({results.guides.length})</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {results.guides.map((guide: any) => (
                  <Link
                    key={guide.id}
                    href={`/guides/${guide.slug}`}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition"
                  >
                    <h3 className="text-xl font-heading mb-2">{guide.title}</h3>
                    <p className="text-garage-gray text-sm line-clamp-2">{guide.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.engines.length === 0 && results.parts.length === 0 && results.guides.length === 0 && (
            <div className="text-center py-12 text-garage-gray">
              No results found for &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  )
}

