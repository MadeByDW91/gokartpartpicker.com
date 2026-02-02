'use client';

import Link from 'next/link';
import { ChevronLeft, Ruler, Circle, Box, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

/** Generic side-view wireframe: frame, wheels, seat area */
function SideViewSVG() {
  return (
    <svg viewBox="0 0 200 80" className="w-full h-auto" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="20" y="28" width="160" height="24" rx="2" className="text-cream-500/70" />
      <circle cx="40" cy="56" r="12" className="text-cream-500/60" />
      <circle cx="160" cy="56" r="12" className="text-cream-500/60" />
      <rect x="72" y="32" width="56" height="16" rx="1" className="text-orange-500/40" />
      <circle cx="100" cy="24" r="6" className="text-cream-500/50" />
    </svg>
  );
}

/** Generic front-view wireframe */
function FrontViewSVG() {
  return (
    <svg viewBox="0 0 80 80" className="w-full h-auto" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="10" y="20" width="60" height="40" rx="2" className="text-cream-500/70" />
      <circle cx="22" cy="58" r="10" className="text-cream-500/60" />
      <circle cx="58" cy="58" r="10" className="text-cream-500/60" />
      <rect x="28" y="32" width="24" height="16" rx="1" className="text-orange-500/40" />
    </svg>
  );
}

/** Generic top-down plan view */
function TopViewSVG() {
  return (
    <svg viewBox="0 0 200 120" className="w-full h-auto" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="24" y="24" width="152" height="72" rx="2" className="text-cream-500/70" />
      <circle cx="44" cy="36" r="10" className="text-cream-500/60" />
      <circle cx="156" cy="36" r="10" className="text-cream-500/60" />
      <circle cx="44" cy="84" r="10" className="text-cream-500/60" />
      <circle cx="156" cy="84" r="10" className="text-cream-500/60" />
      <rect x="76" y="44" width="48" height="32" rx="1" className="text-orange-500/40" />
      <circle cx="100" cy="52" r="8" className="text-cream-500/50" />
    </svg>
  );
}

const SPEC_GROUPS = [
  {
    label: 'Dimensions',
    icon: Ruler,
    items: [
      { name: 'Length', value: '~72–96"', note: 'Build dependent' },
      { name: 'Width', value: '~28–36"', note: 'Track width' },
      { name: 'Wheelbase', value: '~42–60"', note: 'Axle to axle' },
    ],
  },
  {
    label: 'Tires',
    icon: Circle,
    items: [
      { name: 'Front', value: 'Common 11–18"', note: 'Diameter' },
      { name: 'Rear', value: 'Common 15–18"', note: 'Drive tires' },
    ],
  },
  {
    label: 'Frame & clearance',
    icon: Box,
    items: [
      { name: 'Frame tubing', value: '1"–1¼"', note: 'Square or round' },
      { name: 'Ground clearance', value: '~4–8"', note: 'To frame' },
    ],
  },
  {
    label: 'Drivetrain & controls',
    icon: Zap,
    items: [
      { name: 'Engine', value: 'Varies', note: 'e.g. 6.5–212cc' },
      { name: 'Drive', value: 'Chain / TC', note: 'Torque converter common' },
      { name: 'Brakes', value: 'Disc / drum', note: 'Per build' },
      { name: 'Steering', value: 'Tie rod', note: 'Rack or gear' },
    ],
  },
] as const;

export default function ChassisLayoutPage() {
  return (
    <div className="min-h-screen bg-olive-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="mb-6">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 text-sm font-medium text-cream-400 hover:text-orange-400 transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Tools
          </Link>
        </div>

        {/* Document-style header */}
        <header className="border-b border-olive-700/50 pb-6 mb-6">
          <h1 className="text-display text-2xl sm:text-3xl text-cream-100 tracking-tight">
            Chassis layout reference
          </h1>
          <p className="mt-1 text-cream-400 text-sm max-w-2xl">
            Generic go-kart chassis views and typical spec ranges. Use this to plan engine, axle, and key parts — confirm dimensions for your actual build.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Diagram panel – multiple views */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-olive-700/50 bg-olive-800/30 overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-sm font-semibold text-cream-200 uppercase tracking-wide mb-4">
                  Layout views
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-lg border border-olive-600/50 bg-olive-900/50 p-3 text-center">
                    <p className="text-xs font-medium text-cream-500 mb-2">Side</p>
                    <div className="text-cream-500/80 aspect-[2.5/1] flex items-center justify-center">
                      <SideViewSVG />
                    </div>
                  </div>
                  <div className="rounded-lg border border-olive-600/50 bg-olive-900/50 p-3 text-center">
                    <p className="text-xs font-medium text-cream-500 mb-2">Front</p>
                    <div className="text-cream-500/80 aspect-square max-w-[120px] mx-auto flex items-center justify-center">
                      <FrontViewSVG />
                    </div>
                  </div>
                  <div className="rounded-lg border border-olive-600/50 bg-olive-900/50 p-3 text-center sm:col-span-3 sm:max-w-md">
                    <p className="text-xs font-medium text-cream-500 mb-2">Top (plan)</p>
                    <div className="text-cream-500/80 aspect-[5/3] flex items-center justify-center">
                      <TopViewSVG />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Specs panel – compact cards */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-cream-200 uppercase tracking-wide">
              Typical specs
            </h2>
            {SPEC_GROUPS.map((group) => {
              const Icon = group.icon;
              return (
                <Card key={group.label} className="border-olive-700/50 bg-olive-800/30 overflow-hidden">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4 text-orange-400 shrink-0" />
                      <span className="text-sm font-semibold text-cream-100">{group.label}</span>
                    </div>
                    <dl className="space-y-1.5">
                      {group.items.map((item) => (
                        <div key={item.name} className="flex justify-between gap-2 text-xs">
                          <dt className="text-cream-500 shrink-0">{item.name}</dt>
                          <dd className="text-cream-200 text-right font-medium">{item.value}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="text-[11px] text-cream-500 mt-2 pt-2 border-t border-olive-700/50">
                      Reference only — confirm for your build
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Title block / footer */}
        <footer className="mt-8 pt-4 border-t border-olive-700/50 flex flex-wrap items-center justify-between gap-2 text-xs text-cream-500">
          <span>GoKartPartPicker</span>
          <span>Chassis layout · Reference</span>
          <span>Confirm all dimensions and specs for your build.</span>
        </footer>
      </div>
    </div>
  );
}
