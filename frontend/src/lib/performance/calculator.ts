/**
 * Performance Calculator
 * 
 * Calculates build performance metrics:
 * - HP (base engine + part contributions)
 * - Torque (base engine + part contributions)
 * - Top Speed estimate
 * - Power-to-Weight Ratio
 */

import type { Engine, Part } from '@/types/database';

/**
 * Part specifications may contain performance contributions
 */
interface PartSpecs {
  hp_contribution?: number;
  torque_contribution?: number;
  rpm_range?: {
    min?: number;
    max?: number;
  };
  [key: string]: unknown;
}

/**
 * Calculate total HP for a build
 * Formula: base_hp + Σ(part_hp_contribution)
 */
export function calculateBuildHP(engine: Engine | null, parts: Part[]): number {
  if (!engine) return 0;
  
  let totalHP = engine.horsepower;
  
  parts.forEach((part) => {
    const specs = part.specifications as PartSpecs;
    const contribution = specs?.hp_contribution || 0;
    totalHP += contribution;
  });
  
  // Round to 1 decimal place
  return Math.round(totalHP * 10) / 10;
}

/**
 * Calculate total torque for a build
 * Formula: base_torque + Σ(part_torque_contribution)
 * 
 * If engine torque is not available, estimate from HP:
 * torque = (hp × 5252) / rpm
 * Using 3600 RPM as typical for small engines
 */
export function calculateBuildTorque(engine: Engine | null, parts: Part[]): number {
  if (!engine) return 0;
  
  // Use engine torque if available, otherwise estimate from HP
  let baseTorque = engine.torque;
  if (!baseTorque || baseTorque === 0) {
    // Estimate: torque = (hp × 5252) / rpm
    // Typical small engine RPM: 3600
    baseTorque = (engine.horsepower * 5252) / 3600;
  }
  
  let totalTorque = baseTorque;
  
  parts.forEach((part) => {
    const specs = part.specifications as PartSpecs;
    const contribution = specs?.torque_contribution || 0;
    totalTorque += contribution;
  });
  
  // Round to 1 decimal place
  return Math.round(totalTorque * 10) / 10;
}

/**
 * Estimate top speed in MPH
 * Simplified formula: (hp × 200) / (weight / 100) / gear_ratio
 * 
 * @param hp - Total horsepower
 * @param weight - Total weight in lbs (engine + parts + kart base weight)
 * @param gearRatio - Final drive ratio (default 1.0 for direct drive)
 */
export function estimateTopSpeed(
  hp: number,
  weight: number = 200,
  gearRatio: number = 1.0
): number {
  if (hp <= 0 || weight <= 0) return 0;
  
  const constant = 200; // Empirical constant
  const speed = (hp * constant) / (weight / 100) / gearRatio;
  
  // Round to nearest integer
  return Math.round(speed);
}

/**
 * Calculate power-to-weight ratio
 * Formula: hp / (weight / 100)
 * 
 * Returns HP per 100 lbs
 */
export function calculatePowerToWeight(hp: number, weight: number = 200): number {
  if (hp <= 0 || weight <= 0) return 0;
  
  const ratio = hp / (weight / 100);
  
  // Round to 1 decimal place
  return Math.round(ratio * 10) / 10;
}

/**
 * Estimate 0-20 MPH acceleration time (seconds)
 * Simplified formula based on power-to-weight ratio
 */
export function estimateAcceleration0to20(hp: number, weight: number = 200): number {
  if (hp <= 0 || weight <= 0) return 0;
  
  const powerToWeight = calculatePowerToWeight(hp, weight);
  
  // Empirical formula: lower power-to-weight = slower acceleration
  // Typical range: 2-8 seconds for go-karts
  const time = Math.max(2, Math.min(8, 10 - powerToWeight * 0.8));
  
  return Math.round(time * 10) / 10;
}

/**
 * Estimate 0-30 MPH acceleration time (seconds)
 */
export function estimateAcceleration0to30(hp: number, weight: number = 200): number {
  if (hp <= 0 || weight <= 0) return 0;
  
  const powerToWeight = calculatePowerToWeight(hp, weight);
  
  // Slightly longer than 0-20
  const time = Math.max(3, Math.min(12, 15 - powerToWeight * 1.0));
  
  return Math.round(time * 10) / 10;
}

/**
 * Calculate total build weight
 * Engine weight + estimated part weights + base kart weight
 * 
 * @param engine - Selected engine
 * @param parts - Selected parts
 * @param baseKartWeight - Base kart weight (default 100 lbs)
 */
