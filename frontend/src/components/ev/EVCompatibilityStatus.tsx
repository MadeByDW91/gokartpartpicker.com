'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ElectricMotor, Part, PartCategory } from '@/types/database';

interface EVCompatibilityStatusProps {
  motor: ElectricMotor | null;
  parts: Map<PartCategory, Part>;
}

type Status = 'ok' | 'warn' | 'error';

interface Check {
  id: string;
  label: string;
  status: Status;
  message: string;
}

function getSpecNumber(specs: Record<string, unknown>, ...keys: string[]): number | null {
  for (const k of keys) {
    const v = specs[k];
    if (typeof v === 'number' && !isNaN(v)) return v;
  }
  return null;
}

export function EVCompatibilityStatus({ motor, parts }: EVCompatibilityStatusProps) {
  const checks = useMemo((): Check[] => {
    const result: Check[] = [];
    if (!motor) return result;

    const battery = parts.get('battery');
    const controller = parts.get('motor_controller');
    const charger = parts.get('charger');

    const motorV = motor.voltage;
    const motorKw = motor.power_kw;
    const requiredAmps = motorKw > 0 ? (motorKw * 1000) / motorV : 0;

    if (battery) {
      const v = getSpecNumber(battery.specifications ?? {}, 'voltage', 'voltage_v');
      if (v !== null) {
        if (v === motorV) {
          result.push({ id: 'battery-v', label: 'Battery voltage', status: 'ok', message: `${v}V matches motor` });
        } else {
          result.push({ id: 'battery-v', label: 'Battery voltage', status: 'error', message: `${v}V ≠ motor ${motorV}V` });
        }
      } else {
        result.push({ id: 'battery-v', label: 'Battery voltage', status: 'warn', message: 'Verify battery voltage matches motor' });
      }
    } else {
      result.push({ id: 'battery-v', label: 'Battery voltage', status: 'warn', message: 'Add a battery matching motor voltage' });
    }

    if (controller) {
      const v = getSpecNumber(controller.specifications ?? {}, 'voltage', 'voltage_v', 'voltage_max');
      const amps = getSpecNumber(controller.specifications ?? {}, 'max_current', 'rated_current', 'current_amps', 'continuous_amps');
      const kw = getSpecNumber(controller.specifications ?? {}, 'power_kw', 'max_power_kw', 'rated_power_kw');
      if (v !== null && v !== motorV) {
        result.push({ id: 'ctrl-v', label: 'Controller voltage', status: 'error', message: `${v}V ≠ motor ${motorV}V` });
      } else if (v !== null) {
        result.push({ id: 'ctrl-v', label: 'Controller voltage', status: 'ok', message: `${v}V matches motor` });
      }
      if (amps !== null && requiredAmps > 0 && amps < requiredAmps) {
        result.push({ id: 'ctrl-a', label: 'Controller current', status: 'warn', message: `Rated ${amps}A may be below motor draw (~${Math.round(requiredAmps)}A)` });
      } else if (amps !== null && requiredAmps > 0) {
        result.push({ id: 'ctrl-a', label: 'Controller current', status: 'ok', message: `Rated ${amps}A sufficient` });
      }
      if (kw !== null && kw < motorKw) {
        result.push({ id: 'ctrl-kw', label: 'Controller power', status: 'warn', message: `${kw} kW < motor ${motorKw} kW` });
      }
    } else {
      result.push({ id: 'ctrl', label: 'Controller', status: 'warn', message: 'Add a controller matching motor voltage and current' });
    }

    if (charger) {
      const v = getSpecNumber(charger.specifications ?? {}, 'voltage', 'voltage_v', 'output_voltage');
      if (v !== null && v !== motorV) {
        result.push({ id: 'charger-v', label: 'Charger voltage', status: 'error', message: `${v}V ≠ battery/motor ${motorV}V` });
      } else if (v !== null) {
        result.push({ id: 'charger-v', label: 'Charger voltage', status: 'ok', message: `${v}V matches` });
      }
    }

    return result;
  }, [motor, parts]);

  if (!motor || checks.length === 0) return null;

  const hasError = checks.some((c) => c.status === 'error');
  const hasWarn = checks.some((c) => c.status === 'warn');

  return (
    <Card className="bg-olive-800/50 border-olive-600">
      <CardHeader className="border-b border-olive-600 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className={cn(
              'w-4 h-4',
              hasError ? 'text-red-400' : hasWarn ? 'text-amber-400' : 'text-green-400'
            )} />
            <h3 className="text-sm font-semibold text-cream-100">Compatibility</h3>
          </div>
          {hasError && <span className="text-xs text-red-400">Fix required</span>}
          {!hasError && hasWarn && <span className="text-xs text-amber-400">Verify</span>}
          {!hasError && !hasWarn && <span className="text-xs text-green-400">OK</span>}
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        <ul className="space-y-1.5">
          {checks.map((c) => (
            <li key={c.id} className="flex items-start gap-2 text-xs">
              {c.status === 'ok' && <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />}
              {c.status === 'warn' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />}
              {c.status === 'error' && <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />}
              <span className={cn(
                'leading-relaxed',
                c.status === 'error' ? 'text-red-300' : c.status === 'warn' ? 'text-amber-300' : 'text-cream-300'
              )}>
                {c.label}: {c.message}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
