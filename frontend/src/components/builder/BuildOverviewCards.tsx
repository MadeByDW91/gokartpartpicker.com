'use client';

import { useMemo } from 'react';
import { Zap, DollarSign, Weight, CheckCircle2, TrendingUp } from 'lucide-react';
import { useBuildPerformance } from '@/hooks/use-build-performance';
import { useBuildStore } from '@/store/build-store';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface OverviewCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  change?: string;
  changePositive?: boolean;
  className?: string;
}

function OverviewCard({ icon: Icon, label, value, change, changePositive, className }: OverviewCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-xl p-5 bg-gradient-to-br from-olive-800/60 to-olive-900/60 border border-olive-700/50 backdrop-blur-sm',
        'hover:border-olive-600/70 transition-all duration-200',
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-olive-700/30 border border-olive-600/30">
          <Icon className="w-5 h-5 text-orange-400" />
        </div>
        {change && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded',
            changePositive 
              ? 'text-green-400 bg-green-500/10 border border-green-500/20' 
              : 'text-red-400 bg-red-500/10 border border-red-500/20'
          )}>
            <TrendingUp className={cn('w-3 h-3', !changePositive && 'rotate-180')} />
            <span>{change}</span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-cream-100">{value}</p>
        <p className="text-sm text-cream-400">{label}</p>
      </div>
    </div>
  );
}

export function BuildOverviewCards() {
  const { selectedEngine, selectedMotor, selectedParts, powerSourceType } = useBuildStore();
  const performance = useBuildPerformance();

  // Calculate build completion percentage
  const buildCompletion = useMemo(() => {
    const requiredComponents = powerSourceType === 'gas' 
      ? ['engine', 'clutch', 'torque_converter', 'chain', 'sprocket'] // At least one drivetrain option
      : ['motor', 'battery', 'motor_controller'];
    
    let completed = 0;
    const total = requiredComponents.length;

    if (powerSourceType === 'gas') {
      if (selectedEngine) completed++;
      // Check for at least one drivetrain option
      const clutchParts = selectedParts.get('clutch') || [];
      const tcParts = selectedParts.get('torque_converter') || [];
      if (clutchParts.length > 0 || tcParts.length > 0) {
        completed++;
      }
      const chainParts = selectedParts.get('chain') || [];
      if (chainParts.length > 0) completed++;
      const sprocketParts = selectedParts.get('sprocket') || [];
      if (sprocketParts.length > 0) completed++;
    } else {
      if (selectedMotor) completed++;
      const batteryParts = selectedParts.get('battery') || [];
      if (batteryParts.length > 0) completed++;
      const controllerParts = selectedParts.get('motor_controller') || [];
      if (controllerParts.length > 0) completed++;
    }

    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [selectedEngine, selectedMotor, selectedParts, powerSourceType]);

  // Calculate total cost
  const totalCost = useMemo(() => {
    let cost = 0;
    if (selectedEngine?.price) cost += selectedEngine.price;
    if (selectedMotor?.price) cost += selectedMotor.price;
    selectedParts.forEach((partsArray) => {
      partsArray.forEach((part) => {
        if (part.price) cost += part.price;
      });
    });
    return cost;
  }, [selectedEngine, selectedMotor, selectedParts]);

  // Calculate total weight
  const totalWeight = performance.weight || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <OverviewCard
        icon={Zap}
        label="Total HP"
        value={performance.hp > 0 ? `${performance.hp.toFixed(performance.hp % 1 === 0 ? 0 : 1)} hp` : '—'}
        className="sm:col-span-1"
      />
      <OverviewCard
        icon={DollarSign}
        label="Total Cost"
        value={totalCost > 0 ? formatPrice(totalCost) : '$0.00'}
        className="sm:col-span-1"
      />
      <OverviewCard
        icon={Weight}
        label="Total Weight"
        value={totalWeight > 0 ? `${totalWeight.toFixed(1)} lbs` : '—'}
        className="sm:col-span-1"
      />
      <OverviewCard
        icon={CheckCircle2}
        label="Build Progress"
        value={`${buildCompletion}%`}
        change={buildCompletion === 100 ? 'Complete' : undefined}
        changePositive={buildCompletion === 100}
        className="sm:col-span-1"
      />
    </div>
  );
}
