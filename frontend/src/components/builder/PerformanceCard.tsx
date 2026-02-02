'use client';

import { useBuildPerformance } from '@/hooks/use-build-performance';
import { useBuildStore } from '@/store/build-store';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Gauge,
  Zap,
  CheckCircle2,
  TrendingUp,
  GaugeCircle,
  Timer,
} from 'lucide-react';

/**
 * Performance Card Component
 * 
 * Displays estimated performance metrics for the current build:
 * - HP (Horsepower)
 * - Torque
 * - Build Completeness
 * - Modification Impact
 * - Acceleration (0-20, 0-30)
 */
export function PerformanceCard() {
  const { selectedEngine, selectedParts } = useBuildStore();
  const performance = useBuildPerformance();
  
  // Calculate build completeness (categories filled)
  const categoriesFilled = selectedParts.size;
  const totalCategories = 12; // Common categories for a complete build
  const completenessPercent = Math.round((categoriesFilled / totalCategories) * 100);
  
  // Calculate modification impact (HP gain from parts)
  const baseHP = selectedEngine?.horsepower || 0;
  const hpGain = performance.hp > baseHP ? performance.hp - baseHP : 0;
  
  // Don't show if no engine selected
  if (!selectedEngine) {
    return null;
  }
  
  return (
    <Card className="bg-olive-700 border border-olive-600">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Gauge className="w-5 h-5 text-orange-400" />
          <h3 className="text-display text-base text-cream-100">Performance</h3>
        </div>
        <Badge variant="info" size="sm">
          Estimate
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* HP */}
          <MetricItem
            icon={<Zap className="w-4 h-4" />}
            label="HP"
            value={performance.hp}
            unit="hp"
            color="text-orange-400"
          />
          
          {/* Torque */}
          <MetricItem
            icon={<GaugeCircle className="w-4 h-4" />}
            label="Torque"
            value={performance.torque}
            unit="lb-ft"
            color="text-orange-400"
          />
          
          {/* Build Completeness */}
          <MetricItem
            icon={<CheckCircle2 className="w-4 h-4" />}
            label="Completeness"
            value={categoriesFilled}
            unit={`/${totalCategories}`}
            color="text-orange-400"
            subtitle={`${completenessPercent}% complete`}
          />
          
          {/* Modification Impact */}
          <MetricItem
            icon={<TrendingUp className="w-4 h-4" />}
            label="Mod Impact"
            value={hpGain > 0 ? hpGain : 0}
            unit="hp gain"
            color="text-orange-400"
            subtitle={hpGain > 0 ? `+${hpGain.toFixed(1)} from parts` : 'No mods'}
          />
        </div>
        
        {/* Acceleration Times */}
        <div className="pt-3 border-t border-olive-600">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="w-4 h-4 text-cream-400" />
            <span className="text-xs font-medium text-cream-400 uppercase tracking-wide">
              Acceleration
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 bg-olive-600/50 rounded">
              <div className="text-lg font-bold text-orange-400">
                {performance.acceleration0to20}s
              </div>
              <div className="text-xs text-cream-400">0-20 mph</div>
            </div>
            <div className="text-center p-2 bg-olive-600/50 rounded">
              <div className="text-lg font-bold text-orange-400">
                {performance.acceleration0to30}s
              </div>
              <div className="text-xs text-cream-400">0-30 mph</div>
            </div>
          </div>
        </div>
        
        {/* Additional Info */}
        <div className="pt-2 border-t border-olive-600">
          <div className="flex items-center justify-between text-xs text-cream-500">
            <span>Est. Weight: {performance.weight} lbs</span>
            {performance.gearRatio !== 1.0 && (
              <span>Ratio: {performance.gearRatio.toFixed(2)}:1</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface MetricItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  color?: string;
  subtitle?: string;
}

function MetricItem({ icon, label, value, unit, color = 'text-orange-400', subtitle }: MetricItemProps) {
  return (
    <div className="p-3 bg-olive-600/50 rounded-lg">
      <div className="flex items-center gap-2 mb-1">
        <div className={color}>{icon}</div>
        <span className="text-xs font-medium text-cream-400 uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-xl font-bold ${color}`}>
          {value.toFixed(value % 1 === 0 ? 0 : 1)}
        </span>
        <span className="text-xs text-cream-500">{unit}</span>
      </div>
      {subtitle && (
        <div className="text-xs text-cream-500 mt-1">{subtitle}</div>
      )}
    </div>
  );
}
