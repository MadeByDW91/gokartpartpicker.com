'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { AlertTriangle, ChevronDown, ChevronUp, Shield, Flame, Thermometer, Droplet, FireExtinguisher, Wind } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

const SAFETY_ITEMS = [
  {
    icon: Flame,
    title: 'Fuel Safety',
    body: 'Store fuel in approved containers. No sparks or open flames near fuel. Ventilate when refueling. Check lines and connections for leaks regularly.',
    priority: 'critical',
  },
  {
    icon: Thermometer,
    title: 'Exhaust & Heat',
    body: 'Exhaust and engine get very hot during operation. Keep clear of clothing, skin, and flammable materials. Route exhaust away from driver and fuel tank.',
    priority: 'critical',
  },
  {
    icon: Droplet,
    title: 'Oil & Hot Surfaces',
    body: 'Check oil level regularly on 4-stroke engines. Allow engine to cool completely before servicing. Avoid touching exhaust, header, or engine after use.',
    priority: 'high',
  },
  {
    icon: FireExtinguisher,
    title: 'Fire Extinguisher',
    body: 'Keep a small, suitable fire extinguisher nearby when running. Know how to use it. Gas and oil fires require the correct extinguisher type (Class B).',
    priority: 'high',
  },
  {
    icon: Wind,
    title: 'Ventilation',
    body: 'Run engines outdoors or in well-ventilated areas only. Carbon monoxide from exhaust can be deadly in enclosed spaces. Never run in garages or enclosed areas.',
    priority: 'critical',
  },
];

interface GasSafetyHighlightsProps {
  compact?: boolean;
}

export function GasSafetyHighlights({ compact = false }: GasSafetyHighlightsProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Card className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-olive-800/30 border-2 border-amber-500/30 shadow-lg shadow-amber-500/5">
      <CardHeader className="border-b border-amber-500/20">
        <button
          type="button"
          className="w-full text-left flex items-center justify-between gap-3"
          onClick={() => setExpanded((e) => !e)}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border-2 border-amber-500/40 shadow-md">
              <Shield className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-cream-100 flex items-center gap-2">
                Gas Engine Safety Guidelines
                <Badge variant="warning" className="text-xs px-2 py-0.5">
                  Critical
                </Badge>
              </h3>
              <p className="text-sm text-cream-300 mt-0.5">
                Essential safety practices for gas-powered go-kart builds
              </p>
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-cream-400 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-cream-400 flex-shrink-0" />
          )}
        </button>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-6">
          <div className="space-y-4">
            {SAFETY_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-xl border transition-all',
                    item.priority === 'critical'
                      ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/15'
                      : 'bg-olive-900/40 border-olive-700/50 hover:bg-olive-900/60'
                  )}
                >
                  <div className={cn(
                    'p-2.5 rounded-lg flex-shrink-0',
                    item.priority === 'critical'
                      ? 'bg-red-500/20 border border-red-500/30'
                      : 'bg-amber-500/20 border border-amber-500/30'
                  )}>
                    <Icon className={cn(
                      'w-5 h-5',
                      item.priority === 'critical' ? 'text-red-400' : 'text-amber-400'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h4 className="font-semibold text-cream-100 text-sm">{item.title}</h4>
                      {item.priority === 'critical' && (
                        <Badge variant="error" className="text-xs px-1.5 py-0.5">
                          Critical
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-cream-300 leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 pt-4 border-t border-amber-500/20">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-cream-100 mb-1">Safety First</p>
                <p className="text-xs text-cream-300 leading-relaxed">
                  These guidelines are essential for safe operation. Always follow manufacturer specifications and local regulations. When in doubt, consult with an experienced builder or professional.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
