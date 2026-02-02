'use client';

import { useMemo } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import type { Engine, ElectricMotor } from '@/types/database';

interface RadarItem {
  id: string;
  shortName: string;
  powerSource: 'gas' | 'electric';
  horsepower: number;
  torque: number;
  price: number | null;
  powerToWeight: number | null;
}

interface EngineComparisonRadarChartProps {
  engines: Engine[];
  motors: ElectricMotor[];
  maxItems?: number;
}

/** Normalize value to 0–100 scale (min = 0, max = 100). */
function normalize(min: number, max: number, value: number): number {
  if (max <= min) return 100;
  const v = Math.max(min, Math.min(max, value));
  return Math.round(((v - min) / (max - min)) * 100);
}

/** Value score: lower price = higher score (0–100). */
function valueScore(minPrice: number, maxPrice: number, price: number): number {
  if (maxPrice <= minPrice) return 100;
  return Math.round(100 - ((price - minPrice) / (maxPrice - minPrice)) * 100);
}

const GAS_COLOR = '#f97316';
const ELECTRIC_COLOR = '#3b82f6';

export function EngineComparisonRadarChart({
  engines,
  motors,
  maxItems = 6,
}: EngineComparisonRadarChartProps) {
  const { radarData, items, empty } = useMemo(() => {
    const engineItems: RadarItem[] = (Array.isArray(engines) ? engines : []).map((e) => ({
      id: e.id,
      shortName: e.name.length > 18 ? `${e.name.substring(0, 15)}...` : e.name,
      powerSource: 'gas' as const,
      horsepower: e.horsepower,
      torque: e.torque,
      price: e.price,
      powerToWeight: e.weight_lbs && e.horsepower ? (e.horsepower / e.weight_lbs) * 100 : null,
    }));
    const motorItems: RadarItem[] = (Array.isArray(motors) ? motors : []).map((m) => ({
      id: m.id,
      shortName: m.name.length > 18 ? `${m.name.substring(0, 15)}...` : m.name,
      powerSource: 'electric' as const,
      horsepower: m.horsepower,
      torque: m.torque_lbft,
      price: m.price,
      powerToWeight: m.weight_lbs && m.horsepower ? (m.horsepower / m.weight_lbs) * 100 : null,
    }));
    const combined = [...engineItems, ...motorItems]
      .sort((a, b) => b.horsepower - a.horsepower)
      .slice(0, maxItems);

    if (combined.length === 0) {
      return { radarData: [], items: [], empty: true };
    }

    const hp = combined.map((d) => d.horsepower);
    const torque = combined.map((d) => d.torque);
    const prices = combined.filter((d) => d.price != null).map((d) => d.price!);
    const pw = combined.filter((d) => d.powerToWeight != null).map((d) => d.powerToWeight!);

    const minHp = Math.min(...hp, 0);
    const maxHp = Math.max(...hp, 1);
    const minTorque = Math.min(...torque, 0);
    const maxTorque = Math.max(...torque, 1);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 1;
    const minPw = pw.length > 0 ? Math.min(...pw) : 0;
    const maxPw = pw.length > 0 ? Math.max(...pw) : 1;

    const subjects: { subject: string; key: string }[] = [
      { subject: 'Power (HP)', key: 'horsepower' },
      { subject: 'Torque', key: 'torque' },
      { subject: 'Value', key: 'value' },
      { subject: 'Power/Weight', key: 'powerToWeight' },
    ];

    const radarData = subjects.map(({ subject, key }) => {
      const row: Record<string, string | number> = { subject };
      combined.forEach((item, i) => {
        let val = 0;
        if (key === 'horsepower') val = normalize(minHp, maxHp, item.horsepower);
        else if (key === 'torque') val = normalize(minTorque, maxTorque, item.torque);
        else if (key === 'value') val = item.price != null ? valueScore(minPrice, maxPrice, item.price) : 50;
        else if (key === 'powerToWeight') val = item.powerToWeight != null ? normalize(minPw, maxPw, item.powerToWeight) : 50;
        row[String(i)] = val;
      });
      return row;
    });

    return { radarData, items: combined, empty: false };
  }, [engines, motors, maxItems]);

  if (empty) {
    return (
      <div className="py-12 text-center text-cream-400 text-sm">
        No engine or motor data available for radar comparison.
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="text-xs text-cream-400 mb-3">
        Comparing up to {items.length} items. All axes normalized 0–100 (higher is better). Value = lower price is better.
      </p>
      <ResponsiveContainer width="100%" height={380}>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
          <PolarGrid stroke="#5a6c5d" strokeOpacity={0.5} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#d4a574', fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#c4b58e', fontSize: 10 }}
          />
          {items.map((item, i) => (
            <Radar
              key={item.id}
              name={item.shortName}
              dataKey={String(i)}
              stroke={item.powerSource === 'gas' ? GAS_COLOR : ELECTRIC_COLOR}
              fill={item.powerSource === 'gas' ? GAS_COLOR : ELECTRIC_COLOR}
              fillOpacity={0.25}
              strokeWidth={1.5}
            />
          ))}
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-olive-800 border border-olive-600 rounded-lg p-3 shadow-xl text-sm min-w-[160px]">
                  <p className="text-cream-300 font-medium mb-2">{payload[0]?.payload?.subject}</p>
                  {payload.map((entry) => (
                    <p key={entry.name} className="flex justify-between gap-4">
                      <span className="text-cream-200">{entry.name}</span>
                      <span className="text-cream-100 font-medium">{entry.value as number}</span>
                    </p>
                  ))}
                </div>
              );
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </RadarChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-olive-700/30 text-xs">
        <span className="flex items-center gap-1.5 text-cream-400">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" aria-hidden />
          Gas
        </span>
        <span className="flex items-center gap-1.5 text-cream-400">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" aria-hidden />
          Electric
        </span>
      </div>
    </div>
  );
}
