'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, getCategoryLabel } from '@/lib/utils';
import type { BuildTemplate } from '@/types/database';
import { useParts } from '@/hooks/use-parts';
import { 
  X, 
  Zap, 
  DollarSign, 
  Package, 
  TrendingUp,
  Rocket,
  Wallet,
  GraduationCap,
  Trophy,
  Baby
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface TemplatePreviewProps {
  template: BuildTemplate;
  onClose: () => void;
  onApply: () => void;
}

const GOAL_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  speed: { label: 'Speed', icon: Rocket, color: 'bg-orange-500' },
  torque: { label: 'Torque', icon: Zap, color: 'bg-blue-500' },
  budget: { label: 'Budget', icon: Wallet, color: 'bg-green-500' },
  beginner: { label: 'Beginner', icon: GraduationCap, color: 'bg-purple-500' },
  competition: { label: 'Competition', icon: Trophy, color: 'bg-yellow-500' },
  kids: { label: 'Kids', icon: Baby, color: 'bg-pink-500' },
};

export function TemplatePreview({ template, onClose, onApply }: TemplatePreviewProps) {
  const { data: allParts } = useParts();
  const goalConfig = GOAL_CONFIG[template.goal] || { label: template.goal, icon: Package, color: 'bg-olive-600' };
  const GoalIcon = goalConfig.icon;
  const engine = template.engine;

  // Get template parts with details
  const templateParts = Object.entries(template.parts || {})
    .map(([category, partId]) => {
      const part = allParts?.find((p) => p.id === partId);
      return { category, partId, part };
    })
    .filter((item) => item.part !== undefined);

  const partCount = Object.keys(template.parts || {}).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-olive-900/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <Card className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-fade-in">
        <CardHeader className="sticky top-0 bg-olive-800 border-b border-olive-600 z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-display text-2xl text-cream-100">{template.name}</h2>
                <Badge
                  variant="default"
                  className={cn('text-xs', goalConfig.color, 'text-cream-100')}
                >
                  <GoalIcon className="w-3 h-3 mr-1" />
                  {goalConfig.label}
                </Badge>
              </div>
              {template.description && (
                <p className="text-cream-400">{template.description}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              icon={<X className="w-4 h-4" />}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Engine */}
          {engine && (
            <div>
              <h3 className="text-lg font-semibold text-cream-100 mb-3">Engine</h3>
              <div className="flex items-center gap-4 p-4 bg-olive-800 rounded-lg">
                {engine.image_url && (
                  <div className="relative w-20 h-20 bg-olive-700 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={engine.image_url}
                      alt={engine.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-cream-100">
                    {engine.brand} {engine.name}
                  </h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-cream-400">
                    <span>{engine.horsepower} HP</span>
                    {engine.torque && <span>{engine.torque} lb-ft torque</span>}
                    {engine.displacement_cc && <span>{engine.displacement_cc}cc</span>}
                  </div>
                </div>
                {engine.price && (
                  <div className="text-right">
                    <span className="text-2xl font-bold text-orange-400">
                      {formatPrice(engine.price)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Performance Estimates */}
          {(template.estimated_hp || template.estimated_torque) && (
            <div>
              <h3 className="text-lg font-semibold text-cream-100 mb-3">Estimated Performance</h3>
              <div className="grid grid-cols-2 gap-4">
                {template.estimated_hp && (
                  <div className="p-4 bg-olive-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-5 h-5 text-orange-400" />
                      <span className="text-sm text-cream-400">Estimated HP</span>
                    </div>
                    <p className="text-2xl font-bold text-cream-100">{template.estimated_hp}</p>
                  </div>
                )}
                {template.estimated_torque && (
                  <div className="p-4 bg-olive-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-5 h-5 text-orange-400" />
                      <span className="text-sm text-cream-400">Estimated Torque</span>
                    </div>
                    <p className="text-2xl font-bold text-cream-100">{template.estimated_torque} lb-ft</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Parts List */}
          {templateParts.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-cream-100 mb-3">
                Parts ({partCount})
              </h3>
              <div className="space-y-2">
                {templateParts.map(({ category, part }) => {
                  if (!part) return null;
                  return (
                    <div
                      key={part.id}
                      className="flex items-center gap-4 p-3 bg-olive-800 rounded-lg"
                    >
                      <Package className="w-5 h-5 text-orange-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-cream-100">{part.name}</p>
                        <p className="text-sm text-cream-400">
                          {getCategoryLabel(category)} • {part.brand}
                        </p>
                      </div>
                      {part.price && (
                        <span className="text-lg font-bold text-orange-400">
                          {formatPrice(part.price)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Total Cost */}
          {template.total_price && (
            <div className="p-4 bg-olive-800 rounded-lg border-2 border-orange-500">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-cream-100">Estimated Total</span>
                <span className="text-3xl font-bold text-orange-400 flex items-center gap-2">
                  <DollarSign className="w-6 h-6" />
                  {formatPrice(template.total_price)}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-olive-600">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={onApply}
              className="flex-1"
            >
              Apply to Builder
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
