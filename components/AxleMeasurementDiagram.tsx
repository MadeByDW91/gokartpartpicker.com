'use client'

interface AxleMeasurementDiagramProps {
  diameter: number
  length: number
  keywayWidth: number
  units: 'in' | 'mm'
}

export default function AxleMeasurementDiagram({
  diameter,
  length,
  keywayWidth,
  units,
}: AxleMeasurementDiagramProps) {
  // Scale for visualization (keep proportions reasonable)
  const scale = 2
  const svgWidth = 400
  const svgHeight = 200
  const axleLength = Math.min(length * scale, 300) // Cap at 300px
  const axleDiameter = Math.max(diameter * scale * 10, 20) // Min 20px for visibility
  const keywayWidthPx = keywayWidth * scale * 10

  const centerY = svgHeight / 2
  const startX = 50
  const endX = startX + axleLength

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-heading font-semibold text-garage-dark dark:text-gray-100 mb-3">
        Measurement Guide
      </h3>
      <svg width={svgWidth} height={svgHeight} className="w-full max-w-full h-auto">
        {/* Axle Body */}
        <rect
          x={startX}
          y={centerY - axleDiameter / 2}
          width={axleLength}
          height={axleDiameter}
          fill="#4B5563"
          stroke="#1F2937"
          strokeWidth="2"
        />

        {/* Keyway */}
        <rect
          x={startX + 10}
          y={centerY - axleDiameter / 2}
          width={keywayWidthPx}
          height={axleDiameter / 4}
          fill="#FBBF24"
          stroke="#F59E0B"
          strokeWidth="1"
        />

        {/* Diameter Measurement Line */}
        <line
          x1={startX - 20}
          y1={centerY - axleDiameter / 2}
          x2={startX - 20}
          y2={centerY + axleDiameter / 2}
          stroke="#EF4444"
          strokeWidth="2"
          strokeDasharray="4,4"
        />
        <text
          x={startX - 25}
          y={centerY}
          fill="#EF4444"
          fontSize="12"
          textAnchor="end"
          dominantBaseline="middle"
          className="font-semibold"
        >
          {diameter.toFixed(3)}
          {units === 'in' ? '"' : 'mm'}
        </text>
        <text
          x={startX - 25}
          y={centerY + 15}
          fill="#6B7280"
          fontSize="10"
          textAnchor="end"
        >
          Diameter
        </text>

        {/* Length Measurement Line */}
        <line
          x1={startX}
          y1={centerY + axleDiameter / 2 + 20}
          x2={endX}
          y2={centerY + axleDiameter / 2 + 20}
          stroke="#3B82F6"
          strokeWidth="2"
          strokeDasharray="4,4"
        />
        <text
          x={(startX + endX) / 2}
          y={centerY + axleDiameter / 2 + 35}
          fill="#3B82F6"
          fontSize="12"
          textAnchor="middle"
          className="font-semibold"
        >
          {length.toFixed(1)}
          {units === 'in' ? '"' : 'mm'}
        </text>
        <text
          x={(startX + endX) / 2}
          y={centerY + axleDiameter / 2 + 50}
          fill="#6B7280"
          fontSize="10"
          textAnchor="middle"
        >
          Length
        </text>

        {/* Keyway Width Measurement */}
        <line
          x1={startX + 10}
          y1={centerY - axleDiameter / 2 - 20}
          x2={startX + 10 + keywayWidthPx}
          y2={centerY - axleDiameter / 2 - 20}
          stroke="#10B981"
          strokeWidth="2"
          strokeDasharray="4,4"
        />
        <text
          x={startX + 10 + keywayWidthPx / 2}
          y={centerY - axleDiameter / 2 - 25}
          fill="#10B981"
          fontSize="12"
          textAnchor="middle"
          className="font-semibold"
        >
          {keywayWidth.toFixed(3)}
          {units === 'in' ? '"' : 'mm'}
        </text>
        <text
          x={startX + 10 + keywayWidthPx / 2}
          y={centerY - axleDiameter / 2 - 40}
          fill="#6B7280"
          fontSize="10"
          textAnchor="middle"
        >
          Keyway Width
        </text>

        {/* Tooltips */}
        <circle
          cx={startX - 20}
          cy={centerY - axleDiameter / 2}
          r="4"
          fill="#EF4444"
          className="cursor-help"
        >
          <title>Measure diameter here (center of axle)</title>
        </circle>
        <circle
          cx={startX + 10 + keywayWidthPx / 2}
          cy={centerY - axleDiameter / 2}
          r="4"
          fill="#10B981"
          className="cursor-help"
        >
          <title>Measure keyway width at bottom (narrowest point)</title>
        </circle>
      </svg>
      <p className="text-xs text-garage-gray dark:text-gray-400 mt-2 text-center">
        Hover over colored dots for measurement tips
      </p>
    </div>
  )
}

