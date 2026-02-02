'use client';

import { useMemo, useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useBuildStore } from '@/store/build-store';
import { useRecommendations, usePopularCombinations, useUpgradePath } from '@/hooks/use-recommendations-enhanced';
import { useBuildPerformance } from '@/hooks/use-build-performance';
import { LiveToolsContent } from './LiveToolsContent';
import { ManualCard } from '@/components/engines/ManualCard';
import { EngineTorqueSpecs } from '@/components/engines/EngineTorqueSpecs';
import { getTorqueSpecs } from '@/data/torque-specs';
import { 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign,
  Gauge,
  Zap,
  Weight,
  Cog,
  Battery,
  Info,
  Target,
  Rocket,
  Shield,
  Wrench,
  Package,
  ArrowRight,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Users,
  ArrowUp,
  Plus,
  Eye,
  Clock,
  BarChart3,
  Flame,
  Calculator,
  FileText,
  BookOpen,
  Layers,
  ChevronLeft,
  ChevronRight,
  Mountain,
  Car,
  Flag,
  Trophy,
  Wallet,
  GraduationCap,
  Baby,
} from 'lucide-react';
import { formatPrice, getCategoryLabel, cn } from '@/lib/utils';
import type { Engine, ElectricMotor, Part, PartCategory } from '@/types/database';
import type { RecommendationGoal } from '@/actions/recommendations';
import { getGuides } from '@/actions/guides';
import type { Guide } from '@/types/guides';
import { useTemplates } from '@/hooks/use-templates';
import type { BuildTemplate, TemplateGoal } from '@/types/database';
import { useRouter } from 'next/navigation';
import { BuilderInsightsVisualComparison } from './BuilderInsightsVisualComparison';

interface BuilderInsightsProps {
  // For engines page: pass engines/motors and selected item
  engines?: Engine[];
  motors?: ElectricMotor[];
  selectedItem?: Engine | ElectricMotor | null;
  activePowerSource?: 'gas' | 'electric' | 'all';
  
  // For builder page: use build store context
  category?: PartCategory | null;
  onAddPart?: (part: Part) => void;
  
  // Common props
  variant?: 'engines-page' | 'builder-page';
}

interface Insight {
  id: string;
  type: 'tip' | 'warning' | 'info' | 'recommendation' | 'success' | 'action' | 'performance' | 'cost';
  title: string;
  message: string;
  icon: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
  category: 'critical' | 'performance' | 'cost' | 'next' | 'recommendations';
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  metrics?: {
    label: string;
    value: string | number;
    unit?: string;
  }[];
  badge?: string;
}

// Required parts for gas engine build
const GAS_REQUIRED_PARTS = [
  { category: 'clutch', label: 'Clutch or Torque Converter', critical: true },
  { category: 'chain', label: 'Drive Chain', critical: true },
  { category: 'sprocket', label: 'Sprockets (Clutch & Axle)', critical: true },
  { category: 'throttle', label: 'Throttle Cable & Pedal', critical: true },
  { category: 'fuel_system', label: 'Fuel System (Tank, Lines, Filter)', critical: true },
  { category: 'brake', label: 'Brakes', critical: true },
  { category: 'wheel', label: 'Wheels', critical: true },
  { category: 'tire', label: 'Tires', critical: true },
  { category: 'frame', label: 'Frame', critical: true },
];

// Required parts for EV build
const EV_REQUIRED_PARTS = [
  { category: 'battery', label: 'Battery Pack', critical: true },
  { category: 'motor_controller', label: 'Motor Controller', critical: true },
  { category: 'charger', label: 'Battery Charger', critical: true },
  { category: 'throttle_controller', label: 'Throttle', critical: true },
  { category: 'bms', label: 'BMS (Battery Management System)', critical: true },
  { category: 'brake', label: 'Brakes', critical: true },
  { category: 'wheel', label: 'Wheels', critical: true },
  { category: 'tire', label: 'Tires', critical: true },
  { category: 'frame', label: 'Frame', critical: true },
];

type TabType = 'live-tools' | 'recommendations' | 'manual-specs' | 'useful-guides' | 'templates' | 'visual-comparison';

// Template goal icons mapping
const TEMPLATE_GOAL_ICONS: Record<TemplateGoal, React.ComponentType<{ className?: string }>> = {
  speed: Rocket,
  torque: Zap,
  budget: Wallet,
  beginner: GraduationCap,
  competition: Trophy,
  kids: Baby,
  offroad: Mountain,
  onroad: Car,
  racing: Flag,
};

const TEMPLATE_GOAL_LABELS: Record<TemplateGoal, string> = {
  speed: 'Speed',
  torque: 'Torque',
  budget: 'Budget',
  beginner: 'Beginner',
  competition: 'Competition',
  kids: 'Kids',
  offroad: 'Off-Road',
  onroad: 'On-Road',
  racing: 'Racing',
};

