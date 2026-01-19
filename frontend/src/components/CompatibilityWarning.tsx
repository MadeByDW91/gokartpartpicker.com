'use client';

import Image from 'next/image';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CompatibilityWarning as WarningType } from '@/types/database';

/**
 * Get compatibility icon path based on type
 */
function getCompatibilityIcon(type: 'error' | 'warning' | 'info'): string {
  switch (type) {
    case 'error':
      return '/icons/icon-compat-error-v1.svg';
    case 'warning':
      return '/icons/icon-compat-warn-v1.svg';
    case 'info':
      return '/icons/icon-compat-ok-v1.svg';
    default:
      return '/icons/icon-compat-unknown-v1.svg';
  }
}

interface CompatibilityWarningProps {
  warning: WarningType;
  onDismiss?: () => void;
  className?: string;
}

export function CompatibilityWarning({ 
  warning, 
  onDismiss,
  className 
}: CompatibilityWarningProps) {
  const icons = {
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };
  
  const styles = {
    error: {
      bg: 'bg-[rgba(166,61,64,0.1)]',
      border: 'border-l-[var(--error)]',
      icon: 'text-[var(--error)]',
      title: 'text-[#c46366]',
    },
    warning: {
      bg: 'bg-[rgba(212,128,60,0.1)]',
      border: 'border-l-[var(--warning)]',
      icon: 'text-[var(--warning)]',
      title: 'text-[#e09654]',
    },
    info: {
      bg: 'bg-[rgba(90,125,154,0.1)]',
      border: 'border-l-[var(--info)]',
      icon: 'text-[var(--info)]',
      title: 'text-[#7a9db9]',
    },
  };
  
  const Icon = icons[warning.type];
  const style = styles[warning.type];
  
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-md border-l-4',
        style.bg,
        style.border,
        className
      )}
    >
      <div className="flex-shrink-0 mt-0.5 w-5 h-5 relative">
        <Image
          src={getCompatibilityIcon(warning.type)}
          alt={warning.type}
          fill
          className="object-contain"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn('text-sm font-semibold uppercase tracking-wide', style.title)}>
            {warning.type === 'error' ? 'Incompatible' : warning.type === 'warning' ? 'Warning' : 'Note'}
          </span>
          <span className="text-xs text-cream-400">
            {warning.source} → {warning.target}
          </span>
        </div>
        <p className="text-sm text-cream-200">{warning.message}</p>
      </div>
      
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 text-cream-400 hover:text-cream-100 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

interface CompatibilityWarningListProps {
  warnings: WarningType[];
  className?: string;
}

export function CompatibilityWarningList({ 
  warnings, 
  className 
}: CompatibilityWarningListProps) {
  if (warnings.length === 0) return null;
  
  // Sort by severity: errors first, then warnings, then info
  const sortedWarnings = [...warnings].sort((a, b) => {
    const order = { error: 0, warning: 1, info: 2 };
    return order[a.type] - order[b.type];
  });
  
  const errorCount = warnings.filter((w) => w.type === 'error').length;
  const warningCount = warnings.filter((w) => w.type === 'warning').length;
  
  return (
    <div className={cn('space-y-3', className)}>
      {/* Summary */}
      {(errorCount > 0 || warningCount > 0) && (
        <div className="flex items-center gap-4 text-sm">
          {errorCount > 0 && (
            <span className="flex items-center gap-1.5 text-[#c46366]">
              <AlertCircle className="w-4 h-4" />
              {errorCount} incompatible
            </span>
          )}
          {warningCount > 0 && (
            <span className="flex items-center gap-1.5 text-[#e09654]">
              <AlertTriangle className="w-4 h-4" />
              {warningCount} warning{warningCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}
      
      {/* Warnings */}
      <div className="space-y-2">
        {sortedWarnings.map((warning, index) => (
          <CompatibilityWarning key={index} warning={warning} />
        ))}
      </div>
    </div>
  );
}
