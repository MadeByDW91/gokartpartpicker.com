'use client';

import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { 
  Cog, Battery, Zap, Gauge, DollarSign, TrendingUp, 
  ExternalLink, Plus, Filter, X, Activity, BarChart3
} from 'lucide-react';
import { formatPrice, getMotorBrandDisplay } from '@/lib/utils';
import { useBuildStore } from '@/store/build-store';
import type { Engine, ElectricMotor } from '@/types/database';

interface ChartItem {
  id: string;
  name: string;
  brand: string;
  shortName: string; // Truncated name for chart display
  slug: string; // For navigation
  powerSource: 'gas' | 'electric';
  horsepower: number;
  power_kw: number;
  torque: number;
  price: number | null;
  weight_lbs: number | null;
  costPerHp: number | null;
  powerToWeight: number | null; // HP per 100 lbs
  displacement_cc?: number;
  voltage?: number;
  shaft_diameter?: number; // For compatibility stats
  // Original data for actions
  engine?: Engine;
  motor?: ElectricMotor;
}

interface EngineComparisonChartsProps {
  engines: Engine[];
  motors: ElectricMotor[];
  maxItems?: number; // Limit number of items shown in charts
}

export function EngineComparisonCharts({ engines, motors, maxItems = 20 }: EngineComparisonChartsProps) {
  const router = useRouter();
  const { setEngine, setMotor, setPowerSourceType } = useBuildStore();
  const [chartType, setChartType] = useState<'horsepower' | 'horsepowerRadial' | 'torque' | 'price' | 'costPerHp' | 'powerToWeight' | 'scatter'>('horsepower');
  const [powerSourceFilter, setPowerSourceFilter] = useState<'all' | 'gas' | 'electric'>('all');
  const [brandFilter, setBrandFilter] = useState<string>('');
  const [minHpFilter, setMinHpFilter] = useState<string>('');
  const [maxHpFilter, setMaxHpFilter] = useState<string>('');
  const [minPriceFilter, setMinPriceFilter] = useState<string>('');
  const [maxPriceFilter, setMaxPriceFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Ensure we have valid arrays
  const safeEngines = Array.isArray(engines) ? engines : [];
  const safeMotors = Array.isArray(motors) ? motors : [];

  // Combine and normalize data
  const chartData: ChartItem[] = useMemo(() => {
    const engineItems: ChartItem[] = safeEngines.map((engine) => {
      const powerToWeight = engine.weight_lbs && engine.horsepower 
        ? (engine.horsepower / engine.weight_lbs) * 100 
        : null;
      return {
        id: engine.id,
        name: engine.name,
        brand: engine.brand,
        shortName: engine.name.length > 20 ? `${engine.name.substring(0, 17)}...` : engine.name,
        slug: engine.slug,
        powerSource: 'gas' as const,
        horsepower: engine.horsepower,
        power_kw: engine.horsepower * 0.746,
        torque: engine.torque,
        price: engine.price,
        weight_lbs: engine.weight_lbs,
        costPerHp: engine.price && engine.horsepower ? engine.price / engine.horsepower : null,
        powerToWeight,
        displacement_cc: engine.displacement_cc,
        shaft_diameter: engine.shaft_diameter,
        engine,
      };
    });

    const motorItems: ChartItem[] = safeMotors.map((motor) => {
      const powerToWeight = motor.weight_lbs && motor.horsepower 
        ? (motor.horsepower / motor.weight_lbs) * 100 
        : null;
      return {
        id: motor.id,
        name: motor.name,
        brand: getMotorBrandDisplay(motor.brand),
        shortName: motor.name.length > 20 ? `${motor.name.substring(0, 17)}...` : motor.name,
        slug: motor.slug,
        powerSource: 'electric' as const,
        horsepower: motor.horsepower,
        power_kw: motor.power_kw,
        torque: motor.torque_lbft,
        price: motor.price,
        weight_lbs: motor.weight_lbs,
        costPerHp: motor.price && motor.horsepower ? motor.price / motor.horsepower : null,
        powerToWeight,
        voltage: motor.voltage,
        shaft_diameter: motor.shaft_diameter || undefined,
        motor,
      };
    });

    let combined = [...engineItems, ...motorItems];

    // Apply filters
    if (powerSourceFilter !== 'all') {
      combined = combined.filter((item) => item.powerSource === powerSourceFilter);
    }
    
    if (brandFilter) {
      combined = combined.filter((item) => 
        item.brand.toLowerCase().includes(brandFilter.toLowerCase())
      );
    }
    
    if (minHpFilter) {
      const minHp = parseFloat(minHpFilter);
      if (!isNaN(minHp)) {
        combined = combined.filter((item) => item.horsepower >= minHp);
      }
    }
    
    if (maxHpFilter) {
      const maxHp = parseFloat(maxHpFilter);
      if (!isNaN(maxHp)) {
        combined = combined.filter((item) => item.horsepower <= maxHp);
      }
    }
    
    if (minPriceFilter) {
      const minPrice = parseFloat(minPriceFilter);
      if (!isNaN(minPrice)) {
        combined = combined.filter((item) => item.price !== null && item.price >= minPrice);
      }
    }
    
    if (maxPriceFilter) {
      const maxPrice = parseFloat(maxPriceFilter);
      if (!isNaN(maxPrice)) {
        combined = combined.filter((item) => item.price !== null && item.price <= maxPrice);
      }
    }

    // Sort by the selected metric and limit
    combined.sort((a, b) => {
      switch (chartType) {
        case 'horsepower':
        case 'horsepowerRadial':
          return b.horsepower - a.horsepower;
        case 'torque':
          return b.torque - a.torque;
        case 'price':
          return (b.price || 0) - (a.price || 0);
        case 'costPerHp':
          return (b.costPerHp || Infinity) - (a.costPerHp || Infinity);
        case 'powerToWeight':
          return (b.powerToWeight || 0) - (a.powerToWeight || 0);
        default:
          return 0;
      }
    });

    return combined.slice(0, maxItems);
  }, [safeEngines, safeMotors, chartType, powerSourceFilter, brandFilter, minHpFilter, maxHpFilter, minPriceFilter, maxPriceFilter, maxItems]);
  
  // Get unique brands for filter
  const uniqueBrands = useMemo(() => {
    const allBrands = [...safeEngines.map(e => e.brand), ...safeMotors.map(m => m.brand)];
    return [...new Set(allBrands)].sort();
  }, [safeEngines, safeMotors]);
  
  // Handle add to build
  const handleAddToBuild = (item: ChartItem) => {
    if (item.powerSource === 'gas' && item.engine) {
      setEngine(item.engine);
      setPowerSourceType('gas');
    } else if (item.powerSource === 'electric' && item.motor) {
      setMotor(item.motor);
      setPowerSourceType('electric');
    }
    router.push('/builder');
  };
  
  // Custom tooltip with actions
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartItem;
      return (
        <div className="bg-olive-800 border border-olive-600 rounded-lg p-4 shadow-xl min-w-[280px]">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="font-semibold text-cream-100 mb-1">{data.name}</p>
              <Badge 
                variant="default" 
                className={`text-xs ${data.powerSource === 'gas' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}
              >
                {data.powerSource === 'gas' ? <Cog className="w-3 h-3 mr-1" /> : <Battery className="w-3 h-3 mr-1" />}
                {data.brand}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
            <div>
              <span className="text-cream-400">HP:</span>
              <span className="ml-1 font-semibold text-cream-100">{data.horsepower.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-cream-400">Torque:</span>
              <span className="ml-1 font-semibold text-cream-100">{data.torque.toFixed(1)} lb-ft</span>
            </div>
            {data.weight_lbs && (
              <div>
                <span className="text-cream-400">Weight:</span>
                <span className="ml-1 font-semibold text-cream-100">{data.weight_lbs.toFixed(1)} lbs</span>
              </div>
            )}
            {data.powerToWeight && (
              <div>
                <span className="text-cream-400">HP/100lbs:</span>
                <span className="ml-1 font-semibold text-orange-400">{data.powerToWeight.toFixed(1)}</span>
              </div>
            )}
            {data.price && (
              <div>
                <span className="text-cream-400">Price:</span>
                <span className="ml-1 font-semibold text-cream-100">{formatPrice(data.price)}</span>
              </div>
            )}
            {data.costPerHp && (
              <div>
                <span className="text-cream-400">Cost/HP:</span>
                <span className="ml-1 font-semibold text-orange-400">${data.costPerHp.toFixed(0)}</span>
              </div>
            )}
            {data.displacement_cc && (
              <div>
                <span className="text-cream-400">Displacement:</span>
                <span className="ml-1 font-semibold text-cream-100">{data.displacement_cc}cc</span>
              </div>
            )}
            {data.voltage && (
              <div>
                <span className="text-cream-400">Voltage:</span>
                <span className="ml-1 font-semibold text-cream-100">{data.voltage}V</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 pt-3 border-t border-olive-600">
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleAddToBuild(data)}
              icon={<Plus className="w-3 h-3" />}
              className="flex-1 text-xs"
            >
              Add to Build
            </Button>
            <Link href={data.powerSource === 'gas' ? `/engines/${data.slug}` : `/motors/${data.slug}`}>
              <Button
                variant="secondary"
                size="sm"
                icon={<ExternalLink className="w-3 h-3" />}
                className="text-xs"
              >
                Details
              </Button>
            </Link>
          </div>
        </div>
      );
    }
    return null;
  };

  // Get chart value based on type
  const getChartValue = (item: ChartItem) => {
    switch (chartType) {
      case 'horsepower':
      case 'horsepowerRadial':
        return item.horsepower;
      case 'torque':
        return item.torque;
      case 'price':
        return item.price || 0;
      case 'costPerHp':
        return item.costPerHp || 0;
      case 'powerToWeight':
        return item.powerToWeight || 0;
      default:
        return 0;
    }
  };

  // Get chart label
  const getChartLabel = () => {
    switch (chartType) {
      case 'horsepower':
      case 'horsepowerRadial':
        return 'Horsepower (HP)';
      case 'torque':
        return 'Torque (lb-ft)';
      case 'price':
        return 'Price ($)';
      case 'costPerHp':
        return 'Cost per HP ($)';
      case 'powerToWeight':
        return 'HP per 100 lbs';
      default:
        return '';
    }
  };
  
  const hasActiveFilters = brandFilter || minHpFilter || maxHpFilter || minPriceFilter || maxPriceFilter;
  
  const clearFilters = () => {
    setBrandFilter('');
    setMinHpFilter('');
    setMaxHpFilter('');
    setMinPriceFilter('');
    setMaxPriceFilter('');
  };

  // Get color for power source
  const getColor = (powerSource: 'gas' | 'electric') => {
    return powerSource === 'gas' ? '#f97316' : '#3b82f6'; // orange-500 : blue-500
  };

  if (chartData.length === 0) {
    return (
      <Card className="mt-8">
        <CardContent className="py-12 text-center">
          <p className="text-cream-400">No data available for comparison charts.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-6">
      {/* Header - Compact */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-orange-400" />
          <h2 className="text-base font-semibold text-cream-100">Compare engines & motors</h2>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'gas', label: 'Gas Only' },
              { value: 'electric', label: 'Electric Only' },
            ]}
            value={powerSourceFilter}
            onChange={(e) => setPowerSourceFilter(e.target.value as 'all' | 'gas' | 'electric')}
            className="w-32 text-sm"
          />
          
          <Select
            options={[
              { value: 'horsepower', label: 'Horsepower (Bar)' },
              { value: 'horsepowerRadial', label: 'Horsepower (Radial)' },
              { value: 'torque', label: 'Torque' },
              { value: 'price', label: 'Price' },
              { value: 'costPerHp', label: 'Cost per HP' },
              { value: 'powerToWeight', label: 'Power-to-Weight' },
              { value: 'scatter', label: 'HP vs Cost/HP' },
            ]}
            value={chartType}
            onChange={(e) => setChartType(e.target.value as typeof chartType)}
            className="w-36 text-sm"
          />
          
          <Button
            variant={showFilters ? "primary" : "secondary"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            icon={<Filter className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Filters
          </Button>
        </div>
      </div>
      
      <div className="bg-olive-800/30 rounded-lg border border-olive-700/30 p-3 sm:p-4">
        {/* Advanced Filters */}
        {showFilters && (
          <div className="mb-4 p-3 bg-olive-800/20 rounded-lg border border-olive-700/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-cream-200 uppercase tracking-wide">Advanced Filters</h3>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  icon={<X className="w-3 h-3" />}
                  className="text-xs h-7"
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-cream-400 mb-0.5">Brand</label>
                <Input
                  placeholder="Filter by brand..."
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-cream-400 mb-0.5">Min HP</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={minHpFilter}
                  onChange={(e) => setMinHpFilter(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-cream-400 mb-0.5">Max HP</label>
                <Input
                  type="number"
                  placeholder="100"
                  value={maxHpFilter}
                  onChange={(e) => setMaxHpFilter(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-cream-400 mb-0.5">Min Price</label>
                <Input
                  type="number"
                  placeholder="$0"
                  value={minPriceFilter}
                  onChange={(e) => setMinPriceFilter(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-cream-400 mb-0.5">Max Price</label>
                <Input
                  type="number"
                  placeholder="$5000"
                  value={maxPriceFilter}
                  onChange={(e) => setMaxPriceFilter(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        )}
        
        {chartType === 'scatter' ? (
          // Scatter plot: HP vs Cost per HP
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart
              margin={{ top: 12, right: 12, bottom: 44, left: 44 }}
              data={chartData.filter((d) => d.costPerHp !== null && d.price !== null)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#5a6c5d" />
              <XAxis
                dataKey="horsepower"
                name="Horsepower"
                unit=" HP"
                stroke="#d4a574"
                tick={{ fill: '#d4a574', fontSize: 10 }}
                label={{ value: 'Horsepower (HP)', position: 'insideBottom', offset: -8, fill: '#d4a574' }}
              />
              <YAxis
                dataKey="costPerHp"
                name="Cost per HP"
                unit=" $"
                stroke="#d4a574"
                tick={{ fill: '#d4a574', fontSize: 10 }}
                label={{ value: 'Cost per HP ($)', angle: -90, position: 'insideLeft', fill: '#d4a574' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter 
                name="Gas Engines" 
                data={chartData.filter((d) => d.powerSource === 'gas' && d.costPerHp !== null)}
                fill="#f97316"
              />
              <Scatter 
                name="Electric Motors" 
                data={chartData.filter((d) => d.powerSource === 'electric' && d.costPerHp !== null)}
                fill="#3b82f6"
              />
            </ScatterChart>
          </ResponsiveContainer>
        ) : chartType === 'horsepowerRadial' ? (
          // Radial (circular) horsepower comparison
          (() => {
            const maxHp = Math.max(...chartData.map((d) => d.horsepower), 1);
            const radialData = chartData.map((d) => ({
              ...d,
              radialValue: Math.round((d.horsepower / maxHp) * 100),
              fill: d.powerSource === 'gas' ? '#f97316' : '#3b82f6',
            }));
            return (
              <ResponsiveContainer width="100%" height={320}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="20%"
                  outerRadius="90%"
                  barSize={12}
                  data={radialData}
                  startAngle={180}
                  endAngle={-180}
                >
                  <RadialBar
                    background={{ fill: 'rgba(94, 92, 78, 0.3)' }}
                    dataKey="radialValue"
                    onClick={(data: ChartItem) => {
                      if (data?.slug) {
                        router.push(
                          (data as ChartItem).powerSource === 'gas'
                            ? `/engines/${(data as ChartItem).slug}`
                            : `/motors/${(data as ChartItem).slug}`
                        );
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload?.[0]) {
                        const data = payload[0].payload as ChartItem & { radialValue: number };
                        return (
                          <div className="bg-olive-800 border border-olive-600 rounded-lg p-3 shadow-xl text-sm">
                            <p className="font-semibold text-cream-100 mb-1">{data.name}</p>
                            <p className="text-orange-400 font-bold">{data.horsepower.toFixed(1)} HP</p>
                            {data.price != null && (
                              <p className="text-cream-400 mt-1">{formatPrice(data.price)}</p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            );
          })()
        ) : (
          // Enhanced Bar chart with gradients
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 12, right: 12, bottom: 56, left: 44 }}
            >
              <defs>
                <linearGradient id="gasGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={1} />
                  <stop offset="100%" stopColor="#ea580c" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="electricGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#5a6c5d" opacity={0.3} />
              <XAxis
                dataKey="shortName"
                angle={-45}
                textAnchor="end"
                height={52}
                stroke="#d4a574"
                tick={{ fill: '#d4a574', fontSize: 10 }}
              />
              <YAxis
                stroke="#d4a574"
                tick={{ fill: '#d4a574', fontSize: 10 }}
                label={{ value: getChartLabel(), angle: -90, position: 'insideLeft', fill: '#d4a574' }}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(249, 115, 22, 0.1)' }}
              />
              <Bar
                dataKey={(item: ChartItem) => getChartValue(item)}
                name={getChartLabel()}
                radius={[4, 4, 0, 0]}
                onClick={(data: any) => {
                  if (data && data.payload) {
                    const item = data.payload as ChartItem;
                    router.push(item.powerSource === 'gas' ? `/engines/${item.slug}` : `/motors/${item.slug}`);
                  }
                }}
                style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.powerSource === 'gas' ? 'url(#gasGradient)' : 'url(#electricGradient)'}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
        
        {/* Compact key stats + legend */}
        {(() => {
          const totalItems = chartData.length;
          const itemsWithPrice = chartData.filter((d) => d.price != null && d.horsepower > 0);
          const bestValue = itemsWithPrice.length > 0
            ? itemsWithPrice.reduce((best, item) =>
                (item.costPerHp ?? Infinity) < (best.costPerHp ?? Infinity) ? item : best,
                itemsWithPrice[0]
              )
            : null;
          const mostPowerful = chartData.length > 0
            ? chartData.reduce((best, item) => (item.horsepower > best.horsepower ? item : best), chartData[0])
            : null;
          const hpValues = chartData.map((d) => d.horsepower);
          const minHp = hpValues.length > 0 ? Math.min(...hpValues) : 0;
          const maxHp = hpValues.length > 0 ? Math.max(...hpValues) : 0;
          const prices = chartData.filter((d) => d.price != null).map((d) => d.price!);
          const minPrice = prices.length > 0 ? Math.min(...prices) : null;
          const maxPrice = prices.length > 0 ? Math.max(...prices) : null;
          const gasCount = chartData.filter((d) => d.powerSource === 'gas').length;
          const electricCount = chartData.filter((d) => d.powerSource === 'electric').length;
          const entryLevel = chartData.filter((d) => d.horsepower < 8).length;
          const midRange = chartData.filter((d) => d.horsepower >= 8 && d.horsepower <= 12).length;
          const highPerf = chartData.filter((d) => d.horsepower > 12).length;

          return (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 pt-4 border-t border-olive-700/30 text-xs">
              <div className="flex items-center gap-3 text-cream-400/80">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" aria-hidden />
                  Gas {gasCount}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" aria-hidden />
                  Electric {electricCount}
                </span>
              </div>
              <span className="text-cream-500/60">·</span>
              <span className="text-cream-300">{totalItems} items</span>
              <span className="text-cream-500/60">·</span>
              <span className="text-cream-300">{minHp.toFixed(1)}–{maxHp.toFixed(1)} HP</span>
              {(minPrice != null && maxPrice != null) && (
                <>
                  <span className="text-cream-500/60">·</span>
                  <span className="text-cream-300">{formatPrice(minPrice)}–{formatPrice(maxPrice)}</span>
                </>
              )}
              {bestValue && (
                <>
                  <span className="text-cream-500/60">·</span>
                  <span className="text-cream-300">
                    Best value: <span className="text-orange-400 font-medium">{bestValue.shortName}</span> ${bestValue.costPerHp?.toFixed(0) ?? '—'}/HP
                  </span>
                </>
              )}
              {mostPowerful && (
                <>
                  <span className="text-cream-500/60">·</span>
                  <span className="text-cream-300">
                    Most powerful: <span className="text-orange-400 font-medium">{mostPowerful.shortName}</span> {mostPowerful.horsepower.toFixed(1)} HP
                  </span>
                </>
              )}
              <span className="text-cream-500/60">·</span>
              <span className="text-cream-300">{entryLevel} entry, {midRange} mid, {highPerf} high</span>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