export function BuilderInsights({
  engines = [],
  motors = [],
  selectedItem,
  activePowerSource = 'all',
  category,
  onAddPart,
  variant = 'engines-page',
}: BuilderInsightsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('live-tools');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['critical', 'performance']));
  const [goal, setGoal] = useState<RecommendationGoal>('speed');
  const [relevantGuides, setRelevantGuides] = useState<Guide[]>([]);
  const [loadingGuides, setLoadingGuides] = useState(false);
  
  const router = useRouter();
  
  const { 
    selectedEngine, 
    selectedMotor, 
    selectedParts,
    powerSourceType,
  } = useBuildStore();
  
  const performance = useBuildPerformance();
  
  // Fetch templates for the templates tab - filter by selected engine when on builder page
  // Only fetch when engine is selected so templates shown are specific to the engine type
  const selectedEngineId = variant === 'builder-page' ? selectedEngine?.id : undefined;
  const { data: templates = [], isLoading: templatesLoading } = useTemplates(
    undefined,
    selectedEngineId,
    { enabled: variant !== 'builder-page' || !!selectedEngineId }
  );
  
  // Determine which item we're analyzing
  const currentItem = variant === 'builder-page' 
    ? (selectedEngine || selectedMotor)
    : selectedItem;
  
  const currentPowerSource = variant === 'builder-page'
    ? powerSourceType
    : (activePowerSource === 'gas' ? 'gas' : activePowerSource === 'electric' ? 'electric' : (currentItem && 'displacement_cc' in currentItem ? 'gas' : 'electric'));
  
  const isEngine = currentItem && 'displacement_cc' in currentItem;
  const isMotor = currentItem && 'voltage' in currentItem;
  
  // Recommendations hooks (for builder page)
  const engineId = variant === 'builder-page' ? selectedEngine?.id || null : (isEngine ? (currentItem as Engine).id : null);
  const currentParts = Array.from(selectedParts.values()).flat();
  
  const { data: recommendations = [], isLoading: recsLoading } = useRecommendations(
    engineId,
    category || null,
    goal,
    variant === 'builder-page' && !!category && !!engineId
  );
  
  const { data: popularCombinations = [], isLoading: combosLoading } = usePopularCombinations(
    engineId,
    variant === 'builder-page' && !!engineId
  );
  
  const { data: upgradePath = [], isLoading: upgradeLoading } = useUpgradePath(
    variant === 'builder-page' ? selectedEngine : (isEngine ? currentItem as Engine : null),
    variant === 'builder-page' ? currentParts : [],
    goal,
    variant === 'builder-page' && !!selectedEngine
  );

  // Load relevant guides based on current build
  useEffect(() => {
    async function loadRelevantGuides() {
      setLoadingGuides(true);
      try {
        // Fetch all published guides
        const result = await getGuides();
        if (result.success && result.data) {
          const allGuides = result.data;
          
          // Filter guides that are relevant to the current build
          const filtered: Guide[] = [];
          const seenIds = new Set<string>();
          
          // Get engine/motor ID - check both build store and currentItem prop
          const engineOrMotorId = variant === 'builder-page'
            ? (selectedEngine?.id || selectedMotor?.id)
            : (isEngine ? (currentItem as Engine).id : (isMotor ? (currentItem as ElectricMotor).id : null)) || 
              (selectedEngine?.id || selectedMotor?.id); // Fallback to build store for engines/parts pages
          
          // Get all selected part IDs - always check build store (available on all pages)
          const selectedPartIds = Array.from(selectedParts.values()).flat().map(p => p.id);
          
          // Add guides related to the engine/motor
          if (engineOrMotorId) {
            allGuides.forEach(guide => {
              if (guide.related_engine_id === engineOrMotorId && !seenIds.has(guide.id)) {
                filtered.push(guide);
                seenIds.add(guide.id);
              }
            });
          }
          
          // Add guides related to selected parts
          selectedPartIds.forEach(partId => {
            allGuides.forEach(guide => {
              if (guide.related_part_id === partId && !seenIds.has(guide.id)) {
                filtered.push(guide);
                seenIds.add(guide.id);
              }
            });
          });
          
          // Sort by relevance (engine guides first, then part guides) and recency
          filtered.sort((a, b) => {
            // Engine guides first
            if (engineOrMotorId) {
              const aIsEngine = a.related_engine_id === engineOrMotorId;
              const bIsEngine = b.related_engine_id === engineOrMotorId;
              if (aIsEngine && !bIsEngine) return -1;
              if (!aIsEngine && bIsEngine) return 1;
            }
            // Then by created date (newest first)
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
          
          setRelevantGuides(filtered);
        } else {
          setRelevantGuides([]);
        }
      } catch (err) {
        console.error('Failed to load relevant guides:', err);
        setRelevantGuides([]);
      } finally {
        setLoadingGuides(false);
      }
    }
    
    loadRelevantGuides();
  }, [variant, selectedEngine, selectedMotor, selectedParts, currentItem, isEngine, isMotor]);
  
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const insights = useMemo(() => {
    const allInsights: Insight[] = [];
    
    if (!currentItem) {
      // No item selected - show general recommendations
      const relevantItems = currentPowerSource === 'gas' 
        ? engines 
        : currentPowerSource === 'electric'
        ? motors
        : [...engines, ...motors];
      
      const itemsWithPrice = relevantItems.filter(item => item.price && item.horsepower);
      
      if (itemsWithPrice.length > 0) {
        const bestValue = itemsWithPrice.reduce((best, item) => {
          const costPerHp = item.price! / item.horsepower!;
          const bestCostPerHp = best.price! / best.horsepower!;
          return costPerHp < bestCostPerHp ? item : best;
        }, itemsWithPrice[0]);
        
        allInsights.push({
          id: 'best-value',
          type: 'recommendation',
          title: 'Best Value Recommendation',
          message: `${bestValue.brand} ${bestValue.name} offers the best cost per horsepower at $${(bestValue.price! / bestValue.horsepower!).toFixed(0)}/HP.`,
          icon: <TrendingUp className="w-5 h-5" />,
          priority: 'high',
          category: 'recommendations',
          metrics: [
            { label: 'Price', value: formatPrice(bestValue.price!), unit: '' },
            { label: 'HP', value: bestValue.horsepower!.toFixed(1), unit: '' },
            { label: 'Cost/HP', value: `$${(bestValue.price! / bestValue.horsepower!).toFixed(0)}`, unit: '' },
          ],
          action: {
            label: 'View Details',
            href: `/engines/${bestValue.slug || bestValue.id}`
          }
        });
      }
      
      allInsights.push({
        id: 'start-building',
        type: 'action',
        title: 'Start Building',
        message: 'Select an engine or motor to see detailed compatibility requirements, required parts checklist, and build estimates.',
        icon: <Wrench className="w-5 h-5" />,
        priority: 'high',
        category: 'next',
        action: {
          label: 'Go to Builder',
          href: '/builder'
        }
      });
      
      return allInsights;
    }
    
    // Selected item insights
    if (isEngine) {
      const engine = currentItem as Engine;
      
      // CRITICAL: Required parts
      const requiredParts = GAS_REQUIRED_PARTS;
      const selectedPartsList = variant === 'builder-page' 
        ? Array.from(selectedParts.keys())
        : [];
      const missingParts = requiredParts.filter(p => !selectedPartsList.includes(p.category as PartCategory));
      
      allInsights.push({
        id: 'required-parts',
        type: 'warning',
        title: 'Required Parts',
        message: `${requiredParts.length} required parts for a complete build. ${missingParts.length > 0 ? `${missingParts.length} still needed.` : 'All critical parts selected!'}`,
        icon: <Package className="w-5 h-5" />,
        priority: 'high',
        category: 'critical',
        metrics: [
          { label: 'Required', value: requiredParts.length, unit: '' },
          { label: 'Selected', value: selectedPartsList.length, unit: '' },
          { label: 'Missing', value: missingParts.length, unit: '' },
        ],
        action: variant === 'builder-page' ? undefined : {
          label: 'Open Builder',
          href: `/builder?engine=${engine.slug || engine.id}`
        }
      });
      
      if (engine.shaft_diameter) {
        allInsights.push({
          id: 'shaft-compatibility',
          type: 'warning',
          title: 'Shaft Compatibility',
          message: `Requires ${engine.shaft_diameter}" clutch/TC bore. Incompatible parts won't work.`,
          icon: <AlertCircle className="w-5 h-5" />,
          priority: 'high',
          category: 'critical',
          metrics: [
            { label: 'Shaft Diameter', value: engine.shaft_diameter, unit: '"' },
          ],
          action: {
            label: 'Find Compatible',
            href: `/parts?shaft_diameter=${engine.shaft_diameter}`
          }
        });
      }
      
      // PERFORMANCE: Gear ratio & speed
      if (engine.horsepower) {
        let recommendedRatio = '6:1';
        let speedEstimate = '35-40 mph';
        let clutchTeeth = '12T';
        let axleTeeth = '72T';
        let performanceTier = 'Mid-Range';
        
        if (engine.horsepower < 6) {
          recommendedRatio = '5:1';
          speedEstimate = '25-30 mph';
          clutchTeeth = '10T';
          axleTeeth = '50T';
          performanceTier = 'Entry-Level';
        } else if (engine.horsepower >= 6 && engine.horsepower < 10) {
          recommendedRatio = '6:1';
          speedEstimate = '35-45 mph';
          clutchTeeth = '12T';
          axleTeeth = '72T';
          performanceTier = 'Mid-Range';
        } else if (engine.horsepower >= 10) {
          recommendedRatio = '7:1';
          speedEstimate = '45-55+ mph';
          clutchTeeth = '12T';
          axleTeeth = '84T';
          performanceTier = 'High Performance';
        }
        
        allInsights.push({
          id: 'performance-estimate',
          type: 'performance',
          title: `${performanceTier} Performance`,
          message: `Recommended ${recommendedRatio} gear ratio (${clutchTeeth} + ${axleTeeth} sprockets). Expected top speed: ${speedEstimate}.`,
          icon: <Gauge className="w-5 h-5" />,
          priority: 'high',
          category: 'performance',
          metrics: [
            { label: 'HP', value: engine.horsepower.toFixed(1), unit: '' },
            { label: 'Gear Ratio', value: recommendedRatio, unit: '' },
            { label: 'Top Speed', value: speedEstimate, unit: '' },
          ],
          badge: performanceTier,
          action: {
            label: 'Find Sprockets',
            href: `/parts?category=sprocket`
          }
        });
      }
      
      // COST: Build cost estimate
      if (engine.price) {
        const engineCost = engine.price;
        const partsEstimate = 250;
        const frameEstimate = 150;
        const wheelsTiresEstimate = 100;
        const brakesEstimate = 80;
        const hardwareEstimate = 50;
        const totalEstimate = engineCost + partsEstimate + frameEstimate + wheelsTiresEstimate + brakesEstimate + hardwareEstimate;
        
        allInsights.push({
          id: 'build-cost',
          type: 'cost',
          title: 'Estimated Build Cost',
          message: `Complete build estimate including engine, parts, frame, wheels, and hardware.`,
          icon: <DollarSign className="w-5 h-5" />,
          priority: 'medium',
          category: 'cost',
          metrics: [
            { label: 'Engine', value: formatPrice(engineCost), unit: '' },
            { label: 'Parts', value: formatPrice(partsEstimate + frameEstimate + wheelsTiresEstimate + brakesEstimate + hardwareEstimate), unit: '' },
            { label: 'Total', value: formatPrice(totalEstimate), unit: '' },
          ],
          action: {
            label: 'Plan Build Cost',
            href: '/builder'
          }
        });
      }
      
    } else if (isMotor) {
      const motor = currentItem as ElectricMotor;
      
      // CRITICAL: Required components
      const requiredParts = EV_REQUIRED_PARTS;
      const selectedPartsList = variant === 'builder-page' 
        ? Array.from(selectedParts.keys())
        : [];
      const missingParts = requiredParts.filter(p => !selectedPartsList.includes(p.category as PartCategory));
      
      allInsights.push({
        id: 'required-components',
        type: 'warning',
        title: 'Required Components',
        message: `${requiredParts.length} required components for a complete EV build. All must match ${motor.voltage}V.`,
        icon: <Package className="w-5 h-5" />,
        priority: 'high',
        category: 'critical',
        metrics: [
          { label: 'Required', value: requiredParts.length, unit: '' },
          { label: 'Selected', value: selectedPartsList.length, unit: '' },
          { label: 'Missing', value: missingParts.length, unit: '' },
        ],
        action: variant === 'builder-page' ? undefined : {
          label: 'Open EV Builder',
          href: `/builder?motor=${motor.slug || motor.id}`
        }
      });
      
      allInsights.push({
        id: 'voltage-matching',
        type: 'warning',
        title: 'Voltage Matching',
        message: `ALL components must be ${motor.voltage}V: battery, controller, charger. Mixing voltages will cause failure.`,
        icon: <AlertCircle className="w-5 h-5" />,
        priority: 'high',
        category: 'critical',
        metrics: [
          { label: 'System Voltage', value: motor.voltage, unit: 'V' },
        ],
        action: {
          label: `Find ${motor.voltage}V Parts`,
          href: `/parts?voltage=${motor.voltage}`
        }
      });
      
      // PERFORMANCE: Battery sizing & speed
      if (motor.horsepower) {
        let speedEstimate = '30-35 mph';
        let rangeEstimate = '15-20 miles';
        let batteryAh = '20-30 Ah';
        
        if (motor.horsepower >= 5 && motor.horsepower < 10) {
          speedEstimate = '35-45 mph';
          rangeEstimate = '20-25 miles';
          batteryAh = '30-40 Ah';
        } else if (motor.horsepower >= 10) {
          speedEstimate = '45-55+ mph';
          rangeEstimate = '25-35 miles';
          batteryAh = '40-60 Ah';
        }
        
        allInsights.push({
          id: 'ev-performance',
          type: 'performance',
          title: 'Performance Estimate',
          message: `Expected performance with properly sized battery pack.`,
          icon: <Zap className="w-5 h-5" />,
          priority: 'high',
          category: 'performance',
          metrics: [
            { label: 'HP', value: motor.horsepower.toFixed(1), unit: '' },
            { label: 'Top Speed', value: speedEstimate, unit: '' },
            { label: 'Range', value: rangeEstimate, unit: '' },
          ],
          badge: 'EV Performance',
        });
      }
      
      allInsights.push({
        id: 'battery-sizing',
        type: 'recommendation',
        title: 'Battery Sizing',
        message: `Recommended battery capacity based on usage: Light use (10-15 Ah), Recreational (20-30 Ah), Extended (40+ Ah).`,
        icon: <Battery className="w-5 h-5" />,
        priority: 'high',
        category: 'performance',
        action: {
          label: 'Find Batteries',
          href: `/parts?category=battery&voltage=${motor.voltage}`
        }
      });
      
      // COST: EV system cost
      if (motor.price) {
        const motorCost = motor.price;
        const batteryEstimate = motor.voltage * 2.5;
        const controllerEstimate = motor.voltage * 0.8;
        const chargerEstimate = motor.voltage * 0.5;
        const bmsEstimate = 50;
        const wiringEstimate = 30;
        const throttleEstimate = 25;
        const frameEstimate = 150;
        const wheelsTiresEstimate = 100;
        const brakesEstimate = 80;
        const totalEstimate = motorCost + batteryEstimate + controllerEstimate + chargerEstimate + bmsEstimate + wiringEstimate + throttleEstimate + frameEstimate + wheelsTiresEstimate + brakesEstimate;
        
        allInsights.push({
          id: 'ev-cost',
          type: 'cost',
          title: 'Estimated System Cost',
          message: `Complete EV system estimate including motor, battery, controller, charger, and safety components.`,
          icon: <DollarSign className="w-5 h-5" />,
          priority: 'medium',
          category: 'cost',
          metrics: [
            { label: 'Motor', value: formatPrice(motorCost), unit: '' },
            { label: 'Components', value: formatPrice(Math.round(batteryEstimate + controllerEstimate + chargerEstimate + bmsEstimate + wiringEstimate + throttleEstimate + frameEstimate + wheelsTiresEstimate + brakesEstimate)), unit: '' },
            { label: 'Total', value: formatPrice(Math.round(totalEstimate)), unit: '' },
          ],
          action: {
            label: 'Plan EV Build',
            href: '/builder'
          }
        });
      }
    }
    
    // NEXT STEPS
    if (currentItem) {
      if (isEngine) {
        const engine = currentItem as Engine;
        allInsights.push({
          id: 'next-steps',
          type: 'action',
          title: 'Next Steps',
          message: `1) Add to build, 2) Select compatible clutch/TC, 3) Choose sprockets, 4) Complete remaining parts.`,
          icon: <ArrowRight className="w-5 h-5" />,
          priority: 'high',
          category: 'next',
          action: variant === 'builder-page' ? undefined : {
            label: 'Start Building',
            href: `/builder?engine=${engine.slug || engine.id}`
          }
        });
      } else if (isMotor) {
        const motor = currentItem as ElectricMotor;
        allInsights.push({
          id: 'next-steps-ev',
          type: 'action',
          title: 'Next Steps',
          message: `1) Add motor, 2) Select ${motor.voltage}V battery, 3) Choose ${motor.voltage}V controller, 4) Add charger & safety components.`,
          icon: <ArrowRight className="w-5 h-5" />,
          priority: 'high',
          category: 'next',
          action: variant === 'builder-page' ? undefined : {
            label: 'Start EV Build',
            href: `/builder?motor=${motor.slug || motor.id}`
          }
        });
      }
    }
    
    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    allInsights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    return allInsights;
  }, [engines, motors, currentItem, currentPowerSource, variant, selectedParts, category]);
  
  // Group insights by category
  const groupedInsights = useMemo(() => {
    const groups: Record<string, Insight[]> = {
      critical: [],
      performance: [],
      cost: [],
      next: [],
      recommendations: [],
    };
    
    insights.forEach(insight => {
      groups[insight.category].push(insight);
    });
    
    return groups;
  }, [insights]);
  
  const getInsightStyles = (type: Insight['type']) => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          text: 'text-red-400',
          iconBg: 'bg-red-500/20',
        };
      case 'tip':
      case 'info':
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          text: 'text-blue-400',
          iconBg: 'bg-blue-500/20',
        };
      case 'recommendation':
        return {
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/30',
          text: 'text-orange-400',
          iconBg: 'bg-orange-500/20',
        };
      case 'success':
        return {
          bg: 'bg-green-500/10',
          border: 'border-green-500/30',
          text: 'text-green-400',
          iconBg: 'bg-green-500/20',
        };
      case 'action':
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          text: 'text-blue-400',
          iconBg: 'bg-blue-500/20',
        };
      case 'performance':
        return {
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/30',
          text: 'text-purple-400',
          iconBg: 'bg-purple-500/20',
        };
      case 'cost':
        return {
          bg: 'bg-green-500/10',
          border: 'border-green-500/30',
          text: 'text-green-400',
          iconBg: 'bg-green-500/20',
        };
      default:
        return {
          bg: 'bg-olive-800/50',
          border: 'border-olive-600',
          text: 'text-cream-300',
          iconBg: 'bg-olive-700/50',
        };
    }
  };
  
  const sectionLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    critical: { label: 'Critical Requirements', icon: <AlertTriangle className="w-5 h-5" />, color: 'text-red-400' },
    performance: { label: 'Performance Insights', icon: <Gauge className="w-5 h-5" />, color: 'text-purple-400' },
    cost: { label: 'Cost Estimates', icon: <DollarSign className="w-5 h-5" />, color: 'text-green-400' },
    next: { label: 'Next Steps', icon: <ArrowRight className="w-5 h-5" />, color: 'text-blue-400' },
    recommendations: { label: 'Recommendations', icon: <Sparkles className="w-5 h-5" />, color: 'text-orange-400' },
  };
  
  const goalOptions: Array<{ value: RecommendationGoal; label: string; icon: React.ReactNode }> = [
    { value: 'speed', label: 'Speed', icon: <Zap className="w-4 h-4" /> },
    { value: 'torque', label: 'Torque', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'reliability', label: 'Reliability', icon: <Shield className="w-4 h-4" /> },
    { value: 'budget', label: 'Budget', icon: <DollarSign className="w-4 h-4" /> },
  ];
  
  // Tab definitions
  const tabs = [
    {
      id: 'live-tools' as TabType,
      label: 'Live Tools',
      icon: <Calculator className="w-4 h-4" />,
      description: 'Interactive calculators using your current build',
    },
    {
      id: 'manual-specs' as TabType,
      label: 'Manual & Specs',
      icon: <FileText className="w-4 h-4" />,
      description: 'Engine manual and torque specifications',
    },
    {
      id: 'templates' as TabType,
      label: 'Templates',
      icon: <Layers className="w-4 h-4" />,
      description: 'Pre-built configurations for common build goals',
      showOnlyOnBuilder: true,
    },
    {
      id: 'useful-guides' as TabType,
      label: 'Useful Guides',
      icon: <BookOpen className="w-4 h-4" />,
      description: 'Guides related to your current build',
    },
    {
      id: 'visual-comparison' as TabType,
      label: 'Visual Comparison',
      icon: <BarChart3 className="w-4 h-4" />,
      description: 'HP vs cost and EV vs gas',
      showOnlyOnEnginesPage: true,
    },
    {
      id: 'recommendations' as TabType,
      label: 'Recommendations',
      icon: <Sparkles className="w-4 h-4" />,
      description: 'Suggested parts and upgrade paths',
      showOnlyOnBuilder: true,
    },
  ].filter(tab => {
    // Filter based on variant
    if (variant !== 'builder-page' && tab.showOnlyOnBuilder) return false;
    if (variant !== 'engines-page' && (tab as { showOnlyOnEnginesPage?: boolean }).showOnlyOnEnginesPage) return false;
    
    // Manual & Specs tab is always visible (shows message when no engine selected)
    // Other tabs that require engine/motor selection are handled in their content
    
    return true;
  });
  
  return (
    <div className="bg-olive-800/30 rounded-xl border border-olive-700/50 overflow-hidden shadow-lg mb-8">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-olive-700/50 bg-olive-800/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <Calculator className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-cream-100">Builder Insights</h2>
              <p className="text-sm text-cream-400 mt-0.5">{tabs.find(t => t.id === activeTab)?.description || 'Interactive calculators using your current build'}</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-olive-700/50 rounded-lg transition-colors"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-cream-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-cream-400" />
            )}
          </button>
        </div>
        
        {/* Engine / motor context — minimal, professional */}
        <div className="flex items-center gap-2 min-h-[28px]">
          {currentItem ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-cream-200 bg-olive-700/40 border border-olive-600/50 rounded-md px-2.5 py-1.5">
              {isEngine ? (
                <Cog className="w-3.5 h-3.5 text-orange-400 shrink-0" aria-hidden />
              ) : (
                <Battery className="w-3.5 h-3.5 text-blue-400 shrink-0" aria-hidden />
              )}
              <span className="truncate max-w-[280px] sm:max-w-none">
                Insights for {currentItem.brand} {currentItem.name}
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-cream-500 bg-olive-800/50 border border-olive-700/50 rounded-md px-2.5 py-1.5">
              <Info className="w-3.5 h-3.5 shrink-0 opacity-70" aria-hidden />
              {variant === 'engines-page'
                ? 'No engine or motor selected — select one below to see insights'
                : 'No engine or motor selected — select one to see insights'}
            </span>
          )}
        </div>
        
        {/* Tab Navigation */}
        {isExpanded && (
          <div className="flex items-center gap-1 border-b border-olive-700/50 -mx-6 -mb-6 px-6 pb-0">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'relative px-4 py-2.5 text-sm font-medium transition-all border-b-2 rounded-t-lg',
                    isActive
                      ? 'text-orange-400 border-orange-400 bg-orange-500/5'
                      : 'text-cream-400 border-transparent hover:text-cream-200 hover:bg-olive-800/30'
                  )}
                >
                  <div className="flex items-center gap-2">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      
      {isExpanded && (
      <div className="p-0">
        {/* Templates Tab */}
        {activeTab === 'templates' && variant === 'builder-page' && (
          <div className="p-4 sm:p-6">
            {templatesLoading ? (
              <div className="flex gap-4 overflow-hidden">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-72 flex-shrink-0 h-48 bg-olive-700/50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : !selectedEngineId ? (
              <div className="py-8 text-center">
                <Cog className="w-12 h-12 text-cream-400 mx-auto mb-3 opacity-50" />
                <p className="text-cream-400">Select an engine to see templates</p>
                <p className="text-xs text-cream-500 mt-1">Templates are tailored to your chosen engine type</p>
              </div>
            ) : templates.length === 0 ? (
              <div className="py-8 text-center">
                <Layers className="w-12 h-12 text-cream-400 mx-auto mb-3 opacity-50" />
                <p className="text-cream-400">No templates for this engine yet</p>
                <p className="text-xs text-cream-500 mt-1">Browse all templates in the Templates section</p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                  onClick={() => router.push('/templates')}
                >
                  View All Templates
                </Button>
              </div>
            ) : (
              <div className="relative">
                {/* Scroll Buttons */}
                <button
                  onClick={() => {
                    const container = document.getElementById('templates-scroll-container');
                    if (container) {
                      container.scrollBy({ left: -300, behavior: 'smooth' });
                    }
                  }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-olive-900/90 hover:bg-olive-800 border border-olive-600 rounded-full flex items-center justify-center text-cream-200 hover:text-orange-400 transition-colors shadow-lg -ml-2"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    const container = document.getElementById('templates-scroll-container');
                    if (container) {
                      container.scrollBy({ left: 300, behavior: 'smooth' });
                    }
                  }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-olive-900/90 hover:bg-olive-800 border border-olive-600 rounded-full flex items-center justify-center text-cream-200 hover:text-orange-400 transition-colors shadow-lg -mr-2"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                {/* Templates Carousel */}
                <div
                  id="templates-scroll-container"
                  className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 px-1 -mx-1 snap-x snap-mandatory"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {templates.map((template) => {
                    const GoalIcon = TEMPLATE_GOAL_ICONS[template.goal] || Layers;
                    const goalLabel = TEMPLATE_GOAL_LABELS[template.goal] || template.goal;
                    
                    return (
                      <div
                        key={template.id}
                        className="w-72 flex-shrink-0 snap-start bg-gradient-to-br from-olive-800/80 to-olive-900/60 rounded-xl border border-olive-600/50 hover:border-orange-500/50 transition-all duration-200 overflow-hidden group cursor-pointer hover:shadow-xl hover:shadow-orange-500/5"
                        onClick={() => router.push(`/builder?template=${template.id}`)}
                      >
                        {/* Header */}
                        <div className="p-4 border-b border-olive-700/50 bg-olive-800/40">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                <GoalIcon className="w-4 h-4 text-orange-400" />
                              </div>
                              <Badge variant="default" size="sm" className="text-xs">
                                {goalLabel}
                              </Badge>
                            </div>
                            {template.total_price && (
                              <span className="text-sm font-semibold text-orange-400 tabular-nums">
                                {formatPrice(template.total_price)}
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-cream-100 group-hover:text-orange-400 transition-colors line-clamp-1">
                            {template.name}
                          </h3>
                        </div>
                        
                        {/* Body */}
                        <div className="p-4">
                          {template.description && (
                            <p className="text-xs text-cream-400 line-clamp-2 mb-3">
                              {template.description}
                            </p>
                          )}
                          
                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {template.estimated_hp && (
                              <div className="flex items-center gap-1.5 text-xs">
                                <Zap className="w-3 h-3 text-orange-400" />
                                <span className="text-cream-300">{template.estimated_hp} HP</span>
                              </div>
                            )}
                            {template.estimated_torque && (
                              <div className="flex items-center gap-1.5 text-xs">
                                <Gauge className="w-3 h-3 text-blue-400" />
                                <span className="text-cream-300">{template.estimated_torque} lb-ft</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Apply Button */}
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full text-xs group-hover:border-orange-500 group-hover:text-orange-400"
                            icon={<ArrowRight className="w-3 h-3" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/builder?template=${template.id}`);
                            }}
                          >
                            Apply Template
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* View All Card */}
                  <div
                    className="w-56 flex-shrink-0 snap-start bg-olive-800/30 rounded-xl border border-olive-600/30 border-dashed hover:border-orange-500/50 transition-all duration-200 flex flex-col items-center justify-center p-6 cursor-pointer group"
                    onClick={() => router.push('/templates')}
                  >
                    <div className="p-3 rounded-full bg-olive-700/50 group-hover:bg-orange-500/10 mb-3 transition-colors">
                      <Plus className="w-6 h-6 text-cream-400 group-hover:text-orange-400 transition-colors" />
                    </div>
                    <p className="text-sm font-medium text-cream-300 group-hover:text-cream-100 text-center">
                      View All Templates
                    </p>
                    <p className="text-xs text-cream-500 mt-1">
                      {templates.length} available
                    </p>
                  </div>
                </div>
                
                {/* Scroll Indicator Dots */}
                <div className="flex items-center justify-center gap-1.5 mt-4">
                  {Array.from({ length: Math.min(5, Math.ceil(templates.length / 3)) }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-olive-600"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Live Tools Tab */}
        {activeTab === 'live-tools' && (
          <div className="p-4 sm:p-6">
            <LiveToolsContent />
          </div>
        )}
        
        {/* Manual & Specs Tab */}
        {activeTab === 'manual-specs' && (
          <div className="p-4 sm:p-6">
            {!isEngine || !currentItem ? (
              <div className="py-8 text-center">
                <FileText className="w-12 h-12 text-cream-400 mx-auto mb-3 opacity-50" />
                <p className="text-cream-400">
                  Select an engine or motor to view manual and torque specifications
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {(() => {
                  const engine = currentItem as Engine;
                  // Check if manual_url exists and is not empty (handle null, undefined, and empty strings)
                  // Also check schematic_url as fallback (some engines might only have schematic)
                  const manualUrl = engine.manual_url || engine.schematic_url;
                  const hasManual = manualUrl && typeof manualUrl === 'string' && manualUrl.trim().length > 0;
                  const hasTorqueSpecs = !!getTorqueSpecs(engine.slug);
                  
                  // Debug: Log engine data to help diagnose (always log for troubleshooting)
                  console.log('[BuilderInsights] Engine data:', {
                    engineName: `${engine.brand} ${engine.name}`,
                    hasManual,
                    manualUrl,
                    manual_url: engine.manual_url,
                    schematic_url: engine.schematic_url,
                    hasTorqueSpecs,
                    engineSlug: engine.slug,
                    fullEngine: engine,
                  });
                  
                  if (!hasManual && !hasTorqueSpecs) {
                    return (
                      <div className="py-8 text-center">
                        <FileText className="w-12 h-12 text-cream-400 mx-auto mb-3 opacity-50" />
                        <p className="text-cream-400">
                          Manual and torque specifications are not available for this engine
                        </p>
                        <p className="text-xs text-cream-500 mt-2">
                          Debug: manual_url = {engine.manual_url ? `"${engine.manual_url}"` : 'null/undefined'}
                        </p>
                      </div>
                    );
                  }
                  
                  // Always display side-by-side when both are available
                  const itemCount = (hasManual ? 1 : 0) + (hasTorqueSpecs ? 1 : 0);
                  
                  return (
                    <div className={itemCount > 1 ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "max-w-md"}>
                      {hasManual && manualUrl && (
                        <ManualCard
                          manualUrl={manualUrl}
                          engineName={`${engine.brand} ${engine.name}`}
                          type="manual"
                        />
                      )}
                      {hasTorqueSpecs && (
                        <EngineTorqueSpecs
                          engine={engine}
                          compact={true}
                        />
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
        
        {/* Useful Guides Tab */}
        {activeTab === 'useful-guides' && (
          <div className="p-4 sm:p-6">
            {loadingGuides ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-olive-700/50 h-24 rounded-lg" />
                ))}
              </div>
            ) : relevantGuides.length === 0 ? (
              <div className="py-8 text-center">
                <BookOpen className="w-12 h-12 text-cream-400 mx-auto mb-3 opacity-50" />
                <p className="text-cream-400">
                  {!currentItem && selectedParts.size === 0
                    ? 'Select an engine, motor, or add parts to see relevant guides'
                    : 'No guides available for your current selection. Guides will appear here as you add related parts or select an engine/motor.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2">
                {relevantGuides.map((guide) => (
                  <Link
                    key={guide.id}
                    href={`/guides/${guide.slug}`}
                    className="block p-2.5 bg-olive-700/30 rounded-md border border-olive-600 hover:border-orange-500 transition-all group"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-cream-100 group-hover:text-orange-400 transition-colors line-clamp-1">
                            {guide.title}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {guide.difficulty_level && (
                            <Badge
                              variant={
                                guide.difficulty_level === 'beginner' ? 'success' :
                                guide.difficulty_level === 'intermediate' ? 'info' :
                                guide.difficulty_level === 'advanced' ? 'warning' :
                                'error'
                              }
                              size="sm"
                              className="text-xs"
                            >
                              {guide.difficulty_level}
                            </Badge>
                          )}
                          {guide.estimated_time_minutes && (
                            <div className="flex items-center gap-1 text-xs text-cream-400">
                              <Clock className="w-3 h-3" />
                              <span>{guide.estimated_time_minutes}m</span>
                            </div>
                          )}
                          {guide.category && (
                            <Badge variant="default" size="sm" className="text-xs">
                              {guide.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-cream-400 group-hover:text-orange-400 transition-colors flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Visual Comparison Tab (Engines Page Only) */}
        {activeTab === 'visual-comparison' && variant === 'engines-page' && (
          <div className="p-4 sm:p-6">
            <BuilderInsightsVisualComparison
              engines={engines ?? []}
              motors={motors ?? []}
              maxItems={12}
            />
          </div>
        )}
        
        {/* Recommendations Tab (Builder Page Only) */}
        {activeTab === 'recommendations' && variant === 'builder-page' && (
          <div className="p-4 sm:p-6">
            {!selectedEngine && !selectedMotor ? (
              <div className="py-8 text-center">
                <Sparkles className="w-12 h-12 text-cream-400 mx-auto mb-3 opacity-50" />
                <p className="text-cream-400">Select an engine or motor to see recommendations</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Goal Selector */}
                {category && currentItem && (
                  <div className="p-4 border border-olive-700/50 rounded-lg bg-olive-800/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-orange-400" />
                      <span className="text-sm font-semibold text-cream-200">Build Goal</span>
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
                  </div>
                )}
                
                {/* Suggested Parts for Category */}
                {category && recommendations.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-orange-400" />
                      <h3 className="text-sm font-semibold text-cream-100">
                        Suggested {getCategoryLabel(category)}
                      </h3>
                    </div>
                    {recsLoading ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-16 bg-olive-600/50 rounded-lg animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {recommendations.slice(0, 5).map((part) => {
                          const hpGain = (part.specifications?.hp_contribution as number) || 0;
                          const partsArray = selectedParts.get(category) || [];
                          const isSelected = partsArray.some(p => p.id === part.id);
                          
                          return (
                            <div
                              key={part.id}
                              className={cn(
                                'p-3 rounded-lg border transition-all',
                                isSelected
                                  ? 'bg-orange-500/20 border-orange-500/50'
                                  : 'bg-olive-600/50 border-olive-600 hover:border-olive-500'
                              )}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-cream-100 line-clamp-1 text-sm">
                                    {part.name}
                                  </h4>
                                  <p className="text-xs text-cream-400 mt-0.5">{part.brand}</p>
                                  {hpGain > 0 && (
                                    <Badge variant="success" size="sm" className="mt-1.5">
                                      +{hpGain.toFixed(1)} HP
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="text-sm font-bold text-orange-400 mb-1">
                                    {part.price ? formatPrice(part.price) : 'Contact'}
                                  </div>
                                  {!isSelected && onAddPart && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => onAddPart(part)}
                                      icon={<Plus className="w-3 h-3" />}
                                      className="text-xs h-7"
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
                    )}
                  </div>
                )}
                
                {/* Popular Combinations */}
                {popularCombinations.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-blue-400" />
                      <h3 className="text-sm font-semibold text-cream-100">Popular Combinations</h3>
                    </div>
                    {combosLoading ? (
                      <div className="space-y-2">
                        {[1, 2].map((i) => (
                          <div key={i} className="h-16 bg-olive-600/50 rounded-lg animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
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
                  </div>
                )}
                
                {/* Upgrade Path */}
                {upgradePath.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowUp className="w-4 h-4 text-purple-400" />
                      <h3 className="text-sm font-semibold text-cream-100">Upgrade Path</h3>
                    </div>
                    {upgradeLoading ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-16 bg-olive-600/50 rounded-lg animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {upgradePath.slice(0, 5).map((step) => (
                          <div
                            key={step.step}
                            className="p-3 bg-olive-600/50 rounded-lg border border-olive-600"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-cream-100 flex items-center justify-center text-xs font-bold">
                                {step.step}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-cream-100 text-sm">
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
                                {step.recommendedPart && onAddPart && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-cream-300">
                                      {step.recommendedPart.name}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => onAddPart(step.recommendedPart!)}
                                      icon={<ArrowRight className="w-3 h-3" />}
                                      className="text-xs h-7"
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
                  </div>
                )}
                
                {/* Empty state */}
                {!category && !combosLoading && !upgradeLoading && recommendations.length === 0 && (
                  <div className="py-8 text-center">
                    <Sparkles className="w-12 h-12 text-cream-400 mx-auto mb-3 opacity-50" />
                    <p className="text-cream-400">Select a category to see recommendations</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      )}
    </div>
  );
}