export function calculateBuildWeight(
  engine: Engine | null,
  parts: Part[],
  baseKartWeight: number = 100
): number {
  let totalWeight = baseKartWeight;
  
  if (engine?.weight_lbs) {
    totalWeight += engine.weight_lbs;
  } else {
    // Estimate engine weight if not available
    // Typical small engines: 30-50 lbs
    totalWeight += 40;
  }
  
  // Estimate part weights (rough averages)
  parts.forEach((part) => {
    const specs = part.specifications as PartSpecs;
    let partWeight: number;
    if (specs?.weight_lbs && typeof specs.weight_lbs === 'number') {
      partWeight = specs.weight_lbs;
    } else if (specs?.weight_oz && typeof specs.weight_oz === 'number') {
      partWeight = specs.weight_oz / 16;
    } else {
      partWeight = getEstimatedPartWeight(part.category);
    }
    
    totalWeight += partWeight;
  });
  
  return Math.round(totalWeight);
}

/**
 * Get estimated weight for a part category (in lbs)
 */
function getEstimatedPartWeight(category: string): number {
  const weightMap: Record<string, number> = {
    clutch: 2.5,
    torque_converter: 8.0,
    chain: 1.0,
    sprocket: 0.5,
    carburetor: 1.5,
    exhaust: 3.0,
    header: 2.0,
    air_filter: 0.5,
    camshaft: 0.8,
    flywheel: 3.0,
    piston: 0.3,
    connecting_rod: 0.2,
    ignition: 0.5,
    fuel_system: 2.0,
    axle: 5.0,
    wheel: 2.0,
    tire: 3.0,
    brake: 2.5,
    throttle: 0.3,
    frame: 20.0,
    gasket: 0.1,
    hardware: 0.2,
    other: 1.0,
  };
  
  return weightMap[category] || 1.0;
}

/**
 * Calculate final drive ratio from sprocket combination
 * 
 * @param clutchTeeth - Clutch/driver sprocket teeth
 * @param axleTeeth - Axle/driven sprocket teeth
 */
export function calculateGearRatio(
  clutchTeeth: number | null,
  axleTeeth: number | null
): number {
  if (!clutchTeeth || !axleTeeth || clutchTeeth <= 0 || axleTeeth <= 0) {
    return 1.0; // Default to 1:1 if not specified
  }
  
  return axleTeeth / clutchTeeth;
}

/**
 * Get gear ratio from selected parts
 */
export function getGearRatioFromParts(parts: Part[]): number {
  let clutchTeeth: number | null = null;
  let axleTeeth: number | null = null;
  
  parts.forEach((part) => {
    const specs = part.specifications as PartSpecs;
    
    if (part.category === 'clutch' || part.category === 'torque_converter') {
      // Clutch sprocket teeth
      const teeth = specs?.sprocket_teeth || specs?.teeth;
      if (typeof teeth === 'number') {
        clutchTeeth = teeth;
      }
    } else if (part.category === 'sprocket') {
      // Axle sprocket teeth
      const teeth = specs?.teeth;
      if (typeof teeth === 'number') {
        axleTeeth = teeth;
      }
    }
  });
  
  return calculateGearRatio(clutchTeeth, axleTeeth);
}

/**
 * Complete performance calculation result
 */
export interface PerformanceMetrics {
  hp: number;
  torque: number;
  topSpeed: number;
  powerToWeight: number;
  acceleration0to20: number;
  acceleration0to30: number;
  weight: number;
  gearRatio: number;
}

/**
 * Calculate all performance metrics for a build
 */
export function calculatePerformance(
  engine: Engine | null,
  parts: Part[]
): PerformanceMetrics {
  const hp = calculateBuildHP(engine, parts);
  const torque = calculateBuildTorque(engine, parts);
  const weight = calculateBuildWeight(engine, parts);
  const gearRatio = getGearRatioFromParts(parts);
  const topSpeed = estimateTopSpeed(hp, weight, gearRatio);
  const powerToWeight = calculatePowerToWeight(hp, weight);
  const acceleration0to20 = estimateAcceleration0to20(hp, weight);
  const acceleration0to30 = estimateAcceleration0to30(hp, weight);
  
  return {
    hp,
    torque,
    topSpeed,
    powerToWeight,
    acceleration0to20,
    acceleration0to30,
    weight,
    gearRatio,
  };
}
