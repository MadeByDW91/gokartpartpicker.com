'use client'

import { useState } from 'react'
import type { Engine, Part } from '@prisma/client'
import type { PartWithOffer } from '@/lib/calculations'

interface InstallChecklistProps {
  engine: Engine | null
  parts: PartWithOffer[]
}

export default function InstallChecklist({ engine, parts }: InstallChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())

  if (!engine || parts.length === 0) {
    return null
  }

  // Group parts by category
  const partsByCategory: Record<string, PartWithOffer[]> = {}
  for (const part of parts) {
    const category = part.category || 'other'
    if (!partsByCategory[category]) {
      partsByCategory[category] = []
    }
    partsByCategory[category].push(part)
  }

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleCopy = () => {
    const checklistText = generateChecklistText()
    navigator.clipboard.writeText(checklistText)
    alert('Checklist copied to clipboard!')
  }

  const handlePrint = () => {
    window.print()
  }

  const generateChecklistText = () => {
    let text = `Installation Checklist for ${engine.name}\n`
    text += `Generated: ${new Date().toLocaleDateString()}\n\n`

    for (const [category, categoryParts] of Object.entries(partsByCategory)) {
      text += `${category.toUpperCase().replace('_', ' ')}\n`
      for (const part of categoryParts) {
        text += `[ ] ${part.name}\n`
      }
      text += '\n'
    }

    return text
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 print:shadow-none">
      <div className="flex justify-between items-center mb-4 print:hidden">
        <h2 className="text-2xl font-heading">Installation Checklist</h2>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm"
          >
            Copy
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm"
          >
            Print
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(partsByCategory).map(([category, categoryParts]) => (
          <div key={category} className="print:break-inside-avoid">
            <h3 className="font-semibold text-lg mb-3 capitalize">
              {category.replace('_', ' ')}
            </h3>
            <div className="space-y-2">
              {categoryParts.map((part) => {
                const itemId = `checklist-${part.id}`
                const isChecked = checkedItems.has(itemId)
                return (
                  <label
                    key={part.id}
                    className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCheck(itemId)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{part.name}</p>
                      {part.selectedOffer && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {part.selectedOffer.vendor.name} - $
                          {(part.selectedOffer.priceUsd + part.selectedOffer.shippingUsd).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @media print {
          .print\\:hidden {
            display: none;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
          .print\\:shadow-none {
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  )
}

