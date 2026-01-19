'use client';

import React, { useState, useMemo } from 'react';
import { Plus, X, Check, ExternalLink, Zap, AlertTriangle, Info, Scale } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, getCategoryLabel, CATEGORY_GROUPS } from '@/lib/utils';
import { useBuildPerformance } from '@/hooks/use-build-performance';
import { checkCompatibility } from '@/hooks/use-compatibility';
import { useCompatibilityRules } from '@/hooks/use-compatibility';
import Link from 'next/link';
import type { Engine, Part, PartCategory } from '@/types/database';

interface BuilderTableProps {
  selectedEngine: Engine | null;
  selectedParts: Map<PartCategory, Part>;
  onSelectEngine: () => void;
  onSelectPart: (category: PartCategory) => void;
  onRemoveEngine: () => void;
  onRemovePart: (category: PartCategory) => void;
  totalPrice: number;
}

/**
 * Get key specification for a part based on its category
 */
function getKeySpec(part: Part): string | null {
  const specs = part.specifications || {};
  
  // Category-specific key specs
  const specMap: Record<string, string[]> = {
    clutch: ['bore_in', 'bore_diameter', 'bore_mm', 'engagement_rpm'],
    torque_converter: ['bore_in', 'bore_diameter', 'series', 'engagement_rpm'],
    chain: ['chain_size', 'pitch', 'pitch_in'],
    sprocket: ['teeth', 'chain_size', 'bore_in', 'bore_diameter'],
    carburetor: ['throat_diameter_mm', 'throat_diameter', 'size'],
    exhaust: ['pipe_diameter', 'diameter', 'size'],
    air_filter: ['filter_size', 'size', 'diameter'],
    piston: ['bore_mm', 'bore_in', 'displacement_cc'],
    camshaft: ['lift', 'duration', 'lobe_separation'],
    valve_spring: ['spring_rate', 'seat_pressure', 'open_pressure'],
    flywheel: ['weight_lbs', 'weight', 'size'],
    ignition: ['voltage', 'spark_plug_type', 'type'],
    connecting_rod: ['length', 'center_to_center', 'rod_length'],
    crankshaft: ['stroke', 'stroke_mm', 'stroke_in'],
    header: ['pipe_diameter', 'diameter', 'size'],
    fuel_system: ['flow_rate', 'pressure', 'size'],
    gasket: ['bore_size', 'thickness', 'size'],
  };
  
  const keys = specMap[part.category] || ['size', 'specification', 'spec'];
  
  for (const key of keys) {
    const value = specs[key];
    if (value !== undefined && value !== null && value !== '') {
      // Format the value nicely
      if (typeof value === 'number') {
        if (key.includes('mm') || key.includes('diameter_mm')) {
          return `${value}mm`;
        }
        if (key.includes('in') || key.includes('diameter') || key.includes('bore')) {
          return `${value}"`;
        }
        if (key.includes('rpm')) {
          return `${value} RPM`;
        }
        if (key.includes('teeth')) {
          return `${value} teeth`;
        }
        if (key.includes('weight')) {
          return `${value} lbs`;
        }
        return String(value);
      }
      return String(value);
    }
  }
  
  return null;
}

/**
 * Get compatibility status for a part
 */
function getCompatibilityStatus(
  part: Part,
  engine: Engine | null,
  allWarnings: Array<{ type: string; source: string; target: string; message: string }>
): 'compatible' | 'warning' | 'error' | 'unknown' {
  if (!engine) return 'unknown';
  
  // Map part categories to warning target names
  const categoryToTarget: Record<string, string[]> = {
    clutch: ['Clutch'],
    torque_converter: ['Torque Converter'],
    chain: ['Chain'],
    sprocket: ['Sprocket'],
    carburetor: ['Carburetor'],
    exhaust: ['Exhaust'],
    air_filter: ['Air Filter'],
  };
  
  // Check for warnings matching this part's category
  const targetNames = categoryToTarget[part.category] || [];
  const partWarning = allWarnings.find(w => 
    targetNames.includes(w.target) || 
    w.target === part.name || 
    w.target.includes(part.name) ||
    w.message.toLowerCase().includes(part.category.toLowerCase())
  );
  
  if (!partWarning) return 'compatible';
  
  if (partWarning.type === 'error') return 'error';
  if (partWarning.type === 'warning') return 'warning';
  return 'compatible';
}

