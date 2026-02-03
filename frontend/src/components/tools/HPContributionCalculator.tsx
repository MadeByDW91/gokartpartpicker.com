'use client';

import { useState, useMemo } from 'react';
import { Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useEngines } from '@/hooks/use-engines';
import { useParts } from '@/hooks/use-parts';
import { calculateBuildHP } from '@/lib/performance/calculator';
import { getPartBrandDisplay } from '@/lib/utils';
import type { Engine, Part } from '@/types/database';

export function HPContributionCalculator() {
  const { data: engines } = useEngines();
  const { data: allParts } = useParts();
  const [selectedEngineId, setSelectedEngineId] = useState<string>('');
  const [selectedPartIds, setSelectedPartIds] = useState<Set<string>>(new Set());

  const selectedEngine = engines?.find(e => e.id === selectedEngineId) || null;
  const selectedParts = allParts?.filter(p => selectedPartIds.has(p.id)) || [];

  const hpBreakdown = useMemo(() => {
    if (!selectedEngine) {
      return { baseHP: 0, partContributions: [], totalHP: 0 };
    }

    const baseHP = selectedEngine.horsepower;
    const partContributions = selectedParts.map(part => {
      const specs = part.specifications as Record<string, unknown>;
      const contribution = (specs?.hp_contribution as number) || 0;
      return {
        part,
        contribution,
      };
    });

    const totalHP = calculateBuildHP(selectedEngine, selectedParts);

    return {
      baseHP,
      partContributions: partContributions.sort((a, b) => b.contribution - a.contribution),
      totalHP,
    };
  }, [selectedEngine, selectedParts]);

  const togglePart = (partId: string) => {
    const newSet = new Set(selectedPartIds);
    if (newSet.has(partId)) {
      newSet.delete(partId);
    } else {
      newSet.add(partId);
    }
    setSelectedPartIds(newSet);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Engine Selection */}
      <div className="lg:col-span-1 space-y-4">
        <Card className="border-olive-700/50 bg-olive-800/40">
          <CardHeader>
            <h2 className="text-lg font-semibold text-cream-100">Select Engine</h2>
          </CardHeader>
          <CardContent>
            <select
              value={selectedEngineId}
              onChange={(e) => setSelectedEngineId(e.target.value)}
              className="w-full px-3 py-2 bg-olive-800 border border-olive-600 rounded-md text-cream-100"
            >
              <option value="">Choose an engine...</option>
              {engines?.map(engine => (
                <option key={engine.id} value={engine.id}>
                  {engine.brand} {engine.name} ({engine.horsepower} HP)
                </option>
              ))}
            </select>
            {selectedEngine && (
              <div className="mt-4 p-3 bg-olive-700/50 rounded-lg">
                <p className="text-sm text-cream-400">Base HP</p>
                <p className="text-2xl font-bold text-orange-400">{selectedEngine.horsepower} HP</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Parts Selection */}
        <Card className="border-olive-700/50 bg-olive-800/40">
          <CardHeader>
            <h2 className="text-lg font-semibold text-cream-100">Select Parts</h2>
            <p className="text-sm text-cream-400 mt-1">
              {selectedPartIds.size} part{selectedPartIds.size !== 1 ? 's' : ''} selected
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {allParts?.map(part => {
                const specs = part.specifications as Record<string, unknown>;
                const contribution = (specs?.hp_contribution as number) || 0;
                const isSelected = selectedPartIds.has(part.id);

                return (
                  <button
                    key={part.id}
                    onClick={() => togglePart(part.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      isSelected
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-olive-600 bg-olive-800 hover:border-olive-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-cream-100 truncate">{part.name}</p>
                        <p className="text-xs text-cream-400">{getPartBrandDisplay(part.brand)}</p>
                      </div>
                      {contribution > 0 && (
                        <Badge variant="success" className="ml-2">
                          +{contribution} HP
                        </Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* HP Breakdown */}
      <div className="lg:col-span-2">
        <Card className="border-olive-700/50 bg-olive-800/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-cream-100">HP Breakdown</h2>
              {hpBreakdown.totalHP > 0 && (
                <Badge variant="default" className="text-lg px-4 py-1">
                  {hpBreakdown.totalHP} HP Total
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedEngine ? (
              <div className="text-center py-12">
                <Zap className="w-16 h-16 text-olive-600 mx-auto mb-4 opacity-50" />
                <p className="text-cream-400">Select an engine to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-olive-800 rounded-lg border border-olive-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-cream-400">Base Engine HP</p>
                      <p className="text-xl font-bold text-cream-100">{selectedEngine.brand} {selectedEngine.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-400">{hpBreakdown.baseHP} HP</p>
                    </div>
                  </div>
                </div>

                {hpBreakdown.partContributions.length > 0 ? (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-cream-200 uppercase tracking-wide mb-3">
                      Part Contributions
                    </h3>
                    {hpBreakdown.partContributions.map(({ part, contribution }) => (
                      <div
                        key={part.id}
                        className="p-4 bg-olive-800 rounded-lg border border-olive-600 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-cream-100">{part.name}</p>
                          <p className="text-sm text-cream-400">{getPartBrandDisplay(part.brand)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {contribution > 0 ? (
                            <>
                              <TrendingUp className="w-5 h-5 text-green-400" />
                              <span className="text-xl font-bold text-green-400">+{contribution} HP</span>
                            </>
                          ) : (
                            <>
                              <TrendingDown className="w-5 h-5 text-cream-500" />
                              <span className="text-xl font-bold text-cream-500">0 HP</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-cream-400">
                    <p>No parts selected. Add parts to see their HP contributions.</p>
                  </div>
                )}

                {hpBreakdown.partContributions.length > 0 && (
                  <div className="p-4 bg-orange-500/10 rounded-lg border-2 border-orange-500 mt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold text-cream-100">Total Build HP</p>
                      <p className="text-3xl font-bold text-orange-400">{hpBreakdown.totalHP} HP</p>
                    </div>
                    <p className="text-sm text-cream-400 mt-2">
                      Base: {hpBreakdown.baseHP} HP + Parts: +{hpBreakdown.totalHP - hpBreakdown.baseHP} HP
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
