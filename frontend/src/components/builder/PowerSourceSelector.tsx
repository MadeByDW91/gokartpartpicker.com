'use client';

import { LayoutGrid, Flame, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useBuildStore } from '@/store/build-store';
import type { PowerSourceType } from '@/types/database';
import { cn } from '@/lib/utils';

export type PowerSourceViewType = PowerSourceType | 'all';

const MORE_INFO: Record<PowerSourceViewType, { title: string; subtitle: string; bullets: string[] }> = {
  all: {
    title: 'View All',
    subtitle: 'Gas + electric',
    bullets: [
      'See gas engines and electric motors in one list.',
      'Compare specs side-by-side without switching views.',
      "Useful when you haven't decided on power type yet.",
    ],
  },
  gas: {
    title: 'Gas Engine',
    subtitle: 'Classic build',
    bullets: [
      'Traditional internal combustion — high horsepower and torque.',
      'Wide range of modifications and aftermarket parts.',
      'Often the most cost-effective for performance.',
    ],
  },
  electric: {
    title: 'Electric Motor',
    subtitle: 'Quiet, zero emissions',
    bullets: [
      'Instant torque, quiet run, zero tailpipe emissions.',
      'Lower maintenance; battery and controller are main considerations.',
      'Good for indoor or noise-sensitive environments.',
    ],
  },
};

interface PowerSourceSelectorProps {
  onSwitch?: (type: PowerSourceViewType) => void;
  showWarning?: boolean;
  clearOnSwitch?: boolean;
  showViewAll?: boolean;
  viewType?: PowerSourceViewType;
  onViewTypeChange?: (type: PowerSourceViewType) => void;
}

export function PowerSourceSelector({
  onSwitch,
  showWarning = true,
  clearOnSwitch = true,
  showViewAll = false,
  viewType,
  onViewTypeChange,
}: PowerSourceSelectorProps) {
  const { powerSourceType, selectedEngine, selectedMotor, selectedParts, setPowerSourceType, clearBuild } = useBuildStore();
  const hasSelections = selectedEngine || selectedMotor || selectedParts.size > 0;
  const activeViewType = viewType ?? powerSourceType;
  const info = MORE_INFO[activeViewType];

  const handleSwitch = (newType: PowerSourceViewType) => {
    if (newType === 'all') {
      onViewTypeChange?.(newType);
      onSwitch?.(newType);
      return;
    }
    if (newType === powerSourceType && activeViewType === newType) return;
    if (hasSelections && showWarning && clearOnSwitch && (newType === 'gas' || newType === 'electric')) {
      const confirmed = window.confirm(
        'Switching power source will clear your current selection. Do you want to continue?'
      );
      if (!confirmed) return;
    }
    if (clearOnSwitch && (newType === 'gas' || newType === 'electric')) {
      clearBuild();
    }
    if (newType === 'gas' || newType === 'electric') {
      setPowerSourceType(newType);
    }
    onViewTypeChange?.(newType);
    onSwitch?.(newType);
  };

  const tabBase =
    'flex-1 min-w-0 flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3.5 sm:py-4 rounded-t-xl border-2 border-b-0 transition-all duration-200 text-left sm:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-olive-900';
  const tabAll =
    activeViewType === 'all'
      ? 'bg-gradient-to-b from-purple-500/20 to-purple-500/10 border-purple-500/60 text-purple-400'
      : 'bg-olive-800/50 border-olive-700/50 border-b-olive-800/50 text-cream-400 hover:bg-olive-800/70 hover:text-cream-100';
  const tabGas =
    activeViewType === 'gas'
      ? 'bg-gradient-to-b from-orange-500/20 to-orange-500/10 border-orange-500/60 text-orange-400'
      : 'bg-olive-800/50 border-olive-700/50 border-b-olive-800/50 text-cream-400 hover:bg-olive-800/70 hover:text-cream-100';
  const tabElectric =
    activeViewType === 'electric'
      ? 'bg-gradient-to-b from-blue-500/20 to-blue-500/10 border-blue-500/60 text-blue-400'
      : 'bg-olive-800/50 border-olive-700/50 border-b-olive-800/50 text-cream-400 hover:bg-olive-800/70 hover:text-cream-100';

  const accentBullet =
    activeViewType === 'all'
      ? 'text-purple-400/80'
      : activeViewType === 'gas'
        ? 'text-orange-400/80'
        : 'text-blue-400/80';
  const contentBorder =
    activeViewType === 'all'
      ? 'border-purple-500/30'
      : activeViewType === 'gas'
        ? 'border-orange-500/30'
        : 'border-blue-500/30';

  return (
    <div className="space-y-0" role="radiogroup" aria-label="Power source">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <div>
          <h2 id="power-source-label" className="text-sm font-semibold text-cream-100">
            Choose your power source
          </h2>
          <p className="text-xs text-cream-400 mt-0.5">Pick one to filter, or view both together.</p>
        </div>
        {hasSelections && showWarning && (
          <div
            className="flex items-center gap-1.5 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-md text-yellow-400 text-xs whitespace-nowrap"
            role="status"
          >
            <AlertCircle className="w-3 h-3" aria-hidden />
            <span>Switching clears selections</span>
          </div>
        )}
      </div>

      {/* Tabs: View All | Gas | EV */}
      <div className="flex gap-0 rounded-t-xl overflow-hidden" role="group" aria-labelledby="power-source-label">
        {showViewAll && (
          <button
            type="button"
            onClick={() => handleSwitch('all')}
            className={cn(tabBase, tabAll, 'rounded-tl-xl')}
            role="radio"
            aria-checked={activeViewType === 'all'}
            aria-label="View all: gas engines and electric motors together"
          >
            <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" aria-hidden />
            <span className="font-semibold text-sm sm:text-base truncate">View All</span>
            {activeViewType === 'all' && <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden />}
          </button>
        )}
        <button
          type="button"
          onClick={() => handleSwitch('gas')}
          className={cn(tabBase, tabGas, !showViewAll && 'rounded-tl-xl')}
          role="radio"
          aria-checked={activeViewType === 'gas'}
          aria-label="Gas engine: internal combustion, classic build"
        >
          <Flame className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" aria-hidden />
          <span className="font-semibold text-sm sm:text-base truncate">Gas Engine</span>
          {activeViewType === 'gas' && <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden />}
        </button>
        <button
          type="button"
          onClick={() => handleSwitch('electric')}
          className={cn(tabBase, tabElectric, 'rounded-tr-xl')}
          role="radio"
          aria-checked={activeViewType === 'electric'}
          aria-label="Electric motor: quiet, zero emissions"
        >
          <Zap className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" aria-hidden />
          <span className="font-semibold text-sm sm:text-base truncate">Electric Motor</span>
          {activeViewType === 'electric' && <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden />}
        </button>
      </div>

      {/* Single content area: details for the selected tab */}
      <div
        className={cn(
          'rounded-b-xl border-2 border-t-0 rounded-t-none p-4 sm:p-5 bg-olive-800/60',
          contentBorder
        )}
        role="region"
        aria-label={`${info.title} details`}
      >
        <h3 className="text-base font-semibold text-cream-100 mb-1">{info.title}</h3>
        <p className="text-sm text-cream-400 mb-4">{info.subtitle}</p>
        <ul className="space-y-2 text-sm text-cream-300">
          {info.bullets.map((bullet, i) => (
            <li key={i} className="flex gap-2">
              <span className={cn('mt-0.5 shrink-0', accentBullet)}>•</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
