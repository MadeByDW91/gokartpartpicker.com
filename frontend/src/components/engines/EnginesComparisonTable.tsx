'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Cog, 
  Battery, 
  Zap, 
  Gauge, 
  Ruler, 
  DollarSign, 
  Plus,
  ChevronUp,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, cn, getMotorBrandDisplay } from '@/lib/utils';
import type { Engine, ElectricMotor } from '@/types/database';

interface EnginesComparisonTableProps {
  items: (Engine | ElectricMotor)[];
  selectedEngine?: Engine | null;
  selectedMotor?: ElectricMotor | null;
  onAddToBuild: (item: Engine | ElectricMotor) => void;
}

type SortField = 'name' | 'brand' | 'horsepower' | 'torque' | 'price' | 'displacement' | 'voltage';
type SortDirection = 'asc' | 'desc';

export function EnginesComparisonTable({ 
  items, 
  selectedEngine, 
  selectedMotor,
  onAddToBuild 
}: EnginesComparisonTableProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>('horsepower');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedItems = useMemo(() => {
    const sorted = [...items].sort((a, b) => {
      const isEngineA = 'displacement_cc' in a;
      const isEngineB = 'displacement_cc' in b;
      
      let valueA: number | string;
      let valueB: number | string;
      
      switch (sortField) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'brand':
          valueA = (a.brand || '').toLowerCase();
          valueB = (b.brand || '').toLowerCase();
          break;
        case 'horsepower':
          valueA = a.horsepower || 0;
          valueB = b.horsepower || 0;
          break;
        case 'torque':
          valueA = isEngineA ? (a as Engine).torque || 0 : (a as ElectricMotor).torque_lbft || 0;
          valueB = isEngineB ? (b as Engine).torque || 0 : (b as ElectricMotor).torque_lbft || 0;
          break;
        case 'price':
          valueA = a.price || 0;
          valueB = b.price || 0;
          break;
        case 'displacement':
          valueA = isEngineA ? (a as Engine).displacement_cc || 0 : 0;
          valueB = isEngineB ? (b as Engine).displacement_cc || 0 : 0;
          break;
        case 'voltage':
          valueA = !isEngineA ? (a as ElectricMotor).voltage || 0 : 0;
          valueB = !isEngineB ? (b as ElectricMotor).voltage || 0 : 0;
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
  }, [items, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
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

  const handleRowClick = (item: Engine | ElectricMotor) => {
    const isEngine = 'displacement_cc' in item;
    router.push(isEngine ? `/engines/${item.slug}` : `/motors/${item.slug}`);
  };

  return (
    <div className="bg-olive-800/30 rounded-lg border border-olive-700/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-olive-800/50 border-b border-olive-700/50">
              <th className="text-left py-3 px-4 text-xs font-semibold text-cream-300 uppercase tracking-wider">
                Name
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-cream-300 uppercase tracking-wider">
                Type
              </th>
              <th 
                className="text-right py-3 px-4 text-xs font-semibold text-cream-300 uppercase tracking-wider cursor-pointer hover:bg-olive-700/30 transition-colors"
                onClick={() => handleSort('horsepower')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>HP</span>
                  <SortIcon field="horsepower" />
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
              <th className="text-right py-3 px-4 text-xs font-semibold text-cream-300 uppercase tracking-wider">
                <div className="flex items-center justify-end gap-1">
                  <span>Specs</span>
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
            {sortedItems.map((item) => {
              const isEngine = 'displacement_cc' in item;
              const engine = isEngine ? item as Engine : null;
              const motor = !isEngine ? item as ElectricMotor : null;
              const isSelected = isEngine 
                ? selectedEngine?.id === engine?.id
                : selectedMotor?.id === motor?.id;

              return (
                <tr
                  key={item.id}
                  className={cn(
                    "hover:bg-olive-800/40 transition-colors cursor-pointer",
                    isSelected && "bg-orange-500/10 border-l-2 border-l-orange-500"
                  )}
                  onClick={() => handleRowClick(item)}
                >
                  {/* Name Column */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 bg-white rounded-lg overflow-hidden border border-olive-700/30">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-contain p-1"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-olive-800/20">
                            {isEngine ? (
                              <Cog className="w-6 h-6 text-cream-400/50" />
                            ) : (
                              <Battery className="w-6 h-6 text-cream-400/50" />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-cream-100 text-sm sm:text-base line-clamp-1">
                          {item.name}
                        </div>
                        <div className="text-xs text-cream-400 mt-0.5">
                          {getMotorBrandDisplay(item.brand)}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Type Column */}
                  <td className="py-4 px-4">
                    <Badge
                      variant="default"
                      className={cn(
                        "text-xs",
                        isEngine
                          ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                          : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                      )}
                    >
                      {isEngine ? (
                        <>
                          <Cog className="w-3 h-3 mr-1" />
                          Gas
                        </>
                      ) : (
                        <>
                          <Battery className="w-3 h-3 mr-1" />
                          Electric
                        </>
                      )}
                    </Badge>
                  </td>

                  {/* HP Column */}
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-orange-400" />
                      <span className="font-semibold text-cream-100 tabular-nums">
                        {item.horsepower?.toFixed(1) || '—'}
                      </span>
                    </div>
                  </td>

                  {/* Torque Column */}
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-purple-400" />
                      <span className="font-semibold text-cream-100 tabular-nums">
                        {isEngine 
                          ? `${engine?.torque?.toFixed(1) || '—'}`
                          : `${motor?.torque_lbft?.toFixed(1) || '—'}`
                        }
                      </span>
                    </div>
                  </td>

                  {/* Specs Column */}
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-xs">
                      {isEngine && engine?.displacement_cc && (
                        <div className="flex items-center gap-1 text-cream-400">
                          <Gauge className="w-3 h-3" />
                          <span className="tabular-nums">{engine.displacement_cc}cc</span>
                        </div>
                      )}
                      {!isEngine && motor?.voltage && (
                        <div className="flex items-center gap-1 text-cream-400">
                          <Battery className="w-3 h-3" />
                          <span className="tabular-nums">{motor.voltage}V</span>
                        </div>
                      )}
                      {isEngine && engine?.shaft_diameter && (
                        <div className="flex items-center gap-1 text-cream-400">
                          <Ruler className="w-3 h-3" />
                          <span className="tabular-nums">{engine.shaft_diameter}"</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Price Column */}
                  <td className="py-4 px-4 text-right">
                    {item.price ? (
                      <div className="font-bold text-orange-400 tabular-nums">
                        {formatPrice(item.price)}
                      </div>
                    ) : (
                      <span className="text-cream-500 text-sm">—</span>
                    )}
                  </td>

                  {/* Actions Column */}
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center">
                      <Button
                        variant={isSelected ? "secondary" : "primary"}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToBuild(item);
                        }}
                        icon={!isSelected ? <Plus className="w-3.5 h-3.5" /> : undefined}
                        className="text-xs"
                      >
                        {isSelected ? 'Selected' : 'Add'}
                      </Button>
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
