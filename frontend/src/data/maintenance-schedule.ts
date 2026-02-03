/**
 * Typical maintenance schedule for small horizontal-shaft gas engines
 * (Predator, clone, Honda GX-style). Check owner's manual for specific model.
 */

export interface MaintenanceItem {
  interval: string;
  task: string;
}

export const GAS_ENGINE_MAINTENANCE_SCHEDULE: MaintenanceItem[] = [
  { interval: 'First 5–10 hrs', task: 'Break-in oil change' },
  { interval: 'Every 25–50 hrs', task: 'Oil change' },
  { interval: 'Every 25–50 hrs', task: 'Air filter inspection / clean or replace' },
  { interval: 'Every 50–100 hrs', task: 'Spark plug check / replace' },
  { interval: 'Every 100 hrs or annually', task: 'Valve clearance check' },
  { interval: 'As needed', task: 'Carburetor clean, fuel filter, fuel line check' },
];
