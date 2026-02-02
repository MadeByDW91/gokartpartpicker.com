'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatPrice } from '@/lib/utils';
import type { Engine, ElectricMotor } from '@/types/database';

const GAS_COLOR = '#f97316';
const ELECTRIC_COLOR = '#3b82f6';
const HP_COLOR = '#eab308';
const COST_COLOR = '#22c55e';

interface BuilderInsightsVisualComparisonProps {
  engines: Engine[];
  motors: ElectricMotor[];
  maxItems?: number;
}

interface HpCostItem {
  name: string;
  shortName: string;
  hp: number;
  cost: number;
  powerSource: 'Gas' | 'EV';
}

interface EvGasItem {
  name: string;
  gas: number;
  ev: number;
}

export function BuilderInsightsVisualComparison({
  engines = [],
  motors = [],
  maxItems = 10,
}: BuilderInsightsVisualComparisonProps) {
  const hpCostData = useMemo<HpCostItem[]>(() => {
    const engineItems: HpCostItem[] = (Array.isArray(engines) ? engines : []).map((e) => ({
      name: e.name,
      shortName: e.name.length > 14 ? `${e.name.slice(0, 11)}…` : e.name,
      hp: e.horsepower ?? 0,
      cost: e.price ?? 0,
      powerSource: 'Gas' as const,
    }));
    const motorItems: HpCostItem[] = (Array.isArray(motors) ? motors : []).map((m) => ({
      name: m.name,
      shortName: m.name.length > 14 ? `${m.name.slice(0, 11)}…` : m.name,
      hp: m.horsepower ?? 0,
      cost: m.price ?? 0,
      powerSource: 'EV' as const,
    }));
    return [...engineItems, ...motorItems]
      .sort((a, b) => b.hp - a.hp)
      .slice(0, maxItems);
  }, [engines, motors, maxItems]);

  const evGasData = useMemo<EvGasItem[]>(() => {
    const gasCount = (Array.isArray(engines) ? engines : []).length;
    const evCount = (Array.isArray(motors) ? motors : []).length;
    const gasAvgHp =
      engines.length > 0
        ? engines.reduce((s, e) => s + (e.horsepower ?? 0), 0) / engines.length
        : 0;
    const evAvgHp =
      motors.length > 0
        ? motors.reduce((s, m) => s + (m.horsepower ?? 0), 0) / motors.length
        : 0;
    return [
      { name: 'Count', gas: gasCount, ev: evCount },
      { name: 'Avg HP', gas: Math.round(gasAvgHp * 10) / 10, ev: Math.round(evAvgHp * 10) / 10 },
    ];
  }, [engines, motors]);

  const hasHpCost = hpCostData.length > 0;
  const hasEvGas = (engines?.length ?? 0) > 0 || (motors?.length ?? 0) > 0;

  if (!hasHpCost && !hasEvGas) {
    return (
      <div className="py-8 text-center">
        <p className="text-cream-400">No engine or motor data available for comparison.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* HP vs Cost bar chart */}
      <div className="bg-olive-800/20 rounded-lg border border-olive-700/50 p-4">
        <h3 className="text-sm font-semibold text-cream-100 mb-3">HP vs Cost</h3>
        {hasHpCost ? (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={hpCostData}
                margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
                barGap={4}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,212,212,0.1)" />
                <XAxis
                  dataKey="shortName"
                  tick={{ fill: '#d4d4d4', fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(212,212,212,0.2)' }}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: '#d4d4d4', fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(212,212,212,0.2)' }}
                  label={{ value: 'HP', angle: -90, position: 'insideLeft', fill: '#d4d4d4', fontSize: 10 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#d4d4d4', fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(212,212,212,0.2)' }}
                  tickFormatter={(v) => `$${v}`}
                  label={{ value: 'Cost', angle: 90, position: 'insideRight', fill: '#d4d4d4', fontSize: 10 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload as HpCostItem;
                    return (
                      <div className="bg-olive-800 border border-olive-600 rounded-lg px-3 py-2 shadow-lg text-sm">
                        <p className="font-semibold text-cream-100">{d.name}</p>
                        <p className="text-cream-400">
                          HP: <span className="text-cream-100">{d.hp}</span> · Cost:{' '}
                          <span className="text-cream-100">{formatPrice(d.cost)}</span>
                        </p>
                      </div>
                    );
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(value) => <span className="text-cream-300">{value}</span>}
                />
                <Bar
                  yAxisId="left"
                  dataKey="hp"
                  name="HP"
                  fill={HP_COLOR}
                  radius={[2, 2, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  yAxisId="right"
                  dataKey="cost"
                  name="Cost ($)"
                  fill={COST_COLOR}
                  radius={[2, 2, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-cream-500 py-8 text-center">No data</p>
        )}
      </div>

      {/* EV vs Gas bar chart */}
      <div className="bg-olive-800/20 rounded-lg border border-olive-700/50 p-4">
        <h3 className="text-sm font-semibold text-cream-100 mb-3">EV vs Gas</h3>
        {hasEvGas ? (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={evGasData}
                layout="vertical"
                margin={{ top: 16, right: 24, left: 48, bottom: 8 }}
                barGap={8}
                barCategoryGap="24%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,212,212,0.1)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: '#d4d4d4', fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(212,212,212,0.2)' }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#d4d4d4', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(212,212,212,0.2)' }}
                  width={44}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const row = payload[0].payload as EvGasItem;
                    return (
                      <div className="bg-olive-800 border border-olive-600 rounded-lg px-3 py-2 shadow-lg text-sm">
                        <p className="font-semibold text-cream-100">{row.name}</p>
                        <p className="text-orange-400">Gas: {row.gas}</p>
                        <p className="text-blue-400">EV: {row.ev}</p>
                      </div>
                    );
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(value) => <span className="text-cream-300">{value}</span>}
                />
                <Bar dataKey="gas" name="Gas" fill={GAS_COLOR} radius={[0, 2, 2, 0]} maxBarSize={32} />
                <Bar dataKey="ev" name="EV" fill={ELECTRIC_COLOR} radius={[0, 2, 2, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-cream-500 py-8 text-center">No data</p>
        )}
      </div>
    </div>
  );
}
