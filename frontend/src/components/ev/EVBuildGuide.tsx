'use client';

import { useMemo, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Check, Circle, ChevronDown, ChevronUp, ArrowRight, Battery } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn, getCategoryLabel } from '@/lib/utils';
import type { ElectricMotor, Part, PartCategory } from '@/types/database';

const STEPS: {
  id: string;
  label: string;
  category?: PartCategory;
  categories?: PartCategory[];
  description: string;
}[] = [
  { id: 'motor', label: 'Choose motor', description: 'Pick voltage (e.g. 48V) and power' },
  { id: 'battery', label: 'Add battery', category: 'battery', description: 'Match motor voltage, sufficient Ah' },
  { id: 'controller', label: 'Add controller', category: 'motor_controller', description: 'Match voltage, rated for motor power' },
  { id: 'rest', label: 'Charger, throttle, safety', categories: ['charger', 'throttle_controller'], description: 'Charger + throttle + BMS, fuses, wiring' },
];

/** Complete EV system items checklist */
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

interface EVBuildGuideProps {
  selectedMotor: ElectricMotor | null;
  selectedParts: Map<PartCategory, Part[]>;
  onSelectPart?: (category: PartCategory) => void;
  compact?: boolean;
}

export function EVBuildGuide({
  selectedMotor,
  selectedParts,
  onSelectPart,
  compact = false,
}: EVBuildGuideProps) {
  const [expanded, setExpanded] = useState(!compact);

  const { currentStepIndex, nextAction } = useMemo(() => {
    let idx = 0;
    if (!selectedMotor) {
      return { currentStepIndex: 0, nextAction: { label: 'Choose motor', category: null as PartCategory | null } };
    }
    idx = 1;
    if (!selectedParts.has('battery')) {
      return { currentStepIndex: 1, nextAction: { label: 'Add battery', category: 'battery' as PartCategory } };
    }
    idx = 2;
    if (!selectedParts.has('motor_controller')) {
      return { currentStepIndex: 2, nextAction: { label: 'Add controller', category: 'motor_controller' as PartCategory } };
    }
    idx = 3;
    const hasCharger = selectedParts.has('charger');
    const hasThrottle = selectedParts.has('throttle_controller');
    if (!hasCharger || !hasThrottle) {
      return {
        currentStepIndex: 3,
        nextAction: {
          label: !hasCharger ? 'Add charger' : 'Add throttle',
          category: (!hasCharger ? 'charger' : 'throttle_controller') as PartCategory,
        },
      };
    }
    return { currentStepIndex: 4, nextAction: { label: 'All required steps done', category: null } };
  }, [selectedMotor, selectedParts]);

  const allDone = currentStepIndex >= 4;

  // Calculate completion stats
  const completed = useMemo(() => {
    let count = 0;
    if (selectedMotor) count++;
    for (const item of EV_SYSTEM_ITEMS) {
      if (item.id === 'motor') continue;
      if (item.category && selectedParts.has(item.category)) count++;
    }
    return count;
  }, [selectedMotor, selectedParts]);

  const totalRequired = 1 + EV_SYSTEM_ITEMS.filter((i) => i.required).length;
  const requiredDone = useMemo(() => {
    let n = selectedMotor ? 1 : 0;
    for (const item of EV_SYSTEM_ITEMS) {
      if (!item.required) continue;
      if (item.id === 'motor') continue;
      if (item.category && selectedParts.has(item.category)) n++;
    }
    return n;
  }, [selectedMotor, selectedParts]);

  return (
    <Card className="bg-olive-800/50 border-olive-600">
      <button
        type="button"
        className="w-full text-left"
        onClick={() => setExpanded((e) => !e)}
      >
        <CardHeader className="border-b border-olive-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Battery className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-display font-semibold text-cream-100">EV Build Guide</h3>
                <p className="text-sm text-cream-400">
                  {allDone 
                    ? `${completed} of ${EV_SYSTEM_ITEMS.length + 1} items complete` 
                    : `Step ${currentStepIndex + 1} of 4: ${nextAction.label}`}
                  {requiredDone < totalRequired && !allDone && (
                    <span className="text-orange-400 ml-1">
                      — {totalRequired - requiredDone} required missing
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
      </button>

      {expanded && (
        <CardContent className="pt-4">
          {/* Recommended next step */}
          {!allDone && nextAction.category && onSelectPart && (
            <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-cream-100">Next: {nextAction.label}</span>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onSelectPart(nextAction.category!)}
              >
                Browse
              </Button>
            </div>
          )}

          {/* Step-by-step guide */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-cream-200 mb-3">Build Steps</h4>
            <ol className="space-y-3">
              {STEPS.map((step, i) => {
                const isMotorStep = step.id === 'motor';
                const done = isMotorStep
                  ? !!selectedMotor
                  : step.categories
                    ? step.categories.every((c) => selectedParts.has(c))
                    : step.category
                      ? selectedParts.has(step.category)
                      : false;
                const isCurrent = i === currentStepIndex;
                const browseCats = step.categories ?? (step.category ? [step.category] : []);

                return (
                  <li
                    key={step.id}
                    className={cn(
                      'flex items-start gap-3 p-2 rounded-lg transition-colors',
                      isCurrent && !done && 'bg-blue-500/10 border border-blue-500/20'
                    )}
                  >
                    {done ? (
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-cream-500/50 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-cream-100">{(i + 1)}. {step.label}</span>
                        {isCurrent && !done && (
                          <span className="text-xs font-medium text-blue-400 bg-blue-500/20 px-1.5 py-0.5 rounded">
                            Next
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-cream-500 mt-0.5">{step.description}</p>
                      {!done && browseCats.length > 0 && onSelectPart && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {browseCats.filter((c) => !selectedParts.has(c)).map((cat) => (
                            <Button
                              key={cat}
                              variant="ghost"
                              size="sm"
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                              onClick={() => onSelectPart(cat)}
                            >
                              Browse {getCategoryLabel(cat)}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Complete system checklist */}
          <div className="pt-4 border-t border-olive-600">
            <h4 className="text-sm font-semibold text-cream-200 mb-3">Complete System Checklist</h4>
            <ul className="space-y-2">
              {EV_SYSTEM_ITEMS.map((item) => {
                const isMotor = item.id === 'motor';
                const hasPart = isMotor 
                  ? !!selectedMotor
                  : !!item.category && selectedParts.has(item.category);
                const part = isMotor ? null : (item.category ? selectedParts.get(item.category)?.[0] ?? null : null);

                return (
                  <li key={item.id} className="flex items-start gap-3">
                    {hasPart ? (
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-cream-500/50 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn(
                          'text-sm font-medium',
                          hasPart ? 'text-cream-100' : 'text-cream-400'
                        )}>
                          {item.label}
                          {item.required && (
                            <span className="text-orange-400/80 text-xs ml-1">required</span>
                          )}
                        </span>
                        {isMotor && selectedMotor && (
                          <span className="text-cream-500 text-xs truncate">
                            — {selectedMotor.name} ({selectedMotor.voltage}V)
                          </span>
                        )}
                        {part && (
                          <span className="text-cream-500 text-xs truncate">
                            — {part.name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-cream-500 mt-0.5">{item.description}</p>
                      {!hasPart && item.category && onSelectPart && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 text-xs h-7"
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
          </div>

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
