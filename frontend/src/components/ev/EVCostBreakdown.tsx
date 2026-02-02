'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { DollarSign, AlertCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { ElectricMotor, Part, PartCategory } from '@/types/database';

const EV_CATEGORY_LABELS: Record<string, string> = {
  battery: 'Battery',
  motor_controller: 'Controller',
  charger: 'Charger',
  bms: 'BMS',
  throttle_controller: 'Throttle',
  voltage_converter: 'Converter',
  battery_mount: 'Mount',
  wiring_harness: 'Wiring',
};

interface EVCostBreakdownProps {
  selectedMotor: ElectricMotor | null;
  selectedParts: Map<PartCategory, Part[]>;
}

export function EVCostBreakdown({ selectedMotor, selectedParts }: EVCostBreakdownProps) {
  const { total, byCategory, missing } = useMemo(() => {
    let total = 0;
    const byCategory: { label: string; amount: number }[] = [];
    const missing: string[] = [];

    if (selectedMotor?.price) {
      total += selectedMotor.price;
      byCategory.push({ label: 'Motor', amount: selectedMotor.price });
    } else if (selectedMotor) {
      missing.push('Motor (price unknown)');
    } else {
      missing.push('Motor');
    }

    const evCategories: PartCategory[] = [
      'battery',
      'motor_controller',
      'charger',
      'bms',
      'throttle_controller',
      'voltage_converter',
      'battery_mount',
      'wiring_harness',
    ];

    const required = ['battery', 'motor_controller', 'charger', 'throttle_controller'];

    for (const cat of evCategories) {
      const partsArray = selectedParts.get(cat) || [];
      const categoryTotal = partsArray.reduce((sum, p) => sum + (p.price ?? 0), 0);
      if (categoryTotal > 0) {
        total += categoryTotal;
        byCategory.push({
          label: EV_CATEGORY_LABELS[cat] || cat,
          amount: categoryTotal,
        });
      } else if (required.includes(cat)) {
        missing.push(EV_CATEGORY_LABELS[cat] || cat);
      }
    }

    return { total, byCategory, missing };
  }, [selectedMotor, selectedParts]);

  return (
    <Card className="bg-olive-800/50 border-olive-600">
      <CardHeader className="border-b border-olive-600 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-semibold text-cream-100">Build Cost</h3>
          </div>
          {total > 0 && (
            <span className="text-lg font-bold text-orange-400">{formatPrice(total)}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        {byCategory.length > 0 ? (
          <div className="space-y-1.5">
            {byCategory.map(({ label, amount }) => (
              <div
                key={label}
                className="flex justify-between text-xs text-cream-400"
              >
                <span>{label}</span>
                <span className="text-cream-200">{formatPrice(amount)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-cream-500">Select parts to see cost</p>
        )}
        {missing.length > 0 && (
          <div className="mt-3 pt-3 border-t border-olive-600">
            <p className="text-xs text-cream-400">
              Missing: <span className="text-cream-300">{missing.slice(0, 2).join(', ')}</span>
              {missing.length > 2 && <span className="text-cream-500"> +{missing.length - 2}</span>}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
