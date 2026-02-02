'use client';

import React, { useState, useMemo } from 'react';
import { Plus, X, Check, ExternalLink, Zap, AlertTriangle, Info, Scale, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, getCategoryLabel, getOrderedCategoryGroupsForBuilder, GAS_ONLY_CATEGORIES, ELECTRIC_ONLY_CATEGORIES, cn } from '@/lib/utils';
import { useBuildPerformance } from '@/hooks/use-build-performance';
import { checkCompatibility } from '@/hooks/use-compatibility';
import { useCompatibilityRules } from '@/hooks/use-compatibility';
import Link from 'next/link';
import type { Engine, ElectricMotor, Part, PartCategory, PowerSourceType } from '@/types/database';

interface BuilderTableProps {
  selectedEngine: Engine | null;
  selectedMotor: ElectricMotor | null;
  selectedParts: Map<PartCategory, Part[]>; // Changed to support multiple parts per category
  onSelectEngine: () => void;
  onSelectMotor?: () => void;
  onSelectPart: (category: PartCategory) => void;
  onRemoveEngine: () => void;
  onRemoveMotor?: () => void;
  onRemovePart: (category: PartCategory, partId: string) => void; // Now requires partId
  totalPrice: number;
  powerSourceType?: PowerSourceType;
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
  selectedMotor,
  selectedParts,
  onSelectEngine,
  onSelectMotor,
  onSelectPart,
  onRemoveEngine,
  onRemoveMotor,
  onRemovePart,
  totalPrice,
  powerSourceType = 'gas',
}: BuilderTableProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const performance = useBuildPerformance();
  const { data: compatRules = [] } = useCompatibilityRules();
  
  // Calculate compatibility warnings
  const compatibilityWarnings = useMemo(() => {
    if (!compatRules || compatRules.length === 0) return [];
    // For now, only check compatibility for gas engines
    // EV compatibility will be handled separately
    if (!selectedEngine) return [];
    try {
      return checkCompatibility(selectedEngine, selectedParts, compatRules);
    } catch (error) {
      console.error('[BuilderTable] Error checking compatibility:', error);
      return [];
    }
  }, [selectedEngine, selectedParts, compatRules]);
  
  // Calculate total weight
  const totalWeight = useMemo(() => {
    let weight = selectedEngine?.weight_lbs || selectedMotor?.weight_lbs || 0;
    try {
      selectedParts.forEach((partsArray) => {
        partsArray.forEach((part) => {
          const specs = part.specifications || {};
          const partWeight = specs.weight_lbs || specs.weight || 0;
          if (typeof partWeight === 'number') {
            weight += partWeight;
          }
        });
      });
    } catch (error) {
      console.error('[BuilderTable] Error calculating weight:', error);
    }
    return weight;
  }, [selectedEngine, selectedMotor, selectedParts]);

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
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
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
            {/* Engine Row (Gas builds) */}
            {selectedEngine && (
              <tr className="bg-olive-800 hover:bg-olive-700 transition-colors">
                <td className="px-4 py-3 text-cream-100 font-medium">Engine</td>
                <td className="px-4 py-3">
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
                </td>
                <td className="px-4 py-3 text-right text-cream-100">
                  {selectedEngine?.price ? formatPrice(selectedEngine.price) : '—'}
                </td>
                <td className="px-4 py-3 text-left text-sm text-cream-400">
                  <div className="space-y-1">
                    <div>{selectedEngine.horsepower} HP</div>
                    <div>{selectedEngine.torque} lb-ft</div>
                    <div>{selectedEngine.displacement_cc}cc</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant="success" size="sm">
                    <Check className="w-3 h-3" />
                    Compatible
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right text-cream-400">
                  {selectedEngine?.weight_lbs ? `${selectedEngine.weight_lbs} lbs` : '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant="success" size="sm">
                    <Check className="w-3 h-3" />
                    Available
                  </Badge>
                </td>
              </tr>
            )}
            
            {/* Motor Row (Electric builds) */}
            {selectedMotor && (
              <tr className="bg-olive-800 hover:bg-olive-700 transition-colors">
                <td className="px-4 py-3 text-cream-100 font-medium">Motor</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="text-cream-100 font-medium">{selectedMotor.name}</div>
                      <div className="text-sm text-cream-400">{selectedMotor.brand}</div>
                    </div>
                    {onRemoveMotor && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onRemoveMotor}
                        className="text-cream-400 hover:text-orange-400"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-cream-100">
                  {selectedMotor?.price ? formatPrice(selectedMotor.price) : '—'}
                </td>
                <td className="px-4 py-3 text-left text-sm text-cream-400">
                  <div className="space-y-1">
                    <div>{selectedMotor.horsepower} HP</div>
                    <div>{selectedMotor.power_kw} kW</div>
                    <div>{selectedMotor.voltage}V</div>
                    <div>{selectedMotor.torque_lbft} lb-ft</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant="success" size="sm">
                    <Check className="w-3 h-3" />
                    Selected
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right text-cream-400">
                  {selectedMotor?.weight_lbs ? `${selectedMotor.weight_lbs} lbs` : '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant="success" size="sm">
                    <Check className="w-3 h-3" />
                    Available
                  </Badge>
                </td>
              </tr>
            )}
            
            {/* Power Source Selection Row (when neither is selected) */}
            {!selectedEngine && !selectedMotor && (
              <tr className="bg-olive-800 hover:bg-olive-700 transition-colors">
                <td className="px-4 py-3 text-cream-100 font-medium">
                  {powerSourceType === 'electric' ? 'Motor' : 'Engine'}
                </td>
                <td className="px-4 py-3" colSpan={6}>
                  {powerSourceType === 'electric' && onSelectMotor ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={onSelectMotor}
                      icon={<Plus className="w-4 h-4" />}
                    >
                      Choose A Motor
                    </Button>
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
              </tr>
            )}

            {/* Part Categories by Group — EV System under Motor for electric builds */}
            {getOrderedCategoryGroupsForBuilder(powerSourceType ?? 'gas').map((group) => {
              // Filter categories based on power source
              const compatibleCategories = group.categories.filter((cat) => {
                const category = cat as PartCategory;
                if (powerSourceType === 'electric') {
                  return !GAS_ONLY_CATEGORIES.includes(category);
                } else {
                  return !ELECTRIC_ONLY_CATEGORIES.includes(category);
                }
              });
              
              // Skip this group if no compatible categories
              if (compatibleCategories.length === 0) return null;
              
              const isExpanded = expandedGroups.has(group.id);
              // Include tire_front and tire_rear when checking for selected categories if tire is in the group
              const tireCategories = compatibleCategories.includes('tire') 
                ? ['tire_front', 'tire_rear'] as PartCategory[]
                : [];
              const selectedCategories = compatibleCategories
                .filter((cat) => cat !== 'tire') // Exclude 'tire' from regular check
                .filter((cat) => {
                  const parts = selectedParts.get(cat as PartCategory);
                  return parts && parts.length > 0;
                })
                .concat(tireCategories.filter((cat) => {
                  const parts = selectedParts.get(cat as PartCategory);
                  return parts && parts.length > 0;
                }));
              const hasSelected = selectedCategories.length > 0;

              // Get selected parts info for display in header
              const selectedPartsInfo = selectedCategories.map((cat) => {
                const parts = selectedParts.get(cat as PartCategory) || [];
                return {
                  category: cat as PartCategory,
                  parts,
                  count: parts.length,
                };
              });

              return (
                <React.Fragment key={group.id}>
                  {/* Group Header Row */}
                  <tr
                    className="bg-olive-700 cursor-pointer hover:bg-olive-600 transition-colors group"
                    onClick={() => toggleGroup(group.id)}
                  >
                    <td colSpan={7} className="px-4 py-3">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Chevron Icon - Always visible to indicate expandability */}
                          <div className={cn(
                            "flex-shrink-0 transition-transform duration-200",
                            isExpanded && "rotate-180"
                          )}>
                            <ChevronDown className="w-5 h-5 text-cream-400 group-hover:text-orange-400" />
                          </div>
                          
                          <span className="text-cream-200 font-medium flex-shrink-0">{group.label}</span>
                          
                          {hasSelected && (
                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                              {selectedPartsInfo.map(({ category, parts, count }) => (
                                <div 
                                  key={category} 
                                  className="flex items-center gap-1 text-sm bg-olive-600 px-2 py-1 rounded"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span className="text-cream-300 font-medium">
                                    {count > 1 ? `${count} ${getCategoryLabel(category)}s` : parts[0]?.name || getCategoryLabel(category)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {!hasSelected && !isExpanded && (
                            <span className="text-sm text-cream-500/70 italic">
                              Click to add parts
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {!hasSelected && !isExpanded && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleGroup(group.id);
                              }}
                              icon={<Plus className="w-4 h-4" />}
                              className="whitespace-nowrap"
                            >
                              Add Parts
                            </Button>
                          )}
                          
                          {!hasSelected && isExpanded && (
                            <span className="text-sm text-cream-500">Click to collapse</span>
                          )}
                          
                          {hasSelected && !isExpanded && (
                            <div className="flex items-center gap-2">
                              <Badge variant="success" size="sm">
                                {selectedCategories.length} selected
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleGroup(group.id);
                                }}
                                icon={<ChevronDown className="w-4 h-4" />}
                              >
                                View
                              </Button>
                            </div>
                          )}
                          
                          {hasSelected && isExpanded && (
                            <span className="text-sm text-cream-500">Click to collapse</span>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Category Rows (only if expanded) */}
                  {isExpanded &&
                    compatibleCategories
                      .filter((cat) => cat !== 'tire') // Filter out 'tire' - we'll handle it separately
                      .map((category) => {
                        const categoryTyped = category as PartCategory;
                        const selectedPartsArray = selectedParts.get(categoryTyped) || [];
                        const hasParts = selectedPartsArray.length > 0;
                        
                        return (
                          <React.Fragment key={category}>
                            {/* Category Header Row (shows category name and add button) */}
                            <tr className="bg-olive-800/50 hover:bg-olive-800/70 transition-colors">
                              <td className="px-4 py-3 pl-8 text-cream-200 font-medium" colSpan={2}>
                                <div className="flex items-center justify-between">
                                  <span>{getCategoryLabel(category as PartCategory)}</span>
                                  {hasParts && (
                                    <Badge variant="default" size="sm" className="text-xs">
                                      {selectedPartsArray.length} {selectedPartsArray.length === 1 ? 'part' : 'parts'}
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td colSpan={5} className="px-4 py-3">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => onSelectPart(categoryTyped)}
                                  icon={<Plus className="w-4 h-4" />}
                                >
                                  {hasParts ? 'Add Another' : `Add ${getCategoryLabel(category)}`}
                                </Button>
                              </td>
                            </tr>
                            
                            {/* Individual Parts Rows */}
                            {selectedPartsArray.map((selectedPart) => {
                              const keySpec = getKeySpec(selectedPart);
                              const compatStatus = selectedPart && selectedEngine 
                                ? getCompatibilityStatus(selectedPart, selectedEngine, compatibilityWarnings)
                                : selectedPart && selectedMotor
                                ? 'compatible' // EV compatibility will be handled separately
                                : 'unknown';
                              
                              // Get part weight
                              const partWeight = selectedPart?.specifications 
                                ? (selectedPart.specifications.weight_lbs || selectedPart.specifications.weight || null)
                                : null;
                              
                              return (
                                <tr
                                  key={`${category}-${selectedPart.id}`}
                                  className="bg-olive-800 hover:bg-olive-700 transition-colors"
                                >
                                  <td className="px-4 py-3 pl-12 text-cream-300 text-sm">
                                    <div className="w-1 h-1 rounded-full bg-cream-500/50" />
                                  </td>
                                  <td className="px-4 py-3">
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
                                        onClick={() => onRemovePart(categoryTyped, selectedPart.id)}
                                        className="text-cream-400 hover:text-orange-400 flex-shrink-0"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
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
                  
                  {/* Special handling for tire sub-categories */}
                  {isExpanded && compatibleCategories.includes('tire') && (
                    <>
                      {/* Front Tire */}
                      {(() => {
                        const categoryTyped = 'tire_front' as PartCategory;
                        const selectedPartsArray = selectedParts.get(categoryTyped) || [];
                        const hasParts = selectedPartsArray.length > 0;
                        
                        return (
                          <React.Fragment>
                            {/* Category Header Row */}
                            <tr className="bg-olive-800/50 hover:bg-olive-800/70 transition-colors">
                              <td className="px-4 py-3 pl-8 text-cream-200 font-medium" colSpan={2}>
                                <div className="flex items-center justify-between">
                                  <span>{getCategoryLabel('tire_front')}</span>
                                  {hasParts && (
                                    <Badge variant="default" size="sm" className="text-xs">
                                      {selectedPartsArray.length} {selectedPartsArray.length === 1 ? 'part' : 'parts'}
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td colSpan={5} className="px-4 py-3">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => onSelectPart(categoryTyped)}
                                  icon={<Plus className="w-4 h-4" />}
                                >
                                  {hasParts ? 'Add Another' : `Add ${getCategoryLabel('tire_front')}`}
                                </Button>
                              </td>
                            </tr>
                            
                            {/* Individual Parts Rows */}
                            {selectedPartsArray.map((selectedPart) => {
                              const keySpec = getKeySpec(selectedPart);
                              const compatStatus = selectedPart && selectedEngine 
                                ? getCompatibilityStatus(selectedPart, selectedEngine, compatibilityWarnings)
                                : selectedPart && selectedMotor
                                ? 'compatible'
                                : 'unknown';
                              const partWeight = selectedPart?.specifications 
                                ? (selectedPart.specifications.weight_lbs || selectedPart.specifications.weight || null)
                                : null;
                              
                              return (
                                <tr
                                  key={`tire_front-${selectedPart.id}`}
                                  className="bg-olive-800 hover:bg-olive-700 transition-colors"
                                >
                                  <td className="px-4 py-3 pl-12 text-cream-300 text-sm">
                                    <div className="w-1 h-1 rounded-full bg-cream-500/50" />
                                  </td>
                                  <td className="px-4 py-3">
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
                                        onClick={() => onRemovePart(categoryTyped, selectedPart.id)}
                                        className="text-cream-400 hover:text-orange-400 flex-shrink-0"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
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
                      })()}
                      
                      {/* Rear Tire */}
                      {(() => {
                        const categoryTyped = 'tire_rear' as PartCategory;
                        const selectedPartsArray = selectedParts.get(categoryTyped) || [];
                        const hasParts = selectedPartsArray.length > 0;
                        
                        return (
                          <React.Fragment>
                            {/* Category Header Row */}
                            <tr className="bg-olive-800/50 hover:bg-olive-800/70 transition-colors">
                              <td className="px-4 py-3 pl-8 text-cream-200 font-medium" colSpan={2}>
                                <div className="flex items-center justify-between">
                                  <span>{getCategoryLabel('tire_rear')}</span>
                                  {hasParts && (
                                    <Badge variant="default" size="sm" className="text-xs">
                                      {selectedPartsArray.length} {selectedPartsArray.length === 1 ? 'part' : 'parts'}
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td colSpan={5} className="px-4 py-3">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => onSelectPart(categoryTyped)}
                                  icon={<Plus className="w-4 h-4" />}
                                >
                                  {hasParts ? 'Add Another' : `Add ${getCategoryLabel('tire_rear')}`}
                                </Button>
                              </td>
                            </tr>
                            
                            {/* Individual Parts Rows */}
                            {selectedPartsArray.map((selectedPart) => {
                              const keySpec = getKeySpec(selectedPart);
                              const compatStatus = selectedPart && selectedEngine 
                                ? getCompatibilityStatus(selectedPart, selectedEngine, compatibilityWarnings)
                                : selectedPart && selectedMotor
                                ? 'compatible'
                                : 'unknown';
                              const partWeight = selectedPart?.specifications 
                                ? (selectedPart.specifications.weight_lbs || selectedPart.specifications.weight || null)
                                : null;
                              
                              return (
                                <tr
                                  key={`tire_rear-${selectedPart.id}`}
                                  className="bg-olive-800 hover:bg-olive-700 transition-colors"
                                >
                                  <td className="px-4 py-3 pl-12 text-cream-300 text-sm">
                                    <div className="w-1 h-1 rounded-full bg-cream-500/50" />
                                  </td>
                                  <td className="px-4 py-3">
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
                                        onClick={() => onRemovePart(categoryTyped, selectedPart.id)}
                                        className="text-cream-400 hover:text-orange-400 flex-shrink-0"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
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
                      })()}
                    </>
                  )}
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
                  </div>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3 p-4 sm:p-6">
        {/* Engine Card (Gas builds) */}
        {selectedEngine && (
          <div className="bg-olive-700 rounded-lg border border-olive-600 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-semibold text-cream-100">Engine</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemoveEngine}
                className="text-cream-400 hover:text-orange-400 min-h-[44px] min-w-[44px] touch-manipulation"
                aria-label="Remove engine"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-lg sm:text-xl font-bold text-cream-100 mb-1">{selectedEngine.name}</div>
                <div className="text-sm sm:text-base text-cream-400">{selectedEngine.brand}</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-cream-400">Price</div>
                  <div className="text-lg font-bold text-orange-400">
                    {selectedEngine.price ? formatPrice(selectedEngine.price) : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-cream-400">HP</div>
                  <div className="text-lg font-bold text-cream-100">{selectedEngine.horsepower} HP</div>
                </div>
                <div>
                  <div className="text-cream-400">Torque</div>
                  <div className="text-lg font-bold text-cream-100">{selectedEngine.torque} lb-ft</div>
                </div>
                <div>
                  <div className="text-cream-400">Displacement</div>
                  <div className="text-lg font-bold text-cream-100">{selectedEngine.displacement_cc}cc</div>
                </div>
              </div>
              <div className="pt-2 border-t border-olive-600">
                <Badge variant="success" size="sm" className="text-xs sm:text-sm">
                  <Check className="w-4 h-4" />
                  Compatible
                </Badge>
              </div>
            </div>
          </div>
        )}
        
        {/* Motor Card (Electric builds) */}
        {selectedMotor && (
          <div className="bg-olive-700 rounded-lg border border-olive-600 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-semibold text-cream-100">Motor</h3>
              {onRemoveMotor && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRemoveMotor}
                  className="text-cream-400 hover:text-orange-400 min-h-[44px] min-w-[44px] touch-manipulation"
                  aria-label="Remove motor"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-lg sm:text-xl font-bold text-cream-100 mb-1">{selectedMotor.name}</div>
                <div className="text-sm sm:text-base text-cream-400">{selectedMotor.brand}</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-cream-400">Price</div>
                  <div className="text-lg font-bold text-orange-400">
                    {selectedMotor.price ? formatPrice(selectedMotor.price) : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-cream-400">HP</div>
                  <div className="text-lg font-bold text-cream-100">{selectedMotor.horsepower} HP</div>
                </div>
                <div>
                  <div className="text-cream-400">Power</div>
                  <div className="text-lg font-bold text-cream-100">{selectedMotor.power_kw} kW</div>
                </div>
                <div>
                  <div className="text-cream-400">Voltage</div>
                  <div className="text-lg font-bold text-cream-100">{selectedMotor.voltage}V</div>
                </div>
                <div>
                  <div className="text-cream-400">Torque</div>
                  <div className="text-lg font-bold text-cream-100">{selectedMotor.torque_lbft} lb-ft</div>
                </div>
              </div>
              <div className="pt-2 border-t border-olive-600">
                <Badge variant="success" size="sm" className="text-xs sm:text-sm">
                  <Check className="w-4 h-4" />
                  Selected
                </Badge>
              </div>
            </div>
          </div>
        )}
        
        {/* Power Source Selection (when neither is selected) */}
        {!selectedEngine && !selectedMotor && (
          <div className="bg-olive-700 rounded-lg border border-olive-600 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-semibold text-cream-100">
                {powerSourceType === 'electric' ? 'Motor' : 'Engine'}
              </h3>
            </div>
            {powerSourceType === 'electric' && onSelectMotor ? (
              <Button
                variant="primary"
                size="sm"
                onClick={onSelectMotor}
                icon={<Plus className="w-5 h-5" />}
                className="w-full min-h-[52px] text-base touch-manipulation"
              >
                Choose A Motor
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={onSelectEngine}
                icon={<Plus className="w-5 h-5" />}
                className="w-full min-h-[52px] text-base touch-manipulation"
              >
                Choose An Engine
              </Button>
            )}
          </div>
        )}

        {/* Part Categories by Group — EV System under Motor for electric builds */}
        {getOrderedCategoryGroupsForBuilder(powerSourceType ?? 'gas').map((group) => {
          // Filter categories based on power source
          const compatibleCategories = group.categories.filter((cat) => {
            const category = cat as PartCategory;
            if (powerSourceType === 'electric') {
              return !GAS_ONLY_CATEGORIES.includes(category);
            } else {
              return !ELECTRIC_ONLY_CATEGORIES.includes(category);
            }
          });
          
          // Skip this group if no compatible categories
          if (compatibleCategories.length === 0) return null;
          
          const isExpanded = expandedGroups.has(group.id);
          // Include tire_front and tire_rear when checking for selected categories if tire is in the group
          const tireCategories = compatibleCategories.includes('tire') 
            ? ['tire_front', 'tire_rear'] as PartCategory[]
            : [];
          const selectedCategories = compatibleCategories
            .filter((cat) => cat !== 'tire') // Exclude 'tire' from regular check
            .filter((cat) => {
              const parts = selectedParts.get(cat as PartCategory);
              return parts && parts.length > 0;
            })
            .concat(tireCategories.filter((cat) => {
              const parts = selectedParts.get(cat as PartCategory);
              return parts && parts.length > 0;
            }));
          const hasSelected = selectedCategories.length > 0;

          return (
            <div key={group.id} className="bg-olive-700 rounded-lg border border-olive-600 overflow-hidden">
              {/* Group Header */}
              <div className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-olive-600 transition-colors min-h-[60px] group">
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left touch-manipulation"
                >
                  {/* Chevron Icon - Always visible */}
                  <div className={cn(
                    "flex-shrink-0 transition-transform duration-200",
                    isExpanded && "rotate-180"
                  )}>
                    <ChevronDown className="w-5 h-5 text-cream-400 group-hover:text-orange-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-base sm:text-lg font-semibold text-cream-100 mb-1">{group.label}</div>
                    {hasSelected && !isExpanded && (
                      <div className="flex items-center gap-2">
                        <Badge variant="success" size="sm" className="text-xs">
                          {selectedCategories.length} selected
                        </Badge>
                        <span className="text-xs text-cream-500">Tap to view</span>
                      </div>
                    )}
                    {!hasSelected && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-cream-400">
                          {compatibleCategories
                            .filter((cat) => cat !== 'tire') // Filter out 'tire' - we show front/rear separately
                            .concat(compatibleCategories.includes('tire') ? ['tire_front', 'tire_rear'] : [])
                            .map((cat) => getCategoryLabel(cat as PartCategory))
                            .join(', ')}
                        </span>
                        <span className="text-xs text-orange-400 italic">Tap to add parts</span>
                      </div>
                    )}
                    {isExpanded && (
                      <span className="text-xs text-cream-500">Tap to collapse</span>
                    )}
                  </div>
                </button>
                
                {!hasSelected && !isExpanded && (
                  <div className="flex-shrink-0 ml-3">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => toggleGroup(group.id)}
                      icon={<Plus className="w-4 h-4" />}
                      className="whitespace-nowrap"
                    >
                      Add
                    </Button>
                  </div>
                )}
              </div>

              {/* Selected Parts Summary (when collapsed) */}
              {hasSelected && !isExpanded && (
                <div className="px-4 sm:px-5 pb-4 space-y-2">
                  {selectedCategories.map((category) => {
                    const parts = selectedParts.get(category as PartCategory) || [];
                    if (parts.length === 0) return null;
                    
                    const totalPrice = parts.reduce((sum, p) => sum + (p.price || 0), 0);
                    
                    return (
                      <div
                        key={category}
                        className="flex items-center justify-between bg-olive-800 rounded p-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-cream-100">
                            {parts.length === 1 
                              ? parts[0].name 
                              : `${parts.length} ${getCategoryLabel(category as PartCategory)}s`}
                          </div>
                          <div className="text-xs text-cream-400">{getCategoryLabel(category as PartCategory)}</div>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <div className="text-sm font-bold text-orange-400">
                            {totalPrice > 0 ? formatPrice(totalPrice) : '—'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Expanded Category List */}
              {isExpanded && (
                <div className="border-t border-olive-600 divide-y divide-olive-600">
                  {compatibleCategories
                    .filter((cat) => cat !== 'tire') // Filter out 'tire' - we'll handle it separately
                    .map((category) => {
                    const categoryTyped = category as PartCategory;
                    const selectedPartsArray = selectedParts.get(categoryTyped) || [];
                    const hasParts = selectedPartsArray.length > 0;

                    return (
                      <div
                        key={category}
                        className={`p-4 sm:p-5 ${hasParts ? 'bg-olive-800/50' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm sm:text-base font-semibold text-cream-200">
                              {getCategoryLabel(categoryTyped)}
                            </h4>
                            {hasParts && (
                              <Badge variant="default" size="sm" className="text-xs">
                                {selectedPartsArray.length} {selectedPartsArray.length === 1 ? 'part' : 'parts'}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Add Button */}
                        <div className="mb-3">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onSelectPart(categoryTyped)}
                            icon={<Plus className="w-5 h-5" />}
                            className="w-full min-h-[52px] text-base touch-manipulation"
                          >
                            {hasParts ? 'Add Another' : `Add ${getCategoryLabel(categoryTyped)}`}
                          </Button>
                        </div>

                        {/* List of Selected Parts */}
                        {selectedPartsArray.length > 0 && (
                          <div className="space-y-3">
                            {selectedPartsArray.map((selectedPart) => {
                              const keySpec = getKeySpec(selectedPart);
                              const compatStatus = selectedPart && selectedEngine 
                                ? getCompatibilityStatus(selectedPart, selectedEngine, compatibilityWarnings)
                                : 'unknown';

                              return (
                                <div
                                  key={selectedPart.id}
                                  className="bg-olive-900/50 rounded-lg p-3 border border-olive-700/50"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div>
                                      <div className="text-base font-bold text-cream-100 mb-1">
                                        {selectedPart.name}
                                      </div>
                                      <div className="text-sm text-cream-400">{selectedPart.brand}</div>
                                    </div>
                                    {selectedPart && selectedEngine && (
                                      <div className="flex items-center gap-2">
                                        {compatStatus === 'compatible' && (
                                          <Badge variant="success" size="sm" className="text-xs">
                                            <Check className="w-3 h-3" />
                                          </Badge>
                                        )}
                                        {compatStatus === 'warning' && (
                                          <Badge variant="warning" size="sm" className="text-xs">
                                            <AlertTriangle className="w-3 h-3" />
                                          </Badge>
                                        )}
                                        {compatStatus === 'error' && (
                                          <Badge variant="error" size="sm" className="text-xs">
                                            <AlertTriangle className="w-3 h-3" />
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                    <div>
                                      <div className="text-cream-400">Price</div>
                                      <div className="text-lg font-bold text-orange-400">
                                        {selectedPart.price ? formatPrice(selectedPart.price) : '—'}
                                      </div>
                                    </div>
                                    {keySpec && (
                                      <div>
                                        <div className="text-cream-400">Key Spec</div>
                                        <div className="text-lg font-bold text-cream-100">{keySpec}</div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 pt-2 border-t border-olive-600">
                                    {selectedPart.slug && (
                                      <Link
                                        href={`/parts/${selectedPart.slug}`}
                                        className="text-sm text-orange-400 hover:text-orange-300 flex-1"
                                      >
                                        View Details →
                                      </Link>
                                    )}
                                    {selectedPart.affiliate_url && (
                                      <a
                                        href={selectedPart.affiliate_url}
                                        target="_blank"
                                        rel="noopener noreferrer sponsored"
                                        className="p-2 text-cream-400 hover:text-orange-400 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                                        aria-label={`Buy ${selectedPart.name}`}
                                      >
                                        <ExternalLink className="w-5 h-5" />
                                      </a>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => onRemovePart(categoryTyped, selectedPart.id)}
                                      className="text-cream-400 hover:text-orange-400 min-h-[44px] min-w-[44px] touch-manipulation"
                                      aria-label={`Remove ${selectedPart.name}`}
                                    >
                                      <X className="w-5 h-5" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Special handling for tire sub-categories */}
                  {compatibleCategories.includes('tire') && (
                    <>
                      {/* Front Tire */}
                      {(() => {
                        const categoryTyped = 'tire_front' as PartCategory;
                        const selectedPartsArray = selectedParts.get(categoryTyped) || [];
                        const hasParts = selectedPartsArray.length > 0;
                        
                        return (
                          <div className={`p-4 sm:p-5 ${hasParts ? 'bg-olive-800/50' : ''}`}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm sm:text-base font-semibold text-cream-200">
                                  {getCategoryLabel('tire_front')}
                                </h4>
                                {hasParts && (
                                  <Badge variant="default" size="sm" className="text-xs">
                                    {selectedPartsArray.length} {selectedPartsArray.length === 1 ? 'part' : 'parts'}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Add Button */}
                            <div className="mb-3">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => onSelectPart(categoryTyped)}
                                icon={<Plus className="w-5 h-5" />}
                                className="w-full min-h-[52px] text-base touch-manipulation"
                              >
                                {hasParts ? 'Add Another' : `Add ${getCategoryLabel('tire_front')}`}
                              </Button>
                            </div>

                            {/* List of Selected Parts */}
                            {selectedPartsArray.length > 0 && (
                              <div className="space-y-3">
                                {selectedPartsArray.map((selectedPart) => {
                                  const keySpec = getKeySpec(selectedPart);
                                  const compatStatus = selectedPart && selectedEngine 
                                    ? getCompatibilityStatus(selectedPart, selectedEngine, compatibilityWarnings)
                                    : 'unknown';

                                  return (
                                    <div
                                      key={selectedPart.id}
                                      className="bg-olive-900/50 rounded-lg p-3 border border-olive-700/50"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div>
                                          <div className="text-base font-bold text-cream-100 mb-1">
                                            {selectedPart.name}
                                          </div>
                                          <div className="text-sm text-cream-400">{selectedPart.brand}</div>
                                        </div>
                                        {selectedPart && selectedEngine && (
                                          <div className="flex items-center gap-2">
                                            {compatStatus === 'compatible' && (
                                              <Badge variant="success" size="sm" className="text-xs">
                                                <Check className="w-3 h-3" />
                                              </Badge>
                                            )}
                                            {compatStatus === 'warning' && (
                                              <Badge variant="warning" size="sm" className="text-xs">
                                                <AlertTriangle className="w-3 h-3" />
                                              </Badge>
                                            )}
                                            {compatStatus === 'error' && (
                                              <Badge variant="error" size="sm" className="text-xs">
                                                <AlertTriangle className="w-3 h-3" />
                                              </Badge>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                        <div>
                                          <div className="text-cream-400">Price</div>
                                          <div className="text-lg font-bold text-orange-400">
                                            {selectedPart.price ? formatPrice(selectedPart.price) : '—'}
                                          </div>
                                        </div>
                                        {keySpec && (
                                          <div>
                                            <div className="text-cream-400">Key Spec</div>
                                            <div className="text-lg font-bold text-cream-100">{keySpec}</div>
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 pt-2 border-t border-olive-600">
                                        {selectedPart.slug && (
                                          <Link
                                            href={`/parts/${selectedPart.slug}`}
                                            className="text-sm text-orange-400 hover:text-orange-300 flex-1"
                                          >
                                            View Details →
                                          </Link>
                                        )}
                                        {selectedPart.affiliate_url && (
                                          <a
                                            href={selectedPart.affiliate_url}
                                            target="_blank"
                                            rel="noopener noreferrer sponsored"
                                            className="p-2 text-cream-400 hover:text-orange-400 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                                            aria-label={`Buy ${selectedPart.name}`}
                                          >
                                            <ExternalLink className="w-5 h-5" />
                                          </a>
                                        )}
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => onRemovePart(categoryTyped, selectedPart.id)}
                                          className="text-cream-400 hover:text-orange-400 min-h-[44px] min-w-[44px] touch-manipulation"
                                          aria-label={`Remove ${selectedPart.name}`}
                                        >
                                          <X className="w-5 h-5" />
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                      
                      {/* Rear Tire */}
                      {(() => {
                        const categoryTyped = 'tire_rear' as PartCategory;
                        const selectedPartsArray = selectedParts.get(categoryTyped) || [];
                        const hasParts = selectedPartsArray.length > 0;
                        
                        return (
                          <div className={`p-4 sm:p-5 ${hasParts ? 'bg-olive-800/50' : ''}`}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm sm:text-base font-semibold text-cream-200">
                                  {getCategoryLabel('tire_rear')}
                                </h4>
                                {hasParts && (
                                  <Badge variant="default" size="sm" className="text-xs">
                                    {selectedPartsArray.length} {selectedPartsArray.length === 1 ? 'part' : 'parts'}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Add Button */}
                            <div className="mb-3">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => onSelectPart(categoryTyped)}
                                icon={<Plus className="w-5 h-5" />}
                                className="w-full min-h-[52px] text-base touch-manipulation"
                              >
                                {hasParts ? 'Add Another' : `Add ${getCategoryLabel('tire_rear')}`}
                              </Button>
                            </div>

                            {/* List of Selected Parts */}
                            {selectedPartsArray.length > 0 && (
                              <div className="space-y-3">
                                {selectedPartsArray.map((selectedPart) => {
                                  const keySpec = getKeySpec(selectedPart);
                                  const compatStatus = selectedPart && selectedEngine 
                                    ? getCompatibilityStatus(selectedPart, selectedEngine, compatibilityWarnings)
                                    : 'unknown';

                                  return (
                                    <div
                                      key={selectedPart.id}
                                      className="bg-olive-900/50 rounded-lg p-3 border border-olive-700/50"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div>
                                          <div className="text-base font-bold text-cream-100 mb-1">
                                            {selectedPart.name}
                                          </div>
                                          <div className="text-sm text-cream-400">{selectedPart.brand}</div>
                                        </div>
                                        {selectedPart && selectedEngine && (
                                          <div className="flex items-center gap-2">
                                            {compatStatus === 'compatible' && (
                                              <Badge variant="success" size="sm" className="text-xs">
                                                <Check className="w-3 h-3" />
                                              </Badge>
                                            )}
                                            {compatStatus === 'warning' && (
                                              <Badge variant="warning" size="sm" className="text-xs">
                                                <AlertTriangle className="w-3 h-3" />
                                              </Badge>
                                            )}
                                            {compatStatus === 'error' && (
                                              <Badge variant="error" size="sm" className="text-xs">
                                                <AlertTriangle className="w-3 h-3" />
                                              </Badge>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                        <div>
                                          <div className="text-cream-400">Price</div>
                                          <div className="text-lg font-bold text-orange-400">
                                            {selectedPart.price ? formatPrice(selectedPart.price) : '—'}
                                          </div>
                                        </div>
                                        {keySpec && (
                                          <div>
                                            <div className="text-cream-400">Key Spec</div>
                                            <div className="text-lg font-bold text-cream-100">{keySpec}</div>
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 pt-2 border-t border-olive-600">
                                        {selectedPart.slug && (
                                          <Link
                                            href={`/parts/${selectedPart.slug}`}
                                            className="text-sm text-orange-400 hover:text-orange-300 flex-1"
                                          >
                                            View Details →
                                          </Link>
                                        )}
                                        {selectedPart.affiliate_url && (
                                          <a
                                            href={selectedPart.affiliate_url}
                                            target="_blank"
                                            rel="noopener noreferrer sponsored"
                                            className="p-2 text-cream-400 hover:text-orange-400 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                                            aria-label={`Buy ${selectedPart.name}`}
                                          >
                                            <ExternalLink className="w-5 h-5" />
                                          </a>
                                        )}
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => onRemovePart(categoryTyped, selectedPart.id)}
                                          className="text-cream-400 hover:text-orange-400 min-h-[44px] min-w-[44px] touch-manipulation"
                                          aria-label={`Remove ${selectedPart.name}`}
                                        >
                                          <X className="w-5 h-5" />
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Total Summary Card */}
        <div className="bg-olive-700 rounded-lg border-2 border-orange-500 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-cream-100">Total</h3>
            <div className="text-2xl sm:text-3xl font-bold text-orange-400">
              {formatPrice(totalPrice)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-olive-600">
            {totalWeight > 0 && (
              <div>
                <div className="text-sm text-cream-400 mb-1">Total Weight</div>
                <div className="flex items-center gap-1 text-lg font-bold text-cream-100">
                  <Scale className="w-4 h-4" />
                  {totalWeight.toFixed(1)} lbs
                </div>
              </div>
            )}
            {selectedEngine && (
              <div>
                <div className="text-sm text-cream-400 mb-1">Total HP</div>
                <div className="flex items-center gap-1 text-lg font-bold text-orange-400">
                  <Zap className="w-4 h-4" />
                  {performance.hp.toFixed(performance.hp % 1 === 0 ? 0 : 1)} hp
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
