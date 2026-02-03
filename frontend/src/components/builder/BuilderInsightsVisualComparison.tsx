'use client';

import { useMemo } from 'react';
import { formatPrice } from '@/lib/utils';
import type { Engine, ElectricMotor } from '@/types/database';
import { TrendingUp, Zap } from 'lucide-react';

interface BuilderInsightsVisualComparisonProps {
  engines: Engine[];
  motors: ElectricMotor[];
  /** When set, show how this engine/motor compares and suggest alternatives */
  selectedItem?: Engine | ElectricMotor | null;
  maxItems?: number;
}

export function BuilderInsightsVisualComparison({
  engines = [],
  motors = [],
  selectedItem,
}: BuilderInsightsVisualComparisonProps) {
  const combined = useMemo(() => {
    const engineItems = (Array.isArray(engines) ? engines : []).map((e) => ({
      ...e,
      powerSource: 'gas' as const,
      hp: e.horsepower ?? 0,
      cost: e.price ?? 0,
    }));
    const motorItems = (Array.isArray(motors) ? motors : []).map((m) => ({
      ...m,
      powerSource: 'electric' as const,
      hp: m.horsepower ?? 0,
      cost: m.price ?? 0,
    }));
    return [...engineItems, ...motorItems].sort((a, b) => b.hp - a.hp);
  }, [engines, motors]);

  const gas = combined.filter((x) => x.powerSource === 'gas');
  const ev = combined.filter((x) => x.powerSource === 'electric');

  const catalogSummary = useMemo(() => {
    if (combined.length === 0) return null;
    const withPrice = combined.filter((x) => x.cost > 0);
    const minPrice = withPrice.length ? Math.min(...withPrice.map((x) => x.cost)) : 0;
    const maxPrice = withPrice.length ? Math.max(...withPrice.map((x) => x.cost)) : 0;
    const maxHp = Math.max(...combined.map((x) => x.hp), 0);
    const bestValue = [...combined]
      .filter((x) => x.cost > 0 && x.hp > 0)
      .sort((a, b) => (a.cost / a.hp) - (b.cost / b.hp))[0];
    return { minPrice, maxPrice, maxHp, bestValue, gasCount: gas.length, evCount: ev.length };
  }, [combined, gas.length, ev.length]);

  const selectedAnalysis = useMemo(() => {
    if (!selectedItem || combined.length === 0) return null;
    const isEngine = 'displacement_cc' in selectedItem;
    const hp = isEngine ? (selectedItem as Engine).horsepower ?? 0 : (selectedItem as ElectricMotor).horsepower ?? 0;
    const cost = selectedItem.price ?? 0;
    const sameType = combined
      .filter((x) => (isEngine ? x.powerSource === 'gas' : x.powerSource === 'electric'))
      .sort((a, b) => b.hp - a.hp);
    const rankByHp = sameType.findIndex((x) => x.id === selectedItem.id) + 1;
    const hpRank = rankByHp > 0 ? `${rankByHp} of ${sameType.length} by HP` : null;
    const cheaperWithSimilarHp = sameType
      .filter((x) => x.id !== selectedItem.id && x.cost < cost && x.hp >= hp * 0.9)
      .sort((a, b) => a.cost - b.cost)[0];
    const moreHpSimilarCost = sameType
      .filter((x) => x.id !== selectedItem.id && x.hp > hp && x.cost <= cost * 1.2)
      .sort((a, b) => b.hp - a.hp)[0];
    const costPerHp = cost > 0 && hp > 0 ? cost / hp : null;
    const avgCostPerHp = sameType.filter((x) => x.cost > 0 && x.hp > 0).length
      ? sameType.reduce((s, x) => s + x.cost / x.hp, 0) / sameType.filter((x) => x.cost > 0 && x.hp > 0).length
      : null;
    const valueVerdict = costPerHp != null && avgCostPerHp != null
      ? costPerHp < avgCostPerHp * 0.95
        ? 'Good value (below average $/HP)'
        : costPerHp > avgCostPerHp * 1.05
          ? 'Premium (above average $/HP)'
          : 'Average value'
      : null;
    return {
      hpRank,
      valueVerdict,
      cheaperWithSimilarHp,
      moreHpSimilarCost,
    };
  }, [selectedItem, combined]);

  if (combined.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-cream-400 text-sm">No engine or motor data available.</p>
      </div>
    );
  }

  const summary = catalogSummary!;

  return (
    <div className="space-y-6">
      {/* Catalog summary — always useful */}
      <div className="rounded-lg border border-olive-700/50 bg-olive-800/20 p-4">
        <h3 className="text-sm font-semibold text-cream-100 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-orange-400" />
          Catalog at a glance
        </h3>
        <ul className="space-y-2 text-sm">
          {summary.gasCount > 0 && (
            <li className="text-cream-300">
              <span className="font-medium text-cream-100">{summary.gasCount}</span> gas engine{summary.gasCount !== 1 ? 's' : ''}
              {summary.minPrice > 0 || summary.maxPrice > 0 ? (
                <span className="text-cream-400"> · {formatPrice(summary.minPrice)} – {formatPrice(summary.maxPrice)}</span>
              ) : null}
            </li>
          )}
          {summary.evCount > 0 && (
            <li className="text-cream-300">
              <span className="font-medium text-cream-100">{summary.evCount}</span> electric motor{summary.evCount !== 1 ? 's' : ''}
            </li>
          )}
          {summary.maxHp > 0 && (
            <li className="text-cream-300">
              Up to <span className="font-medium text-cream-100">{summary.maxHp} HP</span> in this catalog
            </li>
          )}
          {summary.bestValue && (
            <li className="text-cream-300 pt-1 border-t border-olive-700/50 mt-2">
              <span className="text-cream-400">Best value (HP per dollar):</span>{' '}
              <span className="font-medium text-cream-100">{summary.bestValue.name}</span>
            </li>
          )}
        </ul>
      </div>

      {/* When something is selected: how it compares + alternatives */}
      {selectedItem && selectedAnalysis && (
        <div className="rounded-lg border border-olive-700/50 bg-olive-800/20 p-4">
          <h3 className="text-sm font-semibold text-cream-100 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-400" />
            How {selectedItem.name} compares
          </h3>
          <ul className="space-y-2 text-sm">
            {selectedAnalysis.hpRank && (
              <li className="text-cream-300">
                <span className="text-cream-400">HP ranking:</span>{' '}
                <span className="text-cream-100">{selectedAnalysis.hpRank}</span>
              </li>
            )}
            {selectedAnalysis.valueVerdict && (
              <li className="text-cream-300">
                <span className="text-cream-400">Value:</span>{' '}
                <span className="text-cream-100">{selectedAnalysis.valueVerdict}</span>
              </li>
            )}
            {selectedAnalysis.cheaperWithSimilarHp && (
              <li className="text-cream-300">
                <span className="text-cream-400">Similar HP, lower cost:</span>{' '}
                <span className="font-medium text-cream-100">{selectedAnalysis.cheaperWithSimilarHp.name}</span>
                <span className="text-cream-400"> ({formatPrice(selectedAnalysis.cheaperWithSimilarHp.cost)})</span>
              </li>
            )}
            {selectedAnalysis.moreHpSimilarCost && (
              <li className="text-cream-300">
                <span className="text-cream-400">More HP, similar price:</span>{' '}
                <span className="font-medium text-cream-100">{selectedAnalysis.moreHpSimilarCost.name}</span>
                <span className="text-cream-400"> ({selectedAnalysis.moreHpSimilarCost.hp} HP)</span>
              </li>
            )}
          </ul>
        </div>
      )}

      {!selectedItem && (
        <p className="text-xs text-cream-500 text-center py-2">
          Select an engine or motor above to see how it compares and get alternatives.
        </p>
      )}
    </div>
  );
}
