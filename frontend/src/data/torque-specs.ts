/**
 * Torque Specifications for All Engines
 * Includes both ft-lb and in-lb values
 */

export interface TorqueSpec {
  component: string;
  torqueFtLb: string; // e.g., "12-15 ft-lb"
  torqueInLb: string; // e.g., "144-180 in-lb"
  notes: string;
}

export interface EngineTorqueSpecs {
  engineSlug: string; // Matches engines.slug
  name: string;
  specs: TorqueSpec[];
}

/**
 * Convert ft-lb range to in-lb range
 * Example: "12-15 ft-lb" -> "144-180 in-lb"
 */
function convertFtLbToInLb(ftLbRange: string): string {
  const match = ftLbRange.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*ft-lb/i);
  if (match) {
    const min = parseFloat(match[1]) * 12;
    const max = parseFloat(match[2]) * 12;
    return `${Math.round(min)}-${Math.round(max)} in-lb`;
  }
  // If single value
  const singleMatch = ftLbRange.match(/(\d+(?:\.\d+)?)\s*ft-lb/i);
  if (singleMatch) {
    const value = parseFloat(singleMatch[1]) * 12;
    return `${Math.round(value)} in-lb`;
  }
  return ftLbRange.replace('ft-lb', 'in-lb').replace(/(\d+(?:\.\d+)?)/g, (m) => String(parseFloat(m) * 12));
}

