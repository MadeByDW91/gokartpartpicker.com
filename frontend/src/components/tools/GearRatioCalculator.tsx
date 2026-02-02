'use client';

import { useState, useMemo } from 'react';
import { Settings } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export function GearRatioCalculator() {
  const [driveTeeth, setDriveTeeth] = useState<string>('12');
  const [drivenTeeth, setDrivenTeeth] = useState<string>('60');
  const [tireDiameterInches, setTireDiameterInches] = useState<string>('');
  const [engineRpm, setEngineRpm] = useState<string>('');

  const drive = parseFloat(driveTeeth) || 0;
  const driven = parseFloat(drivenTeeth) || 0;
  const tireIn = parseFloat(tireDiameterInches) || 0;
  const rpm = parseFloat(engineRpm) || 0;

  const { ratio, topSpeedMph } = useMemo(() => {
    if (drive <= 0 || driven <= 0) {
      return { ratio: 0, topSpeedMph: null as number | null };
    }
    const ratio = driven / drive;
    let topSpeedMph: number | null = null;
    if (tireIn > 0 && rpm > 0) {
      // mph = (rpm * tire circumference in miles) / (ratio * 60)
      const circumferenceMiles = (Math.PI * tireIn) / (12 * 5280);
      topSpeedMph = (rpm / ratio) * circumferenceMiles * 60;
      topSpeedMph = Math.round(topSpeedMph * 10) / 10;
    }
    return { ratio: Math.round(ratio * 100) / 100, topSpeedMph };
  }, [drive, driven, tireIn, rpm]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-olive-700/50 bg-olive-800/40">
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-green-400" />
            Sprocket Setup
          </h2>
          <p className="text-sm text-cream-400 mt-1">
            Drive = engine/clutch; Driven = axle sprocket
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-cream-200 mb-1.5">Drive sprocket (engine) teeth</label>
            <Input
              type="number"
              min={1}
              max={99}
              value={driveTeeth}
              onChange={(e) => setDriveTeeth(e.target.value)}
              className="bg-olive-800 border-olive-600 text-cream-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-cream-200 mb-1.5">Driven sprocket (axle) teeth</label>
            <Input
              type="number"
              min={1}
              max={999}
              value={drivenTeeth}
              onChange={(e) => setDrivenTeeth(e.target.value)}
              className="bg-olive-800 border-olive-600 text-cream-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-cream-200 mb-1.5">Tire diameter (inches, optional)</label>
            <Input
              type="number"
              min={0}
              step={0.5}
              placeholder="e.g. 11"
              value={tireDiameterInches}
              onChange={(e) => setTireDiameterInches(e.target.value)}
              className="bg-olive-800 border-olive-600 text-cream-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-cream-200 mb-1.5">Engine RPM (optional)</label>
            <Input
              type="number"
              min={0}
              step={100}
              placeholder="e.g. 3600"
              value={engineRpm}
              onChange={(e) => setEngineRpm(e.target.value)}
              className="bg-olive-800 border-olive-600 text-cream-100"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-olive-700/50 bg-olive-800/40 border-green-500/30">
        <CardHeader>
          <h2 className="text-lg font-semibold text-cream-100">Results</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-olive-800 rounded-lg border border-olive-600">
            <p className="text-sm text-cream-400">Gear ratio</p>
            <p className="text-2xl font-bold text-green-400">
              {ratio > 0 ? ratio.toFixed(2) : '—'}
            </p>
            <p className="text-xs text-cream-500 mt-1">
              Higher ratio = more top speed, less acceleration. Lower = more acceleration, less top speed.
            </p>
          </div>
          {topSpeedMph != null && (
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <p className="text-sm text-cream-400">Estimated top speed</p>
              <p className="text-2xl font-bold text-green-400">{topSpeedMph} mph</p>
              <p className="text-xs text-cream-500 mt-1">At {engineRpm} RPM with {tireDiameterInches}&quot; tire</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
