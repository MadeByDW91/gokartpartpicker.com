'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { AlertTriangle, ChevronDown, ChevronUp, Shield, Zap, AlertCircle, Battery, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

const SAFETY_ITEMS = [
  {
    icon: Zap,
    title: 'High Voltage Safety',
    body: '48V and above can be dangerous. Always isolate power and disconnect the battery pack before working on wiring or components. Never work on live circuits.',
    priority: 'critical',
  },
  {
    icon: AlertCircle,
    title: 'Fuse Protection',
    body: 'Use appropriately sized fuses rated for your battery and controller current. Never bypass or oversize fuses—they protect against fire and component damage.',
    priority: 'critical',
  },
  {
    icon: Shield,
    title: 'Emergency Kill Switch',
    body: 'Install an easy-to-reach kill switch that immediately cuts power to the motor and preferably the main battery pack. Test regularly to ensure it works.',
    priority: 'critical',
  },
  {
    icon: Battery,
    title: 'Battery Management',
    body: 'Use a BMS (Battery Management System) with Li-ion/LiFePO4 batteries. Avoid puncture, short circuits, and incorrect chargers. Store and charge in a well-ventilated, fire-safe area.',
    priority: 'high',
  },
  {
    icon: Wrench,
    title: 'Proper Wiring',
    body: 'Use correct wire gauge for your current draw. Secure all connections with proper terminals. Avoid chafing, pinching, or exposed conductors. Use wire management to prevent damage.',
    priority: 'high',
  },
];

interface EVSafetyHighlightsProps {
  compact?: boolean;
}

export function EVSafetyHighlights({ compact = false }: EVSafetyHighlightsProps) {
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
                EV Safety Guidelines
                <Badge variant="warning" className="text-xs px-2 py-0.5">
                  Critical
                </Badge>
              </h3>
              <p className="text-sm text-cream-300 mt-0.5">
                Essential safety practices for electric go-kart builds
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
