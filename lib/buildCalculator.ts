import type { Engine, Upgrade, RiskLevel } from '@prisma/client'

export interface BuildMetrics {
  estimatedHp: number
  estimatedRpmLimit: number
  riskScore: number // 0-100
  warnings: BuildWarning[]
}

export interface BuildWarning {
  type: 'error' | 'warning' | 'info'
  message: string
}

interface UpgradeWithRelations extends Upgrade {
  // Upgrade may have relations loaded
}

/**
 * Calculate build metrics based on engine and selected upgrades
 * Pure function - no side effects, deterministic
 */
export function calculateBuildMetrics(
  engine: Engine,
  selectedUpgrades: UpgradeWithRelations[]
): BuildMetrics {
  const warnings: BuildWarning[] = []
  let estimatedHp = engine.stockHp || (engine.baseHpMin + engine.baseHpMax) / 2
  let estimatedRpmLimit = engine.stockRpmLimit || engine.stockRpm
  let riskScore = 0

  // Track selected upgrade slugs for requirement/conflict checking
  const selectedSlugs = new Set(selectedUpgrades.map((u) => u.slug))

  // Check requirements and conflicts
  for (const upgrade of selectedUpgrades) {
    // Check requirements
    if (upgrade.requires) {
      const required = upgrade.requires as string[]
      for (const reqSlug of required) {
        if (!selectedSlugs.has(reqSlug)) {
          warnings.push({
            type: 'error',
            message: `${upgrade.name} requires: ${reqSlug}. Please select it first.`,
          })
        }
      }
    }

    // Check conflicts
    if (upgrade.conflicts) {
      const conflicts = upgrade.conflicts as string[]
      for (const conflictSlug of conflicts) {
        if (selectedSlugs.has(conflictSlug)) {
          warnings.push({
            type: 'error',
            message: `${upgrade.name} conflicts with: ${conflictSlug}. Remove one.`,
          })
        }
      }
    }

    // Calculate HP gain (use average of min/max if both exist)
    if (upgrade.hpGainMin !== null && upgrade.hpGainMax !== null) {
      const hpGain = (upgrade.hpGainMin + upgrade.hpGainMax) / 2
      estimatedHp += hpGain
    } else if (upgrade.hpGainMin !== null) {
      estimatedHp += upgrade.hpGainMin
    } else if (upgrade.hpGainMax !== null) {
      estimatedHp += upgrade.hpGainMax
    }

    // Calculate RPM delta
    if (upgrade.rpmDelta !== null) {
      estimatedRpmLimit += upgrade.rpmDelta
    }

    // Calculate risk score
    switch (upgrade.riskLevel) {
      case 'HIGH':
        riskScore += 30
        break
      case 'MED':
        riskScore += 15
        break
      case 'LOW':
        riskScore += 5
        break
    }
  }

  // Add risk based on RPM limits
  if (estimatedRpmLimit > 6000) {
    riskScore += 20
    warnings.push({
      type: 'warning',
      message: 'RPM limit exceeds 6000. Ensure proper bottom-end modifications.',
    })
  } else if (estimatedRpmLimit > 5000) {
    riskScore += 10
    warnings.push({
      type: 'info',
      message: 'RPM limit above 5000. Consider billet rod and flywheel for safety.',
    })
  }

  // Cap risk score at 100
  riskScore = Math.min(100, riskScore)

  // Add info warnings for high HP
  if (estimatedHp > 15) {
    warnings.push({
      type: 'info',
      message: 'High HP build. Ensure proper cooling and fuel delivery.',
    })
  }

  return {
    estimatedHp: Math.round(estimatedHp * 10) / 10, // Round to 1 decimal
    estimatedRpmLimit,
    riskScore,
    warnings,
  }
}


