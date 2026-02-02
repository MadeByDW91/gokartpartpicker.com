'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Cog, Battery, ArrowUp, ArrowDown, ChevronUp, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import type { Engine, ElectricMotor } from '@/types/database';

interface ComparisonItem {
  id: string;
  name: string;
  brand: string;
  powerSource: 'gas' | 'electric';
  horsepower: number;
  power_kw: number;
  torque: number;
  price: number | null;
  weight_lbs: number | null;
  image_url: string | null;
  slug: string;
  // Additional fields
  voltage?: number;
  displacement_cc?: number;
  peak_power_kw?: number | null;
}

interface ComparisonTableProps {
  engines: Engine[];
  motors: ElectricMotor[];
}

type SortField = 'name' | 'brand' | 'horsepower' | 'power_kw' | 'torque' | 'price' | 'weight_lbs' | 'cost_per_hp';
type SortOrder = 'asc' | 'desc';

export function ComparisonTable({ engines, motors }: ComparisonTableProps) {
  const [sortField, setSortField] = useState<SortField>('horsepower');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Combine and normalize data
  const items: ComparisonItem[] = useMemo(() => {
    const engineItems: ComparisonItem[] = engines.map((engine) => ({
      id: engine.id,
      name: engine.name,
      brand: engine.brand,
      powerSource: 'gas' as const,
      horsepower: engine.horsepower,
      power_kw: engine.horsepower * 0.746, // Convert HP to kW
      torque: engine.torque,
      price: engine.price,
      weight_lbs: engine.weight_lbs,
      image_url: engine.image_url,
      slug: engine.slug,
      displacement_cc: engine.displacement_cc,
    }));

    const motorItems: ComparisonItem[] = motors.map((motor) => ({
      id: motor.id,
      name: motor.name,
      brand: motor.brand,
      powerSource: 'electric' as const,
      horsepower: motor.horsepower,
      power_kw: motor.power_kw,
      torque: motor.torque_lbft,
      price: motor.price,
      weight_lbs: motor.weight_lbs,
      image_url: motor.image_url,
      slug: motor.slug,
      voltage: motor.voltage,
      peak_power_kw: motor.peak_power_kw,
    }));

    return [...engineItems, ...motorItems];
  }, [engines, motors]);

  // Sort items
  const sortedItems = useMemo(() => {
    const sorted = [...items].sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'brand':
          aValue = a.brand.toLowerCase();
          bValue = b.brand.toLowerCase();
          break;
        case 'horsepower':
          aValue = a.horsepower;
          bValue = b.horsepower;
          break;
        case 'power_kw':
          aValue = a.power_kw;
          bValue = b.power_kw;
          break;
        case 'torque':
          aValue = a.torque;
          bValue = b.torque;
          break;
        case 'price':
          aValue = a.price ?? Infinity;
          bValue = b.price ?? Infinity;
          break;
        case 'weight_lbs':
          aValue = a.weight_lbs ?? Infinity;
          bValue = b.weight_lbs ?? Infinity;
          break;
        case 'cost_per_hp':
          aValue = a.price && a.horsepower ? a.price / a.horsepower : Infinity;
          bValue = b.price && b.horsepower ? b.price / b.horsepower : Infinity;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return sorted;
  }, [items, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronUp className="w-3 h-3 text-cream-500 opacity-50" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-orange-400" />
      : <ArrowDown className="w-3 h-3 text-orange-400" />;
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full align-middle">
        <table className="min-w-full divide-y divide-olive-600/50 text-sm">
          <thead className="bg-olive-800/80 backdrop-blur-sm sticky top-0 z-10 border-b border-olive-600/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-cream-100 uppercase tracking-wider">
                Type
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-semibold text-cream-100 uppercase tracking-wider cursor-pointer hover:bg-olive-700 transition-colors"
                onClick={() => handleSort('brand')}
              >
                <div className="flex items-center gap-1">
                  Brand
                  <SortIcon field="brand" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-semibold text-cream-100 uppercase tracking-wider cursor-pointer hover:bg-olive-700 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Name
                  <SortIcon field="name" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-right text-sm font-semibold text-cream-100 uppercase tracking-wider cursor-pointer hover:bg-olive-700 transition-colors"
                onClick={() => handleSort('horsepower')}
              >
                <div className="flex items-center justify-end gap-1">
                  HP
                  <SortIcon field="horsepower" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-right text-sm font-semibold text-cream-100 uppercase tracking-wider cursor-pointer hover:bg-olive-700 transition-colors"
                onClick={() => handleSort('power_kw')}
              >
                <div className="flex items-center justify-end gap-1">
                  kW
                  <SortIcon field="power_kw" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-right text-sm font-semibold text-cream-100 uppercase tracking-wider cursor-pointer hover:bg-olive-700 transition-colors"
                onClick={() => handleSort('torque')}
              >
                <div className="flex items-center justify-end gap-1">
                  Torque
                  <SortIcon field="torque" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-right text-sm font-semibold text-cream-100 uppercase tracking-wider cursor-pointer hover:bg-olive-700 transition-colors"
                onClick={() => handleSort('price')}
              >
                <div className="flex items-center justify-end gap-1">
                  Price
                  <SortIcon field="price" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-right text-sm font-semibold text-cream-100 uppercase tracking-wider cursor-pointer hover:bg-olive-700 transition-colors"
                onClick={() => handleSort('weight_lbs')}
              >
                <div className="flex items-center justify-end gap-1">
                  Weight
                  <SortIcon field="weight_lbs" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-right text-sm font-semibold text-cream-100 uppercase tracking-wider cursor-pointer hover:bg-olive-700 transition-colors"
                onClick={() => handleSort('cost_per_hp')}
              >
                <div className="flex items-center justify-end gap-1">
                  $/HP
                  <SortIcon field="cost_per_hp" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-olive-900/50 divide-y divide-olive-700/30">
            {sortedItems.map((item) => {
              const costPerHp = item.price && item.horsepower 
                ? item.price / item.horsepower 
                : null;

              return (
                <tr 
                  key={item.id} 
                  className="hover:bg-olive-800/70 transition-colors border-b border-olive-700/20 last:border-0"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    {item.powerSource === 'gas' ? (
                      <Badge variant="default" className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs px-2 py-1">
                        <Cog className="w-3 h-3 mr-1" />
                        Gas
                      </Badge>
                    ) : (
                      <Badge variant="default" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs px-2 py-1">
                        <Battery className="w-3 h-3 mr-1" />
                        EV
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-cream-200">
                    {item.brand}
                  </td>
                  <td className="px-4 py-3 text-sm text-cream-100 font-medium">
                    <div className="flex items-center gap-3">
                      {item.image_url ? (
                        <div className="relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-olive-800 border border-olive-700/50">
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 flex-shrink-0 rounded-md bg-olive-800/50 border border-olive-700/50 flex items-center justify-center">
                          {item.powerSource === 'gas' ? (
                            <Cog className="w-6 h-6 text-olive-600" />
                          ) : (
                            <Battery className="w-6 h-6 text-olive-600" />
                          )}
                        </div>
                      )}
                      <span className="max-w-[250px] truncate">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-cream-200 font-semibold">
                    {item.horsepower.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-cream-200">
                    {item.power_kw.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-cream-200">
                    {item.torque.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-cream-100 font-semibold">
                    {item.price ? formatPrice(item.price) : '—'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-cream-300">
                    {item.weight_lbs ? `${item.weight_lbs.toFixed(0)}` : '—'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-cream-200 font-medium">
                    {costPerHp ? `$${costPerHp.toFixed(0)}` : '—'}
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
