'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  CircleDot, 
  Settings, 
  DollarSign, 
  Wrench, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Zap,
  Gauge,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type BrakeType = 'mechanical' | 'hydraulic' | null;
type UseCase = 'racing' | 'recreational' | 'off-road' | 'budget' | null;
type KartWeight = 'light' | 'medium' | 'heavy' | null;
type TopSpeed = 'low' | 'medium' | 'high' | null;

interface BrakeSystemComparison {
  type: 'mechanical' | 'hydraulic';
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  cost: { min: number; max: number; avg: number };
  installation: { difficulty: 'easy' | 'medium' | 'hard'; time: string };
  performance: { stopping: number; maintenance: number; reliability: number };
  bestFor: string[];
  notRecommendedFor: string[];
}

const brakeSystems: BrakeSystemComparison[] = [
  {
    type: 'mechanical',
    name: 'Mechanical Brake',
    description: 'Cable-actuated brake system using a lever and cable to engage the brake pad or band.',
    pros: [
      'Lower cost ($20-$80)',
      'Simple installation',
      'Easy to maintain and adjust',
      'No fluid required',
      'Lightweight',
      'Good for low to medium speeds',
    ],
    cons: [
      'Less stopping power',
      'Requires more force to engage',
      'Cable can stretch over time',
      'Not ideal for high speeds',
      'May fade under heavy use',
    ],
    cost: { min: 20, max: 80, avg: 50 },
    installation: { difficulty: 'easy', time: '30-60 minutes' },
    performance: { stopping: 6, maintenance: 8, reliability: 7 },
    bestFor: [
      'Recreational go-karts',
      'Budget builds',
      'Low to medium speeds (< 30 mph)',
      'Lightweight karts',
      'Beginner builders',
    ],
    notRecommendedFor: [
      'High-speed racing',
      'Heavy karts (> 300 lbs)',
      'Frequent hard braking',
    ],
  },
  {
    type: 'hydraulic',
    name: 'Hydraulic Brake',
    description: 'Fluid-actuated brake system using a master cylinder and brake caliper for powerful, consistent stopping.',
    pros: [
      'Superior stopping power',
      'Consistent performance',
      'Less force required to engage',
      'Better for high speeds',
      'More reliable under heavy use',
      'Professional feel',
    ],
    cons: [
      'Higher cost ($100-$300+)',
      'More complex installation',
      'Requires brake fluid',
      'Bleeding required',
      'Heavier system',
      'More maintenance',
    ],
    cost: { min: 100, max: 300, avg: 200 },
    installation: { difficulty: 'hard', time: '2-4 hours' },
    performance: { stopping: 9, maintenance: 6, reliability: 9 },
    bestFor: [
      'Racing go-karts',
      'High-speed builds (> 30 mph)',
      'Heavy karts (> 300 lbs)',
      'Frequent hard braking',
      'Professional builds',
    ],
    notRecommendedFor: [
      'Budget builds',
      'Very lightweight karts',
      'Beginner builders (complexity)',
    ],
  },
];

