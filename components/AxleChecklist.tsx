'use client'

import { GroupedResults } from '@/lib/axleCompatibility'

interface AxleChecklistProps {
  results: GroupedResults
}

export default function AxleChecklist({ results }: AxleChecklistProps) {
  const checklist: {
    category: string
    label: string
    items: string[]
    required: boolean
  }[] = []

  // Bearings (typically need 2)
  if (results.BEARING) {
    const fits = results.BEARING.filter((r) => r.status === 'FITS')
    if (fits.length > 0) {
      checklist.push({
        category: 'BEARING',
        label: 'Bearings',
        items: fits.map((r) => r.axlePart.name),
        required: true,
      })
    }
  }

  // Hubs
  const hubItems: string[] = []
  if (results.HUB) {
    const fits = results.HUB.filter((r) => r.status === 'FITS')
    hubItems.push(...fits.map((r) => r.axlePart.name))
  }
  if (hubItems.length > 0) {
    checklist.push({
      category: 'HUB',
      label: 'Hubs',
      items: hubItems,
      required: true,
    })
  }

  // Brake System
  const brakeItems: string[] = []
  if (results.BRAKE_ROTOR) {
    const fits = results.BRAKE_ROTOR.filter((r) => r.status === 'FITS')
    brakeItems.push(...fits.map((r) => `Rotor: ${r.axlePart.name}`))
  }
  if (results.BRAKE_CALIPER) {
    const fits = results.BRAKE_CALIPER.filter((r) => r.status === 'FITS')
    brakeItems.push(...fits.map((r) => `Caliper: ${r.axlePart.name}`))
  }
  if (brakeItems.length > 0) {
    checklist.push({
      category: 'BRAKE',
      label: 'Brake System',
      items: brakeItems,
      required: false,
    })
  }

  // Sprocket + Chain
  if (results.SPROCKET) {
    const fits = results.SPROCKET.filter((r) => r.status === 'FITS')
    if (fits.length > 0) {
      checklist.push({
        category: 'SPROCKET',
        label: 'Sprocket & Chain',
        items: fits.map((r) => r.axlePart.name),
        required: true,
      })
    }
  }

  // Wheels/Tires
  if (results.WHEEL) {
    const fits = results.WHEEL.filter((r) => r.status === 'FITS')
    if (fits.length > 0) {
      checklist.push({
        category: 'WHEEL',
        label: 'Wheels/Tires',
        items: fits.map((r) => r.axlePart.name),
        required: true,
      })
    }
  }

  // Hardware
  const hardwareItems: string[] = []
  if (results.HARDWARE) {
    const fits = results.HARDWARE.filter((r) => r.status === 'FITS')
    hardwareItems.push(...fits.map((r) => r.axlePart.name))
  }
  // Always suggest key stock
  hardwareItems.push('Key Stock (matching keyway width)')
  hardwareItems.push('Shaft Collars / Spacers')
  hardwareItems.push('Set Screws (if needed)')

  if (hardwareItems.length > 0) {
    checklist.push({
      category: 'HARDWARE',
      label: 'Hardware & Accessories',
      items: hardwareItems,
      required: true,
    })
  }

  if (checklist.length === 0) {
    return null
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
      <h3 className="text-xl font-heading font-bold text-garage-dark dark:text-gray-100 mb-4">
        What You Still Need
      </h3>
      <p className="text-sm text-garage-gray dark:text-gray-400 mb-4">
        Based on your axle specifications, here&apos;s a checklist of compatible parts you&apos;ll need:
      </p>
      <div className="space-y-4">
        {checklist.map((section) => (
          <div key={section.category} className="border-l-4 border-garage-orange pl-4">
            <h4 className="font-heading font-semibold text-garage-dark dark:text-gray-100 mb-2">
              {section.label}
              {section.required && (
                <span className="text-xs text-red-500 ml-2">(Required)</span>
              )}
            </h4>
            <ul className="space-y-1">
              {section.items.map((item, idx) => (
                <li key={idx} className="text-sm text-garage-gray dark:text-gray-400 flex items-center gap-2">
                  <span className="text-garage-orange">▢</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
        <p className="text-xs text-garage-gray dark:text-gray-400">
          <strong>Tip:</strong> This checklist can be integrated with your build planner later to track your complete
          go-kart build.
        </p>
      </div>
    </div>
  )
}

