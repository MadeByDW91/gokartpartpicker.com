'use client';

import { useMemo, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle, 
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
  ChevronUp
} from 'lucide-react';
import { formatPrice, getCategoryLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Engine, ElectricMotor } from '@/types/database';

interface BuilderInsightsPanelProps {
  engines: Engine[];
  motors: ElectricMotor[];
  selectedItem?: Engine | ElectricMotor | null;
  activePowerSource?: 'gas' | 'electric' | 'all';
}

interface Insight {
  type: 'tip' | 'warning' | 'info' | 'recommendation' | 'success' | 'action';
  title: string;
  message: string;
  icon: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
  action?: {
    label: string;
    href: string;
  };
  category: 'critical' | 'performance' | 'cost' | 'next';
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
  { category: 'controller', label: 'Motor Controller', critical: true },
  { category: 'charger', label: 'Battery Charger', critical: true },
  { category: 'throttle', label: 'Throttle', critical: true },
  { category: 'bms', label: 'BMS (Battery Management System)', critical: true },
  { category: 'brake', label: 'Brakes', critical: true },
  { category: 'wheel', label: 'Wheels', critical: true },
  { category: 'tire', label: 'Tires', critical: true },
  { category: 'frame', label: 'Frame', critical: true },
];

export function BuilderInsightsPanel({ engines, motors, selectedItem, activePowerSource = 'all' }: BuilderInsightsPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['critical']));
  
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
    
    if (!selectedItem) {
      // When nothing selected, show actionable recommendations
      const relevantItems = activePowerSource === 'gas' 
        ? engines 
        : activePowerSource === 'electric'
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
          type: 'recommendation',
          title: 'Best Value Recommendation',
          message: `${bestValue.brand} ${bestValue.name} offers the best cost per horsepower at $${(bestValue.price! / bestValue.horsepower!).toFixed(0)}/HP (${formatPrice(bestValue.price!)}).`,
          icon: <TrendingUp className="w-4 h-4" />,
          priority: 'high',
          category: 'next',
          action: {
            label: 'View Details',
            href: `/engines/${bestValue.slug || bestValue.id}`
          }
        });
      }
      
      allInsights.push({
        type: 'action',
        title: 'Start Building',
        message: `Select an engine or motor to see detailed compatibility requirements, required parts checklist, and build estimates.`,
        icon: <Wrench className="w-4 h-4" />,
        priority: 'high',
        category: 'next',
        action: {
          label: 'Go to Builder',
          href: '/builder'
        }
      });
      
      return allInsights;
    }
    
    // Selected item insights - organized by category
    const isEngine = 'displacement_cc' in selectedItem;
    const item = selectedItem as Engine | ElectricMotor;
    
    if (isEngine) {
      const engine = item as Engine;
      
      // CRITICAL: Required parts & compatibility
      allInsights.push({
        type: 'warning',
        title: 'Required Parts',
        message: `${GAS_REQUIRED_PARTS.length} required parts: ${GAS_REQUIRED_PARTS.slice(0, 3).map(p => p.label).join(', ')}, and ${GAS_REQUIRED_PARTS.length - 3} more.`,
        icon: <Package className="w-4 h-4" />,
        priority: 'high',
        category: 'critical',
        action: {
          label: 'Open Builder',
          href: `/builder?engine=${engine.slug || engine.id}`
        }
      });
      
      if (engine.shaft_diameter) {
        allInsights.push({
          type: 'warning',
          title: 'Shaft Compatibility',
          message: `Requires ${engine.shaft_diameter}" clutch/TC bore. Incompatible parts won't work.`,
          icon: <AlertCircle className="w-4 h-4" />,
          priority: 'high',
          category: 'critical',
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
          type: 'recommendation',
          title: `${performanceTier} Performance`,
          message: `${recommendedRatio} gear ratio (${clutchTeeth} + ${axleTeeth} sprockets). Expected: ${speedEstimate}. ${engine.horsepower >= 10 ? '⚠️ Requires reinforced frame & quality brakes.' : ''}`,
          icon: <Target className="w-4 h-4" />,
          priority: 'high',
          category: 'performance',
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
          type: 'info',
          title: 'Estimated Build Cost',
          message: `Engine: ${formatPrice(engineCost)} + Parts (~${formatPrice(partsEstimate + frameEstimate + wheelsTiresEstimate + brakesEstimate + hardwareEstimate)}) = ~${formatPrice(totalEstimate)} total.`,
          icon: <DollarSign className="w-4 h-4" />,
          priority: 'medium',
          category: 'cost',
          action: {
            label: 'Plan Build Cost',
            href: '/builder'
          }
        });
      }
      
      // NEXT STEPS
      allInsights.push({
        type: 'action',
        title: 'Next Steps',
        message: `1) Add to build, 2) Select compatible clutch/TC, 3) Choose sprockets, 4) Complete remaining parts.`,
        icon: <ArrowRight className="w-4 h-4" />,
        priority: 'high',
        category: 'next',
        action: {
          label: 'Start Building',
          href: `/builder?engine=${engine.slug || engine.id}`
        }
      });
      
    } else {
      // Electric motor insights
      const motor = item as ElectricMotor;
      
      // CRITICAL: Required components & voltage
      allInsights.push({
        type: 'warning',
        title: 'Required Components',
        message: `${EV_REQUIRED_PARTS.length} required: Battery, Controller, Charger, Throttle, BMS, Brakes, Wheels, Tires, Frame. All must match ${motor.voltage}V.`,
        icon: <Package className="w-4 h-4" />,
        priority: 'high',
        category: 'critical',
        action: {
          label: 'Open EV Builder',
          href: `/builder?motor=${motor.slug || motor.id}`
        }
      });
      
      allInsights.push({
        type: 'warning',
        title: 'Voltage Matching',
        message: `ALL components must be ${motor.voltage}V: battery, controller, charger. Mixing voltages will cause failure.`,
        icon: <AlertCircle className="w-4 h-4" />,
        priority: 'high',
        category: 'critical',
        action: {
          label: `Find ${motor.voltage}V Parts`,
          href: `/parts?voltage=${motor.voltage}`
        }
      });
      
      // PERFORMANCE: Battery sizing & speed
      allInsights.push({
        type: 'recommendation',
        title: 'Battery Sizing',
        message: `Light use: 10-15 Ah (~$${Math.round(motor.voltage * 1.5)}-${Math.round(motor.voltage * 2)}). Recreational: 20-30 Ah (~$${Math.round(motor.voltage * 2)}-${Math.round(motor.voltage * 3)}). Extended: 40+ Ah (~$${Math.round(motor.voltage * 3)}+).`,
        icon: <Battery className="w-4 h-4" />,
        priority: 'high',
        category: 'performance',
        action: {
          label: 'Find Batteries',
          href: `/parts?category=battery&voltage=${motor.voltage}`
        }
      });
      
      if (motor.horsepower) {
        let speedEstimate = '30-35 mph';
        let rangeEstimate = '15-20 miles';
        
        if (motor.horsepower >= 5 && motor.horsepower < 10) {
          speedEstimate = '35-45 mph';
          rangeEstimate = '20-25 miles';
        } else if (motor.horsepower >= 10) {
          speedEstimate = '45-55+ mph';
          rangeEstimate = '25-35 miles';
        }
        
        allInsights.push({
          type: 'success',
          title: 'Performance Estimate',
          message: `${speedEstimate} top speed. Range: ${rangeEstimate} per charge (varies with battery capacity).`,
          icon: <Zap className="w-4 h-4" />,
          priority: 'high',
          category: 'performance',
        });
      }
      
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
          type: 'info',
          title: 'Estimated System Cost',
          message: `Motor: ${formatPrice(motorCost)} + Components (~${formatPrice(Math.round(batteryEstimate + controllerEstimate + chargerEstimate + bmsEstimate + wiringEstimate + throttleEstimate + frameEstimate + wheelsTiresEstimate + brakesEstimate))}) = ~${formatPrice(Math.round(totalEstimate))} total.`,
          icon: <DollarSign className="w-4 h-4" />,
          priority: 'medium',
          category: 'cost',
          action: {
            label: 'Plan EV Build',
            href: '/builder'
          }
        });
      }
      
      // NEXT STEPS
      allInsights.push({
        type: 'action',
        title: 'Next Steps',
        message: `1) Add motor, 2) Select ${motor.voltage}V battery, 3) Choose ${motor.voltage}V controller, 4) Add charger & safety components.`,
        icon: <ArrowRight className="w-4 h-4" />,
        priority: 'high',
        category: 'next',
        action: {
          label: 'Start EV Build',
          href: `/builder?motor=${motor.slug || motor.id}`
        }
      });
    }
    
    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    allInsights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    return allInsights;
  }, [engines, motors, selectedItem, activePowerSource]);
  
  // Group insights by category
  const groupedInsights = useMemo(() => {
    const groups: Record<string, Insight[]> = {
      critical: [],
      performance: [],
      cost: [],
      next: [],
    };
    
    insights.forEach(insight => {
      groups[insight.category].push(insight);
    });
    
    return groups;
  }, [insights]);
  
  const getInsightStyles = (type: Insight['type']) => {
    switch (type) {
      case 'warning':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'tip':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'recommendation':
        return 'bg-orange-500/10 border-orange-500/30 text-orange-400';
      case 'success':
        return 'bg-green-500/10 border-green-500/30 text-green-400';
      case 'action':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-300';
      default:
        return 'bg-olive-800/50 border-olive-600 text-cream-300';
    }
  };
  
  const sectionLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    critical: { label: 'Critical Requirements', icon: <AlertTriangle className="w-4 h-4" /> },
    performance: { label: 'Performance', icon: <Gauge className="w-4 h-4" /> },
    cost: { label: 'Cost Estimate', icon: <DollarSign className="w-4 h-4" /> },
    next: { label: 'Next Steps', icon: <ArrowRight className="w-4 h-4" /> },
  };
  
  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-orange-400" />
        <h2 className="text-lg font-semibold text-cream-100">Builder Insights</h2>
        {selectedItem && (
          <Badge variant="default" size="sm" className="ml-auto">
            {insights.length}
          </Badge>
        )}
      </div>
      
      {insights.length > 0 ? (
        <div className="space-y-2">
          {Object.entries(groupedInsights).map(([category, categoryInsights]) => {
            if (categoryInsights.length === 0) return null;
            
            const isExpanded = expandedSections.has(category);
            const section = sectionLabels[category];
            
            return (
              <div key={category} className="border border-olive-700/50 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection(category)}
                  className="w-full flex items-center justify-between p-3 bg-olive-800/30 hover:bg-olive-800/40 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {section.icon}
                    <span className="text-sm font-semibold text-cream-100">{section.label}</span>
                    <Badge variant="default" size="sm" className="ml-1">
                      {categoryInsights.length}
                    </Badge>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-cream-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-cream-400" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="p-3 space-y-2 bg-olive-800/20">
                    {categoryInsights.map((insight, index) => (
                      <div
                        key={index}
                        className={cn('p-3 rounded border text-sm', getInsightStyles(insight.type))}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="flex-shrink-0 mt-0.5">
                            {insight.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-cream-100 mb-1">
                              {insight.title}
                            </h3>
                            <p className="text-xs leading-relaxed text-cream-200/90 mb-1.5">
                              {insight.message}
                            </p>
                            {insight.action && (
                              <Link
                                href={insight.action.href}
                                className="inline-flex items-center gap-1 text-xs font-medium text-orange-400 hover:text-orange-300 transition-colors"
                              >
                                {insight.action.label}
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 bg-olive-800/30 rounded-lg border border-olive-700/30">
          <p className="text-sm text-cream-400/80 text-center">
            Loading insights...
          </p>
        </div>
      )}
    </div>
  );
}
