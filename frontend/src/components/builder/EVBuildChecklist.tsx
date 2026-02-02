'use client';

import { useMemo, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Check, Circle, Battery, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { ElectricMotor, Part, PartCategory } from '@/types/database';

/** EV system items we track. Maps to part categories where applicable. */
const EV_SYSTEM_ITEMS: {
  id: string;
  label: string;
  category?: PartCategory;
  required: boolean;
  description: string;
}[] = [
  { id: 'motor', label: 'Motor', required: true, description: 'Power source' },
  { id: 'battery', label: 'Battery', category: 'battery', required: true, description: 'Energy storage — match motor voltage' },
  { id: 'controller', label: 'Motor controller', category: 'motor_controller', required: true, description: 'Speed & throttle control' },
  { id: 'charger', label: 'Charger', category: 'charger', required: true, description: 'Recharge battery — match voltage' },
  { id: 'bms', label: 'BMS', category: 'bms', required: false, description: 'Battery protection (recommended for Li-ion)' },
  { id: 'throttle', label: 'Throttle', category: 'throttle_controller', required: true, description: 'User input (pot, hall, or PWM)' },
  { id: 'mount', label: 'Battery mount', category: 'battery_mount', required: false, description: 'Secure battery' },
  { id: 'wiring', label: 'Wiring / harness', category: 'wiring_harness', required: false, description: 'Connections & correct gauge' },
  { id: 'safety', label: 'Fuses & kill switch', required: false, description: 'Strongly recommended' },
];

interface EVBuildChecklistProps {
  selectedMotor: ElectricMotor | null;
  selectedParts: Map<PartCategory, Part[]>;
  onSelectPart?: (category: PartCategory) => void;
  compact?: boolean;
}

export function EVBuildChecklist({
  selectedMotor,
  selectedParts,
  onSelectPart,
  compact = false,
}: EVBuildChecklistProps) {
  const [expanded, setExpanded] = useState(false);
  const completed = useMemo(() => {
    let count = 0;
    if (selectedMotor) count++;
    for (const item of EV_SYSTEM_ITEMS) {
      if (item.id === 'motor') continue;
      if (item.category && selectedParts.has(item.category)) count++;
    }
    return count;
  }, [selectedMotor, selectedParts]);

  const total = 1 + EV_SYSTEM_ITEMS.filter((i) => i.required).length;
  const requiredDone = useMemo(() => {
    let n = selectedMotor ? 1 : 0;
    for (const item of EV_SYSTEM_ITEMS) {
      if (!item.required) continue;
      if (item.id === 'motor') continue;
      if (item.category && selectedParts.has(item.category)) n++;
    }
    return n;
  }, [selectedMotor, selectedParts]);

  const nextStep = useMemo((): { label: string; category: PartCategory | null } | null => {
    if (!selectedMotor) return { label: 'Choose motor', category: null };
    if (!selectedParts.has('battery')) return { label: 'Add battery', category: 'battery' };
    if (!selectedParts.has('motor_controller')) return { label: 'Add controller', category: 'motor_controller' };
    if (!selectedParts.has('charger')) return { label: 'Add charger', category: 'charger' };
    if (!selectedParts.has('throttle_controller')) return { label: 'Add throttle', category: 'throttle_controller' };
    return null;
  }, [selectedMotor, selectedParts]);

  return (
    <Card className="bg-olive-800/50 border-olive-600">
      <CardHeader
        className="cursor-pointer border-b border-olive-600"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Battery className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-display font-semibold text-cream-100">EV System Checklist</h3>
              <p className="text-sm text-cream-400">
                {completed} of {EV_SYSTEM_ITEMS.length + 1} items
                {requiredDone < total && (
                  <span className="text-orange-400 ml-1">
                    — {total - requiredDone} required missing
                  </span>
                )}
              </p>
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-cream-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-cream-400" />
          )}
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-4">
          {nextStep?.category && onSelectPart && (
            <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-cream-100">Next: {nextStep.label}</span>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onSelectPart(nextStep.category!)}
              >
                Browse
              </Button>
            </div>
          )}
          <ul className="space-y-2">
            {/* Motor */}
            <li className="flex items-start gap-3">
              {selectedMotor ? (
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-cream-500/50 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <span className={cn(
                  'font-medium',
                  selectedMotor ? 'text-cream-100' : 'text-cream-400'
                )}>
                  Motor
                </span>
                {selectedMotor && (
                  <span className="text-cream-500 ml-1 truncate">
                    — {selectedMotor.name} ({selectedMotor.voltage}V)
                  </span>
                )}
                <p className="text-xs text-cream-500 mt-0.5">Power source</p>
              </div>
            </li>

            {EV_SYSTEM_ITEMS.filter((i) => i.id !== 'motor').map((item) => {
              const hasPart = !!item.category && selectedParts.has(item.category);
              const part = item.category ? selectedParts.get(item.category)?.[0] ?? null : null;
              return (
                <li key={item.id} className="flex items-start gap-3">
                  {hasPart ? (
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-cream-500/50 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn(
                        'font-medium',
                        hasPart ? 'text-cream-100' : 'text-cream-400'
                      )}>
                        {item.label}
                        {item.required && (
                          <span className="text-orange-400/80 text-xs ml-1">required</span>
                        )}
                      </span>
                      {part && (
                        <span className="text-cream-500 text-sm truncate">
                          — {part.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-cream-500 mt-0.5">{item.description}</p>
                    {!hasPart && item.category && onSelectPart && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                        onClick={() => onSelectPart(item.category!)}
                      >
                        Browse {item.label}
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {selectedMotor && (
            <div className="mt-4 pt-4 border-t border-olive-600">
              <p className="text-xs text-cream-400">
                Use a <strong className="text-cream-200">{selectedMotor.voltage}V</strong> battery,
                controller, and charger. Ensure controller is rated for at least{' '}
                <strong className="text-cream-200">{selectedMotor.power_kw} kW</strong>.
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
