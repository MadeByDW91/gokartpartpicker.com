'use client'

import { useState } from 'react'
import type { Part } from '@prisma/client'

interface WhyThisPartTooltipProps {
  part: Part
  children: React.ReactNode
}

export default function WhyThisPartTooltip({ part, children }: WhyThisPartTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Generate "why" content from part metadata
  const getWhyContent = () => {
    const bullets: string[] = []

    // What it does
    if (part.description) {
      bullets.push(part.description)
    } else {
      bullets.push(`Enhances ${part.category.replace('_', ' ')} performance`)
    }

    // When needed
    if (part.hpGainMin > 0 || part.hpGainMax > 0) {
      bullets.push(`Adds ${part.hpGainMin}-${part.hpGainMax} HP when installed`)
    }
    if (part.rpmLimitDelta > 0) {
      bullets.push(`Increases safe RPM limit by ${part.rpmLimitDelta} RPM`)
    }

    // Dependencies (from category)
    const categoryDeps: Record<string, string> = {
      'valvetrain': 'May require billet flywheel for high RPM',
      'ignition': 'Works with stock or upgraded ignition systems',
      'intake': 'Compatible with stock or aftermarket carbs',
      'exhaust': 'Pairs well with intake upgrades',
    }
    if (categoryDeps[part.category]) {
      bullets.push(categoryDeps[part.category])
    }

    return bullets
  }

  const whyContent = getWhyContent()

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-help"
      >
        {children}
      </div>
      {isOpen && (
        <div className="absolute z-50 bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg shadow-xl">
          <div className="font-semibold mb-2">Why {part.name}?</div>
          <ul className="space-y-1 list-disc list-inside">
            {whyContent.map((bullet, idx) => (
              <li key={idx} className="text-xs">
                {bullet}
              </li>
            ))}
          </ul>
          <div className="absolute bottom-0 left-4 transform translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
        </div>
      )}
    </div>
  )
}