export default function BrakeSelectorPage() {
  const [selectedType, setSelectedType] = useState<BrakeType>(null);
  const [useCase, setUseCase] = useState<UseCase>(null);
  const [kartWeight, setKartWeight] = useState<KartWeight>(null);
  const [topSpeed, setTopSpeed] = useState<TopSpeed>(null);

  // Calculate recommendation based on inputs
  const recommendation = useMemo(() => {
    if (!useCase && !kartWeight && !topSpeed) return null;

    let mechanicalScore = 0;
    let hydraulicScore = 0;

    // Use case scoring
    if (useCase === 'budget' || useCase === 'recreational') mechanicalScore += 3;
    if (useCase === 'racing') hydraulicScore += 3;
    if (useCase === 'off-road') {
      mechanicalScore += 1;
      hydraulicScore += 2; // Hydraulic better for off-road reliability
    }

    // Weight scoring
    if (kartWeight === 'light') mechanicalScore += 2;
    if (kartWeight === 'medium') {
      mechanicalScore += 1;
      hydraulicScore += 1;
    }
    if (kartWeight === 'heavy') hydraulicScore += 3;

    // Speed scoring
    if (topSpeed === 'low') mechanicalScore += 2;
    if (topSpeed === 'medium') {
      mechanicalScore += 1;
      hydraulicScore += 1;
    }
    if (topSpeed === 'high') hydraulicScore += 3;

    if (mechanicalScore === hydraulicScore) return 'either';
    return mechanicalScore > hydraulicScore ? 'mechanical' : 'hydraulic';
  }, [useCase, kartWeight, topSpeed]);

  const recommendedSystem = recommendation && recommendation !== 'either' 
    ? brakeSystems.find(s => s.type === recommendation) 
    : null;

  return (
    <div className="min-h-screen bg-olive-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/tools"
            className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Tools
          </Link>
          <div>
            <h1 className="text-display text-3xl text-cream-100 mb-2">Brake System Selector</h1>
            <p className="text-cream-300">
              Compare mechanical vs hydraulic brakes and find the right system for your go-kart build
            </p>
          </div>
        </div>

        {/* Decision Tree / Inputs */}
        <Card className="mb-8 border-orange-500/30 bg-gradient-to-br from-orange-500/5 via-olive-800/40 to-olive-800/40">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <Settings className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-cream-100">Find Your Brake System</h2>
                <p className="text-sm text-cream-400 mt-0.5">Answer a few questions to get a recommendation</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Use Case */}
              <div>
                <label className="block text-sm font-medium text-cream-200 mb-2">
                  Primary Use Case
                </label>
                <select
                  value={useCase || ''}
                  onChange={(e) => setUseCase(e.target.value as UseCase || null)}
                  className="w-full px-3 py-2 bg-olive-800/70 border border-olive-700/50 rounded-lg text-cream-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  <option value="">Select use case...</option>
                  <option value="racing">Racing</option>
                  <option value="recreational">Recreational</option>
                  <option value="off-road">Off-Road</option>
                  <option value="budget">Budget Build</option>
                </select>
              </div>

              {/* Kart Weight */}
              <div>
                <label className="block text-sm font-medium text-cream-200 mb-2">
                  Kart Weight
                </label>
                <select
                  value={kartWeight || ''}
                  onChange={(e) => setKartWeight(e.target.value as KartWeight || null)}
                  className="w-full px-3 py-2 bg-olive-800/70 border border-olive-700/50 rounded-lg text-cream-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  <option value="">Select weight...</option>
                  <option value="light">Light (&lt; 200 lbs)</option>
                  <option value="medium">Medium (200-300 lbs)</option>
                  <option value="heavy">Heavy (&gt; 300 lbs)</option>
                </select>
              </div>

              {/* Top Speed */}
              <div>
                <label className="block text-sm font-medium text-cream-200 mb-2">
                  Expected Top Speed
                </label>
                <select
                  value={topSpeed || ''}
                  onChange={(e) => setTopSpeed(e.target.value as TopSpeed || null)}
                  className="w-full px-3 py-2 bg-olive-800/70 border border-olive-700/50 rounded-lg text-cream-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  <option value="">Select speed...</option>
                  <option value="low">Low (&lt; 25 mph)</option>
                  <option value="medium">Medium (25-40 mph)</option>
                  <option value="high">High (&gt; 40 mph)</option>
                </select>
              </div>
            </div>

            {/* Recommendation */}
            {recommendation && (
              <div className={cn(
                "p-4 rounded-lg border-2",
                recommendation === 'either' 
                  ? "bg-blue-500/10 border-blue-500/30"
                  : recommendation === 'mechanical'
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-orange-500/10 border-orange-500/30"
              )}>
                <div className="flex items-start gap-3">
                  {recommendation === 'either' ? (
                    <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-cream-100 mb-1">
                      {recommendation === 'either' 
                        ? 'Either System Works'
                        : `Recommended: ${recommendedSystem?.name}`}
                    </h3>
                    <p className="text-sm text-cream-400">
                      {recommendation === 'either' 
                        ? 'Both mechanical and hydraulic brakes would work well for your build. Choose based on budget and preference.'
                        : recommendedSystem?.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setUseCase(null);
                setKartWeight(null);
                setTopSpeed(null);
                setSelectedType(null);
              }}
              className="mt-4 text-cream-400 hover:text-cream-100"
            >
              Clear all
            </Button>
          </CardContent>
        </Card>

        {/* Comparison Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {brakeSystems.map((system) => (
            <Card
              key={system.type}
              className={cn(
                "border-2 transition-all",
                selectedType === system.type
                  ? "border-orange-500 bg-orange-500/10"
                  : "border-olive-700/50 bg-olive-800/40 hover:border-olive-600"
              )}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-cream-100">{system.name}</h2>
                  <Button
                    variant={selectedType === system.type ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedType(selectedType === system.type ? null : system.type)}
                  >
                    {selectedType === system.type ? 'Selected' : 'Select'}
                  </Button>
                </div>
                <p className="text-cream-400 text-sm">{system.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cost */}
                <div className="p-3 bg-olive-800/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-cream-200">Cost</span>
                  </div>
                  <p className="text-cream-100 font-semibold">
                    ${system.cost.min}-${system.cost.max} (avg: ${system.cost.avg})
                  </p>
                </div>

                {/* Installation */}
                <div className="p-3 bg-olive-800/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Wrench className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-cream-200">Installation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        system.installation.difficulty === 'easy' ? 'success' :
                        system.installation.difficulty === 'medium' ? 'default' : 'warning'
                      }
                    >
                      {system.installation.difficulty}
                    </Badge>
                    <span className="text-sm text-cream-400">{system.installation.time}</span>
                  </div>
                </div>

                {/* Performance Ratings */}
                <div className="p-3 bg-olive-800/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Gauge className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-cream-200">Performance</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-cream-400">Stopping Power</span>
                      <div className="flex gap-1">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "w-2 h-2 rounded-full",
                              i < system.performance.stopping
                                ? "bg-green-400"
                                : "bg-olive-700"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-cream-400">Maintenance Ease</span>
                      <div className="flex gap-1">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "w-2 h-2 rounded-full",
                              i < system.performance.maintenance
                                ? "bg-blue-400"
                                : "bg-olive-700"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-cream-400">Reliability</span>
                      <div className="flex gap-1">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "w-2 h-2 rounded-full",
                              i < system.performance.reliability
                                ? "bg-orange-400"
                                : "bg-olive-700"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pros */}
                <div>
                  <h3 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Pros
                  </h3>
                  <ul className="space-y-1">
                    {system.pros.map((pro, i) => (
                      <li key={i} className="text-sm text-cream-300 flex items-start gap-2">
                        <CircleDot className="w-3 h-3 text-green-400 mt-1.5 flex-shrink-0" />
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cons */}
                <div>
                  <h3 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-1">
                    <XCircle className="w-4 h-4" />
                    Cons
                  </h3>
                  <ul className="space-y-1">
                    {system.cons.map((con, i) => (
                      <li key={i} className="text-sm text-cream-300 flex items-start gap-2">
                        <CircleDot className="w-3 h-3 text-red-400 mt-1.5 flex-shrink-0" />
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Best For */}
                <div className="pt-2 border-t border-olive-700/50">
                  <h3 className="text-sm font-semibold text-cream-200 mb-2">Best For</h3>
                  <div className="flex flex-wrap gap-2">
                    {system.bestFor.map((item, i) => (
                      <Badge key={i} variant="default" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Side-by-Side Comparison */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-cream-100">Quick Comparison</h2>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-olive-700/50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-cream-200">Feature</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-cream-200">Mechanical</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-cream-200">Hydraulic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-olive-700/30">
                  <tr>
                    <td className="py-3 px-4 text-sm text-cream-300">Cost</td>
                    <td className="py-3 px-4 text-center text-sm text-cream-100">$20-$80</td>
                    <td className="py-3 px-4 text-center text-sm text-cream-100">$100-$300+</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-sm text-cream-300">Installation</td>
                    <td className="py-3 px-4 text-center text-sm text-cream-100">Easy (30-60 min)</td>
                    <td className="py-3 px-4 text-center text-sm text-cream-100">Hard (2-4 hours)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-sm text-cream-300">Stopping Power</td>
                    <td className="py-3 px-4 text-center text-sm text-cream-100">Good</td>
                    <td className="py-3 px-4 text-center text-sm text-cream-100">Excellent</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-sm text-cream-300">Maintenance</td>
                    <td className="py-3 px-4 text-center text-sm text-cream-100">Easy</td>
                    <td className="py-3 px-4 text-center text-sm text-cream-100">Moderate</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-sm text-cream-300">Best Speed Range</td>
                    <td className="py-3 px-4 text-center text-sm text-cream-100">&lt; 30 mph</td>
                    <td className="py-3 px-4 text-center text-sm text-cream-100">&gt; 30 mph</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-sm text-cream-300">Weight</td>
                    <td className="py-3 px-4 text-center text-sm text-cream-100">Light</td>
                    <td className="py-3 px-4 text-center text-sm text-cream-100">Heavy</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link href="/builder">
            <Button variant="primary" size="lg">
              Start Building with Recommended Brake System
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