export function BuilderTable({
  selectedEngine,
  selectedParts,
  onSelectEngine,
  onSelectPart,
  onRemoveEngine,
  onRemovePart,
  totalPrice,
}: BuilderTableProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const performance = useBuildPerformance();
  const { data: compatRules = [] } = useCompatibilityRules();
  
  // Calculate compatibility warnings
  const compatibilityWarnings = useMemo(() => {
    if (!compatRules || compatRules.length === 0 || !selectedEngine) return [];
    try {
      return checkCompatibility(selectedEngine, selectedParts, compatRules);
    } catch (error) {
      console.error('[BuilderTable] Error checking compatibility:', error);
      return [];
    }
  }, [selectedEngine, selectedParts, compatRules]);
  
  // Calculate total weight
  const totalWeight = useMemo(() => {
    let weight = selectedEngine?.weight_lbs || 0;
    try {
      selectedParts.forEach((part) => {
        const specs = part.specifications || {};
        const partWeight = specs.weight_lbs || specs.weight || 0;
        if (typeof partWeight === 'number') {
          weight += partWeight;
        }
      });
    } catch (error) {
      console.error('[BuilderTable] Error calculating weight:', error);
    }
    return weight;
  }, [selectedEngine, selectedParts]);

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  return (
    <div className="bg-olive-800 rounded-lg border border-olive-600 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-olive-700 border-b border-olive-600">
              <th className="px-4 py-3 text-left text-sm font-semibold text-cream-100">Component</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-cream-100">Selection</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-cream-100">Price</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-cream-100">Key Specs</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-cream-100">Compatibility</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-cream-100">Weight</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-cream-100">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-olive-600">
            {/* Engine Row */}
            <tr className="bg-olive-800 hover:bg-olive-700 transition-colors">
              <td className="px-4 py-3 text-cream-100 font-medium">Engine</td>
              <td className="px-4 py-3">
                {selectedEngine ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="text-cream-100 font-medium">{selectedEngine.name}</div>
                      <div className="text-sm text-cream-400">{selectedEngine.brand}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onRemoveEngine}
                      className="text-cream-400 hover:text-orange-400"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onSelectEngine}
                    icon={<Plus className="w-4 h-4" />}
                  >
                    Choose An Engine
                  </Button>
                )}
              </td>
              <td className="px-4 py-3 text-right text-cream-100">
                {selectedEngine?.price ? formatPrice(selectedEngine.price) : '—'}
              </td>
              <td className="px-4 py-3 text-left text-sm text-cream-400">
                {selectedEngine ? (
                  <div className="space-y-1">
                    <div>{selectedEngine.horsepower} HP</div>
                    <div>{selectedEngine.torque} lb-ft</div>
                    <div>{selectedEngine.displacement_cc}cc</div>
                  </div>
                ) : '—'}
              </td>
              <td className="px-4 py-3 text-center">
                {selectedEngine && (
                  <Badge variant="success" size="sm">
                    <Check className="w-3 h-3" />
                    Compatible
                  </Badge>
                )}
              </td>
              <td className="px-4 py-3 text-right text-cream-400">
                {selectedEngine?.weight_lbs ? `${selectedEngine.weight_lbs} lbs` : '—'}
              </td>
              <td className="px-4 py-3 text-center">
                {selectedEngine && (
                  <Badge variant="success" size="sm">
                    <Check className="w-3 h-3" />
                    Available
                  </Badge>
                )}
              </td>
            </tr>

            {/* Part Categories by Group */}
            {CATEGORY_GROUPS.map((group) => {
              const isExpanded = expandedGroups.has(group.id);
              const selectedCategories = group.categories.filter((cat) => selectedParts.has(cat as PartCategory));
              const hasSelected = selectedCategories.length > 0;

              // Get selected parts info for display in header
              const selectedPartsInfo = selectedCategories.map((cat) => {
                const part = selectedParts.get(cat as PartCategory);
                return {
                  category: cat as PartCategory,
                  part,
                };
              });

              return (
                <React.Fragment key={group.id}>
                  {/* Group Header Row */}
                  <tr
                    className="bg-olive-700 cursor-pointer hover:bg-olive-600 transition-colors"
                    onClick={() => toggleGroup(group.id)}
                  >
                    <td colSpan={7} className="px-4 py-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-cream-200 font-medium flex-shrink-0">{group.label}</span>
                          {hasSelected && (
                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                              {selectedPartsInfo.map(({ category, part }) => (
                                <div 
                                  key={category} 
                                  className="flex items-center gap-1 text-sm bg-olive-600 px-2 py-1 rounded"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span className="text-cream-300 font-medium truncate max-w-[200px]">
                                    {part?.name}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onRemovePart(category);
                                    }}
                                    className="text-cream-400 hover:text-orange-400 transition-colors flex-shrink-0"
                                    aria-label={`Remove ${getCategoryLabel(category)}`}
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {!hasSelected && (
                          <div className="text-sm text-cream-400 flex-shrink-0">
                            {isExpanded ? (
                              <span className="text-cream-500">Click to collapse</span>
                            ) : (
                              <span className="text-cream-500">
                                {group.categories.map((cat) => getCategoryLabel(cat as PartCategory)).join(', ')}
                              </span>
                            )}
                          </div>
                        )}
                        {hasSelected && !isExpanded && (
                          <div className="text-sm text-orange-400 flex-shrink-0">
                            {selectedCategories.length} selected
                          </div>
                        )}
                        {hasSelected && isExpanded && (
                          <div className="text-sm text-cream-500 flex-shrink-0">
                            Click to collapse
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Category Rows (only if expanded) */}
                  {isExpanded &&
                    group.categories.map((category) => {
                      const categoryTyped = category as PartCategory;
                      const selectedPart = selectedParts.get(categoryTyped);
                      const keySpec = selectedPart ? getKeySpec(selectedPart) : null;
                      const compatStatus = selectedPart && selectedEngine 
                        ? getCompatibilityStatus(selectedPart, selectedEngine, compatibilityWarnings)
                        : 'unknown';
                      
                      // Get part weight
                      const partWeight = selectedPart?.specifications 
                        ? (selectedPart.specifications.weight_lbs || selectedPart.specifications.weight || null)
                        : null;
                      
                      return (
                        <tr
                          key={category}
                          className={`bg-olive-800 hover:bg-olive-700 transition-colors ${
                            selectedPart ? 'bg-olive-700/50' : ''
                          }`}
                        >
                          <td className="px-4 py-3 pl-8 text-cream-200">
                            {getCategoryLabel(category as PartCategory)}
                          </td>
                          <td className="px-4 py-3">
                            {selectedPart ? (
                              <div className="flex items-center gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="text-cream-100 font-medium truncate">{selectedPart.name}</div>
                                  <div className="text-sm text-cream-400">{selectedPart.brand}</div>
                                  {selectedPart.slug && (
                                    <Link 
                                      href={`/parts/${selectedPart.slug}`}
                                      className="text-xs text-orange-400 hover:text-orange-300 mt-1 inline-block"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      View Details →
                                    </Link>
                                  )}
                                </div>
                                {selectedPart.affiliate_url && (
                                  <a
                                    href={selectedPart.affiliate_url}
                                    target="_blank"
                                    rel="noopener noreferrer sponsored"
                                    className="text-cream-400 hover:text-orange-400 flex-shrink-0"
                                    aria-label={`Buy ${selectedPart.name} (affiliate link)`}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onRemovePart(categoryTyped)}
                                  className="text-cream-400 hover:text-orange-400 flex-shrink-0"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => onSelectPart(categoryTyped)}
                                icon={<Plus className="w-4 h-4" />}
                              >
                                Choose {getCategoryLabel(category)}
                              </Button>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-cream-100">
                            {selectedPart?.price ? formatPrice(selectedPart.price) : '—'}
                          </td>
                          <td className="px-4 py-3 text-left text-sm text-cream-400">
                            {keySpec ? (
                              <div className="flex items-center gap-1">
                                <Info className="w-3 h-3" />
                                <span>{keySpec}</span>
                              </div>
                            ) : '—'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {selectedPart && selectedEngine ? (
                              compatStatus === 'compatible' ? (
                                <Badge variant="success" size="sm">
                                  <Check className="w-3 h-3" />
                                  Compatible
                                </Badge>
                              ) : compatStatus === 'warning' ? (
                                <Badge variant="warning" size="sm">
                                  <AlertTriangle className="w-3 h-3" />
                                  Warning
                                </Badge>
                              ) : compatStatus === 'error' ? (
                                <Badge variant="error" size="sm">
                                  <AlertTriangle className="w-3 h-3" />
                                  Issue
                                </Badge>
                              ) : (
                                <Badge variant="default" size="sm">
                                  Unknown
                                </Badge>
                              )
                            ) : selectedPart ? (
                              <span className="text-cream-500 text-xs">No engine</span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-cream-400">
                            {partWeight && typeof partWeight === 'number' ? (
                              <div className="flex items-center justify-end gap-1">
                                <Scale className="w-3 h-3" />
                                <span>{partWeight} lbs</span>
                              </div>
                            ) : '—'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {selectedPart && (
                              <Badge variant="success" size="sm">
                                <Check className="w-3 h-3" />
                                Available
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </React.Fragment>
              );
            })}

            {/* Total Row with HP Calculator */}
            <tr className="bg-olive-700 border-t-2 border-olive-500 font-semibold">
              <td colSpan={2} className="px-4 py-4 text-cream-100">
                Total
              </td>
              <td className="px-4 py-4 text-right text-orange-400 text-lg">
                {formatPrice(totalPrice)}
              </td>
              <td className="px-4 py-4"></td>
              <td className="px-4 py-4"></td>
              <td className="px-4 py-4 text-right text-cream-300">
                {totalWeight > 0 ? (
                  <div className="flex items-center justify-end gap-1">
                    <Scale className="w-4 h-4" />
                    <span>{totalWeight.toFixed(1)} lbs</span>
                  </div>
                ) : '—'}
              </td>
              {/* Vertical HP Calculator */}
              <td className="px-4 py-4">
                {selectedEngine && (
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange-400" />
                      <span className="text-sm font-medium text-cream-400 uppercase">Total HP</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-400">
                      {performance.hp.toFixed(performance.hp % 1 === 0 ? 0 : 1)} hp
                    </div>
                    <div className="text-xs text-cream-500 mt-1">
                      {performance.topSpeed.toFixed(0)} mph top speed
                    </div>
                  </div>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
