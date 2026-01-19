/**
 * useBuildPerformance Hook
 * 
 * React hook that calculates build performance metrics
 * Updates automatically when engine or parts change
 */

import { useMemo } from 'react';
import { useBuildStore } from '@/store/build-store';
import {
  calculatePerformance,
  type PerformanceMetrics,
} from '@/lib/performance/calculator';

/**
 * Hook to get performance metrics for the current build
 * 
 * @returns Performance metrics object with hp, torque, topSpeed, etc.
 */
export function useBuildPerformance(): PerformanceMetrics {
  const { selectedEngine, selectedParts } = useBuildStore();
  
  const performance = useMemo(() => {
    const partsArray = Array.from(selectedParts.values());
    return calculatePerformance(selectedEngine, partsArray);
  }, [selectedEngine, selectedParts]);
  
  return performance;
}

/**
 * Hook to get individual performance metrics
 * Useful when you only need specific values
 */
export function useBuildHP(): number {
  const { hp } = useBuildPerformance();
  return hp;
}

export function useBuildTorque(): number {
  const { torque } = useBuildPerformance();
  return torque;
}

export function useBuildTopSpeed(): number {
  const { topSpeed } = useBuildPerformance();
  return topSpeed;
}

export function useBuildPowerToWeight(): number {
  const { powerToWeight } = useBuildPerformance();
  return powerToWeight;
}
