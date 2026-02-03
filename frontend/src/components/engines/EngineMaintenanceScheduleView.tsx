'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Printer, ArrowLeft, CalendarCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Engine } from '@/types/database';
import { GAS_ENGINE_MAINTENANCE_SCHEDULE } from '@/data/maintenance-schedule';

interface EngineMaintenanceScheduleViewProps {
  engine: Engine;
}

export function EngineMaintenanceScheduleView({ engine }: EngineMaintenanceScheduleViewProps) {
  const searchParams = useSearchParams();

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    if (searchParams.get('print') === '1') {
      const t = setTimeout(() => window.print(), 800);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  const engineDisplayName =
    engine.name.trim().toLowerCase().startsWith(engine.brand.trim().toLowerCase())
      ? engine.name.trim()
      : `${engine.brand} ${engine.name}`.trim();

  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .maint-print-container { max-width: 100% !important; padding: 0 !important; }
          .maint-print-header { border-bottom: 3px solid #000; margin-bottom: 20px; padding-bottom: 12px; page-break-after: avoid; }
          .maint-print-table { border-collapse: collapse; width: 100%; page-break-inside: avoid; }
          .maint-print-table th { background: #f3f4f6 !important; color: #000 !important; font-weight: 700; border: 1px solid #000; padding: 10px 14px; text-align: left; font-size: 12pt; }
          .maint-print-table td { border: 1px solid #d1d5db; padding: 8px 14px; color: #000 !important; font-size: 11pt; }
          .maint-print-note { background: #fff9e6 !important; border: 2px solid #f59e0b !important; padding: 12px !important; margin-bottom: 20px !important; page-break-inside: avoid; }
          .maint-print-footer { margin-top: 24px; padding-top: 12px; border-top: 2px solid #000; font-size: 9pt; color: #4b5563 !important; }
        }
      `}</style>

      <div className="min-h-screen bg-olive-900">
        <div className="bg-olive-800 border-b border-olive-700 print:hidden no-print">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link
                href={`/engines/${engine.slug}`}
                className="inline-flex items-center gap-2 text-sm text-cream-400 hover:text-orange-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Engine
              </Link>
              <Button variant="primary" size="sm" onClick={handlePrint} icon={<Printer className="w-4 h-4" />}>
                Print
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 print:py-0">
          <div className="no-print mb-4">
            <Link
              href={`/engines/${engine.slug}`}
              className="text-sm text-cream-400 hover:text-orange-400 transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Engine page: manual, specs &amp; parts
            </Link>
          </div>

          <div className="maint-print-container bg-white text-black rounded-xl shadow-2xl print:shadow-none p-8 sm:p-12 print:p-0">
            <div className="maint-print-header mb-6 print:mb-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1 print:text-2xl">
                    Maintenance Schedule
                  </h1>
                  <h2 className="text-xl font-semibold text-gray-700 print:text-lg">
                    {engineDisplayName}
                  </h2>
                </div>
                <div className="hidden print:block text-right text-sm text-gray-600">
                  {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            </div>

            <div className="maint-print-note bg-amber-50 border-2 border-amber-400 rounded-lg p-4 print:p-3 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Typical for small horizontal-shaft gas engines. Always check your owner&apos;s manual for your specific model and follow manufacturer recommendations.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto mb-6">
              <table className="maint-print-table w-full bg-white">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left py-3 px-4 text-sm font-bold text-gray-900 uppercase tracking-wide">
                      Interval
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-gray-900 uppercase tracking-wide">
                      Task
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {GAS_ENGINE_MAINTENANCE_SCHEDULE.map((row, i) => (
                    <tr key={i} className="border-b border-gray-200 last:border-0">
                      <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">{row.interval}</td>
                      <td className="py-3 px-4 text-gray-700">{row.task}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="maint-print-footer pt-4 border-t-2 border-gray-300 print:border-black">
              <p className="text-xs text-gray-500">
                GoKartPartPicker.com • {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
