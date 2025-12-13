'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Engine } from '@prisma/client'
import { useBuildStore } from '@/lib/buildStore'
import Link from 'next/link'

interface TimingKey {
  degrees: number
  label: string
  hpGainMin: number
  hpGainMax: number
  riskDelta: number
  requiresBilletFlywheel: boolean
  requiresBilletRod: boolean
}

const TIMING_KEYS: TimingKey[] = [
  {
    degrees: 0,
    label: '0° (Stock)',
    hpGainMin: 0,
    hpGainMax: 0,
    riskDelta: 0,
    requiresBilletFlywheel: false,
    requiresBilletRod: false,
  },
  {
    degrees: 2,
    label: '2° Key',
    hpGainMin: 0.3,
    hpGainMax: 0.8,
    riskDelta: 0.5,
    requiresBilletFlywheel: false,
    requiresBilletRod: false,
  },
  {
    degrees: 4,
    label: '4° Key',
    hpGainMin: 0.5,
    hpGainMax: 1.2,
    riskDelta: 1,
    requiresBilletFlywheel: true,
    requiresBilletRod: false,
  },
  {
    degrees: 6,
    label: '6° Key',
    hpGainMin: 0.8,
    hpGainMax: 1.5,
    riskDelta: 1.5,
    requiresBilletFlywheel: true,
    requiresBilletRod: true,
  },
]

interface IgnitionTimingCalculatorProps {
  engines: Engine[]
}

