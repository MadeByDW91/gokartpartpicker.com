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

  useEffect(() => {
    fetch('/api/engines')
      .then((res) => res.json())
      .then((data) => setEngines(data))
  }, [])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    const params = new URLSearchParams(searchParams.toString())
    if (category) {
      params.set('category', category)
    } else {
      params.delete('category')
    }
    router.push(`/parts?${params.toString()}`)
  }

  const handleEngineChange = (engineId: string) => {
    setSelectedEngine(engineId)
    const params = new URLSearchParams(searchParams.toString())
    if (engineId) {
      params.set('engineId', engineId)
    } else {
      params.delete('engineId')
    }
    router.push(`/parts?${params.toString()}`)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
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
            onChange={(e) => handleEngineChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
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
    </div>
  )
}

