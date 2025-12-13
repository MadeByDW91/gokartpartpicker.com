'use client'

import type { Engine, Part } from '@prisma/client'
import type { PartWithOffer } from '@/lib/calculations'

interface CompatibilityRule {
  id: string
  type: 'requires' | 'conflicts' | 'recommends' | 'warns'
  severity: 'info' | 'warn' | 'danger'
  condition: {
    partIds?: string[]
    categories?: string[]
    engineIds?: string[]
  }
  message: string
  action?: {
    type: 'add_part' | 'remove_part' | 'show_guide'
    data: any
  }
}

interface CompatibilityWarningsProps {
  engine: Engine | null
  parts: PartWithOffer[]
}

// Define compatibility rules (data-driven, easy to extend)
const compatibilityRules: CompatibilityRule[] = [
  {
    id: 'billet-flywheel-required',
    type: 'requires',
    severity: 'danger',
    condition: {
      categories: ['22lb-valve-springs', '18lb-valve-springs'],
    },
    message: 'Billet flywheel required for high-RPM valve springs',
    action: {
      type: 'add_part',
      data: { category: 'flywheel', filter: 'billet' },
    },
  },
  {
    id: 'governor-removal-recommended',
    type: 'recommends',
    severity: 'warn',
    condition: {
      categories: ['stage-2-cam', 'high-compression-head'],
    },
    message: 'Governor removal recommended for performance mods',
  },
  {
    id: 'carb-tuning-needed',
    type: 'warns',
    severity: 'info',
    condition: {
      categories: ['header-exhaust', 'stage-1-air-filter'],
    },
    message: 'Consider carburetor tuning for optimal performance',
  },
]

export default function CompatibilityWarnings({ engine, parts }: CompatibilityWarningsProps) {
  const warnings: CompatibilityRule[] = []

  // Evaluate rules
  for (const rule of compatibilityRules) {
    let matches = false

    // Check part categories
    if (rule.condition.categories) {
      const partCategories = parts.map((p) => p.category)
      matches = rule.condition.categories.some((cat) => partCategories.includes(cat))
    }

    // Check specific part IDs
    if (rule.condition.partIds) {
      const partIds = parts.map((p) => p.id)
      matches = rule.condition.partIds.some((id) => partIds.includes(id))
    }

    // Check engine IDs
    if (rule.condition.engineIds && engine) {
      matches = rule.condition.engineIds.includes(engine.id)
    }

    if (matches) {
      warnings.push(rule)
    }
  }

  if (warnings.length === 0) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-2xl font-heading mb-4">Compatibility Warnings</h2>
      <div className="space-y-3">
        {warnings.map((warning) => {
          const bgColor =
            warning.severity === 'danger'
              ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
              : warning.severity === 'warn'
                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'

          const textColor =
            warning.severity === 'danger'
              ? 'text-red-800 dark:text-red-200'
              : warning.severity === 'warn'
                ? 'text-yellow-800 dark:text-yellow-200'
                : 'text-blue-800 dark:text-blue-200'

          const icon =
            warning.severity === 'danger' ? '🚨' : warning.severity === 'warn' ? '⚠️' : 'ℹ️'

          return (
            <div key={warning.id} className={`p-4 rounded border ${bgColor}`}>
              <p className={`${textColor} flex items-start gap-2`}>
                <span>{icon}</span>
                <span className="flex-1">{warning.message}</span>
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

