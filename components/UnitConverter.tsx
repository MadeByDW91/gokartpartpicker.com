'use client'

import { useState, useRef, useEffect } from 'react'

interface UnitConverterProps {
  value: number
  unit: 'ft-lb' | 'Nm' | 'mm' | 'in' | 'oz' | 'g'
  className?: string
  children?: React.ReactNode
}

export default function UnitConverter({ value, unit, className = '', children }: UnitConverterProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const tooltipRef = useRef<HTMLSpanElement>(null)

  const conversions: Record<string, { label: string; value: number }> = {
    'ft-lb': { label: 'Nm', value: value * 1.35582 },
    'Nm': { label: 'ft-lb', value: value * 0.737562 },
    'mm': { label: 'in', value: value / 25.4 },
    'in': { label: 'mm', value: value * 25.4 },
    'oz': { label: 'g', value: value * 28.3495 },
    'g': { label: 'oz', value: value / 28.3495 },
  }

  const conversion = conversions[unit]
  if (!conversion) {
    return children ? <>{children}</> : <span className={className}>{value} {unit}</span>
  }

  return (
    <span
      className={`relative inline-block cursor-help ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children || `${value} ${unit}`}
      {showTooltip && (
        <span
          ref={tooltipRef}
          className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded shadow-lg z-50 whitespace-nowrap"
        >
          ≈ {conversion.value.toFixed(2)} {conversion.label}
        </span>
      )}
    </span>
  )
}

