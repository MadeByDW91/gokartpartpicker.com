'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Fuse from 'fuse.js'
import { useRouter } from 'next/navigation'

interface SearchResult {
  type: 'engine' | 'part' | 'guide'
  id: string
  slug: string
  name: string
  description?: string
}

interface SmartSearchProps {
  onClose?: () => void
}

export default function SmartSearch({ onClose }: SmartSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [searchIndex, setSearchIndex] = useState<Fuse<SearchResult> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Load search index on mount
  useEffect(() => {
    loadSearchIndex()
  }, [])

  // Keyboard shortcut: / to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isOpen && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        setIsOpen(true)
        setTimeout(() => inputRef.current?.focus(), 0)
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        setQuery('')
        setResults([])
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const loadSearchIndex = async () => {
    try {
      // Fetch all searchable data
      const [enginesRes, partsRes, guidesRes] = await Promise.all([
        fetch('/api/engines'),
        fetch('/api/parts'),
        fetch('/api/guides'),
      ])

      const engines = await enginesRes.json()
      const parts = await partsRes.json()
      const guides = await guidesRes.json()

      // Combine into searchable format
      const searchData: SearchResult[] = [
        ...engines.map((e: any) => ({
          type: 'engine' as const,
          id: e.id,
          slug: e.slug,
          name: e.name,
          description: e.description,
        })),
        ...parts.map((p: any) => ({
          type: 'part' as const,
          id: p.id,
          slug: p.slug,
          name: p.name,
          description: p.description,
        })),
        ...guides.map((g: any) => ({
          type: 'guide' as const,
          id: g.id,
          slug: g.slug,
          name: g.title,
          description: g.description,
        })),
      ]

      // Create Fuse.js index
      const fuse = new Fuse(searchData, {
        keys: ['name', 'description'],
        threshold: 0.4, // Typo tolerance (0 = exact match, 1 = match anything)
        includeScore: true,
        minMatchCharLength: 2,
      })

      setSearchIndex(fuse)
    } catch (error) {
      console.error('Failed to load search index:', error)
    }
  }

  const handleSearch = (value: string) => {
    setQuery(value)
    if (!value.trim() || !searchIndex) {
      setResults([])
      return
    }

    setLoading(true)
    const fuseResults = searchIndex.search(value)
    const limitedResults = fuseResults.slice(0, 8).map((result) => result.item)
    setResults(limitedResults)
    setLoading(false)
  }

  const handleSelect = (result: SearchResult) => {
    let path = ''
    if (result.type === 'engine') path = `/engines/${result.slug}`
    else if (result.type === 'part') path = `/parts/${result.slug}`
    else if (result.type === 'guide') path = `/guides/${result.slug}`

    router.push(path)
    setIsOpen(false)
    setQuery('')
    setResults([])
    onClose?.()
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center gap-2"
      >
        <span>🔍</span>
        <span className="hidden sm:inline">Search</span>
        <span className="hidden sm:inline text-xs text-gray-400">/</span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-xl">🔍</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search engines, parts, guides... (typo tolerant)"
              className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-garage-orange"
              autoFocus
            />
            <button
              onClick={() => {
                setIsOpen(false)
                setQuery('')
                setResults([])
                onClose?.()
              }}
              className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ESC
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Searching...</div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSelect(result)}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-sm font-semibold text-garage-orange capitalize">
                      {result.type}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {result.name}
                      </p>
                      {result.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mt-1">
                          {result.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="text-center py-8 text-gray-500">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Start typing to search... (Press / to open, ESC to close)
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

