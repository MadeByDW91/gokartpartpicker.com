'use client';

import { useMemo } from 'react';
import { Zap, Gauge, Wallet, Battery } from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import { useBuildStore } from '@/store/build-store';
import type { Engine, ElectricMotor } from '@/types/database';

interface BuilderRecommendationsProps {
  engines?: Engine[];
  motors?: ElectricMotor[];
}

interface RecommendationCard {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: {
    border: string;
    bg: string;
    text: string;
    icon: string;
  };
  item: Engine | ElectricMotor | null;
  value: string;
}

export function BuilderRecommendations({ engines = [], motors = [] }: BuilderRecommendationsProps) {
  const { powerSourceType, selectedEngine, selectedMotor, setEngine, setMotor, setPowerSourceType } = useBuildStore();

  const recommendations = useMemo(() => {
    let items = powerSourceType === 'electric' 
      ? motors 
      : powerSourceType === 'gas'
      ? engines
      : [...engines, ...motors];

    // Exclude currently selected engine/motor
    if (selectedEngine) {
      items = items.filter((item) => !('displacement_cc' in item) || item.id !== selectedEngine.id);
    }
    if (selectedMotor) {
      items = items.filter((item) => 'displacement_cc' in item || item.id !== selectedMotor.id);
    }

    const itemsWithPrice = items.filter((item) => item.price && item.horsepower);
    const itemsWithWeight = items.filter((item) => item.horsepower && item.weight_lbs);

    // Best Value (lowest cost per HP)
    const bestValue = itemsWithPrice.length > 0
      ? itemsWithPrice.reduce((best, item) => {
          const costPerHp = item.price! / item.horsepower!;
          const bestCostPerHp = best.price! / best.horsepower!;
          return costPerHp < bestCostPerHp ? item : best;
        }, itemsWithPrice[0])
      : null;

    // Most Powerful
    const mostPowerful = items.length > 0
      ? items.reduce((best, item) => (item.horsepower || 0) > (best.horsepower || 0) ? item : best, items[0])
      : null;

    // Best Budget (lowest price)
    const bestBudget = itemsWithPrice.length > 0
      ? itemsWithPrice.reduce((cheapest, item) => item.price! < cheapest.price! ? item : cheapest, itemsWithPrice[0])
      : null;

    // Best Power-to-Weight
    const bestPowerWeight = itemsWithWeight.length > 0
      ? itemsWithWeight.reduce((best, item) => {
          const ptw = item.horsepower! / item.weight_lbs!;
          const bestPtw = best.horsepower! / best.weight_lbs!;
          return ptw > bestPtw ? item : best;
        }, itemsWithWeight[0])
      : null;

    const cards: RecommendationCard[] = [
      {
        id: 'best-value',
        label: 'Best Value',
        icon: Zap,
        color: {
          border: 'border-orange-500',
          bg: 'bg-orange-500/5',
          text: 'text-orange-400',
          icon: 'text-orange-400',
        },
        item: bestValue,
        value: bestValue 
          ? `$${(bestValue.price! / bestValue.horsepower!).toFixed(0)}/HP • ${formatPrice(bestValue.price!)}`
          : '—',
      },
      {
        id: 'most-powerful',
        label: 'Most Powerful',
        icon: Gauge,
        color: {
          border: 'border-blue-500',
          bg: 'bg-blue-500/5',
          text: 'text-blue-400',
          icon: 'text-blue-400',
        },
        item: mostPowerful,
        value: mostPowerful 
          ? `${mostPowerful.horsepower.toFixed(1)} HP${mostPowerful.price ? ` • ${formatPrice(mostPowerful.price)}` : ''}`
          : '—',
      },
      {
        id: 'best-budget',
        label: 'Best Budget',
        icon: Wallet,
        color: {
          border: 'border-green-500',
          bg: 'bg-green-500/5',
          text: 'text-green-400',
          icon: 'text-green-400',
        },
        item: bestBudget,
        value: bestBudget 
          ? `${formatPrice(bestBudget.price!)} • ${bestBudget.horsepower.toFixed(1)} HP`
          : '—',
      },
      {
        id: 'best-power-weight',
        label: 'Best Power/Weight',
        icon: Battery,
        color: {
          border: 'border-purple-500',
          bg: 'bg-purple-500/5',
          text: 'text-purple-400',
          icon: 'text-purple-400',
        },
        item: bestPowerWeight,
        value: bestPowerWeight 
          ? `${((bestPowerWeight.horsepower! / bestPowerWeight.weight_lbs!) * 100).toFixed(1)} HP/100lbs`
          : '—',
      },
    ];

    return cards;
  }, [engines, motors, powerSourceType]);

  const handleSelect = (item: Engine | ElectricMotor | null) => {
    if (!item) return;
    
    if ('displacement_cc' in item) {
      // It's an engine
      setEngine(item);
      setPowerSourceType('gas');
    } else {
      // It's a motor
      setMotor(item);
      setPowerSourceType('electric');
    }
  };

  if (recommendations.every((r) => !r.item)) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {recommendations.map((rec) => {
        const IconComponent = rec.icon;
        const item = rec.item;
        const name = item ? `${item.brand} ${item.name}` : '—';

        return (
          <button
            key={rec.id}
            onClick={() => handleSelect(item)}
            disabled={!item}
            className={cn(
              'relative p-5 rounded-lg border-2 transition-all text-left',
              rec.color.border,
              rec.color.bg,
              item 
                ? 'hover:scale-[1.02] hover:shadow-lg cursor-pointer active:scale-[0.98]' 
                : 'opacity-50 cursor-not-allowed'
            )}
          >
            {/* Icon + Label */}
            <div className="flex items-center gap-2 mb-3">
              <IconComponent className={`w-5 h-5 ${rec.color.icon}`} />
              <span className={`text-sm font-semibold ${rec.color.text}`}>
                {rec.label}
              </span>
            </div>

            {/* Engine/Motor Name */}
            <h3 className="text-base font-bold text-cream-100 mb-2 line-clamp-2 leading-tight">
              {name}
            </h3>

            {/* Value/Specs */}
            <p className="text-sm text-cream-300">
              {rec.value}
            </p>
          </button>
        );
      })}
    </div>
  );
}
