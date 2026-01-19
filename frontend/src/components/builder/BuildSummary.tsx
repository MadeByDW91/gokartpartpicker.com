'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useBuildStore } from '@/store/build-store';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CompatibilityWarningList } from '@/components/CompatibilityWarning';
import { PerformanceCard } from '@/components/builder/PerformanceCard';
import { CostCard } from '@/components/builder/CostCard';
import { CostBreakdown } from '@/components/builder/CostBreakdown';
import { BudgetSuggestions } from '@/components/builder/BudgetSuggestions';
import { formatPrice, getCategoryLabel } from '@/lib/utils';
import {
  Cog,
  Package,
  AlertTriangle,
  Trash2,
  Save,
  Share2,
  ExternalLink,
} from 'lucide-react';
import type { PartCategory } from '@/types/database';

interface BuildSummaryProps {
  onSave?: () => void;
  onShare?: () => void;
  onClear?: () => void;
  isAuthenticated?: boolean;
  showMobileActions?: boolean;
}

/**
 * Build summary sidebar component
 * Shows selected engine, parts, compatibility warnings, and total price
 */
export function BuildSummary({
  onSave,
  onShare,
  onClear,
  isAuthenticated = false,
  showMobileActions = false,
}: BuildSummaryProps) {
  const {
    selectedEngine,
    selectedParts,
    getTotalPrice,
    warnings,
    hasIncompatibilities,
  } = useBuildStore();

  const totalPrice = getTotalPrice();
  const [budget, setBudget] = useState<number | undefined>(undefined);
  const completedSteps = [
    selectedEngine ? 1 : 0,
    ...Array.from(selectedParts.values()).map(() => 1),
  ].reduce((a, b) => a + b, 0);

  return (
    <Card className="sticky top-24">
      <CardHeader className="flex flex-row items-center justify-between">
        <h2 className="text-display text-lg text-cream-100">Your Build</h2>
        <Badge 
          variant={hasIncompatibilities() ? 'error' : completedSteps > 0 ? 'success' : 'default'}
        >
          {hasIncompatibilities() ? (
            <>
              <AlertTriangle className="w-3 h-3" />
              Issues
            </>
          ) : (
            `${completedSteps} selected`
          )}
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Selected Engine */}
        {selectedEngine ? (
          <div className="p-3 bg-olive-600 rounded-lg space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Cog className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-cream-100 truncate">
                    {selectedEngine.name}
                  </p>
                  <p className="text-xs text-cream-400">{selectedEngine.brand}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-orange-400 ml-2 flex-shrink-0">
                {selectedEngine.price ? formatPrice(selectedEngine.price) : '—'}
              </span>
            </div>
            {/* Harbor Freight Link for Predator Engines */}
            {selectedEngine.brand.toLowerCase().includes('predator') && (
              <a
                href="https://www.harborfreight.com/brands/predator/engines.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-cream-400 hover:text-orange-400 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span>View on Harbor Freight</span>
              </a>
            )}
          </div>
        ) : (
          <div className="p-3 border border-dashed border-olive-600 rounded-lg text-center">
            <p className="text-sm text-cream-400">No engine selected</p>
          </div>
        )}
        
        {/* Selected Parts */}
        {selectedParts.size > 0 && (
          <div className="space-y-2">
            {Array.from(selectedParts.entries()).map(([category, part]) => (
              <div key={category} className="p-3 bg-olive-600 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Package className="w-4 h-4 text-orange-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-cream-100 line-clamp-1">
                        {part.name}
                      </p>
                      <p className="text-xs text-cream-400">
                        {getCategoryLabel(category)}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-orange-400 ml-2 flex-shrink-0">
                    {part.price ? formatPrice(part.price) : 'Contact'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Performance Metrics */}
        {selectedEngine && (
          <div className="pt-4 border-t border-olive-600">
            <PerformanceCard />
          </div>
        )}
        
        {/* Compatibility Warnings */}
        {warnings.length > 0 && (
          <div className="pt-4 border-t border-olive-600">
            <CompatibilityWarningList warnings={warnings} />
          </div>
        )}
        
        {/* Cost Card with Budget */}
        <div className="pt-4 border-t border-olive-600">
          <CostCard 
            budget={budget} 
            onBudgetChange={setBudget}
          />
        </div>

        {/* Budget Suggestions (when over budget) */}
        {budget && totalPrice > budget && (
          <div className="pt-4">
            <BudgetSuggestions budget={budget} />
          </div>
        )}

        {/* Cost Breakdown */}
        <div className="pt-4">
          <CostBreakdown showDetails={true} />
        </div>

        {/* Mobile Actions */}
        {showMobileActions && (
            <div className="space-y-2">
              {(selectedEngine || selectedParts.size > 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClear}
                  icon={<Trash2 className="w-4 h-4" />}
                  className="w-full"
                >
                  Clear Build
                </Button>
              )}
              
              {(selectedEngine || selectedParts.size > 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onShare}
                  icon={<Share2 className="w-4 h-4" />}
                  className="w-full"
                >
                  Share Build
                </Button>
              )}
              
              {isAuthenticated ? (
                <Button
                  variant="primary"
                  onClick={onSave}
                  disabled={!selectedEngine && selectedParts.size === 0}
                  icon={<Save className="w-4 h-4" />}
                  className="w-full"
                >
                  Save Build
                </Button>
              ) : (
                <Link href="/auth/login?redirect=/builder" className="block">
                  <Button variant="secondary" className="w-full">
                    Login to Save
                  </Button>
                </Link>
              )}
            </div>
          )}
      </CardContent>
    </Card>
  );
}