export default function IgnitionTimingCalculator({ engines }: IgnitionTimingCalculatorProps) {
  const router = useRouter()
  const buildEngine = useBuildStore((state) => state.engine)
  const buildParts = useBuildStore((state) => state.parts)
  const addPart = useBuildStore((state) => state.addPart)

  const [selectedEngineId, setSelectedEngineId] = useState<string>(
    buildEngine?.id || engines[0]?.id || '',
  )
  const [baseTiming, setBaseTiming] = useState<number>(0)
  const [selectedKeyDegrees, setSelectedKeyDegrees] = useState<number>(0)
  const [rpmTarget, setRpmTarget] = useState<number>(0)

  const selectedEngine = engines.find((e) => e.id === selectedEngineId)
  const selectedKey = TIMING_KEYS.find((k) => k.degrees === selectedKeyDegrees)!

  // Initialize base timing from engine or build
  useEffect(() => {
    if (selectedEngine?.stockTimingDegBtdc !== null && selectedEngine?.stockTimingDegBtdc !== undefined) {
      setBaseTiming(selectedEngine.stockTimingDegBtdc)
    } else if (buildEngine?.id === selectedEngineId && buildEngine?.stockTimingDegBtdc) {
      setBaseTiming(buildEngine.stockTimingDegBtdc)
    }
  }, [selectedEngineId, selectedEngine, buildEngine])

  // Calculate results
  const effectiveTiming = baseTiming + selectedKeyDegrees
  const hpDelta = {
    min: selectedKey.hpGainMin,
    max: selectedKey.hpGainMax,
  }
  const riskLevel =
    selectedKey.riskDelta === 0
      ? 'LOW'
      : selectedKey.riskDelta <= 1
        ? 'MED'
        : 'HIGH'

  const hasBilletFlywheel = buildParts.some(
    (p) => p.category === 'flywheel' && p.name.toLowerCase().includes('billet'),
  )
  const hasBilletRod = buildParts.some(
    (p) => p.category === 'rod' && p.name.toLowerCase().includes('billet'),
  )

  const warnings: string[] = []
  if (selectedKey.requiresBilletFlywheel && !hasBilletFlywheel) {
    warnings.push(
      '⚠️ 4° and 6° timing keys require a billet flywheel for safety. Stock flywheels can fail at high RPMs.',
    )
  }
  if (selectedKey.requiresBilletRod && !hasBilletRod) {
    warnings.push(
      '⚠️ 6° timing keys require a billet connecting rod for safety at high RPMs.',
    )
  }
  if (effectiveTiming > 30) {
    warnings.push(
      '⚠️ Very advanced timing (>30° BTDC) may cause pre-ignition. Verify with timing light and listen for knock.',
    )
  }

  const handleAddToBuild = async () => {
    if (!selectedEngine) return

    // Find the timing key upgrade in the database
    const timingKeySlug = `timing-key-${selectedKeyDegrees}deg`
    
    // For now, we'll navigate to the engine page with a query param
    // In a full implementation, we'd fetch the upgrade and add it to the build
    router.push(`/engines/${selectedEngine.slug}?timingKey=${timingKeySlug}`)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <h2 className="text-2xl font-heading font-semibold text-garage-dark">Inputs</h2>

          <div>
            <label className="block text-sm font-semibold text-garage-dark mb-2">
              Engine
            </label>
            <select
              value={selectedEngineId}
              onChange={(e) => setSelectedEngineId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-garage-orange focus:border-transparent"
            >
              {engines.map((engine) => (
                <option key={engine.id} value={engine.id}>
                  {engine.name}
                </option>
              ))}
            </select>
            {selectedEngine && (
              <p className="text-sm text-garage-gray mt-1">
                Stock HP: {selectedEngine.stockHp || `${selectedEngine.baseHpMin}-${selectedEngine.baseHpMax}`} HP
                {' • '}
                Stock RPM: {selectedEngine.stockRpm} RPM
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-garage-dark mb-2">
              Base Timing (degrees BTDC)
            </label>
            <input
              type="number"
              value={baseTiming}
              onChange={(e) => setBaseTiming(parseFloat(e.target.value) || 0)}
              min="0"
              max="40"
              step="0.5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-garage-orange focus:border-transparent"
            />
            <p className="text-sm text-garage-gray mt-1">
              {selectedEngine?.stockTimingDegBtdc
                ? `Stock timing: ${selectedEngine.stockTimingDegBtdc}° BTDC`
                : 'Enter base timing (typically 20-25° BTDC for stock engines)'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-garage-dark mb-2">
              Timing Key
            </label>
            <div className="space-y-2">
              {TIMING_KEYS.map((key) => (
                <label
                  key={key.degrees}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                    selectedKeyDegrees === key.degrees
                      ? 'border-garage-orange bg-orange-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="timingKey"
                    value={key.degrees}
                    checked={selectedKeyDegrees === key.degrees}
                    onChange={(e) => setSelectedKeyDegrees(parseFloat(e.target.value))}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-garage-dark">{key.label}</div>
                    <div className="text-sm text-garage-gray">
                      +{key.hpGainMin}-{key.hpGainMax} HP
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-garage-dark mb-2">
              Target RPM (optional)
            </label>
            <input
              type="number"
              value={rpmTarget || ''}
              onChange={(e) => setRpmTarget(parseInt(e.target.value) || 0)}
              min="0"
              max="8000"
              step="100"
              placeholder="e.g., 5000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-garage-orange focus:border-transparent"
            />
            <p className="text-sm text-garage-gray mt-1">
              Optional: Enter target RPM for timing recommendations
            </p>
          </div>
        </div>

        {/* Outputs */}
        <div className="space-y-6">
          <h2 className="text-2xl font-heading font-semibold text-garage-dark">Results</h2>

          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div>
              <div className="text-sm text-garage-gray mb-1">Effective Timing</div>
              <div className="text-3xl font-heading font-bold text-garage-dark">
                {effectiveTiming.toFixed(1)}° BTDC
              </div>
              <div className="text-sm text-garage-gray mt-1">
                Base ({baseTiming}°) + Key ({selectedKeyDegrees}°)
              </div>
            </div>

            <div>
              <div className="text-sm text-garage-gray mb-1">HP Gain</div>
              <div className="text-2xl font-heading font-semibold text-garage-orange">
                +{hpDelta.min}-{hpDelta.max} HP
              </div>
            </div>

            <div>
              <div className="text-sm text-garage-gray mb-1">Risk Level</div>
              <div
                className={`text-xl font-heading font-semibold ${
                  riskLevel === 'LOW'
                    ? 'text-green-600'
                    : riskLevel === 'MED'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                }`}
              >
                {riskLevel}
              </div>
            </div>
          </div>

          {warnings.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">Safety Warnings</h3>
              <ul className="space-y-2">
                {warnings.map((warning, idx) => (
                  <li key={idx} className="text-sm text-red-800">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selectedKeyDegrees > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Required Tools</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Flywheel puller</li>
                <li>• Torque wrench (10-150 ft-lb)</li>
                <li>• Impact gun or breaker bar</li>
                <li>• Socket set</li>
                <li>• Timing light (for verification)</li>
              </ul>
            </div>
          )}

          <div className="pt-4 space-y-3">
            {buildEngine ? (
              <>
                <button
                  onClick={handleAddToBuild}
                  className="w-full bg-garage-orange text-white px-6 py-3 rounded-lg font-heading hover:bg-opacity-90 transition"
                >
                  Add to Current Build
                </button>
                <Link
                  href="/build"
                  className="block w-full text-center bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-heading hover:bg-gray-300 transition"
                >
                  View Build
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={`/engines/${selectedEngine?.slug || ''}?timingKey=timing-key-${selectedKeyDegrees}deg`}
                  className="block w-full text-center bg-garage-orange text-white px-6 py-3 rounded-lg font-heading hover:bg-opacity-90 transition"
                >
                  Start Build with This Engine
                </Link>
                <Link
                  href="/build"
                  className="block w-full text-center bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-heading hover:bg-gray-300 transition"
                >
                  Go to Build Planner
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="font-semibold text-yellow-800 mb-2">Important Notes</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>
            • Always verify actual timing with a timing light after installation. Key degrees are
            approximate.
          </li>
          <li>
            • Listen for detonation/knock. If present, reduce timing or check fuel quality.
          </li>
          <li>
            • Never use advanced timing keys (4° or 6°) without proper safety components (billet
            flywheel, billet rod).
          </li>
          <li>
            • These calculations are estimates. Actual results may vary based on engine condition,
            fuel quality, and other factors.
          </li>
        </ul>
      </div>
    </div>
  )
}