export const TORQUE_SPECS: Record<string, EngineTorqueSpecs> = {
  'predator-79': {
    engineSlug: 'predator-79',
    name: 'Predator 79cc',
    specs: [
      { component: 'Cylinder Head Bolts', torqueFtLb: '8-10 ft-lb', torqueInLb: convertFtLbToInLb('8-10 ft-lb'), notes: 'Tighten in crisscross pattern' },
      { component: 'Connecting Rod Bolts', torqueFtLb: '6-8 ft-lb', torqueInLb: convertFtLbToInLb('6-8 ft-lb'), notes: 'Critical - do not over-tighten' },
      { component: 'Flywheel Nut', torqueFtLb: '30-35 ft-lb', torqueInLb: convertFtLbToInLb('30-35 ft-lb'), notes: 'Use thread locker' },
      { component: 'Spark Plug', torqueFtLb: '8-10 ft-lb', torqueInLb: convertFtLbToInLb('8-10 ft-lb'), notes: 'Hand tight + 1/4 turn' },
      { component: 'Oil Drain Plug', torqueFtLb: '6-8 ft-lb', torqueInLb: convertFtLbToInLb('6-8 ft-lb'), notes: 'Replace crush washer' },
      { component: 'Carburetor Mounting Bolts', torqueFtLb: '4-6 ft-lb', torqueInLb: convertFtLbToInLb('4-6 ft-lb'), notes: 'Even pressure' },
      { component: 'Exhaust Mounting Bolts', torqueFtLb: '6-8 ft-lb', torqueInLb: convertFtLbToInLb('6-8 ft-lb'), notes: 'Check after first run' },
      { component: 'Air Filter Cover Screws', torqueFtLb: '2-4 ft-lb', torqueInLb: convertFtLbToInLb('2-4 ft-lb'), notes: 'Snug only' },
      { component: 'Valve Cover Bolts', torqueFtLb: '4-6 ft-lb', torqueInLb: convertFtLbToInLb('4-6 ft-lb'), notes: 'Even pattern' },
    ],
  },
  'predator-212-non-hemi': {
    engineSlug: 'predator-212-non-hemi',
    name: 'Predator 212 Non-Hemi',
    specs: [
      { component: 'Cylinder Head Bolts', torqueFtLb: '12-15 ft-lb', torqueInLb: convertFtLbToInLb('12-15 ft-lb'), notes: 'Tighten in crisscross pattern' },
      { component: 'Connecting Rod Bolts', torqueFtLb: '8-10 ft-lb', torqueInLb: convertFtLbToInLb('8-10 ft-lb'), notes: 'Critical - do not over-tighten' },
      { component: 'Flywheel Nut', torqueFtLb: '50-55 ft-lb', torqueInLb: convertFtLbToInLb('50-55 ft-lb'), notes: 'Use thread locker' },
      { component: 'Spark Plug', torqueFtLb: '10-12 ft-lb', torqueInLb: convertFtLbToInLb('10-12 ft-lb'), notes: 'Hand tight + 1/4 turn' },
      { component: 'Oil Drain Plug', torqueFtLb: '8-10 ft-lb', torqueInLb: convertFtLbToInLb('8-10 ft-lb'), notes: 'Replace crush washer' },
      { component: 'Carburetor Mounting Bolts', torqueFtLb: '5-7 ft-lb', torqueInLb: convertFtLbToInLb('5-7 ft-lb'), notes: 'Even pressure' },
      { component: 'Exhaust Mounting Bolts', torqueFtLb: '8-10 ft-lb', torqueInLb: convertFtLbToInLb('8-10 ft-lb'), notes: 'Check after first run' },
      { component: 'Air Filter Cover Screws', torqueFtLb: '3-5 ft-lb', torqueInLb: convertFtLbToInLb('3-5 ft-lb'), notes: 'Snug only' },
      { component: 'Governor Arm Screw', torqueFtLb: '5-7 ft-lb', torqueInLb: convertFtLbToInLb('5-7 ft-lb'), notes: 'If applicable' },
      { component: 'Valve Cover Bolts', torqueFtLb: '5-7 ft-lb', torqueInLb: convertFtLbToInLb('5-7 ft-lb'), notes: 'Even pattern' },
    ],
  },
  'predator-212-hemi': {
    engineSlug: 'predator-212-hemi',
    name: 'Predator 212 Hemi',
    specs: [
      { component: 'Cylinder Head Bolts', torqueFtLb: '12-15 ft-lb', torqueInLb: convertFtLbToInLb('12-15 ft-lb'), notes: 'Tighten in crisscross pattern' },
      { component: 'Connecting Rod Bolts', torqueFtLb: '8-10 ft-lb', torqueInLb: convertFtLbToInLb('8-10 ft-lb'), notes: 'Critical - do not over-tighten' },
      { component: 'Flywheel Nut', torqueFtLb: '50-55 ft-lb', torqueInLb: convertFtLbToInLb('50-55 ft-lb'), notes: 'Use thread locker' },
      { component: 'Spark Plug', torqueFtLb: '10-12 ft-lb', torqueInLb: convertFtLbToInLb('10-12 ft-lb'), notes: 'Hand tight + 1/4 turn' },
      { component: 'Oil Drain Plug', torqueFtLb: '8-10 ft-lb', torqueInLb: convertFtLbToInLb('8-10 ft-lb'), notes: 'Replace crush washer' },
      { component: 'Carburetor Mounting Bolts', torqueFtLb: '5-7 ft-lb', torqueInLb: convertFtLbToInLb('5-7 ft-lb'), notes: 'Even pressure' },
      { component: 'Exhaust Mounting Bolts', torqueFtLb: '8-10 ft-lb', torqueInLb: convertFtLbToInLb('8-10 ft-lb'), notes: 'Check after first run' },
      { component: 'Air Filter Cover Screws', torqueFtLb: '3-5 ft-lb', torqueInLb: convertFtLbToInLb('3-5 ft-lb'), notes: 'Snug only' },
      { component: 'Governor Arm Screw', torqueFtLb: '5-7 ft-lb', torqueInLb: convertFtLbToInLb('5-7 ft-lb'), notes: 'If applicable' },
      { component: 'Valve Cover Bolts', torqueFtLb: '5-7 ft-lb', torqueInLb: convertFtLbToInLb('5-7 ft-lb'), notes: 'Even pattern' },
    ],
  },
  'predator-ghost': {
    engineSlug: 'predator-ghost',
    name: 'Predator Ghost 212',
    specs: [
      { component: 'Cylinder Head Bolts', torqueFtLb: '12-15 ft-lb', torqueInLb: convertFtLbToInLb('12-15 ft-lb'), notes: 'Tighten in crisscross pattern' },
      { component: 'Connecting Rod Bolts', torqueFtLb: '8-10 ft-lb', torqueInLb: convertFtLbToInLb('8-10 ft-lb'), notes: 'Critical - do not over-tighten' },
      { component: 'Flywheel Nut', torqueFtLb: '50-55 ft-lb', torqueInLb: convertFtLbToInLb('50-55 ft-lb'), notes: 'Use thread locker (may use billet flywheel)' },
      { component: 'Spark Plug', torqueFtLb: '10-12 ft-lb', torqueInLb: convertFtLbToInLb('10-12 ft-lb'), notes: 'Hand tight + 1/4 turn' },
      { component: 'Oil Drain Plug', torqueFtLb: '8-10 ft-lb', torqueInLb: convertFtLbToInLb('8-10 ft-lb'), notes: 'Replace crush washer' },
      { component: 'Carburetor Mounting Bolts', torqueFtLb: '5-7 ft-lb', torqueInLb: convertFtLbToInLb('5-7 ft-lb'), notes: 'Even pressure' },
      { component: 'Exhaust Mounting Bolts', torqueFtLb: '8-10 ft-lb', torqueInLb: convertFtLbToInLb('8-10 ft-lb'), notes: 'Check after first run' },
      { component: 'Air Filter Cover Screws', torqueFtLb: '3-5 ft-lb', torqueInLb: convertFtLbToInLb('3-5 ft-lb'), notes: 'Snug only' },
      { component: 'Valve Cover Bolts', torqueFtLb: '5-7 ft-lb', torqueInLb: convertFtLbToInLb('5-7 ft-lb'), notes: 'Even pattern' },
    ],
  },
  'predator-224': {
    engineSlug: 'predator-224',
    name: 'Predator 224',
    specs: [
      { component: 'Cylinder Head Bolts', torqueFtLb: '12-15 ft-lb', torqueInLb: convertFtLbToInLb('12-15 ft-lb'), notes: 'Tighten in crisscross pattern' },
      { component: 'Connecting Rod Bolts', torqueFtLb: '8-10 ft-lb', torqueInLb: convertFtLbToInLb('8-10 ft-lb'), notes: 'Critical - do not over-tighten' },
      { component: 'Flywheel Nut', torqueFtLb: '50-55 ft-lb', torqueInLb: convertFtLbToInLb('50-55 ft-lb'), notes: 'Use thread locker' },
      { component: 'Spark Plug', torqueFtLb: '10-12 ft-lb', torqueInLb: convertFtLbToInLb('10-12 ft-lb'), notes: 'Hand tight + 1/4 turn' },
      { component: 'Oil Drain Plug', torqueFtLb: '8-10 ft-lb', torqueInLb: convertFtLbToInLb('8-10 ft-lb'), notes: 'Replace crush washer' },
      { component: 'Carburetor Mounting Bolts', torqueFtLb: '5-7 ft-lb', torqueInLb: convertFtLbToInLb('5-7 ft-lb'), notes: 'Even pressure' },
      { component: 'Exhaust Mounting Bolts', torqueFtLb: '8-10 ft-lb', torqueInLb: convertFtLbToInLb('8-10 ft-lb'), notes: 'Check after first run' },
      { component: 'Air Filter Cover Screws', torqueFtLb: '3-5 ft-lb', torqueInLb: convertFtLbToInLb('3-5 ft-lb'), notes: 'Snug only' },
      { component: 'Valve Cover Bolts', torqueFtLb: '5-7 ft-lb', torqueInLb: convertFtLbToInLb('5-7 ft-lb'), notes: 'Even pattern' },
    ],
  },
  'predator-301': {
    engineSlug: 'predator-301',
    name: 'Predator 301',
    specs: [
      { component: 'Cylinder Head Bolts', torqueFtLb: '14-18 ft-lb', torqueInLb: convertFtLbToInLb('14-18 ft-lb'), notes: 'Tighten in crisscross pattern' },
      { component: 'Connecting Rod Bolts', torqueFtLb: '10-12 ft-lb', torqueInLb: convertFtLbToInLb('10-12 ft-lb'), notes: 'Critical - do not over-tighten' },
      { component: 'Flywheel Nut', torqueFtLb: '60-65 ft-lb', torqueInLb: convertFtLbToInLb('60-65 ft-lb'), notes: 'Use thread locker' },
      { component: 'Spark Plug', torqueFtLb: '12-14 ft-lb', torqueInLb: convertFtLbToInLb('12-14 ft-lb'), notes: 'Hand tight + 1/4 turn' },
      { component: 'Oil Drain Plug', torqueFtLb: '10-12 ft-lb', torqueInLb: convertFtLbToInLb('10-12 ft-lb'), notes: 'Replace crush washer' },
      { component: 'Carburetor Mounting Bolts', torqueFtLb: '6-8 ft-lb', torqueInLb: convertFtLbToInLb('6-8 ft-lb'), notes: 'Even pressure' },
      { component: 'Exhaust Mounting Bolts', torqueFtLb: '10-12 ft-lb', torqueInLb: convertFtLbToInLb('10-12 ft-lb'), notes: 'Check after first run' },
      { component: 'Air Filter Cover Screws', torqueFtLb: '4-6 ft-lb', torqueInLb: convertFtLbToInLb('4-6 ft-lb'), notes: 'Snug only' },
      { component: 'Valve Cover Bolts', torqueFtLb: '6-8 ft-lb', torqueInLb: convertFtLbToInLb('6-8 ft-lb'), notes: 'Even pattern' },
    ],
  },
  'predator-420': {
    engineSlug: 'predator-420',
    name: 'Predator 420',
    specs: [
      { component: 'Cylinder Head Bolts', torqueFtLb: '16-20 ft-lb', torqueInLb: convertFtLbToInLb('16-20 ft-lb'), notes: 'Tighten in crisscross pattern' },
      { component: 'Connecting Rod Bolts', torqueFtLb: '12-14 ft-lb', torqueInLb: convertFtLbToInLb('12-14 ft-lb'), notes: 'Critical - do not over-tighten' },
      { component: 'Flywheel Nut', torqueFtLb: '65-70 ft-lb', torqueInLb: convertFtLbToInLb('65-70 ft-lb'), notes: 'Use thread locker' },
      { component: 'Spark Plug', torqueFtLb: '13-15 ft-lb', torqueInLb: convertFtLbToInLb('13-15 ft-lb'), notes: 'Hand tight + 1/4 turn' },
      { component: 'Oil Drain Plug', torqueFtLb: '12-14 ft-lb', torqueInLb: convertFtLbToInLb('12-14 ft-lb'), notes: 'Replace crush washer' },
      { component: 'Carburetor Mounting Bolts', torqueFtLb: '7-9 ft-lb', torqueInLb: convertFtLbToInLb('7-9 ft-lb'), notes: 'Even pressure' },
      { component: 'Exhaust Mounting Bolts', torqueFtLb: '12-14 ft-lb', torqueInLb: convertFtLbToInLb('12-14 ft-lb'), notes: 'Check after first run' },
      { component: 'Air Filter Cover Screws', torqueFtLb: '4-6 ft-lb', torqueInLb: convertFtLbToInLb('4-6 ft-lb'), notes: 'Snug only' },
      { component: 'Valve Cover Bolts', torqueFtLb: '7-9 ft-lb', torqueInLb: convertFtLbToInLb('7-9 ft-lb'), notes: 'Even pattern' },
    ],
  },
  'predator-670': {
    engineSlug: 'predator-670',
    name: 'Predator 670 V-Twin',
    specs: [
      { component: 'Cylinder Head Bolts', torqueFtLb: '18-22 ft-lb', torqueInLb: convertFtLbToInLb('18-22 ft-lb'), notes: 'Tighten in sequence, both cylinders' },
      { component: 'Connecting Rod Bolts', torqueFtLb: '14-16 ft-lb', torqueInLb: convertFtLbToInLb('14-16 ft-lb'), notes: 'Critical - do not over-tighten' },
      { component: 'Flywheel Nut', torqueFtLb: '70-75 ft-lb', torqueInLb: convertFtLbToInLb('70-75 ft-lb'), notes: 'Use thread locker' },
      { component: 'Spark Plug', torqueFtLb: '14-16 ft-lb', torqueInLb: convertFtLbToInLb('14-16 ft-lb'), notes: 'Hand tight + 1/4 turn (both)' },
      { component: 'Oil Drain Plug', torqueFtLb: '14-16 ft-lb', torqueInLb: convertFtLbToInLb('14-16 ft-lb'), notes: 'Replace crush washer' },
      { component: 'Carburetor Mounting Bolts', torqueFtLb: '8-10 ft-lb', torqueInLb: convertFtLbToInLb('8-10 ft-lb'), notes: 'Even pressure' },
      { component: 'Exhaust Mounting Bolts', torqueFtLb: '14-16 ft-lb', torqueInLb: convertFtLbToInLb('14-16 ft-lb'), notes: 'Check after first run' },
      { component: 'Air Filter Cover Screws', torqueFtLb: '5-7 ft-lb', torqueInLb: convertFtLbToInLb('5-7 ft-lb'), notes: 'Snug only' },
      { component: 'Valve Cover Bolts', torqueFtLb: '8-10 ft-lb', torqueInLb: convertFtLbToInLb('8-10 ft-lb'), notes: 'Even pattern' },
      { component: 'Crankcase Bolts', torqueFtLb: '12-14 ft-lb', torqueInLb: convertFtLbToInLb('12-14 ft-lb'), notes: 'V-twin specific' },
    ],
  },
  'honda-gx200': {
    engineSlug: 'honda-gx200',
    name: 'Honda GX200',
    specs: [
      { component: 'Cylinder Head Bolts', torqueFtLb: '14-16 ft-lb', torqueInLb: convertFtLbToInLb('14-16 ft-lb'), notes: 'Tighten in sequence (Honda spec)' },
      { component: 'Connecting Rod Bolts', torqueFtLb: '9-11 ft-lb', torqueInLb: convertFtLbToInLb('9-11 ft-lb'), notes: 'Critical - Honda spec' },
      { component: 'Flywheel Nut', torqueFtLb: '55-60 ft-lb', torqueInLb: convertFtLbToInLb('55-60 ft-lb'), notes: 'Use thread locker' },
      { component: 'Spark Plug', torqueFtLb: '11-13 ft-lb', torqueInLb: convertFtLbToInLb('11-13 ft-lb'), notes: 'Hand tight + 1/4 turn' },
      { component: 'Oil Drain Plug', torqueFtLb: '9-11 ft-lb', torqueInLb: convertFtLbToInLb('9-11 ft-lb'), notes: 'Replace crush washer' },
      { component: 'Carburetor Mounting Bolts', torqueFtLb: '6-8 ft-lb', torqueInLb: convertFtLbToInLb('6-8 ft-lb'), notes: 'Even pressure' },
      { component: 'Exhaust Mounting Bolts', torqueFtLb: '9-11 ft-lb', torqueInLb: convertFtLbToInLb('9-11 ft-lb'), notes: 'Check after first run' },
      { component: 'Air Filter Cover Screws', torqueFtLb: '4-6 ft-lb', torqueInLb: convertFtLbToInLb('4-6 ft-lb'), notes: 'Snug only' },
      { component: 'Valve Cover Bolts', torqueFtLb: '6-8 ft-lb', torqueInLb: convertFtLbToInLb('6-8 ft-lb'), notes: 'Even pattern' },
    ],
  },
  'briggs-206': {
    engineSlug: 'briggs-206',
    name: 'Briggs & Stratton 206',
    specs: [
      { component: 'Cylinder Head Bolts', torqueFtLb: '12-15 ft-lb', torqueInLb: convertFtLbToInLb('12-15 ft-lb'), notes: 'Tighten in crisscross pattern' },
      { component: 'Connecting Rod Bolts', torqueFtLb: '8-10 ft-lb', torqueInLb: convertFtLbToInLb('8-10 ft-lb'), notes: 'Critical - do not over-tighten' },
      { component: 'Flywheel Nut', torqueFtLb: '50-55 ft-lb', torqueInLb: convertFtLbToInLb('50-55 ft-lb'), notes: 'Use thread locker' },
      { component: 'Spark Plug', torqueFtLb: '10-12 ft-lb', torqueInLb: convertFtLbToInLb('10-12 ft-lb'), notes: 'Hand tight + 1/4 turn' },
      { component: 'Oil Drain Plug', torqueFtLb: '8-10 ft-lb', torqueInLb: convertFtLbToInLb('8-10 ft-lb'), notes: 'Replace crush washer' },
      { component: 'Carburetor Mounting Bolts', torqueFtLb: '5-7 ft-lb', torqueInLb: convertFtLbToInLb('5-7 ft-lb'), notes: 'Even pressure' },
      { component: 'Exhaust Mounting Bolts', torqueFtLb: '8-10 ft-lb', torqueInLb: convertFtLbToInLb('8-10 ft-lb'), notes: 'Check after first run' },
      { component: 'Air Filter Cover Screws', torqueFtLb: '3-5 ft-lb', torqueInLb: convertFtLbToInLb('3-5 ft-lb'), notes: 'Snug only' },
      { component: 'Valve Cover Bolts', torqueFtLb: '5-7 ft-lb', torqueInLb: convertFtLbToInLb('5-7 ft-lb'), notes: 'Even pattern' },
      { component: 'Side Cover Bolts', torqueFtLb: '8-10 ft-lb', torqueInLb: convertFtLbToInLb('8-10 ft-lb'), notes: 'Sealed engine - do not remove' },
    ],
  },
};

/**
 * Normalize slug for lookup (lowercase, trim)
 */
function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

/**
 * Get torque specs for an engine by slug
 */
export function getTorqueSpecs(engineSlug: string): EngineTorqueSpecs | null {
  const key = normalizeSlug(engineSlug);
  return TORQUE_SPECS[key] ?? TORQUE_SPECS[engineSlug] ?? null;
}

/**
 * Get all available engine slugs for torque specs
 */
export function getAvailableEngineSlugs(): string[] {
  return Object.keys(TORQUE_SPECS);
}
