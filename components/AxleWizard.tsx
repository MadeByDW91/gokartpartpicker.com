'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AxleMeasurementDiagram from './AxleMeasurementDiagram'

export interface AxleInput {
  type: 'LIVE' | 'DEAD'
  diameter: number
  length: number
  keywayWidth: number
  keywayHeight?: number
  threadedEnds?: boolean
  threadSize?: string
  notes?: string
  units: 'in' | 'mm'
}

export default function AxleWizard() {
  const router = useRouter()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [units, setUnits] = useState<'in' | 'mm'>('in')
  const [formData, setFormData] = useState<AxleInput>({
    type: 'LIVE',
    diameter: 1,
    length: 36,
    keywayWidth: 0.25,
    units: 'in',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Convert to inches if needed
    let diameter = formData.diameter
    let length = formData.length
    let keywayWidth = formData.keywayWidth
    let keywayHeight = formData.keywayHeight

    if (units === 'mm') {
      diameter = diameter / 25.4
      length = length / 25.4
      keywayWidth = keywayWidth / 25.4
      if (keywayHeight) {
        keywayHeight = keywayHeight / 25.4
      }
    }

    // Build query params
    const params = new URLSearchParams({
      type: formData.type,
      diameter: diameter.toString(),
      length: length.toString(),
      keywayWidth: keywayWidth.toString(),
    })

    if (keywayHeight) {
      params.append('keywayHeight', keywayHeight.toString())
    }
    if (formData.threadedEnds) {
      params.append('threadedEnds', 'true')
      if (formData.threadSize) {
        params.append('threadSize', formData.threadSize)
      }
    }
    if (formData.notes) {
      params.append('notes', formData.notes)
    }

    router.push(`/axles/live?${params.toString()}`)
  }

  const updateField = (field: keyof AxleInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const commonDiameters = [0.75, 1, 1.25]
  const commonKeywayWidths = [0.1875, 0.25, 0.3125, 0.375]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8">
      <h2 className="text-2xl font-heading font-bold text-garage-dark dark:text-gray-100 mb-6">
        Axle Compatibility Wizard
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Units Toggle */}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm font-semibold text-garage-gray dark:text-gray-400">Units:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setUnits('in')}
              className={`px-4 py-2 rounded-lg font-heading text-sm transition ${
                units === 'in'
                  ? 'bg-garage-orange text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Inches
            </button>
            <button
              type="button"
              onClick={() => setUnits('mm')}
              className={`px-4 py-2 rounded-lg font-heading text-sm transition ${
                units === 'mm'
                  ? 'bg-garage-orange text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Millimeters
            </button>
          </div>
        </div>

        {/* Axle Type (Fixed to LIVE for v1) */}
        <div>
          <label className="block text-sm font-semibold text-garage-dark dark:text-gray-100 mb-2">
            Axle Type <span className="text-red-500">*</span>
          </label>
          <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-lg">
            <span className="text-garage-gray dark:text-gray-300">Live Axle (v1 only)</span>
          </div>
        </div>

        {/* Axle Diameter */}
        <div>
          <label className="block text-sm font-semibold text-garage-dark dark:text-gray-100 mb-2">
            Axle Diameter <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <select
              value={formData.diameter}
              onChange={(e) => updateField('diameter', parseFloat(e.target.value))}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-garage-dark dark:text-gray-100"
            >
              {commonDiameters.map((d) => (
                <option key={d} value={d}>
                  {d}&quot; ({d * 25.4}mm)
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              value={formData.diameter}
              onChange={(e) => updateField('diameter', parseFloat(e.target.value) || 0)}
              placeholder="Custom"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-garage-dark dark:text-gray-100"
            />
          </div>
          <p className="text-xs text-garage-gray dark:text-gray-400 mt-1">
            Common sizes: 3/4&quot;, 1&quot;, 1-1/4&quot;
          </p>
        </div>

        {/* Axle Length */}
        <div>
          <label className="block text-sm font-semibold text-garage-dark dark:text-gray-100 mb-2">
            Axle Length <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.length}
            onChange={(e) => updateField('length', parseFloat(e.target.value) || 0)}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-garage-dark dark:text-gray-100"
            placeholder={units === 'in' ? '36' : '914'}
          />
          <p className="text-xs text-garage-gray dark:text-gray-400 mt-1">
            Measure from end to end in {units === 'in' ? 'inches' : 'millimeters'}
          </p>
        </div>

        {/* Keyway Width */}
        <div>
          <label className="block text-sm font-semibold text-garage-dark dark:text-gray-100 mb-2">
            Keyway Width <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <select
              value={formData.keywayWidth}
              onChange={(e) => updateField('keywayWidth', parseFloat(e.target.value))}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-garage-dark dark:text-gray-100"
            >
              {commonKeywayWidths.map((kw) => (
                <option key={kw} value={kw}>
                  {kw}&quot; ({kw * 25.4}mm)
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.001"
              value={formData.keywayWidth}
              onChange={(e) => updateField('keywayWidth', parseFloat(e.target.value) || 0)}
              placeholder="Custom"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-garage-dark dark:text-gray-100"
            />
          </div>
          <p className="text-xs text-garage-gray dark:text-gray-400 mt-1">
            Common sizes: 3/16&quot;, 1/4&quot;, 5/16&quot;, 3/8&quot;
          </p>
        </div>

        {/* Keyway Height (Optional) */}
        <div>
          <label className="block text-sm font-semibold text-garage-dark dark:text-gray-100 mb-2">
            Keyway Height (Optional)
          </label>
          <input
            type="number"
            step="0.001"
            value={formData.keywayHeight || ''}
            onChange={(e) => updateField('keywayHeight', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-garage-dark dark:text-gray-100"
            placeholder={units === 'in' ? '0.125' : '3.175'}
          />
        </div>

        {/* Advanced Options Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-garage-orange hover:underline font-semibold"
          >
            {showAdvanced ? '▼' : '▶'} Advanced Options
          </button>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="space-y-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
            <div>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={formData.threadedEnds || false}
                  onChange={(e) => updateField('threadedEnds', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold text-garage-dark dark:text-gray-100">
                  Threaded Ends
                </span>
              </label>
              {formData.threadedEnds && (
                <input
                  type="text"
                  value={formData.threadSize || ''}
                  onChange={(e) => updateField('threadSize', e.target.value)}
                  placeholder="e.g., 5/8-18, M16x1.5"
                  className="w-full mt-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-garage-dark dark:text-gray-100"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-garage-dark dark:text-gray-100 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Cart model, old part numbers, special requirements..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-garage-dark dark:text-gray-100"
              />
            </div>
          </div>
        )}

        {/* Measurement Diagram */}
        <div className="mt-6">
          <AxleMeasurementDiagram
            diameter={formData.diameter}
            length={formData.length}
            keywayWidth={formData.keywayWidth}
            units={units}
          />
        </div>

        {/* Common Mistakes Callout */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h3 className="text-sm font-heading font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            ⚠️ Common Measurement Mistakes
          </h3>
          <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
            <li>Don&apos;t measure keyway width at the top - measure at the bottom where it&apos;s parallel</li>
            <li>Measure axle diameter at the center, not at the ends (which may be threaded or tapered)</li>
            <li>For keyway width, use calipers to measure the narrowest point</li>
          </ul>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-garage-orange text-white px-6 py-3 rounded-lg font-heading text-lg hover:bg-opacity-90 transition shadow-lg"
        >
          Find Compatible Parts
        </button>
      </form>
    </div>
  )
}

