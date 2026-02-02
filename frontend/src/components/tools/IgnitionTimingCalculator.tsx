'use client';

import { useState, useMemo } from 'react';
import { Gauge, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export function IgnitionTimingCalculator() {
  const [stockTiming, setStockTiming] = useState<string>('20');
  const [keyDegrees, setKeyDegrees] = useState<string>('4');

  const stock = parseFloat(stockTiming) || 0;
  const key = parseFloat(keyDegrees) || 0;

  const { newTiming, isAdvance } = useMemo(() => {
    const newTiming = stock + key;
    return { newTiming, isAdvance: key > 0 };
  }, [stock, key]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-olive-700/50 bg-olive-800/40">
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-green-400" />
            Timing Inputs
          </h2>
          <p className="text-sm text-cream-400 mt-1">
            Stock timing is usually 20–28° BTDC for small engines. Keys are often ±4°.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-cream-200 mb-1.5">Stock timing (° BTDC)</label>
            <Input
              type="number"
              min={0}
              max={45}
              step={0.5}
              value={stockTiming}
              onChange={(e) => setStockTiming(e.target.value)}
              className="bg-olive-800 border-olive-600 text-cream-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-cream-200 mb-1.5">Timing key (degrees)</label>
            <Input
              type="number"
              step={0.5}
              placeholder="e.g. 4 for advance, -4 for retard"
              value={keyDegrees}
              onChange={(e) => setKeyDegrees(e.target.value)}
              className="bg-olive-800 border-olive-600 text-cream-100"
            />
            <p className="text-xs text-cream-500 mt-1">
              Positive = advance (more HP, higher revs). Negative = retard (safer, less detonation).
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-olive-700/50 bg-olive-800/40 border-green-500/30">
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">Results</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-olive-800 rounded-lg border border-olive-600">
            <p className="text-sm text-cream-400">New timing</p>
            <p className="text-2xl font-bold text-green-400">
              {newTiming.toFixed(1)}° BTDC
            </p>
            <p className="text-xs text-cream-500 mt-1">
              {isAdvance ? 'Advanced' : 'Retarded'} by {Math.abs(key).toFixed(1)}° from stock.
            </p>
          </div>
          <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm text-cream-300">
              <p className="font-medium text-amber-400 mb-1">Safety</p>
              <p>Too much advance can cause detonation and engine damage. Use premium fuel if advancing timing. Retard if you hear pinging.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
