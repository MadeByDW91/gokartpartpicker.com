'use client';

import { useState } from 'react';
import { useBuildStore } from '@/store/build-store';
import { useRecommendations, usePopularCombinations, useUpgradePath } from '@/hooks/use-recommendations-enhanced';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Sparkles,
  TrendingUp,
  Shield,
  DollarSign,
  ChevronRight,
  Plus,
  Users,
  ArrowUp,
  Zap,
} from 'lucide-react';
import { formatPrice, getCategoryLabel } from '@/lib/utils';
import type { PartCategory, Part } from '@/types/database';
import type { RecommendationGoal } from '@/actions/recommendations';

interface RecommendationsPanelProps {
  category: PartCategory | null;
  onAddPart?: (part: Part) => void;
}

/**
 * Recommendations Panel Component
 * 
 * Displays:
 * - Goal-based recommendations for selected category
 * - Popular part combinations for the engine
 * - Upgrade path guidance
 */
export function RecommendationsPanel({
  category,
  onAddPart,
}: RecommendationsPanelProps) {
  const { selectedEngine, selectedParts } = useBuildStore();
  const [goal, setGoal] = useState<RecommendationGoal>('speed');
  
  const engineId = selectedEngine?.id || null;
  const currentParts = Array.from(selectedParts.values());
  
  const { data: recommendations = [], isLoading: recsLoading } = useRecommendations(
    engineId,
    category,
    goal,
    !!category && !!engineId
  );
  
  const { data: popularCombinations = [], isLoading: combosLoading } = usePopularCombinations(
    engineId,
    !!engineId
  );
  
  const { data: upgradePath = [], isLoading: upgradeLoading } = useUpgradePath(
    selectedEngine,
    currentParts,
    goal,
    !!selectedEngine
  );
  
  const goalOptions: Array<{ value: RecommendationGoal; label: string; icon: React.ReactNode }> = [
    { value: 'speed', label: 'Speed', icon: <Zap className="w-4 h-4" /> },
    { value: 'torque', label: 'Torque', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'reliability', label: 'Reliability', icon: <Shield className="w-4 h-4" /> },
    { value: 'budget', label: 'Budget', icon: <DollarSign className="w-4 h-4" /> },
  ];
  
  const handleAddPart = (part: Part) => {
    if (onAddPart) {
      onAddPart(part);
    }
  };
  
  if (!selectedEngine) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Sparkles className="w-12 h-12 text-cream-400 mx-auto mb-3 opacity-50" />
          <p className="text-cream-400">Select an engine to see recommendations</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Goal Selector */}
      {category && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-orange-400" />
              <h3 className="text-display text-base text-cream-100">Goal</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {goalOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={goal === option.value ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setGoal(option.value)}
                  icon={option.icon}
                  className="text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </CardHeader>
        </Card>
      )}
      
      {/* Suggested Parts for Category */}
      {category && (
        <Card>
          <CardHeader>
            <h3 className="text-display text-base text-cream-100">
              Suggested {getCategoryLabel(category)}
            </h3>
          </CardHeader>
          <CardContent>
            {recsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-olive-600/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.slice(0, 5).map((part) => {
                  const hpGain = (part.specifications?.hp_contribution as number) || 0;
                  const isSelected = selectedParts.get(category)?.id === part.id;
                  
                  return (
                    <div
                      key={part.id}
                      className={`p-3 rounded-lg border ${
                        isSelected
                          ? 'bg-orange-500/20 border-orange-500'
                          : 'bg-olive-600/50 border-olive-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-cream-100 line-clamp-1">
                            {part.name}
                          </h4>
                          <p className="text-xs text-cream-400 mt-1">{part.brand}</p>
                          {hpGain > 0 && (
                            <Badge variant="success" size="sm" className="mt-1">
                              +{hpGain.toFixed(1)} HP
                            </Badge>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-bold text-orange-400">
                            {part.price ? formatPrice(part.price) : 'Contact'}
                          </div>
                          {!isSelected && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddPart(part)}
                              icon={<Plus className="w-3 h-3" />}
                              className="mt-1 text-xs"
                            >
                              Add
                            </Button>
                          )}
                          {isSelected && (
                            <Badge variant="success" size="sm" className="mt-1">
                              Selected
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-cream-400">No recommendations available</p>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Popular Combinations */}
      {popularCombinations.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-400" />
              <h3 className="text-display text-base text-cream-100">Popular Combinations</h3>
            </div>
          </CardHeader>
          <CardContent>
            {combosLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 bg-olive-600/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {popularCombinations.slice(0, 3).map((combo, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-olive-600/50 rounded-lg border border-olive-600"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-cream-400 uppercase">
                        Combination {idx + 1}
                      </span>
                      <Badge variant="info" size="sm">
                        {combo.count} builds ({combo.percentage}%)
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {combo.parts.slice(0, 4).map((p, pIdx) => (
                        <Badge key={pIdx} variant="default" size="sm" className="text-xs">
                          {getCategoryLabel(p.category)}
                        </Badge>
                      ))}
                      {combo.parts.length > 4 && (
                        <Badge variant="default" size="sm" className="text-xs">
                          +{combo.parts.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Upgrade Path */}
      {upgradePath.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ArrowUp className="w-5 h-5 text-orange-400" />
              <h3 className="text-display text-base text-cream-100">Upgrade Path</h3>
            </div>
          </CardHeader>
          <CardContent>
            {upgradeLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-olive-600/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {upgradePath.slice(0, 5).map((step) => (
                  <div
                    key={step.step}
                    className="p-3 bg-olive-600/50 rounded-lg border border-olive-600"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-cream-100 flex items-center justify-center text-xs font-bold">
                        {step.step}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-cream-100">
                            {getCategoryLabel(step.category)}
                          </span>
                          {step.estimatedHPGain > 0 && (
                            <Badge variant="success" size="sm">
                              +{step.estimatedHPGain.toFixed(1)} HP
                            </Badge>
                          )}
                          <Badge
                            variant={step.priority === 'high' ? 'warning' : 'default'}
                            size="sm"
                          >
                            {step.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-cream-400 mb-2">{step.reason}</p>
                        {step.recommendedPart && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-cream-300">
                              {step.recommendedPart.name}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddPart(step.recommendedPart!)}
                              icon={<ChevronRight className="w-3 h-3" />}
                              className="text-xs"
                            >
                              Add
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Empty State */}
      {!category && !combosLoading && !upgradeLoading && (
        <Card>
          <CardContent className="py-8 text-center">
            <Sparkles className="w-12 h-12 text-cream-400 mx-auto mb-3 opacity-50" />
            <p className="text-cream-400">Select a category to see recommendations</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
