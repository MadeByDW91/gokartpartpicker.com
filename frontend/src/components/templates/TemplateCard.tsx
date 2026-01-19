'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import type { BuildTemplate } from '@/types/database';
import { Zap, DollarSign, Package, Rocket, Wallet, GraduationCap, Trophy, Baby } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplateCardProps {
  template: BuildTemplate;
  onApply?: (template: BuildTemplate) => void;
}

const GOAL_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  speed: { label: 'Speed', icon: Rocket, color: 'bg-orange-500' },
  torque: { label: 'Torque', icon: Zap, color: 'bg-blue-500' },
  budget: { label: 'Budget', icon: Wallet, color: 'bg-green-500' },
  beginner: { label: 'Beginner', icon: GraduationCap, color: 'bg-purple-500' },
  competition: { label: 'Competition', icon: Trophy, color: 'bg-yellow-500' },
  kids: { label: 'Kids', icon: Baby, color: 'bg-pink-500' },
};

export function TemplateCard({ template, onApply }: TemplateCardProps) {
  const goalConfig = GOAL_CONFIG[template.goal] || { label: template.goal, icon: Package, color: 'bg-olive-600' };
  const GoalIcon = goalConfig.icon;
  const partCount = Object.keys(template.parts || {}).length;
  const engine = template.engine;

  return (
    <Card hoverable className="h-full flex flex-col">
      <CardContent className="flex flex-col h-full p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-cream-100 line-clamp-1 mb-1">
              {template.name}
            </h3>
            <Badge
              variant="default"
              className={cn('text-xs', goalConfig.color, 'text-cream-100')}
            >
              <GoalIcon className="w-3 h-3 mr-1" />
              {goalConfig.label}
            </Badge>
          </div>
        </div>

        {/* Description */}
        {template.description && (
          <p className="text-sm text-cream-400 line-clamp-2 mb-4 flex-1">
            {template.description}
          </p>
        )}

        {/* Engine Info */}
        {engine && (
          <div className="flex items-center gap-2 px-3 py-2 bg-olive-800 rounded-md mb-4">
            <Package className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-cream-200">
              <span className="text-cream-400">Engine:</span>{' '}
              {engine.brand} {engine.name}
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-orange-400" />
            <div>
              <p className="text-xs text-cream-400">Cost</p>
              <p className="text-sm font-semibold text-cream-100">
                {template.total_price ? formatPrice(template.total_price) : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-orange-400" />
            <div>
              <p className="text-xs text-cream-400">Parts</p>
              <p className="text-sm font-semibold text-cream-100">{partCount}</p>
            </div>
          </div>
        </div>

        {/* Performance Estimates */}
        {(template.estimated_hp || template.estimated_torque) && (
          <div className="flex items-center gap-4 mb-4 text-xs text-cream-400">
            {template.estimated_hp && (
              <span>
                <Zap className="w-3 h-3 inline mr-1" />
                ~{template.estimated_hp} HP
              </span>
            )}
            {template.estimated_torque && (
              <span>
                ~{template.estimated_torque} lb-ft
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto pt-4 border-t border-olive-600">
          {onApply ? (
            <Button
              variant="primary"
              className="w-full"
              onClick={() => onApply(template)}
            >
              Apply to Builder
            </Button>
          ) : (
            <Link href={`/builder?template=${template.id}`} className="block">
              <Button variant="primary" className="w-full">
                Apply to Builder
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
