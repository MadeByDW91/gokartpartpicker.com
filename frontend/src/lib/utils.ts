import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
  brake: 'Brake',
  throttle: 'Throttle',
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

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: 'drivetrain',
    label: 'Drivetrain',
    categories: ['clutch', 'torque_converter', 'chain', 'sprocket'],
  },
  {
    id: 'chassis',
    label: 'Chassis',
    categories: ['axle', 'wheel', 'tire', 'brake', 'throttle', 'frame'],
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
    id: 'other',
    label: 'Other',
    categories: ['hardware', 'other'],
  },
];

/**
 * Get category label
 */
export function getCategoryLabel(category: string): string {
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
