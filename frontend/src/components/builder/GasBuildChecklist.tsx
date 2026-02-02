'use client';

import { useMemo, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Check, Circle, Cog, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn, getCategoryLabel } from '@/lib/utils';
import type { Engine, Part, PartCategory } from '@/types/database';

const STEPS: {
  id: string;
  label: string;
  category?: PartCategory;
  categories?: PartCategory[];
  description: string;
}[] = [
  { id: 'engine', label: 'Choose engine', description: 'Select your gas engine' },
  { id: 'drivetrain', label: 'Add drivetrain', categories: ['clutch', 'torque_converter'], description: 'Clutch or torque converter — match engine shaft' },
  { id: 'chain', label: 'Add chain & sprockets', categories: ['chain', 'sprocket'], description: 'Drive chain and matching sprockets' },
  { id: 'rest', label: 'Throttle, fuel, safety', categories: ['throttle', 'fuel_system'], description: 'Throttle, fuel system, and other components' },
];

const GAS_SYSTEM_ITEMS: {
  id: string;
  label: string;
  category?: PartCategory;
  required: boolean;
  description: string;
}[] = [
  { id: 'engine', label: 'Engine', required: true, description: 'Power source' },
  { id: 'clutch', label: 'Clutch', category: 'clutch', required: false, description: 'Direct drive — match engine shaft' },
  { id: 'torque_converter', label: 'Torque converter', category: 'torque_converter', required: false, description: 'Variable drive — smoother takeoff' },
  { id: 'chain', label: 'Chain', category: 'chain', required: true, description: 'Drive chain — size must match sprockets' },
  { id: 'sprocket', label: 'Sprocket', category: 'sprocket', required: true, description: 'Axle & engine sprockets — match chain' },
  { id: 'throttle', label: 'Throttle', category: 'throttle', required: true, description: 'Throttle cable & pedal' },
  { id: 'fuel_system', label: 'Fuel system', category: 'fuel_system', required: true, description: 'Tank, lines, filter' },
  { id: 'air_filter', label: 'Air filter', category: 'air_filter', required: false, description: 'Protect engine — many kits include' },
  { id: 'exhaust', label: 'Exhaust', category: 'exhaust', required: false, description: 'Header or stock muffler' },
  { id: 'oil_system', label: 'Oil system', category: 'oil_system', required: false, description: '4-stroke oil + capacity' },
];

/** At least one of clutch or torque converter required. */
const DRIVETRAIN_CATEGORIES: PartCategory[] = ['clutch', 'torque_converter'];

interface GasBuildChecklistProps {
  selectedEngine: Engine | null;
  selectedParts: Map<PartCategory, Part[]>; // Changed to support multiple parts per category
  onSelectPart?: (category: PartCategory) => void;
  compact?: boolean;
}

