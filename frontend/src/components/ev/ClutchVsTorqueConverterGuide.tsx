'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { ChevronDown, ChevronUp, Cog } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

const ROWS: { label: string; clutch: string; tc: string }[] = [
  { label: 'Takeoff', clutch: 'Direct engagement', tc: 'Smooth, automatic' },
  { label: 'Best for', clutch: 'Higher RPM, racing', tc: 'Low-end torque, kids' },
  { label: 'Cost', clutch: 'Usually cheaper', tc: 'Higher' },
  { label: 'Maintenance', clutch: 'Replace pads when worn', tc: 'Fluid, belt periodically' },
];

interface ClutchVsTorqueConverterGuideProps {
  compact?: boolean;
  linkToParts?: boolean;
}

export function ClutchVsTorqueConverterGuide({ compact = false, linkToParts = true }: ClutchVsTorqueConverterGuideProps) {
  const [expanded, setExpanded] = useState(false);

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
                <h3 className="text-display font-semibold text-cream-100">
                  Clutch vs torque converter
                </h3>
                <p className="text-sm text-cream-400">Quick comparison</p>
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-olive-600">
                  <th className="text-left py-2 px-3 font-semibold text-cream-200 w-1/4" />
                  <th className="text-left py-2 px-3 font-semibold text-orange-400">Clutch</th>
                  <th className="text-left py-2 px-3 font-semibold text-cream-300">Torque converter</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr
                    key={row.label}
                    className="border-b border-olive-700/50 hover:bg-olive-800/30 transition-colors"
                  >
                    <td className="py-3 px-3 font-medium text-cream-200">{row.label}</td>
                    <td className="py-3 px-3 text-cream-300">{row.clutch}</td>
                    <td className="py-3 px-3 text-cream-300">{row.tc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {linkToParts && (
            <div className="mt-4 pt-4 border-t border-olive-600 flex flex-wrap gap-3">
              <Link href="/parts?category=clutch">
                <Button variant="secondary" size="sm" icon={<Cog className="w-4 h-4" />}>
                  Browse clutches
                </Button>
              </Link>
              <Link href="/parts?category=torque_converter">
                <Button variant="secondary" size="sm">
                  Browse torque converters
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
