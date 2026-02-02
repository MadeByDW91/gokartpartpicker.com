'use client';

import { useMemo } from 'react';
import {
  Gauge,
  Zap,
  Weight,
} from 'lucide-react';
import { useBuildStore } from '@/store/build-store';
import { useBuildPerformance } from '@/hooks/use-build-performance';
import { getCategoryLabel } from '@/lib/utils';
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

/**
 * Live Tools Content - The actual metrics and calculations
 * Can be used standalone or within BuilderInsights tabs
 */
export function LiveToolsContent() {
  const { selectedEngine, selectedMotor, selectedParts, powerSourceType } = useBuildStore();
  const performance = useBuildPerformance();

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

  const totalWeight = weightBreakdown.reduce((sum, item) => sum + item.weight, 0);

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
    <div>
      {/* Single Row: All Live Tools */}
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
      </div>
    </div>
  );
}
