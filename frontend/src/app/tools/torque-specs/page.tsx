'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Download, Printer, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';

// Torque specifications for common small engines
const TORQUE_SPECS = {
  predator_212: {
    name: 'Predator 212',
    specs: [
      { component: 'Cylinder Head Bolts', torque: '12-15 ft-lb', notes: 'Tighten in crisscross pattern' },
      { component: 'Connecting Rod Bolts', torque: '8-10 ft-lb', notes: 'Critical - do not over-tighten' },
      { component: 'Flywheel Nut', torque: '50-55 ft-lb', notes: 'Use thread locker' },
      { component: 'Spark Plug', torque: '10-12 ft-lb', notes: 'Hand tight + 1/4 turn' },
      { component: 'Oil Drain Plug', torque: '8-10 ft-lb', notes: 'Replace crush washer' },
      { component: 'Carburetor Mounting Bolts', torque: '5-7 ft-lb', notes: 'Even pressure' },
      { component: 'Exhaust Mounting Bolts', torque: '8-10 ft-lb', notes: 'Check after first run' },
      { component: 'Air Filter Cover Screws', torque: '3-5 ft-lb', notes: 'Snug only' },
      { component: 'Governor Arm Screw', torque: '5-7 ft-lb', notes: 'If applicable' },
      { component: 'Valve Cover Bolts', torque: '5-7 ft-lb', notes: 'Even pattern' },
    ],
  },
  predator_224: {
    name: 'Predator 224',
    specs: [
      { component: 'Cylinder Head Bolts', torque: '12-15 ft-lb', notes: 'Tighten in crisscross pattern' },
      { component: 'Connecting Rod Bolts', torque: '8-10 ft-lb', notes: 'Critical - do not over-tighten' },
      { component: 'Flywheel Nut', torque: '50-55 ft-lb', notes: 'Use thread locker' },
      { component: 'Spark Plug', torque: '10-12 ft-lb', notes: 'Hand tight + 1/4 turn' },
      { component: 'Oil Drain Plug', torque: '8-10 ft-lb', notes: 'Replace crush washer' },
      { component: 'Carburetor Mounting Bolts', torque: '5-7 ft-lb', notes: 'Even pressure' },
      { component: 'Exhaust Mounting Bolts', torque: '8-10 ft-lb', notes: 'Check after first run' },
    ],
  },
  honda_gx200: {
    name: 'Honda GX200',
    specs: [
      { component: 'Cylinder Head Bolts', torque: '14-16 ft-lb', notes: 'Tighten in sequence' },
      { component: 'Connecting Rod Bolts', torque: '9-11 ft-lb', notes: 'Critical' },
      { component: 'Flywheel Nut', torque: '55-60 ft-lb', notes: 'Use thread locker' },
      { component: 'Spark Plug', torque: '11-13 ft-lb', notes: 'Hand tight + 1/4 turn' },
      { component: 'Oil Drain Plug', torque: '9-11 ft-lb', notes: 'Replace crush washer' },
      { component: 'Carburetor Mounting Bolts', torque: '6-8 ft-lb', notes: 'Even pressure' },
      { component: 'Exhaust Mounting Bolts', torque: '9-11 ft-lb', notes: 'Check after first run' },
    ],
  },
  generic_212: {
    name: 'Generic 212cc Clone',
    specs: [
      { component: 'Cylinder Head Bolts', torque: '12-15 ft-lb', notes: 'Tighten in crisscross pattern' },
      { component: 'Connecting Rod Bolts', torque: '8-10 ft-lb', notes: 'Critical - do not over-tighten' },
      { component: 'Flywheel Nut', torque: '50-55 ft-lb', notes: 'Use thread locker' },
      { component: 'Spark Plug', torque: '10-12 ft-lb', notes: 'Hand tight + 1/4 turn' },
      { component: 'Oil Drain Plug', torque: '8-10 ft-lb', notes: 'Replace crush washer' },
      { component: 'Carburetor Mounting Bolts', torque: '5-7 ft-lb', notes: 'Even pressure' },
      { component: 'Exhaust Mounting Bolts', torque: '8-10 ft-lb', notes: 'Check after first run' },
    ],
  },
};

export default function TorqueSpecsPage() {
  const [selectedEngine, setSelectedEngine] = useState<keyof typeof TORQUE_SPECS>('predator_212');
  const currentSpecs = TORQUE_SPECS[selectedEngine];

  const handleExportCSV = () => {
    const csvRows = [
      ['Component', 'Torque Specification', 'Notes'],
      ...currentSpecs.specs.map(spec => [spec.component, spec.torque, spec.notes]),
    ];

    const csv = csvRows.map(row => 
      row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `torque-specs-${selectedEngine}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

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
              value={selectedEngine}
              onChange={(e) => setSelectedEngine(e.target.value as keyof typeof TORQUE_SPECS)}
              options={Object.keys(TORQUE_SPECS).map(key => ({
                value: key,
                label: TORQUE_SPECS[key as keyof typeof TORQUE_SPECS].name,
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
                    <th className="text-left py-3 px-4 text-sm font-semibold text-cream-100">Torque</th>
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
                        <Badge variant="default">{spec.torque}</Badge>
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
