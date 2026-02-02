'use client';

import { useMemo, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Gauge } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import type { ElectricMotor } from '@/types/database';

/**
 * Simplified range formula: Range (mi) ≈ (V × Ah × efficiency × factor) / (power_kw × 0.4)
 * factor 0.5 = moderate use. Adjust for light/heavy.
 */
function estimateRangeMiles(
  voltage: number,
  ah: number,
  powerKw: number,
  efficiency: number = 0.85,
  useFactor: number = 0.5
): number {
  if (ah <= 0 || powerKw <= 0) return 0;
  const wh = voltage * ah;
  const usable = wh * efficiency * useFactor;
  const milesPerKwh = 3; // rough go-kart consumption
  return Math.round((usable / 1000) * milesPerKwh * 10) / 10;
}

/**
 * Runtime (min) at full throttle: (V × Ah × 0.8) / (power_kw × 1000 / 60) ≈ drawn current vs capacity
 * Simplified: (V * Ah * 60) / (power_kw * 1000) * 0.5 (efficiency/discharge)
 */
function estimateRuntimeMinutes(
  voltage: number,
  ah: number,
  powerKw: number,
  efficiency: number = 0.85
): number {
  if (ah <= 0 || powerKw <= 0) return 0;
  const wh = voltage * ah * efficiency;
  const runMinutes = (wh / 1000 / powerKw) * 60 * 0.5;
  return Math.round(runMinutes);
}

interface EVRangeRuntimeEstimatorProps {
  motor: ElectricMotor | null;
  /** Battery Ah from selected battery part, or manual override */
  batteryAh?: number | null;
  /** Battery voltage; defaults to motor voltage */
  batteryVoltage?: number | null;
}

export function EVRangeRuntimeEstimator({
  motor,
  batteryAh: batteryAhProp = null,
  batteryVoltage = null,
}: EVRangeRuntimeEstimatorProps) {
  const [ahOverride, setAhOverride] = useState(20);
  const ah = batteryAhProp ?? ahOverride;
  const voltage = batteryVoltage ?? motor?.voltage ?? 48;

  const estimates = useMemo(() => {
    if (!motor) return null;
    const rangeModerate = estimateRangeMiles(voltage, ah, motor.power_kw, 0.85, 0.5);
    const rangeLight = estimateRangeMiles(voltage, ah, motor.power_kw, 0.85, 0.7);
    const rangeHeavy = estimateRangeMiles(voltage, ah, motor.power_kw, 0.85, 0.35);
    const runtimeFull = estimateRuntimeMinutes(voltage, ah, motor.power_kw, 0.85);
    return { rangeModerate, rangeLight, rangeHeavy, runtimeFull };
  }, [motor, voltage, ah]);

  if (!motor) {
    return (
      <Card className="bg-olive-800/50 border-olive-600">
        <CardContent className="py-8 text-center">
          <p className="text-cream-400">Select a motor and optionally a battery to estimate range and runtime.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-olive-800/50 border-olive-600">
      <CardHeader className="border-b border-olive-600">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Gauge className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-display font-semibold text-cream-100">Range & runtime</h3>
            <p className="text-sm text-cream-400">
              {motor.name} ({motor.voltage}V, {motor.power_kw} kW)
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-cream-300 mb-1">
            Battery capacity (Ah){batteryAhProp != null ? ' — from selected battery' : ''}
          </label>
          <Input
            type="number"
            min={1}
            max={200}
            value={ah}
            onChange={(e) => setAhOverride(Math.max(0, Number(e.target.value) || 0))}
            readOnly={batteryAhProp != null}
          />
        </div>
        {estimates && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-cream-400">Range (moderate use)</span>
              <span className="font-semibold text-cream-100">~{estimates.rangeModerate} mi</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-cream-400">Range (light use)</span>
              <span className="text-cream-200">~{estimates.rangeLight} mi</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-cream-400">Range (heavy use)</span>
              <span className="text-cream-200">~{estimates.rangeHeavy} mi</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-olive-600">
              <span className="text-cream-400">Runtime at full throttle</span>
              <span className="font-semibold text-orange-400">~{estimates.runtimeFull} min</span>
            </div>
          </div>
        )}
        <p className="text-xs text-cream-500 mt-4">
          Estimates only. Actual range depends on weight, terrain, and riding style.
        </p>
      </CardContent>
    </Card>
  );
}
