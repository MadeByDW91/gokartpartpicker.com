'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { DollarSign, AlertCircle } from 'lucide-react';
import { formatPrice, getCategoryLabel } from '@/lib/utils';
import type { Engine, Part, PartCategory } from '@/types/database';

const GAS_CATEGORIES: PartCategory[] = [
  'clutch',
  'torque_converter',
  'chain',
  'sprocket',
  'throttle',
  'fuel_system',
  'air_filter',
  'exhaust',
  'carburetor',
  'oil_system',
  'header',
];

const REQUIRED_FOR_BUILD: PartCategory[] = [
  'chain',
  'sprocket',
  'throttle',
  'fuel_system',
];

/** At least one required. */
const DRIVETRAIN: PartCategory[] = ['clutch', 'torque_converter'];

interface GasCostBreakdownProps {
  selectedEngine: Engine | null;
  selectedParts: Map<PartCategory, Part[]>;
}

export function GasCostBreakdown({ selectedEngine, selectedParts }: GasCostBreakdownProps) {
  const { total, byCategory, missing } = useMemo(() => {
    let total = 0;
    const byCategory: { label: string; amount: number }[] = [];
    const missing: string[] = [];

    if (selectedEngine?.price) {
      total += selectedEngine.price;
      byCategory.push({ label: 'Engine', amount: selectedEngine.price });
    } else if (selectedEngine) {
      missing.push('Engine (price unknown)');
    } else {
      missing.push('Engine');
    }

    const hasDrivetrain = DRIVETRAIN.some((c) => selectedParts.has(c));
    if (!hasDrivetrain && (selectedEngine || selectedParts.size > 0)) {
      missing.push('Clutch or torque converter');
    }

    for (const cat of GAS_CATEGORIES) {
      const partsArray = selectedParts.get(cat) || [];
      const categoryTotal = partsArray.reduce((sum, p) => sum + (p.price ?? 0), 0);
      if (categoryTotal > 0) {
        total += categoryTotal;
        byCategory.push({ label: getCategoryLabel(cat), amount: categoryTotal });
      } else if (REQUIRED_FOR_BUILD.includes(cat) && (selectedEngine || selectedParts.size > 0)) {
        missing.push(getCategoryLabel(cat));
      }
    }

    return { total, byCategory, missing };
  }, [selectedEngine, selectedParts]);

  return (
    <Card className="bg-olive-800/50 border-olive-600">
      <CardHeader className="border-b border-olive-600">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <DollarSign className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h3 className="text-display font-semibold text-cream-100">Gas build cost</h3>
            <p className="text-sm text-cream-400">
              {total > 0 ? formatPrice(total) : 'Select engine + parts'}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {byCategory.length > 0 && (
          <ul className="space-y-2 mb-4">
            {byCategory.map(({ label, amount }) => (
              <li key={label} className="flex justify-between text-sm text-cream-300">
                <span>{label}</span>
                <span className="font-medium text-cream-100">{formatPrice(amount)}</span>
              </li>
            ))}
          </ul>
        )}
        {total > 0 && (
          <div className="flex justify-between items-center pt-3 border-t border-olive-600">
            <span className="font-semibold text-cream-100">Total</span>
            <span className="text-xl font-bold text-orange-400">{formatPrice(total)}</span>
          </div>
        )}
        {missing.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-cream-300">
              Still need: <strong className="text-cream-100">{missing.join(', ')}</strong>.
              Typical Predator + clutch + chain build: $300–$800.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
