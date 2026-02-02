'use client';

import { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatPrice } from '@/lib/utils';
import type { Engine, ElectricMotor } from '@/types/database';

export type ScatterVariant = 'hp-torque' | 'price-hp' | 'weight-hp';

interface ScatterItem {
  name: string;
  powerSource: 'gas' | 'electric';
  horsepower: number;
  torque: number;
  price: number | null;
  weight_lbs: number | null;
  powerToWeight: number | null;
}

interface EngineComparisonScatterChartsProps {
  engines: Engine[];
  motors: ElectricMotor[];
  variant: ScatterVariant;
  maxItems?: number;
}

const GAS_COLOR = '#f97316';
const ELECTRIC_COLOR = '#3b82f6';

function buildItems(engines: Engine[], motors: ElectricMotor[], maxItems: number): ScatterItem[] {
  const engineItems: ScatterItem[] = (Array.isArray(engines) ? engines : []).map((e) => ({
    name: e.name.length > 24 ? `${e.name.substring(0, 21)}...` : e.name,
    powerSource: 'gas' as const,
    horsepower: e.horsepower,
    torque: e.torque,
    price: e.price,
    weight_lbs: e.weight_lbs,
    powerToWeight: e.weight_lbs && e.horsepower ? (e.horsepower / e.weight_lbs) * 100 : null,
  }));
  const motorItems: ScatterItem[] = (Array.isArray(motors) ? motors : []).map((m) => ({
    name: m.name.length > 24 ? `${m.name.substring(0, 21)}...` : m.name,
    powerSource: 'electric' as const,
    horsepower: m.horsepower,
    torque: m.torque_lbft,
    price: m.price,
    weight_lbs: m.weight_lbs,
    powerToWeight: m.weight_lbs && m.horsepower ? (m.horsepower / m.weight_lbs) * 100 : null,
  }));
  return [...engineItems, ...motorItems]
    .sort((a, b) => b.horsepower - a.horsepower)
    .slice(0, maxItems);
}

export function EngineComparisonScatterCharts({
  engines,
  motors,
  variant,
  maxItems = 30,
}: EngineComparisonScatterChartsProps) {
  const { data, xKey, yKey, xLabel, yLabel, xUnit, yUnit, empty } = useMemo(() => {
    const items = buildItems(engines, motors, maxItems);
    if (variant === 'hp-torque') {
      const filtered = items.filter((d) => d.torque != null && d.horsepower != null);
      return {
        data: filtered,
        xKey: 'horsepower' as const,
        yKey: 'torque' as const,
        xLabel: 'Horsepower (HP)',
        yLabel: 'Torque (lb-ft)',
        xUnit: ' HP',
        yUnit: ' lb-ft',
        empty: filtered.length === 0,
      };
    }
    if (variant === 'price-hp') {
      const filtered = items.filter((d) => d.price != null && d.horsepower != null);
      return {
        data: filtered,
        xKey: 'price' as const,
        yKey: 'horsepower' as const,
        xLabel: 'Price',
        yLabel: 'Horsepower (HP)',
        xUnit: '',
        yUnit: ' HP',
        empty: filtered.length === 0,
      };
    }
    // weight-hp: light + powerful = top-left
    const filtered = items.filter((d) => d.weight_lbs != null && d.horsepower != null);
    return {
      data: filtered,
      xKey: 'weight_lbs' as const,
      yKey: 'horsepower' as const,
      xLabel: 'Weight (lbs)',
      yLabel: 'Horsepower (HP)',
      xUnit: ' lbs',
      yUnit: ' HP',
      empty: filtered.length === 0,
    };
  }, [engines, motors, variant, maxItems]);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: ScatterItem }> }) => {
    if (!active || !payload?.[0]) return null;
    const p = payload[0].payload;
    return (
      <div className="bg-olive-800 border border-olive-600 rounded-lg p-3 shadow-xl text-sm min-w-[180px]">
        <p className="font-semibold text-cream-100 mb-1.5">{p.name}</p>
        <p className="text-cream-300">{p.horsepower.toFixed(1)} HP · {p.torque.toFixed(1)} lb-ft</p>
        {p.price != null && <p className="text-cream-400 mt-0.5">{formatPrice(p.price)}</p>}
        {p.weight_lbs != null && <p className="text-cream-400">{p.weight_lbs.toFixed(1)} lbs</p>}
      </div>
    );
  };

  if (empty) {
    return (
      <div className="py-12 text-center text-cream-400 text-sm">
        No data available for this comparison. Add engines or motors with the required fields.
      </div>
    );
  }

  const gasData = data.filter((d) => d.powerSource === 'gas');
  const electricData = data.filter((d) => d.powerSource === 'electric');

  return (
    <div className="w-full">
      <p className="text-xs text-cream-400 mb-3">
        {variant === 'hp-torque' && 'Power vs torque balance. Upper-right = high power and torque.'}
        {variant === 'price-hp' && 'Value: top-left = more HP per dollar.'}
        {variant === 'weight-hp' && 'Top-left = light and powerful (ideal for karts).'}
      </p>
      <ResponsiveContainer width="100%" height={320}>
        <ScatterChart margin={{ top: 12, right: 12, bottom: 44, left: 44 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#5a6c5d" opacity={0.5} />
          <XAxis
            dataKey={xKey}
            name={xLabel}
            unit={xUnit}
            stroke="#d4a574"
            tick={{ fill: '#d4a574', fontSize: 10 }}
            label={{ value: xLabel, position: 'insideBottom', offset: -8, fill: '#d4a574' }}
          />
          <YAxis
            dataKey={yKey}
            name={yLabel}
            unit={yUnit}
            stroke="#d4a574"
            tick={{ fill: '#d4a574', fontSize: 10 }}
            label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: '#d4a574' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#c4b58e' }} />
          <Scatter name="Gas" data={gasData} fill={GAS_COLOR} shape="circle">
            {gasData.map((_, i) => (
              <Cell key={`gas-${i}`} fill={GAS_COLOR} />
            ))}
          </Scatter>
          <Scatter name="Electric" data={electricData} fill={ELECTRIC_COLOR} shape="circle">
            {electricData.map((_, i) => (
              <Cell key={`ev-${i}`} fill={ELECTRIC_COLOR} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-olive-700/30 text-xs">
        <span className="flex items-center gap-1.5 text-cream-400">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" aria-hidden />
          Gas {gasData.length}
        </span>
        <span className="flex items-center gap-1.5 text-cream-400">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" aria-hidden />
          Electric {electricData.length}
        </span>
      </div>
    </div>
  );
}
