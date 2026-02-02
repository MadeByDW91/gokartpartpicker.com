'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import { EngineComparisonCharts } from './EngineComparisonCharts';
import { EngineComparisonRadarChart } from './EngineComparisonRadarChart';
import { EngineComparisonScatterCharts } from './EngineComparisonScatterCharts';
import { Select } from '@/components/ui/Select';
import type { Engine, ElectricMotor } from '@/types/database';

type ChartViewType = 'bar' | 'radar' | 'hp-torque' | 'price-hp' | 'weight-hp';

interface VisualEngineComparisonProps {
  engines: Engine[];
  motors: ElectricMotor[];
}

export function VisualEngineComparison({ engines, motors }: VisualEngineComparisonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [chartType, setChartType] = useState<ChartViewType>('bar');

  return (
    <div className="bg-olive-800/30 rounded-xl border border-olive-700/50 overflow-hidden shadow-lg mb-8">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-olive-700/50 bg-olive-800/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <BarChart3 className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-cream-100">Visual Engine Comparison</h2>
              <p className="text-sm text-cream-400 mt-0.5">
                Bar, radar, and scatter charts for engines and EV motors
              </p>
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
      </div>
      
      {/* Content with chart type selector */}
      {isExpanded && (
        <div className="p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <label htmlFor="chart-type" className="text-sm font-medium text-cream-200 shrink-0">
              Chart type:
            </label>
            <Select
              id="chart-type"
              value={chartType}
              onChange={(e) => setChartType(e.target.value as ChartViewType)}
              options={[
                { value: 'bar', label: 'Bar chart (HP, torque, price, etc.)' },
                { value: 'radar', label: 'Radar (spider) comparison' },
                { value: 'hp-torque', label: 'HP vs Torque scatter' },
                { value: 'price-hp', label: 'Price vs HP (value) scatter' },
                { value: 'weight-hp', label: 'Weight vs HP scatter' },
              ]}
              className="min-w-[220px]"
            />
          </div>
          {chartType === 'bar' && (
            <EngineComparisonCharts
              engines={engines}
              motors={motors}
              maxItems={20}
            />
          )}
          {chartType === 'radar' && (
            <EngineComparisonRadarChart
              engines={engines}
              motors={motors}
              maxItems={6}
            />
          )}
          {(chartType === 'hp-torque' || chartType === 'price-hp' || chartType === 'weight-hp') && (
            <EngineComparisonScatterCharts
              engines={engines}
              motors={motors}
              variant={chartType}
              maxItems={30}
            />
          )}
        </div>
      )}
    </div>
  );
}
