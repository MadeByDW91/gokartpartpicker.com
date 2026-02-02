'use client';

import Link from 'next/link';
import { Printer, Download, Eye, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { getTorqueSpecs, type EngineTorqueSpecs } from '@/data/torque-specs';
import type { Engine } from '@/types/database';

interface EngineTorqueSpecsProps {
  engine: Engine;
  compact?: boolean;
}

export function EngineTorqueSpecs({ engine, compact = false }: EngineTorqueSpecsProps) {
  const specs = getTorqueSpecs(engine.slug);

  if (!specs) {
    return null;
  }

  const handleView = () => {
    window.open(`/engines/${engine.slug}/torque-specs`, '_blank');
  };

  const handlePrint = () => {
    const printWindow = window.open(`/engines/${engine.slug}/torque-specs`, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleDownload = () => {
    const csvRows = [
      ['Component', 'Torque (ft-lb)', 'Torque (in-lb)', 'Notes'],
      ...specs.specs.map(spec => [
        spec.component,
        spec.torqueFtLb,
        spec.torqueInLb,
        spec.notes || ''
      ]),
    ];

    const csv = csvRows.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `torque-specs-${engine.slug}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const menuItems = [
    {
      label: 'View',
      icon: Eye,
      onClick: handleView,
    },
    {
      label: 'Download',
      icon: Download,
      onClick: handleDownload,
    },
    {
      label: 'Print',
      icon: Printer,
      onClick: handlePrint,
    },
  ];

  if (compact) {
    return (
      <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/10 via-orange-600/5 to-orange-500/5 h-full flex flex-col">
        <CardContent className="p-5 flex flex-col flex-1">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-500/20 border border-orange-500/20 shrink-0">
                <Wrench className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-cream-100 mb-1">Torque Specifications</h3>
                <p className="text-sm text-cream-400/90">
                  Complete fastener torque values for this engine
                </p>
              </div>
            </div>
          </div>
          <div className="mt-auto">
            <DropdownMenu
              trigger="Torque Specs Options"
              items={menuItems}
              variant="orange"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-olive-600/50 bg-olive-800/40">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-cream-100">Torque Specifications</h3>
            <p className="text-sm text-cream-400 mt-1">
              Complete fastener torque values for {engine.name}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownload}
              icon={<Download className="w-4 h-4" />}
            >
              Export CSV
            </Button>
            <Link href={`/engines/${engine.slug}/torque-specs`}>
              <Button
                variant="secondary"
                size="sm"
                icon={<Printer className="w-4 h-4" />}
              >
                View & Print
              </Button>
            </Link>
          </div>
        </div>
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
              {specs.specs.slice(0, 5).map((spec, index) => (
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
        {specs.specs.length > 5 && (
          <div className="mt-4 text-center">
            <Link href={`/engines/${engine.slug}/torque-specs`}>
              <Button variant="ghost" size="sm">
                View All {specs.specs.length} Specifications
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
