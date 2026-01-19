'use client';

import { Badge } from '@/components/ui/Badge';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useBuildStore } from '@/store/build-store';
import type { CompatibilityType } from '@/types/database';

interface CompatibilityBadgeProps {
  variant?: 'summary' | 'detailed';
}

/**
 * Compatibility badge component
 * Shows overall compatibility status for the build
 */
export function CompatibilityBadge({ variant = 'summary' }: CompatibilityBadgeProps) {
  const { warnings, hasIncompatibilities } = useBuildStore();

  if (variant === 'summary') {
    // Simple summary badge (used in build summary header)
    const hasErrors = warnings.some((w) => w.type === 'error');
    const hasWarnings = warnings.some((w) => w.type === 'warning');
    const hasInfo = warnings.some((w) => w.type === 'info');

    if (hasErrors) {
      return (
        <Badge variant="error">
          <AlertTriangle className="w-3 h-3" />
          {warnings.filter((w) => w.type === 'error').length} Error{warnings.filter((w) => w.type === 'error').length !== 1 ? 's' : ''}
        </Badge>
      );
    }

    if (hasWarnings) {
      return (
        <Badge variant="warning">
          <AlertTriangle className="w-3 h-3" />
          {warnings.filter((w) => w.type === 'warning').length} Warning{warnings.filter((w) => w.type === 'warning').length !== 1 ? 's' : ''}
        </Badge>
      );
    }

    if (hasInfo) {
      return (
        <Badge variant="default">
          <Info className="w-3 h-3" />
          {warnings.filter((w) => w.type === 'info').length} Note{warnings.filter((w) => w.type === 'info').length !== 1 ? 's' : ''}
        </Badge>
      );
    }

    return null;
  }

  // Detailed variant would show more information
  // For now, just return summary
  return <CompatibilityBadge variant="summary" />;
}

/**
 * Individual compatibility status badge for a specific part
 */
interface PartCompatibilityBadgeProps {
  type: CompatibilityType;
  message?: string;
}

export function PartCompatibilityBadge({ type, message }: PartCompatibilityBadgeProps) {
  const icons = {
    error: AlertTriangle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    error: 'text-[var(--error)]',
    warning: 'text-[var(--warning)]',
    info: 'text-[var(--info)]',
  };

  const Icon = icons[type];

  return (
    <Badge 
      variant={type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'default'}
      className="flex items-center gap-1"
    >
      <Icon className="w-3 h-3" />
      {message || type}
    </Badge>
  );
}
