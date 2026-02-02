'use client';

import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HealthIndicatorProps {
  score: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

/**
 * Visual health indicator with color-coded status
 */
export function HealthIndicator({
  score,
  size = 'md',
  showLabel = false,
  className = '',
}: HealthIndicatorProps) {
  const getStatus = () => {
    if (score >= 80) return { color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30', icon: CheckCircle, label: 'Excellent' };
    if (score >= 60) return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', icon: AlertTriangle, label: 'Good' };
    if (score >= 40) return { color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30', icon: Info, label: 'Fair' };
    return { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', icon: XCircle, label: 'Poor' };
  };

  const status = getStatus();
  const Icon = status.icon;

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('relative', sizeClasses[size])}>
        <div className={cn('absolute inset-0 rounded-full', status.bg, status.border, 'border')} />
        <Icon className={cn('absolute inset-0', status.color, sizeClasses[size])} />
      </div>
      {showLabel && (
        <span className={cn('text-xs font-medium', status.color)}>
          {status.label} ({score}%)
        </span>
      )}
    </div>
  );
}
