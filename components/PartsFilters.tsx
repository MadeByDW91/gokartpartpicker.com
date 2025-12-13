'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'intake', label: 'Intake' },
  { value: 'exhaust', label: 'Exhaust' },
  { value: 'springs', label: 'Valve Springs' },
  { value: 'cam', label: 'Camshaft' },
  { value: 'flywheel', label: 'Flywheel' },
  { value: 'rod', label: 'Connecting Rod' },
  { value: 'governor_delete', label: 'Governor Delete' },
  { value: 'oil_sensor_delete', label: 'Oil Sensor Delete' },
  { value: 'torque_converter', label: 'Torque Converter' },
]

export default function PartsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [engines, setEngines] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [selectedEngine, setSelectedEngine] = useState(searchParams.get('engineId') || '')
  const [minHp, setMinHp] = useState(searchParams.get('minHp') || '')
  const [maxHp, setMaxHp] = useState(searchParams.get('maxHp') || '')
  const [minRpm, setMinRpm] = useState(searchParams.get('minRpm') || '')
  const [maxBudget, setMaxBudget] = useState(searchParams.get('maxBudget') || '')
  const [beginnerSafe, setBeginnerSafe] = useState(searchParams.get('beginnerSafe') === 'true')
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    fetch('/api/engines')
      .then((res) => res.json())
      .then((data) => setEngines(data))
  }, [])

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    }
    router.push(`/parts?${params.toString()}`)
  }

  const handleReset = () => {
    setSelectedCategory('')
    setSelectedEngine('')
    setMinHp('')
    setMaxHp('')
    setMinRpm('')
    setMaxBudget('')
    setBeginnerSafe(false)
    router.push('/parts')
  }

  const activeFilters = [
    selectedCategory && { key: 'category', label: `Category: ${categories.find(c => c.value === selectedCategory)?.label}` },
    selectedEngine && { key: 'engine', label: `Engine: ${engines.find(e => e.id === selectedEngine)?.name}` },
    minHp && { key: 'minHp', label: `Min HP: ${minHp}` },
    maxHp && { key: 'maxHp', label: `Max HP: ${maxHp}` },
    minRpm && { key: 'minRpm', label: `Min RPM: ${minRpm}` },
    maxBudget && { key: 'maxBudget', label: `Max Budget: $${maxBudget}` },
    beginnerSafe && { key: 'beginnerSafe', label: 'Beginner Safe' },
  ].filter(Boolean) as Array<{ key: string; label: string }>

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value)
              updateParams({ category: e.target.value || null })
            }}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Engine</label>
          <select
            value={selectedEngine}
            onChange={(e) => {
              setSelectedEngine(e.target.value)
              updateParams({ engineId: e.target.value || null })
            }}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">All Engines</option>
            {engines.map((engine) => (
              <option key={engine.id} value={engine.id}>
                {engine.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-garage-orange hover:underline"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
        </button>
        {activeFilters.length > 0 && (
          <button
            onClick={handleReset}
            className="text-sm text-red-600 hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {showAdvanced && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-sm font-semibold mb-2">Min HP Gain</label>
            <input
              type="number"
              value={minHp}
              onChange={(e) => {
                setMinHp(e.target.value)
                updateParams({ minHp: e.target.value || null })
              }}
              placeholder="0"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Max HP Gain</label>
            <input
              type="number"
              value={maxHp}
              onChange={(e) => {
                setMaxHp(e.target.value)
                updateParams({ maxHp: e.target.value || null })
              }}
              placeholder="100"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Min RPM Delta</label>
            <input
              type="number"
              value={minRpm}
              onChange={(e) => {
                setMinRpm(e.target.value)
                updateParams({ minRpm: e.target.value || null })
              }}
              placeholder="0"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Max Budget ($)</label>
            <input
              type="number"
              value={maxBudget}
              onChange={(e) => {
                setMaxBudget(e.target.value)
                updateParams({ maxBudget: e.target.value || null })
              }}
              placeholder="No limit"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      )}

      {showAdvanced && (
        <div className="mb-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={beginnerSafe}
              onChange={(e) => {
                setBeginnerSafe(e.target.checked)
                updateParams({ beginnerSafe: e.target.checked ? 'true' : null })
              }}
              className="rounded"
            />
            <span className="text-sm">Beginner Safe (Low risk, easy install)</span>
          </label>
        </div>
      )}

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
          {activeFilters.map((filter) => (
            <span
              key={filter.key}
              className="px-3 py-1 bg-garage-orange text-white rounded-full text-xs"
            >
              {filter.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

