'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Clock } from 'lucide-react';
import type { Part } from '@/types/database';

/**
 * Charging time (hrs) ≈ (Ah × 1.2) / charger_amps
 */
function estimateChargingHours(ah: number, chargerAmps: number): number {
  if (chargerAmps <= 0) return 0;
  return Math.round((ah * 1.2) / chargerAmps * 10) / 10;
}

interface EVChargingTimeProps {
  batteryAh: number | null;
  chargerPart: Part | null;
}

export function EVChargingTime({ batteryAh, chargerPart }: EVChargingTimeProps) {
  const { hours, hasData } = useMemo(() => {
    const ah = batteryAh ?? 0;
    const specs = chargerPart?.specifications ?? {};
    const amps = (specs.current_output ?? specs.output_amps ?? specs.amps) as number | undefined;
    if (!amps || typeof amps !== 'number' || amps <= 0 || ah <= 0) {
      return { hours: 0, hasData: false };
    }
    return { hours: estimateChargingHours(ah, amps), hasData: true };
  }, [batteryAh, chargerPart]);

  if (!hasData) return null;

  return (
    <Card className="bg-olive-800/50 border-olive-600">
      <CardHeader className="border-b border-olive-600 pb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-cream-100">Charging Time</h3>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        <p className="text-sm font-medium text-cream-100">
          ~{hours} {hours === 1 ? 'hour' : 'hours'}
        </p>
        {chargerPart && (
          <p className="text-xs text-cream-500 mt-1 truncate">{chargerPart.name}</p>
        )}
      </CardContent>
    </Card>
  );
}
