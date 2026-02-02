'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Zap,
  Gauge,
  DollarSign,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  ArrowRight,
  Package,
  Rocket,
  GraduationCap,
  Trophy,
  Baby,
  Mountain,
  Car,
  Flag,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatPrice, cn } from '@/lib/utils';
import type { BuildTemplate } from '@/types/database';

const GOAL_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  speed: { label: 'Speed', icon: Rocket },
  torque: { label: 'Torque', icon: Zap },
  budget: { label: 'Budget', icon: Wallet },
  beginner: { label: 'Beginner', icon: GraduationCap },
  competition: { label: 'Competition', icon: Trophy },
  kids: { label: 'Kids', icon: Baby },
  offroad: { label: 'Off-Road', icon: Mountain },
  onroad: { label: 'On-Road', icon: Car },
  racing: { label: 'Racing', icon: Flag },
};

interface TemplatesComparisonTableProps {
  templates: BuildTemplate[];
  onApply?: (template: BuildTemplate) => void;
}

type SortField = 'name' | 'goal' | 'hp' | 'torque' | 'price';
type SortDirection = 'asc' | 'desc';

export function TemplatesComparisonTable({ templates, onApply }: TemplatesComparisonTableProps) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const sortedTemplates = useMemo(() => {
    const sorted = [...templates].sort((a, b) => {
      let valueA: number | string;
      let valueB: number | string;

      switch (sortField) {
        case 'name':
          valueA = (a.name || '').toLowerCase();
          valueB = (b.name || '').toLowerCase();
          break;
        case 'goal':
          valueA = (GOAL_CONFIG[a.goal]?.label || a.goal).toLowerCase();
          valueB = (GOAL_CONFIG[b.goal]?.label || b.goal).toLowerCase();
          break;
        case 'hp':
          valueA = a.estimated_hp ?? 0;
          valueB = b.estimated_hp ?? 0;
          break;
        case 'torque':
          valueA = a.estimated_torque ?? 0;
          valueB = b.estimated_torque ?? 0;
          break;
        case 'price':
          valueA = a.total_price ?? 0;
          valueB = b.total_price ?? 0;
          break;
        default:
          return 0;
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      const numA = typeof valueA === 'number' ? valueA : 0;
      const numB = typeof valueB === 'number' ? valueB : 0;
      return sortDirection === 'asc' ? numA - numB : numB - numA;
    });

    return sorted;
  }, [templates, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'name' || field === 'goal' ? 'asc' : 'desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-cream-500/50" />;
    }
    return sortDirection === 'asc'
      ? <ChevronUp className="w-3 h-3 text-orange-400" />
      : <ChevronDown className="w-3 h-3 text-orange-400" />;
  };

  return (
    <div className="bg-olive-800/30 rounded-lg border border-olive-700/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-olive-800/50 border-b border-olive-700/50">
              <th className="text-left py-3 px-4 text-xs font-semibold text-cream-300 uppercase tracking-wider">
                Template
              </th>
              <th
                className="text-left py-3 px-4 text-xs font-semibold text-cream-300 uppercase tracking-wider cursor-pointer hover:bg-olive-700/30 transition-colors"
                onClick={() => handleSort('goal')}
              >
                <div className="flex items-center gap-1">
                  <span>Goal</span>
                  <SortIcon field="goal" />
                </div>
              </th>
              <th
                className="text-right py-3 px-4 text-xs font-semibold text-cream-300 uppercase tracking-wider cursor-pointer hover:bg-olive-700/30 transition-colors"
                onClick={() => handleSort('hp')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>HP</span>
                  <SortIcon field="hp" />
                </div>
              </th>
              <th
                className="text-right py-3 px-4 text-xs font-semibold text-cream-300 uppercase tracking-wider cursor-pointer hover:bg-olive-700/30 transition-colors"
                onClick={() => handleSort('torque')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Torque</span>
                  <SortIcon field="torque" />
                </div>
              </th>
              <th
                className="text-right py-3 px-4 text-xs font-semibold text-cream-300 uppercase tracking-wider cursor-pointer hover:bg-olive-700/30 transition-colors"
                onClick={() => handleSort('price')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Price</span>
                  <SortIcon field="price" />
                </div>
              </th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-cream-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-olive-700/30">
            {sortedTemplates.map((template) => {
              const goalConfig = GOAL_CONFIG[template.goal] || { label: template.goal, icon: Package };
              const GoalIcon = goalConfig.icon;
              const imageUrl = template.engine?.image_url;

              return (
                <tr
                  key={template.id}
                  className="hover:bg-olive-800/40 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 bg-white rounded-lg overflow-hidden border border-olive-700/30">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={template.engine?.name || 'Template'}
                            fill
                            className="object-contain p-1"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-olive-800/20">
                            <Package className="w-6 h-6 text-cream-400/50" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-cream-100 text-sm sm:text-base line-clamp-2">
                          {template.name}
                        </div>
                        {template.description && (
                          <div className="text-xs text-cream-400 mt-0.5 line-clamp-1">
                            {template.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-orange-500/10 border border-orange-500/20 text-xs font-medium text-cream-100">
                      <GoalIcon className="w-3 h-3 text-orange-400 shrink-0" />
                      {goalConfig.label}
                    </div>
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-orange-400" />
                      <span className="font-semibold text-cream-100 tabular-nums">
                        {template.estimated_hp != null ? template.estimated_hp.toFixed(1) : '—'}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-purple-400" />
                      <span className="font-semibold text-cream-100 tabular-nums">
                        {template.estimated_torque != null ? template.estimated_torque.toFixed(1) : '—'} lb-ft
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-right">
                    {template.total_price != null ? (
                      <div className="font-bold text-orange-400 tabular-nums">
                        {formatPrice(template.total_price)}
                      </div>
                    ) : (
                      <span className="text-cream-500 text-sm">—</span>
                    )}
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center">
                      {onApply ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onApply(template);
                          }}
                          icon={<ArrowRight className="w-3.5 h-3.5" />}
                          className="text-xs"
                        >
                          Apply
                        </Button>
                      ) : (
                        <Link href={`/builder?template=${template.id}`}>
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<ArrowRight className="w-3.5 h-3.5" />}
                            className="text-xs"
                          >
                            Apply
                          </Button>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
