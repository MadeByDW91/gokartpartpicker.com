'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download, Package, Cog } from 'lucide-react';

export default function ReportsExportPage() {
  const exports = [
    {
      title: 'Engines',
      description: 'Export gas engines and electric motors as CSV (filtered on Engines page).',
      href: '/admin/engines/export',
      icon: Cog,
    },
    {
      title: 'Parts',
      description: 'Export parts catalog as CSV (filtered on Parts page).',
      href: '/admin/parts/export',
      icon: Package,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display text-3xl text-cream-100">Export Catalog</h1>
        <p className="text-cream-300 mt-1">
          Download catalog data as CSV for backup, analysis, or migration
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exports.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="bg-olive-800 border-olive-600">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-orange-400" />
                  <h2 className="text-lg font-semibold text-cream-100">{item.title}</h2>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-cream-400">{item.description}</p>
                <Link href={item.href}>
                  <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />}>
                    Export {item.title}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-olive-800/50 border-olive-600">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-cream-100 mb-2">Tip</h3>
          <p className="text-sm text-cream-400">
            Use filters and search on the Engines or Parts list pages before visiting their export
            pages to export only the subset you need.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
