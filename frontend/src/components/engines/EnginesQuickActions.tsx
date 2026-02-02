'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Zap, Gauge, Wallet, Battery, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Engine, ElectricMotor } from '@/types/database';

interface EnginesQuickActionsProps {
  engines: Engine[];
  motors: ElectricMotor[];
  activePowerSource: 'gas' | 'electric' | 'all';
  onAddToBuild: (item: Engine | ElectricMotor) => void;
}

export function EnginesQuickActions({ engines, motors, activePowerSource, onAddToBuild }: EnginesQuickActionsProps) {
  const recommendations = useMemo(() => {
    const items = activePowerSource === 'all' 
      ? [...engines, ...motors]
      : activePowerSource === 'gas'
      ? engines
      : motors;

    const itemsWithPrice = items.filter(item => item.price && item.horsepower);
    
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

    return { bestValue, mostPowerful, bestBudget };
  }, [engines, motors, activePowerSource]);

  if (!recommendations.bestValue && !recommendations.mostPowerful && !recommendations.bestBudget) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-orange-400" />
          <h2 className="text-xl font-bold text-cream-100">Top Recommendations</h2>
        </div>
        <p className="text-sm text-cream-400">Quick picks based on your current view</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Best Value */}
        {recommendations.bestValue && (
          <button
            onClick={() => onAddToBuild(recommendations.bestValue!)}
            className="group relative p-5 rounded-xl border-2 border-orange-500/50 bg-gradient-to-br from-orange-500/10 to-orange-600/5 hover:border-orange-500 hover:from-orange-500/20 hover:to-orange-600/10 transition-all text-left"
          >
            <div className="flex items-start gap-4">
              {recommendations.bestValue.image_url ? (
                <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-olive-800 border border-olive-700/50">
                  <Image
                    src={recommendations.bestValue.image_url}
                    alt={recommendations.bestValue.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-orange-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-semibold text-orange-400 uppercase tracking-wide">Best Value</span>
                </div>
                <h3 className="text-base font-bold text-cream-100 mb-1 line-clamp-2 leading-tight">
                  {recommendations.bestValue.brand} {recommendations.bestValue.name}
                </h3>
                <p className="text-sm text-cream-300 mb-2">
                  ${((recommendations.bestValue.price! / recommendations.bestValue.horsepower!)).toFixed(0)}/HP
                </p>
                <div className="flex items-center gap-3 text-xs text-cream-400">
                  <span>{recommendations.bestValue.horsepower.toFixed(1)} HP</span>
                  <span>•</span>
                  <span className="text-orange-400 font-semibold">{formatPrice(recommendations.bestValue.price!)}</span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-cream-400 group-hover:text-orange-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
          </button>
        )}

        {/* Most Powerful */}
        {recommendations.mostPowerful && (
          <button
            onClick={() => onAddToBuild(recommendations.mostPowerful!)}
            className="group relative p-5 rounded-xl border-2 border-blue-500/50 bg-gradient-to-br from-blue-500/10 to-blue-600/5 hover:border-blue-500 hover:from-blue-500/20 hover:to-blue-600/10 transition-all text-left"
          >
            <div className="flex items-start gap-4">
              {recommendations.mostPowerful.image_url ? (
                <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-olive-800 border border-olive-700/50">
                  <Image
                    src={recommendations.mostPowerful.image_url}
                    alt={recommendations.mostPowerful.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <Gauge className="w-8 h-8 text-blue-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">Most Powerful</span>
                </div>
                <h3 className="text-base font-bold text-cream-100 mb-1 line-clamp-2 leading-tight">
                  {recommendations.mostPowerful.brand} {recommendations.mostPowerful.name}
                </h3>
                <p className="text-sm text-cream-300 mb-2">
                  {recommendations.mostPowerful.horsepower.toFixed(1)} HP
                </p>
                <div className="flex items-center gap-3 text-xs text-cream-400">
                  {recommendations.mostPowerful.price && (
                    <>
                      <span className="text-blue-400 font-semibold">{formatPrice(recommendations.mostPowerful.price)}</span>
                      <span>•</span>
                    </>
                  )}
                  <span>Highest performance</span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-cream-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
          </button>
        )}

        {/* Best Budget */}
        {recommendations.bestBudget && (
          <button
            onClick={() => onAddToBuild(recommendations.bestBudget!)}
            className="group relative p-5 rounded-xl border-2 border-green-500/50 bg-gradient-to-br from-green-500/10 to-green-600/5 hover:border-green-500 hover:from-green-500/20 hover:to-green-600/10 transition-all text-left"
          >
            <div className="flex items-start gap-4">
              {recommendations.bestBudget.image_url ? (
                <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-olive-800 border border-olive-700/50">
                  <Image
                    src={recommendations.bestBudget.image_url}
                    alt={recommendations.bestBudget.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-green-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-semibold text-green-400 uppercase tracking-wide">Best Budget</span>
                </div>
                <h3 className="text-base font-bold text-cream-100 mb-1 line-clamp-2 leading-tight">
                  {recommendations.bestBudget.brand} {recommendations.bestBudget.name}
                </h3>
                <p className="text-sm text-cream-300 mb-2">
                  Lowest price option
                </p>
                <div className="flex items-center gap-3 text-xs text-cream-400">
                  <span className="text-green-400 font-semibold">{formatPrice(recommendations.bestBudget.price!)}</span>
                  <span>•</span>
                  <span>{recommendations.bestBudget.horsepower.toFixed(1)} HP</span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-cream-400 group-hover:text-green-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
