'use client';

import { cn } from '@/lib/utils';

interface SegmentedControlOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * Professional segmented control component
 * Used for mutually exclusive options (like power source type, view mode)
 */
export function SegmentedControl({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 p-1 bg-olive-800/50 rounded-lg border border-olive-600',
        className
      )}
      role="tablist"
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold transition-all duration-200',
              'min-h-[40px] touch-manipulation',
              isActive
                ? 'bg-gradient-to-b from-orange-500 to-orange-600 text-cream-100 shadow-lg shadow-orange-500/30 border border-orange-400/30'
                : 'text-cream-300 hover:text-cream-100 hover:bg-olive-700/50 active:scale-[0.98]'
            )}
          >
            {option.icon && (
              <span className={cn(
                'flex-shrink-0',
                isActive ? 'text-cream-100' : 'text-cream-400'
              )}>
                {option.icon}
              </span>
            )}
            <span>{option.label}</span>
            {isActive && (
              <span className="absolute inset-0 rounded-md bg-gradient-to-b from-orange-400/20 to-transparent pointer-events-none" />
            )}
          </button>
        );
      })}
    </div>
  );
}
