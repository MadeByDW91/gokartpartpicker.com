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

  // Get the engine's stock RPM limit (use stockRpmLimit if available, otherwise stockRpm)
  const engineStockRpmLimit = engine.stockRpmLimit ?? engine.stockRpm

  // RPM > 3600 without billet flywheel
  // Only warn if safe RPM exceeds 3600 AND exceeds the engine's stock RPM limit
  // This prevents false warnings for engines like the Ghost that have stock RPM of 4000
  if (safeRpm > 3600 && safeRpm > engineStockRpmLimit && !hasBilletFlywheel) {
    warnings.push({
      type: 'error',
      message: `Safe RPM (${safeRpm}) exceeds 3600 RPM without a billet flywheel. This is unsafe and may cause catastrophic failure.`,
    })
  }

  // RPM > 4000 without billet rod
  // Only warn if safe RPM exceeds 4000 AND exceeds the engine's stock RPM limit
  // This prevents false warnings for engines like the Ghost that have stock RPM of 4000
  // Special case: If engine stock RPM limit is exactly 4000 (like Ghost), only warn if RPM > 4000
  if (safeRpm > 4000 && safeRpm > engineStockRpmLimit && !hasBilletRod) {
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

  // Timing key warnings
  const hasTimingKey4deg = parts.some(p => p.category === 'ignition' && p.slug?.includes('timing-key-4deg'))
  const hasTimingKey6deg = parts.some(p => p.category === 'ignition' && p.slug?.includes('timing-key-6deg'))
  
  if (hasTimingKey4deg && !hasBilletFlywheel) {
    warnings.push({
      type: 'error',
      message: '4° timing key requires a billet flywheel for safety. Stock flywheels can fail at high RPMs with advanced timing.',
    })
  }
  
  if (hasTimingKey6deg && !hasBilletFlywheel) {
    warnings.push({
      type: 'error',
      message: '6° timing key requires a billet flywheel for safety. Stock flywheels can fail at high RPMs with advanced timing.',
    })
  }
  
  if (hasTimingKey6deg && !hasBilletRod) {
    warnings.push({
      type: 'error',
      message: '6° timing key requires a billet connecting rod for safety at high RPMs.',
    })
  }

  return warnings
}

/**
 * Calculate timing impact for a given timing key
 */
export function calculateTimingImpact(options: {
  engine: Engine | null
  baseTiming: number
  keyDegrees: number
  rpm?: number
}): {
  effectiveTiming: number
  hpDelta: { min: number; max: number }
  riskDelta: number
} {
  const { baseTiming, keyDegrees } = options
  
  const effectiveTiming = baseTiming + keyDegrees
  
  // Conservative HP gains based on timing key degrees
  const hpGains: Record<number, { min: number; max: number }> = {
    0: { min: 0, max: 0 },
    2: { min: 0.3, max: 0.8 },
    4: { min: 0.5, max: 1.2 },
    6: { min: 0.8, max: 1.5 },
  }
  
  const riskDeltas: Record<number, number> = {
    0: 0,
    2: 0.5,
    4: 1,
    6: 1.5,
  }
  
  return {
    effectiveTiming,
    hpDelta: hpGains[keyDegrees] || { min: 0, max: 0 },
    riskDelta: riskDeltas[keyDegrees] || 0,
  }
}

