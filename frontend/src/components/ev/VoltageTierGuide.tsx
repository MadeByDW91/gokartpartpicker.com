'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { ChevronDown, ChevronUp, Zap, Battery } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

const VOLTAGE_TIERS = [
  {
    voltage: '24V',
    use: 'Kids, light karts',
    pros: 'Simple, cheap, safe',
    cons: 'Limited power/speed',
  },
  {
    voltage: '36V',
    use: 'Recreational',
    pros: 'Good balance',
    cons: 'Fewer off-the-shelf options',
  },
  {
    voltage: '48V',
    use: 'Most builds',
    pros: 'Best availability, performance/cost',
    cons: 'Heavier packs',
  },
  {
    voltage: '72V / 96V',
    use: 'Performance',
    pros: 'High power, speed',
    cons: 'Cost, complexity, safety',
  },
] as const;

interface VoltageTierGuideProps {
  compact?: boolean;
  /** If set, link "Browse motors" to /engines with voltage filter */
  linkToEngines?: boolean;
}

export function VoltageTierGuide({ compact = false, linkToEngines = true }: VoltageTierGuideProps) {
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
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-display font-semibold text-cream-100">
                  Choosing voltage? 24V vs 48V vs 72V
                </h3>
                <p className="text-sm text-cream-400">
                  Quick guide to match your build
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-olive-600">
                  <th className="text-left py-2 px-3 font-semibold text-cream-200">Voltage</th>
                  <th className="text-left py-2 px-3 font-semibold text-cream-200">Typical use</th>
                  <th className="text-left py-2 px-3 font-semibold text-cream-200">Pros</th>
                  <th className="text-left py-2 px-3 font-semibold text-cream-200">Cons</th>
                </tr>
              </thead>
              <tbody>
                {VOLTAGE_TIERS.map((tier) => (
                  <tr
                    key={tier.voltage}
                    className="border-b border-olive-700/50 hover:bg-olive-800/30 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <span className="font-semibold text-blue-400">{tier.voltage}</span>
                    </td>
                    <td className="py-3 px-3 text-cream-300">{tier.use}</td>
                    <td className="py-3 px-3 text-cream-300">{tier.pros}</td>
                    <td className="py-3 px-3 text-cream-400">{tier.cons}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {linkToEngines && (
            <div className="mt-4 pt-4 border-t border-olive-600 flex flex-wrap gap-3">
              <Link href="/engines">
                <Button variant="secondary" size="sm" icon={<Battery className="w-4 h-4" />}>
                  Browse motors by voltage
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
