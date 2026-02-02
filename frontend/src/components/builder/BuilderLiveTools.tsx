'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/Input';
import {
  Calculator,
  Gauge,
  Zap,
  Weight,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  BarChart3,
  GaugeCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useBuildStore } from '@/store/build-store';
import { useBuildPerformance } from '@/hooks/use-build-performance';
import { formatPrice, getCategoryLabel } from '@/lib/utils';
import type { PartCategory } from '@/types/database';

/** Reusable metric card — same style as Performance boxes */
function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  gradient,
  border,
  iconColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: React.ReactNode;
  gradient: string;
  border: string;
  iconColor: string;
}) {
  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br ${gradient} border ${border} shadow-sm`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <span className="text-sm text-cream-400">{label}</span>
      </div>
      <div className="text-2xl font-bold text-cream-100 tabular-nums">{value}</div>
      {sub != null && <div className="text-xs text-cream-500 mt-1">{sub}</div>}
    </div>
  );
}

export function BuilderLiveTools() {
  const { selectedEngine, selectedMotor, selectedParts, powerSourceType, getTotalPrice } = useBuildStore();
  const performance = useBuildPerformance();
  const [isExpanded, setIsExpanded] = useState(true);

  const gearRatio = useMemo(() => {
    const clutchParts = selectedParts.get('clutch') || [];
    const tcParts = selectedParts.get('torque_converter') || [];
    const clutchSprocket = clutchParts[0] || tcParts[0];
    const sprocketParts = selectedParts.get('sprocket') || [];
    const axleSprocket = sprocketParts.find((p) => {
      const specs = p.specifications || {};
      const position = specs.position as string | undefined;
      return position === 'axle' || position === 'rear';
    });
    if (!clutchSprocket || !axleSprocket) return null;
    const clutchTeeth = clutchSprocket.specifications?.teeth as number | undefined;
    const axleTeeth = axleSprocket.specifications?.teeth as number | undefined;
    if (!clutchTeeth || !axleTeeth) return null;
    return axleTeeth / clutchTeeth;
  }, [selectedParts]);

  const weightBreakdown = useMemo(() => {
    const breakdown: Array<{ name: string; weight: number; category: string }> = [];
    if (selectedEngine?.weight_lbs) {
      breakdown.push({ name: selectedEngine.name, weight: selectedEngine.weight_lbs, category: 'Engine' });
    }
    if (selectedMotor?.weight_lbs) {
      breakdown.push({ name: selectedMotor.name, weight: selectedMotor.weight_lbs, category: 'Motor' });
    }
    selectedParts.forEach((parts, category) => {
      parts.forEach((part) => {
        const specs = part.specifications || {};
        const weight = (specs.weight_lbs || specs.weight) as number | undefined;
        if (weight && weight > 0) {
          breakdown.push({ name: part.name, weight, category: getCategoryLabel(category as PartCategory) });
        }
      });
    });
    return breakdown;
  }, [selectedEngine, selectedMotor, selectedParts]);

  const costBreakdown = useMemo(() => {
    const breakdown: Array<{ name: string; cost: number; category: string }> = [];
    if (selectedEngine?.price) {
      breakdown.push({ name: selectedEngine.name, cost: selectedEngine.price, category: 'Engine' });
    }
    if (selectedMotor?.price) {
      breakdown.push({ name: selectedMotor.name, cost: selectedMotor.price, category: 'Motor' });
    }
    selectedParts.forEach((parts, category) => {
      parts.forEach((part) => {
        if (part.price) {
          breakdown.push({ name: part.name, cost: part.price, category: getCategoryLabel(category as PartCategory) });
        }
      });
    });
    return breakdown;
  }, [selectedEngine, selectedMotor, selectedParts]);

  const totalWeight = weightBreakdown.reduce((sum, item) => sum + item.weight, 0);
  const totalCost = getTotalPrice();

  // Calculate build completeness
  const categoriesFilled = selectedParts.size;
  const totalCategories = 12; // Common categories for a complete build
  const completenessPercent = Math.round((categoriesFilled / totalCategories) * 100);

  // Calculate modification impact (HP gain from parts)
  const baseHP = selectedEngine?.horsepower || selectedMotor?.horsepower || 0;
  const hpGain = performance.hp > baseHP ? performance.hp - baseHP : 0;

  // Calculate cost efficiency (cost per HP)
  const costPerHP = performance.hp > 0 && totalCost > 0 ? totalCost / performance.hp : null;

  const clutchTeeth = (() => {
    const clutchParts = selectedParts.get('clutch') || [];
    const tcParts = selectedParts.get('torque_converter') || [];
    const part = clutchParts[0] || tcParts[0];
    return part?.specifications?.teeth as number | undefined;
  })();
  const axleTeeth = (() => {
    const sprocketParts = selectedParts.get('sprocket') || [];
    const axle = sprocketParts.find((p) => {
      const s = p.specifications || {};
      return s.position === 'axle' || s.position === 'rear';
    });
    return axle?.specifications?.teeth as number | undefined;
  })();

  const canGearRatio = powerSourceType === 'gas';

  return (
    <div className="bg-olive-800/30 rounded-xl border border-olive-700/50 overflow-hidden shadow-lg mb-8">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-olive-700/50 bg-olive-800/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <Calculator className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-cream-100">Builder Insights</h2>
              <p className="text-sm text-cream-400 mt-0.5">Interactive calculators using your current build</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-olive-700/50 rounded-lg transition-colors"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-cream-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-cream-400" />
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
      <div className="p-4 sm:p-6 pt-6">
        {/* Row 1: Performance — orange, blue, green, violet (no green/emerald or purple/indigo neighbors) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={Zap}
            label="Total HP"
            value={performance.hp > 0 ? `${performance.hp.toFixed(performance.hp % 1 === 0 ? 0 : 1)}` : '—'}
            sub={
              selectedEngine && performance.hp > selectedEngine.horsepower ? (
                <span className="text-green-400">+{(performance.hp - selectedEngine.horsepower).toFixed(1)} from mods</span>
              ) : undefined
            }
            gradient="from-orange-500/10 to-orange-500/5"
            border="border-orange-500/20"
            iconColor="text-orange-400"
          />
          <MetricCard
            icon={Gauge}
            label="Torque"
            value={performance.torque > 0 ? `${performance.torque.toFixed(1)} lb-ft` : '—'}
            gradient="from-blue-500/10 to-blue-500/5"
            border="border-blue-500/20"
            iconColor="text-blue-400"
          />
          <MetricCard
            icon={CheckCircle2}
            label="Completeness"
            value={`${categoriesFilled}/${totalCategories}`}
            sub={`${completenessPercent}% complete`}
            gradient="from-green-500/10 to-green-500/5"
            border="border-green-500/20"
            iconColor="text-green-400"
          />
          <MetricCard
            icon={TrendingUp}
            label="Mod Impact"
            value={hpGain > 0 ? `+${hpGain.toFixed(1)} hp` : 'No mods'}
            sub={hpGain > 0 ? 'From parts' : undefined}
            gradient="from-violet-500/10 to-violet-500/5"
            border="border-violet-500/20"
            iconColor="text-violet-400"
          />
        </div>

        {/* Row 2: Weight(rose) | Gear(amber) | Cost Efficiency(slate) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <MetricCard
            icon={Weight}
            label="Total Weight"
            value={totalWeight > 0 ? `${totalWeight.toFixed(1)} lbs` : '—'}
            gradient="from-rose-500/10 to-rose-500/5"
            border="border-rose-500/20"
            iconColor="text-rose-400"
          />
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-cream-400">Gear Ratio</span>
            </div>
            <div className="text-2xl font-bold text-cream-100 tabular-nums">
              {canGearRatio && gearRatio != null ? `${gearRatio.toFixed(2)}:1` : '—'}
            </div>
            <div className="text-xs text-cream-500 mt-1">
              {!canGearRatio && 'Gas build only'}
              {canGearRatio && gearRatio != null && clutchTeeth != null && axleTeeth != null && (
                <>{clutchTeeth}T → {axleTeeth}T</>
              )}
              {canGearRatio && gearRatio == null && 'Add clutch + axle sprocket'}
            </div>
          </div>

          <MetricCard
            icon={DollarSign}
            label="Cost Efficiency"
            value={costPerHP != null ? formatPrice(costPerHP) : '—'}
            sub={costPerHP != null ? 'Per HP' : 'Add engine/motor'}
            gradient="from-slate-500/10 to-slate-500/5"
            border="border-slate-400/30"
            iconColor="text-slate-300"
          />
        </div>

        {/* Row 3: Acceleration — distinct colors, no section duplicate */}
        {performance.acceleration0to20 > 0 && performance.acceleration0to30 > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-cream-200 mb-3">Acceleration</h4>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-rose-500/10 to-rose-500/5 border border-rose-500/20 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-rose-400" />
                  <span className="text-sm text-cream-400">0–20 mph</span>
                </div>
                <div className="text-2xl font-bold text-cream-100 tabular-nums">
                  {performance.acceleration0to20.toFixed(1)}s
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-cream-400">0–30 mph</span>
                </div>
                <div className="text-2xl font-bold text-cream-100 tabular-nums">
                  {performance.acceleration0to30.toFixed(1)}s
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
