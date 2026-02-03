import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { PartCategory } from '@/types/database';

/**
 * Combines clsx and tailwind-merge for conditional class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price with currency
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(price);
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Slugify a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Category display names
 */
export const CATEGORY_LABELS: Record<string, string> = {
  // Drive train
  clutch: 'Clutch',
  torque_converter: 'Torque Converter',
  chain: 'Chain',
  sprocket: 'Sprocket',
  // Chassis
  axle: 'Axle',
  wheel: 'Wheel',
  tire: 'Tire',
  tire_front: 'Front Tire',
  tire_rear: 'Rear Tire',
  brake: 'Brake',
  throttle: 'Throttle',
  pedals: 'Pedals',
  frame: 'Frame',
  // Engine parts
  carburetor: 'Carburetor',
  exhaust: 'Exhaust',
  air_filter: 'Air Filter',
  camshaft: 'Camshaft',
  valve_spring: 'Valve Spring',
  flywheel: 'Flywheel',
  ignition: 'Ignition',
  connecting_rod: 'Connecting Rod',
  piston: 'Piston',
  crankshaft: 'Crankshaft',
  oil_system: 'Oil System',
  header: 'Header',
  fuel_system: 'Fuel System',
  gasket: 'Gasket',
  hardware: 'Hardware',
  other: 'Other',
  // EV-specific categories
  battery: 'Battery',
  motor_controller: 'Motor Controller',
  bms: 'BMS',
  charger: 'Charger',
  throttle_controller: 'Throttle Controller',
  voltage_converter: 'Voltage Converter',
  battery_mount: 'Battery Mount',
  wiring_harness: 'Wiring Harness',
  fuse_kill_switch: 'Fuses & Kill Switch',
};

/**
 * Category groups for better organization
 */
export interface CategoryGroup {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  categories: string[];
}

// Gas engine-specific categories (only show for gas builds)
export const GAS_ONLY_CATEGORIES: PartCategory[] = [
  'carburetor',
  'exhaust',
  'air_filter',
  'camshaft',
  'valve_spring',
  'flywheel',
  'ignition',
  'connecting_rod',
  'piston',
  'crankshaft',
  'oil_system',
  'header',
  'fuel_system',
  'gasket',
];

// Electric motor-specific categories (only show for electric builds)
export const ELECTRIC_ONLY_CATEGORIES: PartCategory[] = [
  'battery',
  'motor_controller',
  'bms',
  'charger',
  'throttle_controller',
  'voltage_converter',
  'battery_mount',
  'wiring_harness',
  'fuse_kill_switch',
];

/**
 * Check if a category is compatible with a power source
 */
export function isCategoryCompatibleWithPowerSource(
  category: PartCategory,
  powerSource: 'gas' | 'electric'
): boolean {
  if (powerSource === 'gas') {
    // Gas builds: show gas-only and shared categories, but not electric-only
    return !ELECTRIC_ONLY_CATEGORIES.includes(category);
  } else {
    // Electric builds: show electric-only and shared categories, but not gas-only
    return !GAS_ONLY_CATEGORIES.includes(category);
  }
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: 'drivetrain',
    label: 'Drivetrain',
    categories: ['clutch', 'torque_converter', 'chain', 'sprocket'],
  },
  {
    id: 'chassis',
    label: 'Chassis',
    categories: ['axle', 'wheel', 'tire', 'tire_front', 'tire_rear', 'brake', 'throttle', 'pedals', 'frame'],
  },
  {
    id: 'engine',
    label: 'Engine Parts',
    categories: [
      'carburetor',
      'exhaust',
      'air_filter',
      'camshaft',
      'valve_spring',
      'flywheel',
      'ignition',
      'connecting_rod',
      'piston',
      'crankshaft',
      'oil_system',
      'header',
      'fuel_system',
      'gasket',
    ],
  },
  {
    id: 'ev_system',
    label: 'EV System',
    categories: [
      'battery',
      'motor_controller',
      'charger',
      'bms',
      'throttle_controller',
      'battery_mount',
      'wiring_harness',
      'fuse_kill_switch',
      'voltage_converter',
    ],
  },
  {
    id: 'other',
    label: 'Other',
    categories: ['hardware', 'other'],
  },
];

/** Builder display order: electric — EV System under Motor, then Drivetrain, Chassis, Other. */
const EV_BUILDER_GROUP_ORDER: string[] = ['ev_system', 'drivetrain', 'chassis', 'other'];

/** Builder display order: gas — Drivetrain, Chassis, Engine, Other. */
const GAS_BUILDER_GROUP_ORDER: string[] = ['drivetrain', 'chassis', 'engine', 'other'];

/**
 * Category groups in builder display order. EV System appears directly under Motor for electric builds.
 */
export function getOrderedCategoryGroupsForBuilder(powerSource: 'gas' | 'electric'): CategoryGroup[] {
  const order = powerSource === 'electric' ? EV_BUILDER_GROUP_ORDER : GAS_BUILDER_GROUP_ORDER;
  const byId = new Map(CATEGORY_GROUPS.map((g) => [g.id, g]));
  return order.map((id) => byId.get(id)).filter((g): g is CategoryGroup => !!g);
}

/** Display label when brand is missing (motors, parts). */
export const BRAND_FALLBACK = 'Unbranded';

/** @deprecated Use BRAND_FALLBACK */
export const MOTOR_BRAND_FALLBACK = BRAND_FALLBACK;

/**
 * Display string for electric motor brand. Use everywhere we show motor.brand in the UI.
 */
export function getMotorBrandDisplay(brand: string | null | undefined): string {
  const trimmed = typeof brand === 'string' ? brand.trim() : '';
  return trimmed || BRAND_FALLBACK;
}

/**
 * Display string for part brand. Use everywhere we show part.brand in the UI.
 * Shows "Unbranded" when null/empty for a consistent, professional look.
 */
export function getPartBrandDisplay(brand: string | null | undefined): string {
  const trimmed = typeof brand === 'string' ? brand.trim() : '';
  return trimmed || BRAND_FALLBACK;
}

/**
 * Get category label
 */
export function getCategoryLabel(category: string | undefined | null): string {
  if (!category) return 'Unknown';
  return CATEGORY_LABELS[category] || category.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

/**
 * Get category group for a category
 */
export function getCategoryGroup(category: string): CategoryGroup | null {
  return CATEGORY_GROUPS.find(group => group.categories.includes(category)) || null;
}
