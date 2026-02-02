'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Zap, 
  Cog,
  ChevronDown,
  Ruler,
  Weight,
  Gauge,
  AlertCircle,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ShaftCalloutDiagram } from './ShaftCalloutDiagram';
import { MountDimensionsDiagram } from './MountDimensionsDiagram';
import type { Engine } from '@/types/database';

interface EngineDetailTabsProps {
  engine: Engine;
  performanceTier: { tier: string; color: string; description: string };
}

type TabType = 'overview';

interface SpecRowProps {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  expandable?: boolean;
  expandedContent?: React.ReactNode;
  importance?: 'normal' | 'critical' | 'important';
}

function SpecRow({ 
  label, 
  value, 
  icon: Icon, 
  description, 
  expandable = false,
  expandedContent,
  importance = 'normal'
}: SpecRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const importanceStyles = {
    normal: '',
    important: 'border-l-2 border-l-orange-500/50 pl-3',
    critical: 'border-l-2 border-l-red-500/50 pl-3 bg-red-500/5',
  };

  // Icon color based on importance
  const iconColorClass = importance === 'critical' 
    ? 'text-red-400' 
    : importance === 'important' 
    ? 'text-orange-400' 
    : 'text-cream-400/70';

  return (
    <div className={cn(
      'border-b border-olive-600/20 last:border-b-0 transition-all rounded-md',
      importanceStyles[importance],
      expandable && 'hover:bg-gradient-to-r hover:from-olive-800/40 hover:to-olive-700/20'
    )}>
      <button
        onClick={() => expandable && setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-start justify-between gap-4 py-4 px-2 transition-all duration-200',
          expandable && 'hover:bg-olive-800/20 cursor-pointer rounded-md',
          !expandable && 'cursor-default'
        )}
        disabled={!expandable}
      >
        <div className="flex items-start gap-3 min-w-0 flex-1 text-left">
          {Icon && (
            <div className={cn(
              'p-2 rounded-lg shrink-0 transition-all',
              importance === 'critical' && 'bg-red-500/10 border border-red-500/20',
              importance === 'important' && 'bg-orange-500/10 border border-orange-500/20',
              !importance || importance === 'normal' ? 'bg-olive-700/30 border border-olive-600/20' : ''
            )}>
              <Icon className={cn('w-4 h-4', iconColorClass)} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-cream-200">{label}</p>
              {importance === 'critical' && (
                <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 animate-pulse" />
              )}
            </div>
            {description && (
              <p className="text-xs text-cream-400/70 mt-1 leading-relaxed">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <p className="text-base font-bold text-cream-100 tabular-nums bg-gradient-to-br from-cream-100 to-cream-200 bg-clip-text text-transparent">
            {value}
          </p>
          {expandable && (
            <ChevronDown 
              className={cn(
                'w-4 h-4 text-cream-400/60 transition-all duration-200',
                isExpanded && 'rotate-180 text-orange-400'
              )} 
            />
          )}
        </div>
      </button>
      
      {expandable && isExpanded && expandedContent && (
        <div className="pb-6 border-t border-gradient-to-r from-transparent via-olive-600/30 to-transparent bg-gradient-to-b from-olive-800/50 via-olive-800/30 to-transparent overflow-hidden transition-all duration-300 rounded-b-md animate-in slide-in-from-top-2 fade-in-10">
          <div className="pt-5 px-4 space-y-4">
            {expandedContent}
          </div>
        </div>
      )}
    </div>
  );
}

export function EngineDetailTabs({ engine, performanceTier }: EngineDetailTabsProps) {
  return (
    <div className="mt-6">
      <div className="space-y-6">
            {/* Key Specifications - Enhanced Visual Design */}
            <Card className="border-olive-600/50 bg-gradient-to-br from-olive-800/50 via-olive-800/40 to-olive-900/30 shadow-xl backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gradient-to-r from-transparent via-orange-500/20 to-transparent bg-gradient-to-r from-transparent via-olive-600/30 to-transparent">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 shadow-lg">
                      <Zap className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-cream-100 tracking-tight">Key Specifications</h3>
                      <p className="text-xs text-cream-400/80 mt-1">Essential engine performance metrics</p>
                    </div>
                  </div>
                  <Badge 
                    variant="default" 
                    className={`text-sm font-bold px-3 py-1.5 shadow-md ${
                      performanceTier.color.includes('green') 
                        ? 'bg-gradient-to-r from-green-500/25 to-green-600/15 text-green-300 border-green-500/40 shadow-green-500/20' 
                        : performanceTier.color.includes('orange') 
                        ? 'bg-gradient-to-r from-orange-500/25 to-orange-600/15 text-orange-300 border-orange-500/40 shadow-orange-500/20' 
                        : performanceTier.color.includes('red') 
                        ? 'bg-gradient-to-r from-red-500/25 to-red-600/15 text-red-300 border-red-500/40 shadow-red-500/20' 
                        : 'bg-gradient-to-r from-purple-500/25 to-purple-600/15 text-purple-300 border-purple-500/40 shadow-purple-500/20'
                    }`}
                  >
                    {performanceTier.tier.toUpperCase()}
                  </Badge>
                </div>
                <div className="space-y-0 bg-gradient-to-b from-olive-800/20 to-transparent rounded-lg p-1">
                  <SpecRow 
                    label="Horsepower" 
                    value={`${engine.horsepower} HP`}
                    icon={Zap}
                    description="Power output"
                    expandable={true}
                    expandedContent={
                      <div className="space-y-4">
                        <div className="relative">
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500/40 via-orange-400/30 to-transparent rounded-full" />
                          <p className="text-sm text-cream-300 leading-relaxed pl-4">
                            Horsepower (HP) measures the engine's power output. This {engine.horsepower}HP engine is rated at{' '}
                            <span className="font-bold text-orange-400">{engine.horsepower} horsepower</span>, which determines 
                            the maximum speed and acceleration potential of your go-kart.
                          </p>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent rounded-xl border border-orange-500/20 shadow-lg shadow-orange-500/5">
                          <div className="p-1.5 rounded-lg bg-orange-500/20 border border-orange-500/30 shrink-0">
                            <Info className="w-4 h-4 text-orange-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-orange-300/90 mb-1">Performance Tier</p>
                            <p className="text-sm text-cream-200 leading-relaxed">
                              <span className="font-bold text-cream-100">{performanceTier.tier}</span> - {performanceTier.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    }
                  />
                  <SpecRow 
                    label="Displacement" 
                    value={`${engine.displacement_cc} cc`}
                    icon={Gauge}
                    description="Engine size"
                    expandable={true}
                    expandedContent={
                      <div className="space-y-4">
                        <div className="relative">
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/40 via-blue-400/30 to-transparent rounded-full" />
                          <p className="text-sm text-cream-300 leading-relaxed pl-4">
                            Displacement refers to the total volume of all cylinders in the engine. This engine has a displacement of{' '}
                            <span className="font-bold text-blue-400">{engine.displacement_cc} cubic centimeters (cc)</span>, 
                            which directly impacts power output and fuel consumption.
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div className="group p-4 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-olive-800/30 rounded-xl border border-blue-500/20 hover:border-blue-500/30 transition-all hover:shadow-lg hover:shadow-blue-500/5">
                            <p className="text-xs font-medium text-blue-300/80 mb-2 uppercase tracking-wide">Cylinder Volume</p>
                            <p className="text-lg font-bold text-cream-100 tabular-nums">{engine.displacement_cc} cc</p>
                          </div>
                          <div className="group p-4 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-olive-800/30 rounded-xl border border-purple-500/20 hover:border-purple-500/30 transition-all hover:shadow-lg hover:shadow-purple-500/5">
                            <p className="text-xs font-medium text-purple-300/80 mb-2 uppercase tracking-wide">Power Density</p>
                            <p className="text-lg font-bold text-cream-100 tabular-nums">
                              {(engine.horsepower / engine.displacement_cc * 1000).toFixed(2)} HP/L
                            </p>
                          </div>
                        </div>
                      </div>
                    }
                  />
                  <SpecRow 
                    label="Shaft Diameter" 
                    value={`${engine.shaft_diameter}"`}
                    icon={Ruler}
                    description="Output shaft diameter"
                    expandable={true}
                    expandedContent={
                      <div className="space-y-4">
                        <div className="relative">
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500/40 via-orange-400/30 to-transparent rounded-full" />
                          <p className="text-sm text-cream-300 leading-relaxed pl-4">
                            The shaft diameter measures <span className="font-bold text-orange-400">{engine.shaft_diameter}"</span> at the output shaft. 
                            This dimension determines the size of components that can be mounted directly to the engine shaft.
                          </p>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent rounded-xl border border-orange-500/20 shadow-lg shadow-orange-500/5">
                          <div className="p-1.5 rounded-lg bg-orange-500/20 border border-orange-500/30 shrink-0">
                            <Info className="w-4 h-4 text-orange-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-orange-300/90 mb-1">Important Note</p>
                            <p className="text-sm text-cream-200 leading-relaxed">
                              The shaft diameter is a key specification for selecting appropriate drive components and accessories.
                            </p>
                          </div>
                        </div>
                      </div>
                    }
                  />
                  <SpecRow 
                    label="Torque" 
                    value={`${engine.torque} lb-ft`}
                    icon={Gauge}
                    description="Rotational force"
                    expandable={true}
                    expandedContent={
                      <div className="space-y-4">
                        <div className="relative">
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-500/40 via-amber-400/30 to-transparent rounded-full" />
                          <p className="text-sm text-cream-300 leading-relaxed pl-4">
                            Torque measures the rotational force the engine can produce. This engine generates{' '}
                            <span className="font-bold text-amber-400">{engine.torque} lb-ft</span> of torque, 
                            which determines acceleration and pulling power.
                          </p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent rounded-xl border border-amber-500/20 shadow-lg shadow-amber-500/5">
                          <div className="text-xs font-semibold text-amber-300/90 mb-3 uppercase tracking-wide flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-amber-400" />
                            Torque vs. Horsepower
                          </div>
                          <ul className="space-y-2.5">
                            <li className="flex items-start gap-3">
                              <div className="mt-1 p-1 rounded bg-amber-500/20 border border-amber-500/30 shrink-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              </div>
                              <div className="flex-1">
                                <span className="font-semibold text-cream-200">Torque</span>
                                <span className="text-cream-400"> provides acceleration and pulling power</span>
                              </div>
                            </li>
                            <li className="flex items-start gap-3">
                              <div className="mt-1 p-1 rounded bg-amber-500/20 border border-amber-500/30 shrink-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              </div>
                              <div className="flex-1">
                                <span className="font-semibold text-cream-200">Horsepower</span>
                                <span className="text-cream-400"> determines top speed potential</span>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                    }
                  />
                  {engine.weight_lbs && (
                    <SpecRow 
                      label="Weight" 
                      value={`${engine.weight_lbs} lbs`}
                      icon={Weight}
                      description="Dry weight (without fluids)"
                      expandable={true}
                      expandedContent={
                        <div className="space-y-4">
                          <div className="relative">
                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500/40 via-emerald-400/30 to-transparent rounded-full" />
                            <p className="text-sm text-cream-300 leading-relaxed pl-4">
                              The engine weighs <span className="font-bold text-emerald-400">{engine.weight_lbs} lbs</span> dry 
                              (without oil, fuel, or other fluids). This weight impacts the overall go-kart weight and handling characteristics.
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <div className="group p-4 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-olive-800/30 rounded-xl border border-emerald-500/20 hover:border-emerald-500/30 transition-all hover:shadow-lg hover:shadow-emerald-500/5">
                              <p className="text-xs font-medium text-emerald-300/80 mb-2 uppercase tracking-wide">Dry Weight</p>
                              <p className="text-lg font-bold text-cream-100 tabular-nums">{engine.weight_lbs} lbs</p>
                            </div>
                            <div className="group p-4 bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-olive-800/30 rounded-xl border border-teal-500/20 hover:border-teal-500/30 transition-all hover:shadow-lg hover:shadow-teal-500/5">
                              <p className="text-xs font-medium text-teal-300/80 mb-2 uppercase tracking-wide">With Fluids</p>
                              <p className="text-lg font-bold text-cream-100 tabular-nums">~{engine.weight_lbs + 2} lbs</p>
                            </div>
                          </div>
                        </div>
                      }
                    />
                  )}
                  <SpecRow 
                    label="Shaft Length" 
                    value={`${engine.shaft_length}"`}
                    icon={Ruler}
                    expandable={true}
                    expandedContent={
                      <div className="space-y-4">
                        <div className="relative">
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500/40 via-indigo-400/30 to-transparent rounded-full" />
                          <p className="text-sm text-cream-300 leading-relaxed pl-4">
                            The shaft extends <span className="font-bold text-indigo-400">{engine.shaft_length}"</span> from the engine block. 
                            This length determines how far parts can be mounted from the engine and affects chain alignment.
                          </p>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent rounded-xl border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
                          <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 shrink-0">
                            <AlertCircle className="w-4 h-4 text-indigo-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-indigo-300/90 mb-1">Pro Tip</p>
                            <p className="text-sm text-cream-200 leading-relaxed">
                              Ensure your chain and sprocket alignment accounts for the full shaft length to prevent binding or excessive wear.
                            </p>
                          </div>
                        </div>
                      </div>
                    }
                  />
                </div>
              </CardContent>
            </Card>
      </div>
    </div>
  );
}
