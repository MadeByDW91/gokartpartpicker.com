import type { Engine, Part, VendorOffer } from '@prisma/client'

export interface PartWithOffer extends Part {
  selectedOffer?: VendorOffer & { vendor: { name: string; priority: number } }
}

export interface BuildState {
  engine: Engine | null
  parts: PartWithOffer[]
}

/**
 * Calculate HP range based on engine base HP + sum of part HP gains
 */
export function calcHpRange(engine: Engine | null, parts: Part[]): { min: number; max: number } {
  if (!engine) {
    return { min: 0, max: 0 }
  }

  const hpGainMin = parts.reduce((sum, part) => sum + part.hpGainMin, 0)
  const hpGainMax = parts.reduce((sum, part) => sum + part.hpGainMax, 0)

  return {
    min: engine.baseHpMin + hpGainMin,
    max: engine.baseHpMax + hpGainMax,
  }
}

/**
 * Calculate safe RPM based on engine stock RPM + sum of part RPM limit deltas
 */
export function calcSafeRpm(engine: Engine | null, parts: Part[]): number {
  if (!engine) {
    return 0
  }

  const rpmDelta = parts.reduce((sum, part) => sum + part.rpmLimitDelta, 0)
  return engine.stockRpm + rpmDelta
}

/**
 * Calculate total cost of build parts with selected offers
 */
export function calcTotalCost(parts: PartWithOffer[]): number {
  return parts.reduce((total, part) => {
    if (part.selectedOffer) {
      return total + (part.selectedOffer.priceUsd + part.selectedOffer.shippingUsd)
    }
    return total
  }, 0)
}

export interface Warning {
  type: 'error' | 'warning'
  message: string
}

/**
 * Get warnings based on PDR rules:
 * - RPM > 3600 without billet flywheel = ERROR
 * - RPM > 4000 without billet rod = ERROR
 * - Springs without cam = WARNING
 * - Cam without springs = WARNING
 */
export function getWarnings(engine: Engine | null, parts: Part[]): Warning[] {
  const warnings: Warning[] = []

  if (!engine) {
    return warnings
  }

  const safeRpm = calcSafeRpm(engine, parts)
  const hasBilletFlywheel = parts.some(p => p.category === 'flywheel' && p.name.toLowerCase().includes('billet'))
  const hasBilletRod = parts.some(p => p.category === 'rod' && p.name.toLowerCase().includes('billet'))
  const hasSprings = parts.some(p => p.category === 'springs')
  const hasCam = parts.some(p => p.category === 'cam')

  // RPM > 3600 without billet flywheel
  if (safeRpm > 3600 && !hasBilletFlywheel) {
    warnings.push({
      type: 'error',
      message: `Safe RPM (${safeRpm}) exceeds 3600 RPM without a billet flywheel. This is unsafe and may cause catastrophic failure.`,
    })
  }

  // RPM > 4000 without billet rod
  if (safeRpm > 4000 && !hasBilletRod) {
    warnings.push({
      type: 'error',
      message: `Safe RPM (${safeRpm}) exceeds 4000 RPM without a billet connecting rod. This is unsafe and may cause catastrophic failure.`,
    })
  }

  // Springs without cam
  if (hasSprings && !hasCam) {
    warnings.push({
      type: 'warning',
      message: 'You have valve springs but no camshaft. Springs are typically installed with a performance cam for best results.',
    })
  }

  // Cam without springs
  if (hasCam && !hasSprings) {
    warnings.push({
      type: 'warning',
      message: 'You have a camshaft but no valve springs. High-lift cams typically require upgraded springs to prevent valve float.',
    })
  }

  return warnings
}

