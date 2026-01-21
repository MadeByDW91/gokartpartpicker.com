'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, Download, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { useEngines } from '@/hooks/use-engines';
import { TORQUE_SPECS, getTorqueSpecs, type EngineTorqueSpecs } from '@/data/torque-specs';

export default function TorqueSpecsPage() {
  const { data: engines } = useEngines();
  
  // Get available engines that have torque specs
  const availableEngines = useMemo(() => {
    if (!engines) return [];
    return engines
      .filter(engine => TORQUE_SPECS[engine.slug])
      .map(engine => ({
        slug: engine.slug,
        name: engine.name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [engines]);

  // Default to first available engine, or fallback to predator-212-hemi
  const defaultEngineSlug = availableEngines[0]?.slug || 'predator-212-hemi';
  const [selectedEngineSlug, setSelectedEngineSlug] = useState<string>(defaultEngineSlug);
  
  const currentSpecs: EngineTorqueSpecs | null = getTorqueSpecs(selectedEngineSlug);

  const handleExportCSV = () => {
    if (!currentSpecs) return;
    
    const csvRows = [
      ['Component', 'Torque (ft-lb)', 'Torque (in-lb)', 'Notes'],
      ...currentSpecs.specs.map(spec => [
        spec.component,
        spec.torqueFtLb,
        spec.torqueInLb,
        spec.notes
      ]),
    ];

    const csv = csvRows.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `torque-specs-${selectedEngineSlug}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!currentSpecs) {
    return (
      <div className="min-h-screen bg-olive-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-cream-300">Loading torque specifications...</p>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-olive-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/tools"
            className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Tools
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-display text-3xl text-cream-100 mb-2">Torque Specifications</h1>
              <p className="text-cream-300">
                Complete torque specifications for engine fasteners
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportCSV}
                icon={<Download className="w-4 h-4" />}
              >
                Export CSV
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePrint}
                icon={<Printer className="w-4 h-4" />}
              >
                Print
              </Button>
            </div>
          </div>
        </div>

        {/* Engine Selector */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <label className="block text-sm font-medium text-cream-200 mb-2">
              Select Engine Type
            </label>
            <Select
              value={selectedEngineSlug}
              onChange={(e) => setSelectedEngineSlug(e.target.value)}
              options={availableEngines.map(engine => ({
                value: engine.slug,
                label: engine.name,
              }))}
            />
          </CardContent>
        </Card>

        {/* Torque Specs Table */}
        <Card className="print:shadow-none">
          <CardHeader>
            <h2 className="text-xl font-semibold text-cream-100">
              {currentSpecs.name} Torque Specifications
            </h2>
            <p className="text-sm text-cream-400 mt-1">
              Always use a calibrated torque wrench. Overtightening can cause damage.
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-olive-600">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-cream-100">Component</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-cream-100">Torque (ft-lb)</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-cream-100">Torque (in-lb)</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-cream-100">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSpecs.specs.map((spec, index) => (
                    <tr
                      key={index}
                      className="border-b border-olive-700 hover:bg-olive-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-cream-200 font-medium">{spec.component}</td>
                      <td className="py-3 px-4">
                        <Badge variant="default">{spec.torqueFtLb}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="info">{spec.torqueInLb}</Badge>
                      </td>
                      <td className="py-3 px-4 text-cream-300 text-sm">{spec.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Safety Notice */}
        <Card className="mt-6 border-yellow-500/30 bg-yellow-500/10 print:hidden">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-yellow-400 mb-2">⚠️ Safety Notice</h3>
            <ul className="text-sm text-cream-300 space-y-1 list-disc list-inside">
              <li>Always use a calibrated torque wrench</li>
              <li>Follow the specified torque values exactly</li>
              <li>Overtightening can strip threads or cause component failure</li>
              <li>Undertightening can lead to leaks or loose components</li>
              <li>Check torque values after the first few hours of operation</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
