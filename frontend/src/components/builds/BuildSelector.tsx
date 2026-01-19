'use client';

import { useState, useMemo } from 'react';
import { useUserBuilds, usePublicBuilds } from '@/hooks/use-builds';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Search, X, Check } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import type { Build } from '@/types/database';

interface BuildSelectorProps {
  selectedBuildIds: string[];
  onSelectionChange: (buildIds: string[]) => void;
  maxSelection?: number;
  className?: string;
}

/**
 * Build selector component for choosing builds to compare
 */
export function BuildSelector({
  selectedBuildIds,
  onSelectionChange,
  maxSelection = 3,
  className,
}: BuildSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserBuilds, setShowUserBuilds] = useState(true);
  const [showPublicBuilds, setShowPublicBuilds] = useState(true);

  const { data: userBuilds = [], isLoading: userLoading } = useUserBuilds();
  const { data: publicBuilds = [], isLoading: publicLoading } = usePublicBuilds(50);

  // Filter builds by search query
  const filteredUserBuilds = useMemo(() => {
    if (!searchQuery) return userBuilds;
    const query = searchQuery.toLowerCase();
    return userBuilds.filter(
      (build) =>
        build.name.toLowerCase().includes(query) ||
        (build.engine as any)?.name?.toLowerCase().includes(query) ||
        (build.engine as any)?.brand?.toLowerCase().includes(query)
    );
  }, [userBuilds, searchQuery]);

  const filteredPublicBuilds = useMemo(() => {
    if (!searchQuery) return publicBuilds;
    const query = searchQuery.toLowerCase();
    return publicBuilds.filter(
      (build) =>
        build.name.toLowerCase().includes(query) ||
        (build.engine as any)?.name?.toLowerCase().includes(query) ||
        (build.engine as any)?.brand?.toLowerCase().includes(query)
    );
  }, [publicBuilds, searchQuery]);

  const toggleBuild = (buildId: string) => {
    if (selectedBuildIds.includes(buildId)) {
      onSelectionChange(selectedBuildIds.filter((id) => id !== buildId));
    } else {
      if (selectedBuildIds.length < maxSelection) {
        onSelectionChange([...selectedBuildIds, buildId]);
      }
    }
  };

  const clearSelection = () => {
    onSelectionChange([]);
  };

  return (
    <Card className={className}>
      <CardContent className="space-y-4 pt-6">
        {/* Search */}
        <Input
          icon={<Search className="w-4 h-4" />}
          placeholder="Search builds..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Selection Count */}
        {selectedBuildIds.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-cream-400">
              {selectedBuildIds.length} of {maxSelection} selected
            </span>
            <Button variant="ghost" size="sm" onClick={clearSelection} icon={<X className="w-3 h-3" />}>
              Clear
            </Button>
          </div>
        )}

        {/* Toggle Sections */}
        <div className="flex gap-2">
          <Button
            variant={showUserBuilds ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setShowUserBuilds(!showUserBuilds)}
          >
            My Builds ({userBuilds.length})
          </Button>
          <Button
            variant={showPublicBuilds ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setShowPublicBuilds(!showPublicBuilds)}
          >
            Public ({publicBuilds.length})
          </Button>
        </div>

        {/* Build Lists */}
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {/* User Builds */}
          {showUserBuilds && (
            <div>
              <h3 className="text-sm font-semibold text-cream-300 mb-2">My Builds</h3>
              {userLoading ? (
                <div className="text-sm text-cream-400">Loading...</div>
              ) : filteredUserBuilds.length === 0 ? (
                <div className="text-sm text-cream-400">
                  {searchQuery ? 'No builds found' : 'No builds yet'}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUserBuilds.map((build) => {
                    const isSelected = selectedBuildIds.includes(build.id);
                    const isDisabled = !isSelected && selectedBuildIds.length >= maxSelection;

                    return (
                      <BuildItem
                        key={build.id}
                        build={build}
                        isSelected={isSelected}
                        isDisabled={isDisabled}
                        onToggle={() => toggleBuild(build.id)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Public Builds */}
          {showPublicBuilds && (
            <div>
              <h3 className="text-sm font-semibold text-cream-300 mb-2">Public Builds</h3>
              {publicLoading ? (
                <div className="text-sm text-cream-400">Loading...</div>
              ) : filteredPublicBuilds.length === 0 ? (
                <div className="text-sm text-cream-400">
                  {searchQuery ? 'No builds found' : 'No public builds'}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPublicBuilds.map((build) => {
                    const isSelected = selectedBuildIds.includes(build.id);
                    const isDisabled = !isSelected && selectedBuildIds.length >= maxSelection;

                    return (
                      <BuildItem
                        key={build.id}
                        build={build}
                        isSelected={isSelected}
                        isDisabled={isDisabled}
                        onToggle={() => toggleBuild(build.id)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface BuildItemProps {
  build: Build;
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: () => void;
}

function BuildItem({ build, isSelected, isDisabled, onToggle }: BuildItemProps) {
  const engine = build.engine as any;

  return (
    <button
      onClick={onToggle}
      disabled={isDisabled}
      className={cn(
        'w-full text-left p-3 rounded-lg border-2 transition-all',
        isSelected
          ? 'border-orange-500 bg-orange-500/10'
          : 'border-olive-600 bg-olive-800/30 hover:border-olive-500 hover:bg-olive-800/50',
        isDisabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-cream-100 truncate">{build.name}</span>
            {isSelected && (
              <Badge variant="success" size="sm">
                <Check className="w-3 h-3" />
              </Badge>
            )}
          </div>
          {engine && (
            <p className="text-xs text-cream-400 truncate">
              {engine.brand} {engine.name} • {engine.horsepower} HP
            </p>
          )}
          <p className="text-xs font-semibold text-orange-400 mt-1">
            {formatPrice(build.total_price)}
          </p>
        </div>
      </div>
    </button>
  );
}
