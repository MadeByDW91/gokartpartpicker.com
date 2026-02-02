'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Cog, Battery, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

const ROWS: { label: string; gas: string; electric: string }[] = [
  { label: 'Upfront cost', gas: 'Often lower', electric: 'Usually higher (battery)' },
  { label: 'Running cost', gas: 'Fuel, oil, maintenance', electric: 'Electricity, occasional parts' },
  { label: 'Noise', gas: 'Louder', electric: 'Quiet' },
  { label: 'Maintenance', gas: 'Oil, air filter, carb', electric: 'Less routine work' },
  { label: 'Range / refuel', gas: 'Refuel quickly', electric: 'Recharge 2–6+ hrs' },
  { label: 'Best for', gas: 'Long sessions, racing, simplicity', electric: 'Yard, neighborhoods, kids' },
];

interface EVvsGasComparisonProps {
  compact?: boolean;
  linkToEngines?: boolean;
}

export function EVvsGasComparison({ compact = false, linkToEngines = true }: EVvsGasComparisonProps) {
  const [expanded, setExpanded] = useState(!compact);

  return (
    <Card className="bg-olive-800/50 border-olive-600">
      <button
        type="button"
        className="w-full text-left"
        onClick={() => setExpanded((e) => !e)}
      >
        <CardHeader className="border-b border-olive-600">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-display font-semibold text-cream-100">Gas vs electric</h3>
              <p className="text-sm text-cream-400">Quick comparison</p>
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
                  <th className="text-left py-2 px-3 font-semibold text-orange-400">
                    <span className="inline-flex items-center gap-1"><Cog className="w-4 h-4" /> Gas</span>
                  </th>
                  <th className="text-left py-2 px-3 font-semibold text-blue-400">
                    <span className="inline-flex items-center gap-1"><Battery className="w-4 h-4" /> Electric</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr
                    key={row.label}
                    className="border-b border-olive-700/50 hover:bg-olive-800/30 transition-colors"
                  >
                    <td className="py-3 px-3 font-medium text-cream-200">{row.label}</td>
                    <td className="py-3 px-3 text-cream-300">{row.gas}</td>
                    <td className="py-3 px-3 text-cream-300">{row.electric}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {linkToEngines && (
            <div className="mt-4 pt-4 border-t border-olive-600 flex flex-wrap gap-3">
              <Link href="/engines">
                <Button variant="secondary" size="sm" icon={<Cog className="w-4 h-4" />}>
                  Browse gas engines
                </Button>
              </Link>
              <Link href="/engines">
                <Button variant="secondary" size="sm" icon={<Battery className="w-4 h-4" />}>
                  Browse electric motors
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
