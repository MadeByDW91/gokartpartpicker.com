'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { calculateBuildMetrics, type BuildMetrics } from '@/lib/buildCalculator'
import { useBuildStore } from '@/lib/buildStore'
import type { Engine, Upgrade, Tool, EngineSchematic, TorqueSpec } from '@prisma/client'
import VideoCarousel, { type Video } from '@/components/VideoCarousel'
import UnitConverter from '@/components/UnitConverter'

interface UpgradeWithTools extends Upgrade {
  tools: Array<{
    tool: Tool
    isRequired: boolean
    notes: string | null
  }>
}

interface EngineWithRelations extends Engine {
  schematics: EngineSchematic[]
  torqueSpecs: TorqueSpec[]
  upgrades: Array<{
    upgrade: UpgradeWithTools
  }>
}

interface EnginePageClientProps {
  engine: EngineWithRelations
  videos?: Video[]
}

export default function EnginePageClient({ engine, videos = [] }: EnginePageClientProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const addEngine = useBuildStore((state) => state.addEngine)
  const currentBuildEngine = useBuildStore((state) => state.engine)
  const [selectedUpgradeIds, setSelectedUpgradeIds] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'overview' | 'schematics' | 'torque' | 'upgrades' | 'tools' | 'save'>('overview')
  const [buildName, setBuildName] = useState('')
  const [buildDescription, setBuildDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadingBuild, setLoadingBuild] = useState(false)

  const handleStartBuild = () => {
    addEngine(engine)
    router.push('/build')
  }

  // Load build from query parameter
  useEffect(() => {
    const loadId = searchParams.get('load')
    if (loadId && session) {
      loadSavedBuild(loadId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, session])

  const loadSavedBuild = async (buildId: string) => {
    setLoadingBuild(true)
    try {
      const res = await fetch(`/api/builds/${buildId}`)
      if (!res.ok) {
        throw new Error('Failed to load build')
      }
      const build = await res.json()
      const buildData = build.data as {
        engineId?: string
        engineSlug?: string
        selectedUpgradeIds?: string[]
        notes?: string
      }

      // If build is for a different engine, redirect to that engine
      if (buildData.engineSlug && buildData.engineSlug !== engine.slug) {
        router.push(`/engines/${buildData.engineSlug}?load=${buildId}`)
        return
      }

      // Load upgrade selections
      if (buildData.selectedUpgradeIds) {
        // Map upgrade slugs to IDs
        const upgradeSlugToId = new Map(allUpgrades.map((u) => [u.slug, u.id]))
        const upgradeIds = buildData.selectedUpgradeIds
          .map((slugOrId: string) => {
            // Check if it's already an ID or a slug
            const upgrade = allUpgrades.find((u) => u.id === slugOrId || u.slug === slugOrId)
            return upgrade?.id
          })
          .filter((id): id is string => id !== undefined)

        setSelectedUpgradeIds(new Set(upgradeIds))
      }

      if (buildData.notes) {
        setBuildDescription(buildData.notes)
      }

      setActiveTab('upgrades')
      router.replace(`/engines/${engine.slug}`, { scroll: false })
    } catch (err) {
      console.error('Error loading build:', err)
    } finally {
      setLoadingBuild(false)
    }
  }

  // Get all upgrades from engine relations
  const allUpgrades = useMemo(() => {
    return engine.upgrades.map((eu) => eu.upgrade)
  }, [engine.upgrades])

  // Calculate metrics based on selected upgrades
  const selectedUpgrades = useMemo(() => {
    return allUpgrades.filter((u) => selectedUpgradeIds.has(u.id))
  }, [allUpgrades, selectedUpgradeIds])

  const metrics: BuildMetrics = useMemo(() => {
    return calculateBuildMetrics(engine, selectedUpgrades)
  }, [engine, selectedUpgrades])

  // Get all tools for selected upgrades (deduplicated)
  const allTools = useMemo(() => {
    const toolMap = new Map<string, { tool: Tool; isRequired: boolean; upgradeName: string }>()
    
    for (const upgrade of selectedUpgrades) {
      for (const upgradeTool of upgrade.tools) {
        const existing = toolMap.get(upgradeTool.tool.id)
        if (!existing || upgradeTool.isRequired) {
          toolMap.set(upgradeTool.tool.id, {
            tool: upgradeTool.tool,
            isRequired: upgradeTool.isRequired || existing?.isRequired || false,
            upgradeName: upgrade.name,
          })
        }
      }
    }

    return Array.from(toolMap.values()).sort((a, b) => {
      if (a.isRequired && !b.isRequired) return -1
      if (!a.isRequired && b.isRequired) return 1
      return a.tool.name.localeCompare(b.tool.name)
    })
  }, [selectedUpgrades])

  const toggleUpgrade = (upgradeId: string) => {
    setSelectedUpgradeIds((prev) => {
      const next = new Set(prev)
      if (next.has(upgradeId)) {
        next.delete(upgradeId)
      } else {
        next.add(upgradeId)
      }
      return next
    })
  }

  const handleSaveBuild = async () => {
    if (!session) {
      router.push('/login?redirect=' + encodeURIComponent(`/engines/${engine.slug}`))
      return
    }

    if (!buildName.trim()) {
      alert('Please enter a build name')
      return
    }

    setSaving(true)
    try {
      const buildData = {
        engineId: engine.id,
        engineSlug: engine.slug,
        selectedUpgradeIds: Array.from(selectedUpgradeIds).map((id) => {
          const upgrade = allUpgrades.find((u) => u.id === id)
          return upgrade?.slug || id // Prefer slug for easier loading
        }),
        notes: buildDescription,
      }

      const res = await fetch('/api/builds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: buildName.trim(),
          description: buildDescription.trim() || null,
          data: buildData,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        if (res.status === 403) {
          alert(`Build limit reached (10). ${data.error}`)
        } else {
          alert(data.error || 'Failed to save build')
        }
        return
      }

      alert('Build saved successfully!')
      setBuildName('')
      setBuildDescription('')
      router.push('/my-builds')
    } catch (err) {
      alert('An error occurred. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Group upgrades by category
  const upgradesByCategory = useMemo(() => {
    const grouped: Record<string, UpgradeWithTools[]> = {}
    for (const upgrade of allUpgrades) {
      const category = upgrade.category || 'other'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(upgrade)
    }
    return grouped
  }, [allUpgrades])

  // Group torque specs by category
  const torqueSpecsByCategory = useMemo(() => {
    const grouped: Record<string, TorqueSpec[]> = {}
    for (const spec of engine.torqueSpecs) {
      const category = spec.category || 'Other'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(spec)
    }
    return grouped
  }, [engine.torqueSpecs])

  if (loadingBuild) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-garage-gray">Loading build...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Hero Section */}
      <div className="p-8 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-4xl font-heading font-bold text-garage-dark mb-4">{engine.name}</h1>
            {engine.description && (
              <p className="text-lg text-garage-gray mb-6">{engine.description}</p>
            )}
          </div>
          <div className="flex-shrink-0">
            {currentBuildEngine?.id === engine.id ? (
              <button
                onClick={() => router.push('/build')}
                className="bg-garage-dark text-white px-8 py-3 rounded-lg font-heading text-lg hover:bg-opacity-90 transition shadow-lg"
              >
                View Current Build
              </button>
            ) : (
              <button
                onClick={handleStartBuild}
                className="bg-garage-orange text-white px-8 py-3 rounded-lg font-heading text-lg hover:bg-opacity-90 transition shadow-lg"
              >
                Start Build with This Engine
              </button>
            )}
          </div>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {engine.stockHp && (
            <div>
              <p className="text-sm text-garage-gray mb-1">Stock HP</p>
              <p className="text-2xl font-semibold">{engine.stockHp} HP</p>
            </div>
          )}
          {engine.stockRpmLimit && (
            <div>
              <p className="text-sm text-garage-gray mb-1">Stock RPM Limit</p>
              <p className="text-2xl font-semibold">{engine.stockRpmLimit} RPM</p>
            </div>
          )}
          {engine.displacementCc && (
            <div>
              <p className="text-sm text-garage-gray mb-1">Displacement</p>
              <p className="text-2xl font-semibold">{engine.displacementCc} cc</p>
            </div>
          )}
          {engine.manufacturer && (
            <div>
              <p className="text-sm text-garage-gray mb-1">Manufacturer</p>
              <p className="text-2xl font-semibold">{engine.manufacturer}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'schematics', label: 'Schematics' },
            { id: 'torque', label: 'Torque Specs' },
            { id: 'upgrades', label: 'Upgrades' },
            { id: 'tools', label: 'Tools' },
            { id: 'save', label: 'Save Build' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-4 font-semibold border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-garage-orange text-garage-orange'
                  : 'border-transparent text-garage-gray hover:text-garage-dark'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-heading mb-4">Engine Specifications</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {engine.displacementCc && (
                <div>
                  <p className="text-sm text-garage-gray mb-1">Displacement</p>
                  <p className="text-lg font-semibold">{engine.displacementCc} cc</p>
                </div>
              )}
              {engine.boreMm && (
                <div>
                  <p className="text-sm text-garage-gray mb-1">Bore</p>
                  <p className="text-lg font-semibold">{engine.boreMm} mm</p>
                </div>
              )}
              {engine.strokeMm && (
                <div>
                  <p className="text-sm text-garage-gray mb-1">Stroke</p>
                  <p className="text-lg font-semibold">{engine.strokeMm} mm</p>
                </div>
              )}
              {engine.compressionRatio && (
                <div>
                  <p className="text-sm text-garage-gray mb-1">Compression Ratio</p>
                  <p className="text-lg font-semibold">{engine.compressionRatio}:1</p>
                </div>
              )}
              {engine.oilCapacityOz && (
                <div>
                  <p className="text-sm text-garage-gray mb-1">Oil Capacity</p>
                  <p className="text-lg font-semibold">{engine.oilCapacityOz} oz</p>
                </div>
              )}
              {engine.oilType && (
                <div>
                  <p className="text-sm text-garage-gray mb-1">Oil Type</p>
                  <p className="text-lg font-semibold">{engine.oilType}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'schematics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-heading mb-4">Engine Schematics</h2>
            {engine.schematics.length === 0 ? (
              <p className="text-garage-gray">No schematics available for this engine.</p>
            ) : (
              <div className="space-y-6">
                {engine.schematics.map((schematic) => (
                  <div key={schematic.id} className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-xl font-heading mb-2">{schematic.title}</h3>
                    {schematic.notes && (
                      <p className="text-garage-gray mb-4">{schematic.notes}</p>
                    )}
                    <div className="bg-gray-100 rounded p-4 text-center">
                      <img
                        src={schematic.imageUrl}
                        alt={schematic.title}
                        className="max-w-full h-auto mx-auto"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = '/images/placeholder-schematic.png'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'torque' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-heading mb-4">Torque Specifications</h2>
            {!engine.torqueSpecs || engine.torqueSpecs.length === 0 ? (
              <p className="text-garage-gray">No torque specifications available for this engine.</p>
            ) : (
              <div className="space-y-8">
                {Object.keys(torqueSpecsByCategory).length === 0 ? (
                  <p className="text-garage-gray">No torque specifications available for this engine.</p>
                ) : (
                  Object.entries(torqueSpecsByCategory).map(([category, specs]) => (
                    <div key={category}>
                      <h3 className="text-xl font-heading mb-3">{category}</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-garage-cream">
                              <th className="border border-gray-300 p-3 text-left font-semibold">Fastener</th>
                              <th className="border border-gray-300 p-3 text-left font-semibold">Spec</th>
                              <th className="border border-gray-300 p-3 text-left font-semibold">Unit</th>
                              <th className="border border-gray-300 p-3 text-left font-semibold">Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {specs.map((spec) => {
                              // Parse torque value from spec string (e.g., "17 ft-lb" -> 17)
                              const specMatch = spec.spec.match(/([\d.]+)/)
                              const specValue = specMatch ? parseFloat(specMatch[1]) : 0
                              const unit = (spec.unit || 'ft-lb').toLowerCase() as 'ft-lb' | 'Nm'
                              
                              return (
                                <tr key={spec.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                  <td className="border border-gray-300 dark:border-gray-600 p-3">{spec.fastener}</td>
                                  <td className="border border-gray-300 dark:border-gray-600 p-3 font-semibold text-garage-orange">
                                    {specValue > 0 && (unit.toLowerCase() === 'ft-lb' || unit.toLowerCase() === 'nm') ? (
                                      <UnitConverter value={specValue} unit={unit.toLowerCase() === 'nm' ? 'Nm' : 'ft-lb'}>
                                        {spec.spec}
                                      </UnitConverter>
                                    ) : (
                                      spec.spec
                                    )}
                                  </td>
                                  <td className="border border-gray-300 dark:border-gray-600 p-3">{spec.unit || 'ft-lb'}</td>
                                  <td className="border border-gray-300 dark:border-gray-600 p-3 text-sm text-garage-gray dark:text-gray-400">
                                    {spec.notes || '-'}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'upgrades' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-heading">Upgrades & Calculator</h2>
              <div className="bg-garage-cream rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-garage-gray mb-1">Estimated HP</p>
                    <p className="text-2xl font-bold text-garage-orange">{metrics.estimatedHp.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-garage-gray mb-1">RPM Limit</p>
                    <p className="text-2xl font-bold text-garage-orange">{metrics.estimatedRpmLimit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-garage-gray mb-1">Risk Score</p>
                    <p className={`text-2xl font-bold ${
                      metrics.riskScore < 30 ? 'text-success-green' :
                      metrics.riskScore < 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {metrics.riskScore}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {metrics.warnings.length > 0 && (
              <div className="space-y-2">
                {metrics.warnings.map((warning, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded ${
                      warning.type === 'error' ? 'bg-red-100 border border-red-300' :
                      warning.type === 'warning' ? 'bg-yellow-100 border border-yellow-300' :
                      'bg-blue-100 border border-blue-300'
                    }`}
                  >
                    <p className={warning.type === 'error' ? 'text-red-800' :
                      warning.type === 'warning' ? 'text-yellow-800' : 'text-blue-800'}>
                      {warning.type === 'error' ? '🚨 ' : warning.type === 'warning' ? '⚠️ ' : 'ℹ️ '}
                      {warning.message}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-6">
              {Object.entries(upgradesByCategory).map(([category, upgrades]) => (
                <div key={category}>
                  <h3 className="text-xl font-heading mb-3 capitalize">{category}</h3>
                  <div className="space-y-2">
                    {upgrades.map((upgrade) => {
                      const isSelected = selectedUpgradeIds.has(upgrade.id)
                      const requires = upgrade.requires ? (JSON.parse(upgrade.requires as string) as string[]) : []
                      const conflicts = upgrade.conflicts ? (JSON.parse(upgrade.conflicts as string) as string[]) : []
                      
                      // Check if requirements are met
                      const requirementsMet = requires.every((reqSlug) => {
                        return allUpgrades.some((u) => u.slug === reqSlug && selectedUpgradeIds.has(u.id))
                      })

                      // Check if conflicts exist
                      const hasConflicts = conflicts.some((conflictSlug) => {
                        return allUpgrades.some((u) => u.slug === conflictSlug && selectedUpgradeIds.has(u.id))
                      })

                      return (
                        <label
                          key={upgrade.id}
                          className={`flex items-start p-4 border rounded-lg cursor-pointer transition ${
                            isSelected
                              ? 'border-garage-orange bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          } ${hasConflicts ? 'border-red-300 bg-red-50' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleUpgrade(upgrade.id)}
                            className="mt-1 mr-4"
                            disabled={hasConflicts}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{upgrade.name}</span>
                              {upgrade.riskLevel === 'HIGH' && (
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">HIGH RISK</span>
                              )}
                              {upgrade.riskLevel === 'MED' && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">MED RISK</span>
                              )}
                            </div>
                            {upgrade.description && (
                              <p className="text-sm text-garage-gray mb-2">{upgrade.description}</p>
                            )}
                            <div className="flex gap-4 text-sm">
                              {(upgrade.hpGainMin || upgrade.hpGainMax) && (
                                <span className="text-success-green">
                                  HP: +{upgrade.hpGainMin || 0}-{upgrade.hpGainMax || 0}
                                </span>
                              )}
                              {upgrade.rpmDelta !== null && upgrade.rpmDelta !== 0 && (
                                <span className="text-garage-orange">
                                  RPM: {upgrade.rpmDelta > 0 ? '+' : ''}{upgrade.rpmDelta}
                                </span>
                              )}
                            </div>
                            {!requirementsMet && requires.length > 0 && (
                              <p className="text-xs text-red-600 mt-2">
                                Requires: {requires.join(', ')}
                              </p>
                            )}
                            {hasConflicts && (
                              <p className="text-xs text-red-600 mt-2">
                                Conflicts with selected upgrade
                              </p>
                            )}
                            {upgrade.notes && (
                              <p className="text-xs text-garage-gray mt-2 italic">{upgrade.notes}</p>
                            )}
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-heading mb-4">Tools for This Build</h2>
            {allTools.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-garage-gray mb-4">No tools required yet.</p>
                <p className="text-sm text-garage-gray">Select upgrades to see required tools.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {allTools.map(({ tool, isRequired, upgradeName }) => (
                  <div
                    key={tool.id}
                    className={`border rounded-lg p-4 ${
                      isRequired ? 'border-garage-orange bg-orange-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold">{tool.name}</h3>
                        {isRequired && (
                          <span className="text-xs bg-garage-orange text-white px-2 py-1 rounded mt-1 inline-block">
                            Required
                          </span>
                        )}
                      </div>
                    </div>
                    {tool.description && (
                      <p className="text-sm text-garage-gray mb-2">{tool.description}</p>
                    )}
                    <p className="text-xs text-garage-gray mb-3">For: {upgradeName}</p>
                    <div className="flex items-center justify-between">
                      {tool.priceHint && (
                        <span className="text-sm font-semibold text-garage-orange">{tool.priceHint}</span>
                      )}
                      <a
                        href={tool.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-garage-orange text-white px-4 py-2 rounded-lg text-sm hover:bg-opacity-90 transition"
                      >
                        View on {tool.vendor || 'Amazon'}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'save' && (
          <div className="max-w-md space-y-4">
            <h2 className="text-2xl font-heading mb-4">Save Build</h2>
            {!session ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 mb-4">Please log in to save builds.</p>
                <button
                  onClick={() => router.push('/login?redirect=' + encodeURIComponent(`/engines/${engine.slug}`))}
                  className="bg-garage-orange text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition"
                >
                  Log In
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold mb-2">Build Name *</label>
                  <input
                    type="text"
                    value={buildName}
                    onChange={(e) => setBuildName(e.target.value)}
                    maxLength={60}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="My Stage 1 Build"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Description (Optional)</label>
                  <textarea
                    value={buildDescription}
                    onChange={(e) => setBuildDescription(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Notes about this build..."
                  />
                </div>
                <div className="bg-garage-cream rounded-lg p-4">
                  <p className="text-sm text-garage-gray mb-2">Selected Upgrades:</p>
                  {selectedUpgrades.length === 0 ? (
                    <p className="text-sm text-garage-gray italic">No upgrades selected</p>
                  ) : (
                    <ul className="text-sm space-y-1">
                      {selectedUpgrades.map((u) => (
                        <li key={u.id}>• {u.name}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                  onClick={handleSaveBuild}
                  disabled={saving || !buildName.trim() || selectedUpgrades.length === 0}
                  className="w-full bg-garage-orange text-white py-3 rounded-lg font-heading hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Build'}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Useful Videos Section */}
      {videos.length > 0 && (
        <div className="px-8 pb-8">
          <VideoCarousel videos={videos} title="Useful Videos" showFilters={true} />
        </div>
      )}
    </div>
  )
}

