'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Fuel, Zap } from 'lucide-react';
import { EngineForm } from '@/components/admin/EngineForm';
import { MotorForm } from '@/components/admin/MotorForm';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

type AddType = 'gas' | 'ev';

export default function AddEngineOrMotorPage() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');
  const [addType, setAddType] = useState<AddType>(() => (typeParam === 'ev' ? 'ev' : 'gas'));

  useEffect(() => {
    const t = typeParam === 'ev' ? 'ev' : 'gas';
    setAddType(t);
  }, [typeParam]);

  const handleSetType = (t: AddType) => {
    setAddType(t);
    const url = new URL(window.location.href);
    url.searchParams.set('type', t);
    window.history.replaceState({}, '', url.pathname + url.search);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/engines"
          className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Engines & Motors
        </Link>
        <h1 className="text-display text-3xl text-cream-100">Add Engine or Motor</h1>
        <p className="text-cream-300 mt-1">
          Choose Gas or EV, then paste a product link to auto-fill. Required fields change by type.
        </p>
      </div>

      {/* Type selector */}
      <Card className="border-olive-600/50 bg-olive-800/30">
        <CardContent className="p-4">
          <p className="text-sm font-medium text-cream-200 mb-3">I&apos;m adding:</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleSetType('gas')}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border font-medium text-sm transition-all min-h-[44px] touch-manipulation',
                addType === 'gas'
                  ? 'border-orange-500/60 bg-orange-500/20 text-orange-400'
                  : 'border-olive-600/60 bg-olive-800/50 text-cream-400 hover:bg-olive-700/50 hover:text-cream-200'
              )}
            >
              <Fuel className="w-4 h-4" />
              Gas Engine
            </button>
            <button
              type="button"
              onClick={() => handleSetType('ev')}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border font-medium text-sm transition-all min-h-[44px] touch-manipulation',
                addType === 'ev'
                  ? 'border-blue-500/60 bg-blue-500/20 text-blue-400'
                  : 'border-olive-600/60 bg-olive-800/50 text-cream-400 hover:bg-olive-700/50 hover:text-cream-200'
              )}
            >
              <Zap className="w-4 h-4" />
              Electric Motor (EV)
            </button>
          </div>
          <p className="text-xs text-cream-500 mt-2">
            {addType === 'gas'
              ? 'Gas: name, brand, displacement, HP, torque, shaft, price, image. Paste Harbor Freight or Amazon engine link to auto-fill.'
              : 'EV: name, brand, voltage, power (kW), HP, torque, RPM, price, image. Paste Amazon motor link to auto-fill.'}
          </p>
        </CardContent>
      </Card>

      {/* Form (tailored to type) */}
      {addType === 'gas' ? (
        <EngineForm mode="create" />
      ) : (
        <MotorForm mode="create" />
      )}
    </div>
  );
}