export function GasBuildChecklist({
  selectedEngine,
  selectedParts,
  onSelectPart,
  compact = false,
}: GasBuildChecklistProps) {
  const [expanded, setExpanded] = useState(!compact);

  const completed = useMemo(() => {
    let count = 0;
    if (selectedEngine) count++;
    const hasDrivetrain = DRIVETRAIN_CATEGORIES.some((c) => {
      const parts = selectedParts.get(c);
      return parts && parts.length > 0;
    });
    if (hasDrivetrain) count++;
    for (const item of GAS_SYSTEM_ITEMS) {
      if (item.id === 'engine') continue;
      if (item.category && DRIVETRAIN_CATEGORIES.includes(item.category)) continue;
      if (item.category) {
        const parts = selectedParts.get(item.category);
        if (parts && parts.length > 0) count++;
      }
    }
    return count;
  }, [selectedEngine, selectedParts]);

  const requiredDone = useMemo(() => {
    let n = selectedEngine ? 1 : 0;
    const hasDrivetrain = DRIVETRAIN_CATEGORIES.some((c) => {
      const parts = selectedParts.get(c);
      return parts && parts.length > 0;
    });
    if (hasDrivetrain) n++;
    for (const item of GAS_SYSTEM_ITEMS) {
      if (!item.required) continue;
      if (item.id === 'engine') continue;
      if (item.category && DRIVETRAIN_CATEGORIES.includes(item.category)) continue;
      if (item.category) {
        const parts = selectedParts.get(item.category);
        if (parts && parts.length > 0) n++;
      }
    }
    return n;
  }, [selectedEngine, selectedParts]);

  const requiredTotal = 1 + 1 + 4; // engine + (clutch or tc) + chain, sprocket, throttle, fuel_system
  const restCount = GAS_SYSTEM_ITEMS.filter(
    (i) => i.id !== 'engine' && (!i.category || !DRIVETRAIN_CATEGORIES.includes(i.category))
  ).length;
  const totalItems = 2 + restCount; // engine + (clutch or tc) + remaining items

  const { currentStepIndex, nextAction } = useMemo(() => {
    let idx = 0;
    if (!selectedEngine) {
      return { currentStepIndex: 0, nextAction: { label: 'Choose engine', category: null as PartCategory | null } };
    }
    idx = 1;
    const hasDrivetrain = DRIVETRAIN_CATEGORIES.some((c) => {
      const parts = selectedParts.get(c);
      return parts && parts.length > 0;
    });
    if (!hasDrivetrain) {
      return { currentStepIndex: 1, nextAction: { label: 'Add clutch or torque converter', category: null as PartCategory | null } };
    }
    idx = 2;
    const chainParts = selectedParts.get('chain') || [];
    const sprocketParts = selectedParts.get('sprocket') || [];
    if (chainParts.length === 0 || sprocketParts.length === 0) {
      return { currentStepIndex: 2, nextAction: { label: 'Add chain & sprockets', category: (chainParts.length === 0 ? 'chain' : 'sprocket') as PartCategory } };
    }
    idx = 3;
    const throttleParts = selectedParts.get('throttle') || [];
    const fuelParts = selectedParts.get('fuel_system') || [];
    const hasThrottle = throttleParts.length > 0;
    const hasFuel = fuelParts.length > 0;
    if (!hasThrottle || !hasFuel) {
      return {
        currentStepIndex: 3,
        nextAction: {
          label: !hasThrottle ? 'Add throttle' : 'Add fuel system',
          category: (!hasThrottle ? 'throttle' : 'fuel_system') as PartCategory,
        },
      };
    }
    return { currentStepIndex: 4, nextAction: { label: 'All required steps done', category: null } };
  }, [selectedEngine, selectedParts]);

  const allDone = currentStepIndex >= 4;

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
              <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <Cog className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="text-display font-semibold text-cream-100">Gas Build Guide</h3>
                <p className="text-sm text-cream-400">
                  {allDone 
                    ? `${completed} of ${totalItems} items complete` 
                    : `Step ${currentStepIndex + 1} of 4: ${nextAction.label}`}
                  {requiredDone < requiredTotal && !allDone && (
                    <span className="text-orange-400 ml-1">
                      — {requiredTotal - requiredDone} required missing
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
            <div className="mb-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-orange-400" />
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
                const isEngineStep = step.id === 'engine';
                const done = isEngineStep
                  ? !!selectedEngine
                  : step.categories
                    ? step.categories.every((c) => {
                        const parts = selectedParts.get(c);
                        return parts && parts.length > 0;
                      })
                    : step.category
                      ? (() => {
                          const parts = selectedParts.get(step.category);
                          return parts && parts.length > 0;
                        })()
                      : false;
                const isCurrent = i === currentStepIndex;
                const browseCats = step.categories ?? (step.category ? [step.category] : []);

                return (
                  <li
                    key={step.id}
                    className={cn(
                      'flex items-start gap-3 p-2 rounded-lg transition-colors',
                      isCurrent && !done && 'bg-orange-500/10 border border-orange-500/20'
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
                          <span className="text-xs font-medium text-orange-400 bg-orange-500/20 px-1.5 py-0.5 rounded">
                            Next
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-cream-500 mt-0.5">{step.description}</p>
                      {!done && browseCats.length > 0 && onSelectPart && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {browseCats.filter((c) => {
                            const parts = selectedParts.get(c);
                            return !parts || parts.length === 0;
                          }).map((cat) => (
                            <Button
                              key={cat}
                              variant="ghost"
                              size="sm"
                              className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
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
              {GAS_SYSTEM_ITEMS.map((item) => {
                const isEngine = item.id === 'engine';
                const isDrivetrain = item.category && DRIVETRAIN_CATEGORIES.includes(item.category);
                const hasPart = isEngine 
                  ? !!selectedEngine
                  : isDrivetrain
                    ? DRIVETRAIN_CATEGORIES.some((c) => {
                        const parts = selectedParts.get(c);
                        return parts && parts.length > 0;
                      })
                    : !!item.category && (() => {
                        const parts = selectedParts.get(item.category);
                        return parts && parts.length > 0;
                      })();
                const partsArray = isEngine ? null : (item.category ? selectedParts.get(item.category) : null);
                const part = partsArray && partsArray.length > 0 ? partsArray[0] : null; // Show first part for display

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
                          {isDrivetrain ? 'Clutch or torque converter' : item.label}
                          {item.required && !isDrivetrain && (
                            <span className="text-orange-400/80 text-xs ml-1">required</span>
                          )}
                          {isDrivetrain && (
                            <span className="text-orange-400/80 text-xs ml-1">required (one)</span>
                          )}
                        </span>
                        {isEngine && selectedEngine && (
                          <span className="text-cream-500 text-xs truncate">
                            — {selectedEngine.name} ({selectedEngine.horsepower} HP)
                          </span>
                        )}
                        {part && (
                          <span className="text-cream-500 text-xs truncate">
                            — {part.name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-cream-500 mt-0.5">
                        {isDrivetrain ? 'Pick one — match engine shaft' : item.description}
                      </p>
                      {!hasPart && isDrivetrain && onSelectPart && (
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 text-xs h-7"
                            onClick={() => onSelectPart('clutch')}
                          >
                            Browse clutch
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 text-xs h-7"
                            onClick={() => onSelectPart('torque_converter')}
                          >
                            Browse torque converter
                          </Button>
                        </div>
                      )}
                      {!hasPart && !isDrivetrain && item.category && onSelectPart && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1.5 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 text-xs h-7"
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

          {selectedEngine && (
            <div className="mt-4 pt-4 border-t border-olive-600">
              <p className="text-xs text-cream-400">
                Match clutch or torque converter to <strong className="text-cream-200">{selectedEngine.shaft_diameter}"</strong>{' '}
                <strong className="text-cream-200 capitalize">{selectedEngine.shaft_type}</strong> shaft.
                Use matching chain size (e.g. #35 or #41) for sprockets.
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
