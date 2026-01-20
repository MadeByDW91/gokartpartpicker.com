'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useBuildStore } from '@/store/build-store';
import { useEngines } from '@/hooks/use-engines';
import { useParts } from '@/hooks/use-parts';
import { useCompatibilityRules, checkCompatibility } from '@/hooks/use-compatibility';
import { useCreateBuild, useBuild } from '@/hooks/use-builds';
import { useTemplate } from '@/hooks/use-templates';
import { useAuth } from '@/hooks/use-auth';
import { useAutoSave } from '@/hooks/use-auto-save';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { ShareButton } from '@/components/social/ShareButton';
import { shareBuild } from '@/lib/social-sharing';
import { getEngineBySlug } from '@/actions/engines';
import { EngineCard } from '@/components/EngineCard';
import { PartCard } from '@/components/PartCard';
import { CompatibilityWarningList } from '@/components/CompatibilityWarning';
import { RecommendationsPanel } from '@/components/builder/RecommendationsPanel';
import { BuilderTable, PartSelectionModal } from '@/components/lazy';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EngineCardSkeleton, PartCardSkeleton } from '@/components/ui/Skeleton';
import {
  Wrench,
  Cog,
  Package,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertTriangle,
  Save,
  Trash2,
  DollarSign,
  Share2,
  Copy,
  Sparkles,
  X,
  Loader2,
} from 'lucide-react';
import { formatPrice, getCategoryLabel, CATEGORY_GROUPS, cn } from '@/lib/utils';
import { trackEvent, trackBuildCreated, trackConversion } from '@/lib/analytics';
import { PART_CATEGORIES, type PartCategory, type Engine, type Part } from '@/types/database';

type BuilderStep = 'engine' | PartCategory;

function BuilderPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState<BuilderStep>('engine');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [buildName, setBuildName] = useState('');
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [savedBuildId, setSavedBuildId] = useState<string | null>(null);
  const [selectionModalOpen, setSelectionModalOpen] = useState(false);
  const [selectionCategory, setSelectionCategory] = useState<PartCategory | 'engine'>('engine');
  const [searchQuery, setSearchQuery] = useState('');
  
  // URL parameters
  const engineSlug = searchParams.get('engine');
  const buildId = searchParams.get('build');
  const templateId = searchParams.get('template');
  
  const {
    selectedEngine,
    selectedParts,
    setEngine,
    setPart,
    clearBuild,
    getTotalPrice,
    warnings,
    setWarnings,
    getPartIds,
    hasIncompatibilities,
  } = useBuildStore();
  
  const { data: engines, isLoading: enginesLoading, error: enginesError } = useEngines();
  const { data: allParts, isLoading: partsLoading, error: partsError } = useParts();
  const { data: compatRules } = useCompatibilityRules();
  const { data: loadedBuild, isLoading: buildLoading } = useBuild(buildId || '');
  const { data: loadedTemplate } = useTemplate(templateId || '');
  const { isAuthenticated } = useAuth();
  const createBuild = useCreateBuild();
  const { isSaving, lastSaved, hasUnsavedChanges } = useAutoSave();
  useKeyboardShortcuts(); // Initialize keyboard shortcuts
  
  // Load engine from URL parameter
  useEffect(() => {
    if (engineSlug && !selectedEngine) {
      getEngineBySlug(engineSlug)
        .then((result) => {
          if (result.success && result.data) {
          setEngine(result.data);
          const firstPartCategory = PART_CATEGORIES.find((cat) => {
              const compatibleParts = allParts?.filter((p) => p && p.category === cat) || [];
            return compatibleParts.length > 0;
          });
          if (firstPartCategory) {
            setActiveStep(firstPartCategory);
          }
        }
        })
        .catch((error) => {
          console.error('Error loading engine from URL:', error);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engineSlug, selectedEngine, allParts]);
  
  // Load template from URL parameter
  useEffect(() => {
    if (templateId && loadedTemplate && allParts && !selectedEngine && selectedParts.size === 0) {
      try {
      if (loadedTemplate.engine) {
        setEngine(loadedTemplate.engine);
      }
        const parts = loadedTemplate.parts as Record<string, string> | null;
      if (parts) {
        Object.entries(parts).forEach(([category, partId]) => {
          const part = allParts.find((p) => p.id === partId);
          if (part) {
            setPart(category as PartCategory, part);
          }
        });
      }
      const firstPartCategory = PART_CATEGORIES.find((cat) => {
        const compatibleParts = allParts.filter((p) => p.category === cat) || [];
        return compatibleParts.length > 0;
      });
      if (firstPartCategory) {
        setActiveStep(firstPartCategory);
      }
      } catch (error) {
        console.error('Error loading template:', error);
    }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, loadedTemplate, allParts, selectedEngine, selectedParts]);

  // Load build from URL parameter
  useEffect(() => {
    if (buildId && loadedBuild && !buildLoading && !templateId) {
      try {
      if (loadedBuild.engine) {
        setEngine(loadedBuild.engine);
      }
        const parts = loadedBuild.parts as Record<string, string> | null;
      if (parts && allParts) {
        Object.entries(parts).forEach(([category, partId]) => {
          const part = allParts.find((p) => p.id === partId);
          if (part) {
            setPart(category as PartCategory, part);
          }
        });
      }
      setSavedBuildId(buildId);
      } catch (error) {
        console.error('Error loading build:', error);
    }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildId, loadedBuild, buildLoading, allParts, templateId]);
  
  // Check compatibility whenever selection changes
  useEffect(() => {
    try {
      if (compatRules && Array.isArray(compatRules)) {
      const newWarnings = checkCompatibility(selectedEngine, selectedParts, compatRules);
      setWarnings(newWarnings);
      } else {
        // If no rules, clear warnings
        setWarnings([]);
      }
    } catch (error) {
      console.error('Error checking compatibility:', error);
      setWarnings([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEngine, selectedParts, compatRules]);
  
  // Get parts for current category
  const partsForCategory = useMemo(() => {
    try {
    if (activeStep === 'engine') return [];
      const category = activeStep as PartCategory;
      if (!allParts || !Array.isArray(allParts)) return [];
    
      let parts = allParts.filter((p) => p && p.category === category);
    
    if (selectedEngine && parts.length > 0) {
      parts = [...parts].sort((a, b) => {
          try {
        if ((a.category === 'clutch' || a.category === 'torque_converter') &&
            (b.category === 'clutch' || b.category === 'torque_converter')) {
              const aSpecs = a.specifications || {};
              const bSpecs = b.specifications || {};
              const aBore = aSpecs.bore_diameter || aSpecs.bore_in || 0;
              const bBore = bSpecs.bore_diameter || bSpecs.bore_in || 0;
          const aMatch = aBore === selectedEngine.shaft_diameter;
          const bMatch = bBore === selectedEngine.shaft_diameter;
          if (aMatch && !bMatch) return -1;
          if (!aMatch && bMatch) return 1;
            }
          } catch (error) {
            console.error('Error sorting parts:', error);
        }
        return 0;
      });
    }
    return parts;
    } catch (error) {
      console.error('Error getting parts for category:', error);
      return [];
    }
  }, [allParts, activeStep, selectedEngine]);
  
  // Calculate item count for summary
  const itemCount = useMemo(() => {
    try {
      return (selectedEngine ? 1 : 0) + (selectedParts?.size || 0);
    } catch (error) {
      console.error('Error calculating item count:', error);
      return 0;
    }
  }, [selectedEngine, selectedParts]);
  
  // Get all steps for navigation
  const allSteps: BuilderStep[] = useMemo(() => ['engine', ...PART_CATEGORIES], []);
  const currentStepIndex = useMemo(() => {
    try {
      return allSteps.indexOf(activeStep);
    } catch (error) {
      console.error('Error finding current step index:', error);
      return 0;
    }
  }, [allSteps, activeStep]);
  const canGoNext = currentStepIndex < allSteps.length - 1;
  const canGoPrev = currentStepIndex > 0;
  
  const handleNext = () => {
    if (canGoNext) {
      setActiveStep(allSteps[currentStepIndex + 1]);
    }
  };
  
  const handlePrev = () => {
    if (canGoPrev) {
      setActiveStep(allSteps[currentStepIndex - 1]);
    }
  };
  
  const handleSelectEngine = (engine: Engine) => {
    if (selectedEngine?.id === engine.id) {
      setEngine(null);
    } else {
      setEngine(engine);
      // Auto-advance to first part category
      const firstPartCategory = PART_CATEGORIES.find((cat) => {
        const compatibleParts = allParts?.filter((p) => p.category === cat) || [];
        return compatibleParts.length > 0;
      });
      if (firstPartCategory) {
        setActiveStep(firstPartCategory);
      }
    }
  };
  
  const handleSelectPart = (part: Part) => {
    const current = selectedParts.get(part.category);
    if (current?.id === part.id) {
      setPart(part.category, null);
    } else {
      setPart(part.category, part);
    }
  };
  
  const handleSaveBuild = async () => {
    if (!buildName.trim()) return;
    try {
      const build = await createBuild.mutateAsync({
        name: buildName,
        engine_id: selectedEngine?.id,
        parts: getPartIds(),
        total_price: getTotalPrice(),
        is_public: false,
      });
      
      // Track build creation and conversion
      trackBuildCreated(build.id, selectedEngine?.id, selectedParts.size);
      trackConversion('build_saved', getTotalPrice());
      
      setSavedBuildId(build.id);
      setShowSaveModal(false);
      setBuildName('');
      router.push(`/builder?build=${build.id}`);
    } catch (error) {
      console.error('Failed to save build:', error);
    }
  };
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShareLinkCopied(true);
      setTimeout(() => setShareLinkCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };
  
  const generateShareLink = (): string | null => {
    if (typeof window === 'undefined') return null;
    if (savedBuildId) {
      return `${window.location.origin}/builder?build=${savedBuildId}`;
    }
    return null;
  };
  
  // Safely get total price
  const totalPrice = useMemo(() => {
    try {
      let total = selectedEngine?.price || 0;
      selectedParts.forEach((part) => {
        total += part.price || 0;
      });
      return total;
    } catch (error) {
      console.error('Error calculating total price:', error);
      return 0;
    }
  }, [selectedEngine, selectedParts]);
  
  return (
    <div className="min-h-screen bg-olive-900">
      {/* Header with Progress */}
      <div className="bg-olive-800 border-b border-olive-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400 flex-shrink-0" />
              <h1 className="text-display text-xl sm:text-2xl lg:text-3xl text-cream-100 truncate">
                Build Your Kart
              </h1>
            </div>
            
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              <Link href="/templates">
                <Button variant="secondary" size="sm" icon={<Sparkles className="w-4 h-4" />}>
                  Templates
                </Button>
              </Link>
               {(selectedEngine || selectedParts.size > 0) && (
                 <>
                   <Button variant="ghost" size="sm" onClick={clearBuild} icon={<Trash2 className="w-4 h-4" />}>
                    Clear
                  </Button>
                   <ShareButton
                     options={shareBuild(savedBuildId || '', `My Go-Kart Build - $${totalPrice.toFixed(2)}`)}
                     variant="icon"
                   />
                 </>
               )}
               {/* Auto-save indicator */}
               {hasUnsavedChanges && (
                 <div className="flex items-center gap-2 text-xs text-cream-400">
                   {isSaving ? (
                     <>
                       <Loader2 className="w-3 h-3 animate-spin" />
                       <span>Saving...</span>
                     </>
                   ) : lastSaved ? (
                     <>
                       <Check className="w-3 h-3 text-green-400" />
                       <span>Saved {new Date(lastSaved).toLocaleTimeString()}</span>
                     </>
                   ) : null}
                 </div>
               )}
              {isAuthenticated ? (
                <Button variant="primary" size="sm" onClick={() => setShowSaveModal(true)} disabled={!selectedEngine && selectedParts.size === 0} icon={<Save className="w-4 h-4" />}>
                  Save
                </Button>
              ) : (
                <Link href="/auth/login?redirect=/builder">
                  <Button variant="secondary" size="sm">Login</Button>
                </Link>
              )}
            </div>
            
            {/* Mobile Actions */}
            <div className="md:hidden flex items-center gap-2 flex-shrink-0">
              <Link href="/templates">
                <Button variant="ghost" size="sm" icon={<Sparkles className="w-4 h-4" />} className="min-h-[44px] min-w-[44px] touch-manipulation" aria-label="Templates">
                </Button>
              </Link>
              {(selectedEngine || selectedParts.size > 0) && (
                <>
                  <Button variant="ghost" size="sm" onClick={clearBuild} icon={<Trash2 className="w-4 h-4" />} className="min-h-[44px] min-w-[44px] touch-manipulation" aria-label="Clear build">
                  </Button>
                  <ShareButton
                    options={shareBuild(savedBuildId || '', `My Go-Kart Build - $${totalPrice.toFixed(2)}`)}
                    variant="icon"
                  />
                </>
              )}
              {isAuthenticated ? (
                <Button variant="primary" size="sm" onClick={() => setShowSaveModal(true)} disabled={!selectedEngine && selectedParts.size === 0} icon={<Save className="w-4 h-4" />} className="min-h-[44px] touch-manipulation">
                  <span className="hidden sm:inline">Save</span>
                </Button>
              ) : (
                <Link href="/auth/login?redirect=/builder">
                  <Button variant="secondary" size="sm" className="min-h-[44px] touch-manipulation">Login</Button>
                </Link>
              )}
            </div>
          </div>
          
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Builder Table */}
        <BuilderTable
          selectedEngine={selectedEngine}
          selectedParts={selectedParts}
          onSelectEngine={() => {
            setSelectionCategory('engine');
            setSelectionModalOpen(true);
          }}
          onSelectPart={(category) => {
            setSelectionCategory(category);
            setSelectionModalOpen(true);
          }}
          onRemoveEngine={() => setEngine(null)}
          onRemovePart={(category) => setPart(category, null)}
          totalPrice={totalPrice}
        />

        {/* Compatibility Warnings */}
        {warnings.length > 0 && (
          <div className="mt-6">
            <CompatibilityWarningList warnings={warnings} />
                    </div>
        )}

        {/* Part Selection Modal */}
        <PartSelectionModal
          isOpen={selectionModalOpen}
          onClose={() => {
            setSelectionModalOpen(false);
            setSearchQuery('');
          }}
          category={selectionCategory}
          items={
            selectionCategory === 'engine'
              ? (engines || [])
              : (allParts?.filter((p) => p.category === selectionCategory) || [])
          }
          isLoading={selectionCategory === 'engine' ? enginesLoading : partsLoading}
          error={selectionCategory === 'engine' ? enginesError : partsError}
          selectedItem={
            selectionCategory === 'engine'
              ? selectedEngine
              : selectedParts.get(selectionCategory) || null
          }
          onSelect={(item) => {
            if (selectionCategory === 'engine') {
              setEngine(item as Engine);
            } else {
              setPart(selectionCategory, item as Part);
            }
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Old Content - Hidden for now, can be removed later */}
        {false && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-8">
            {/* Category Tabs */}
            <div className="mb-6">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                  onClick={() => setActiveStep('engine')}
                          className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors flex-shrink-0',
                    activeStep === 'engine'
                      ? 'bg-orange-500 text-cream-100'
                      : selectedEngine
                        ? 'bg-olive-700 text-cream-200 hover:bg-olive-600'
                        : 'bg-olive-800 text-cream-400 hover:bg-olive-700'
                  )}
                >
                  {selectedEngine ? <Check className="w-4 h-4" /> : <Cog className="w-4 h-4" />}
                  <span className="font-medium">Engine</span>
                        </button>
                        
                {PART_CATEGORIES.map((category) => {
                  const selectedPart = selectedParts.get(category);
                  const isActive = activeStep === category;
                              
                              return (
                                <button
                      key={category}
                      onClick={() => setActiveStep(category)}
                                  className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors flex-shrink-0',
                        isActive
                          ? 'bg-orange-500 text-cream-100'
                          : selectedPart
                            ? 'bg-olive-700 text-cream-200 hover:bg-olive-600'
                            : 'bg-olive-800 text-cream-400 hover:bg-olive-700'
                      )}
                    >
                      {selectedPart ? <Check className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                      <span className="font-medium">{getCategoryLabel(category)}</span>
                                </button>
                              );
                            })}
                          </div>
          </div>
          
            {/* Content Area */}
            <div className="space-y-6">
            {/* Step Header */}
              <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {activeStep === 'engine' ? (
                  <Cog className="w-6 h-6 text-orange-400" />
                ) : (
                  <Package className="w-6 h-6 text-orange-400" />
                )}
                <h2 className="text-display text-2xl text-cream-100">
                  {activeStep === 'engine' ? 'Select Engine' : `Select ${getCategoryLabel(activeStep)}`}
                </h2>
              </div>
                
                {/* Navigation Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrev}
                    disabled={!canGoPrev}
                    icon={<ChevronLeft className="w-4 h-4" />}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleNext}
                    disabled={!canGoNext}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
            </div>
            
            {/* Engine Selection */}
            {activeStep === 'engine' && (() => {
              // TypeScript narrowing: check engines first, then array, then length
              const enginesArray: Engine[] = (engines && Array.isArray(engines)) ? (engines as Engine[]) : [];
              const hasEngines = enginesArray.length > 0;
              return (
              <div className="space-y-4">
                  {enginesError ? (
                    <Card className="bg-olive-800 border-olive-600">
                      <CardContent className="py-12 text-center">
                        <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                        <p className="text-cream-100 text-lg mb-2">Failed to load engines</p>
                        <p className="text-cream-400 text-sm mb-4">
                          {(() => {
                            // TypeScript narrowing: we're inside enginesError ? (...) so enginesError is truthy
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const err: any = enginesError;
                            if (err instanceof Error) {
                              return err.message;
                            }
                            return String(err);
                          })()}
                        </p>
                        <Button variant="secondary" onClick={() => window.location.reload()}>
                          Retry
                        </Button>
                      </CardContent>
                    </Card>
                  ) : enginesLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                      <EngineCardSkeleton key={i} />
                    ))}
                  </div>
                  ) : hasEngines ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {enginesArray.slice(0, 12).map((engine) => (
                      <EngineCard
                        key={engine.id}
                        engine={engine}
                        onAddToBuild={handleSelectEngine}
                        isSelected={selectedEngine?.id === engine.id}
                      />
                    ))}
                  </div>
                <div className="text-center pt-4">
                  <Link href="/engines">
                    <Button variant="secondary">
                      Browse All Engines
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
                    </>
                  ) : (
                    <Card className="bg-olive-800 border-olive-600">
                      <CardContent className="py-12 text-center">
                        <Cog className="w-16 h-16 text-olive-500 mx-auto mb-4 opacity-50" />
                        <p className="text-cream-400 text-lg mb-2">No engines available</p>
                        <p className="text-cream-500 text-sm">
                          Check back later or contact support
                        </p>
                      </CardContent>
                    </Card>
                  )}
              </div>
              );
            })()}
            
            {/* Part Selection */}
            {activeStep !== 'engine' && (
                <div className="space-y-6">
                  {partsError ? (
                    <Card className="bg-olive-800 border-olive-600">
                      <CardContent className="py-12 text-center">
                        <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                        <p className="text-cream-100 text-lg mb-2">Failed to load parts</p>
                        <p className="text-cream-400 text-sm mb-4">
                          {(() => {
                            // TypeScript narrowing: we're inside partsError ? (...) so partsError is truthy
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const err: any = partsError;
                            if (err instanceof Error) {
                              return err.message;
                            }
                            return String(err);
                          })()}
                        </p>
                        <Button variant="secondary" onClick={() => window.location.reload()}>
                          Retry
                        </Button>
                      </CardContent>
                    </Card>
                  ) : partsLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                      <PartCardSkeleton key={i} />
                    ))}
                  </div>
                ) : partsForCategory.length === 0 ? (
                    <Card className="bg-olive-800 border-olive-600">
                      <CardContent className="py-12 text-center">
                        <Package className="w-16 h-16 text-olive-500 mx-auto mb-4 opacity-50" />
                        <p className="text-cream-400 text-lg mb-2">
                          No {getCategoryLabel(activeStep as PartCategory).toLowerCase()} parts available
                        </p>
                        <p className="text-cream-500 text-sm">
                          Check back later or browse other categories
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {partsForCategory.slice(0, 12).map((part) => (
                      <PartCard
                        key={part.id}
                        part={part}
                        onAddToBuild={handleSelectPart}
                        isSelected={selectedParts.get(part.category)?.id === part.id}
                      />
                    ))}
                  </div>
                
                      {partsForCategory.length > 9 && (
                  <div className="text-center pt-4">
                          <Link href={`/parts?category=${activeStep as PartCategory}`}>
                      <Button variant="secondary">
                              Browse All {getCategoryLabel(activeStep as PartCategory)}
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                )}
                
                      {/* Recommendations */}
                      {selectedEngine && (
                        <div className="pt-6 border-t border-olive-600">
                    <RecommendationsPanel
                            category={activeStep as PartCategory}
                            onAddPart={handleSelectPart}
                    />
                  </div>
                      )}
                    </>
                )}
              </div>
            )}
            </div>
          </div>
          
          {/* Build Summary Sidebar - Hidden for table view */}
          {false && (
          <div className="lg:col-span-4">
            <Card className="sticky top-32">
              <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-display text-lg text-cream-100">Your Build</h2>
                <Badge variant={hasIncompatibilities() ? 'error' : itemCount > 0 ? 'success' : 'default'}>
                  {hasIncompatibilities() ? (
                    <>
                      <AlertTriangle className="w-3 h-3" />
                      Issues
                    </>
                  ) : (
                    `${itemCount} item${itemCount !== 1 ? 's' : ''}`
                  )}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selected Engine */}
                {selectedEngine ? (
                  <div className="p-3 bg-olive-600 rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <Cog className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-cream-100 truncate">
                            {selectedEngine?.name || 'Unknown Engine'}
                          </p>
                          <p className="text-xs text-cream-400">{selectedEngine?.brand || ''}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setEngine(null)}
                        className="text-cream-400 hover:text-red-400 transition-colors flex-shrink-0"
                        title="Remove engine"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-2 pt-2 border-t border-olive-500">
                      <span className="text-sm font-bold text-orange-400">
                        {(() => {
                          const enginePrice = selectedEngine?.price;
                          if (enginePrice != null && typeof enginePrice === 'number') {
                            // TypeScript narrowing: we've checked enginePrice is a number
                            return formatPrice(enginePrice as number);
                          }
                          return '—';
                        })()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 border border-dashed border-olive-600 rounded-lg text-center">
                    <p className="text-sm text-cream-400">No engine selected</p>
                  </div>
                )}
                
                {/* Selected Parts */}
                {selectedParts.size > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-cream-300 mb-2">Parts</h3>
                    {Array.from(selectedParts.entries()).map(([category, part]) => (
                      <div key={category} className="p-3 bg-olive-600 rounded-lg">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <Package className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-cream-100 line-clamp-1">
                                {part.name}
                              </p>
                              <p className="text-xs text-cream-400">
                                {getCategoryLabel(category)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setPart(category, null)}
                            className="text-cream-400 hover:text-red-400 transition-colors flex-shrink-0"
                            title="Remove part"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="mt-2 pt-2 border-t border-olive-500">
                          <span className="text-sm font-bold text-orange-400">
                            {part.price ? formatPrice(part.price) : '—'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Compatibility Warnings */}
                {warnings.length > 0 && (
                  <div className="pt-4 border-t border-olive-600">
                    <CompatibilityWarningList warnings={warnings} />
                  </div>
                )}
                
                {/* Total */}
                <div className="pt-4 border-t border-olive-600">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-cream-400 font-medium">Estimated Total</span>
                    <span className="text-2xl font-bold text-orange-400">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                  
                  {/* Mobile Actions */}
                  <div className="space-y-2 lg:hidden">
                    {(selectedEngine || selectedParts.size > 0) && (
                      <>
                        <Button variant="ghost" size="sm" onClick={clearBuild} icon={<Trash2 className="w-4 h-4" />} className="w-full">
                        Clear Build
                      </Button>
                        <Button variant="ghost" size="sm" onClick={() => setShowShareModal(true)} icon={<Share2 className="w-4 h-4" />} className="w-full">
                        Share Build
                      </Button>
                      </>
                    )}
                    {isAuthenticated ? (
                      <Button variant="primary" onClick={() => setShowSaveModal(true)} disabled={!selectedEngine && selectedParts.size === 0} icon={<Save className="w-4 h-4" />} className="w-full">
                        Save Build
                      </Button>
                    ) : (
                      <Link href="/auth/login?redirect=/builder" className="block">
                        <Button variant="secondary" className="w-full">Login to Save</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          )}
        </div>
        )}
      
      {/* Share Build Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-olive-900/80 backdrop-blur-sm" onClick={() => setShowShareModal(false)} />
          <Card className="relative w-full max-w-md">
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-display text-xl text-cream-100">Share Your Build</h2>
              <button onClick={() => setShowShareModal(false)} className="text-cream-400 hover:text-cream-100">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {savedBuildId ? (
                <>
                  <p className="text-cream-400 text-sm">Share this link with others:</p>
                  <div className="flex items-center gap-2">
                    <Input value={generateShareLink() || ''} readOnly className="font-mono text-sm" />
                    <Button variant="secondary" size="sm" onClick={() => generateShareLink() && copyToClipboard(generateShareLink()!)} icon={shareLinkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}>
                      {shareLinkCopied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-cream-400 text-sm">Save your build first to generate a shareable link.</p>
                  <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => { setShowShareModal(false); setShowSaveModal(true); }} className="flex-1">
                      Save Build First
                    </Button>
                    <Button variant="ghost" onClick={() => setShowShareModal(false)} className="flex-1">Cancel</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Save Build Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-olive-900/80 backdrop-blur-sm" onClick={() => setShowSaveModal(false)} />
          <Card className="relative w-full max-w-md">
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-display text-xl text-cream-100">Save Your Build</h2>
              <button onClick={() => setShowSaveModal(false)} className="text-cream-400 hover:text-cream-100">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="Build Name" placeholder="My Awesome Kart" value={buildName} onChange={(e) => setBuildName(e.target.value)} autoFocus />
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setShowSaveModal(false)} className="flex-1" disabled={createBuild.isPending}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSaveBuild} loading={createBuild.isPending} disabled={!buildName.trim()} icon={<Save className="w-4 h-4" />} className="flex-1">
                  Save
                </Button>
              </div>
              {savedBuildId && (
                <div className="pt-4 border-t border-olive-600">
                  <p className="text-sm text-cream-400 mb-2">Build saved! Share it with others:</p>
                  <Button variant="secondary" onClick={() => { setShowSaveModal(false); setShowShareModal(true); }} icon={<Share2 className="w-4 h-4" />} className="w-full">
                    Share Build
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-olive-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    }>
      <BuilderPageContent />
    </Suspense>
  );
}
