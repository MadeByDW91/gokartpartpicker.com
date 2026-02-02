'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Printer, Download, ArrowLeft, Wrench, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { Engine } from '@/types/database';
import type { EngineTorqueSpecs } from '@/data/torque-specs';

interface EngineTorqueSpecsViewProps {
  engine: Engine;
  specs: EngineTorqueSpecs;
}

export function EngineTorqueSpecsView({ engine, specs }: EngineTorqueSpecsViewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
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

  // Normalize torque values to ensure consistent formatting
  const normalizeTorqueValue = (value: string): string => {
    // Ensure all values have units if they're missing
    if (!value.toLowerCase().includes('ft-lb') && !value.toLowerCase().includes('in-lb')) {
      // If it's just numbers, assume ft-lb format
      return value.includes('-') ? `${value} ft-lb` : `${value} ft-lb`;
    }
    return value;
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            margin: 0.75in;
            size: letter;
          }
          
          .no-print {
            display: none !important;
          }
          
          body {
            background: white !important;
            color: black !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          }
          
          .print-container {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          .print-header {
            border-bottom: 3px solid #000;
            margin-bottom: 24px;
            padding-bottom: 16px;
            page-break-after: avoid;
          }
          
          .print-safety {
            background: #fff9e6 !important;
            border: 2px solid #f59e0b !important;
            padding: 16px !important;
            margin-bottom: 24px !important;
            border-radius: 8px !important;
            page-break-inside: avoid;
          }
          
          .print-table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 24px;
            page-break-inside: avoid;
          }
          
          .print-table th {
            background: #f3f4f6 !important;
            color: #000 !important;
            font-weight: 700;
            border: 1px solid #000;
            padding: 12px 16px;
            text-align: left;
            font-size: 12pt;
          }
          
          .print-table td {
            border: 1px solid #d1d5db;
            padding: 10px 16px;
            text-align: left;
            color: #000 !important;
            font-size: 11pt;
            vertical-align: top;
          }
          
          .print-table tr:nth-child(even) {
            background: #f9fafb !important;
          }
          
          .print-table tr:nth-child(odd) {
            background: #ffffff !important;
          }
          
          .print-footer {
            margin-top: 32px;
            padding-top: 16px;
            border-top: 2px solid #000;
            font-size: 9pt;
            color: #4b5563 !important;
            page-break-inside: avoid;
          }
          
          .torque-value {
            font-weight: 600;
            color: #000 !important;
            font-family: 'Courier New', monospace;
          }
          
          .component-name {
            font-weight: 600;
            color: #000 !important;
          }
        }
      `}</style>
      
      <div className="min-h-screen bg-olive-900">
        {/* Navigation Header - Hidden when printing */}
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
              
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExportCSV}
                  icon={<Download className="w-4 h-4" />}
                >
                  Export CSV
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handlePrint}
                  icon={<Printer className="w-4 h-4" />}
                >
                  Print
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 print:py-0">
          {/* Printable Content */}
          <div ref={printRef} className="print-container bg-white text-black rounded-xl shadow-2xl print:shadow-none p-8 sm:p-12 print:p-0">
            {/* Professional Header */}
            <div className="print-header mb-8 print:mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2 print:text-3xl">
                    Torque Specifications
                  </h1>
                  <h2 className="text-2xl font-semibold text-gray-700 print:text-xl">
                    {engine.brand} {engine.name}
                  </h2>
                </div>
                <div className="hidden print:block text-right">
                  <p className="text-sm text-gray-600">
                    {new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              <p className="text-base text-gray-600 print:text-sm">
                Complete fastener torque values for all engine components. Use a calibrated torque wrench for all installations.
              </p>
            </div>

            {/* Integrated Safety Notice */}
            <div className="mb-8 print:mb-6 print-safety bg-amber-50 border-2 border-amber-400 rounded-lg p-5 print:p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5 print:text-amber-800" />
                <div>
                  <h3 className="font-bold text-amber-900 mb-3 print:text-base print:mb-2">Important Safety Guidelines</h3>
                  <ul className="space-y-2 text-sm text-amber-800 print:text-xs print:space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="font-semibold shrink-0">•</span>
                      <span>Always use a calibrated torque wrench for accurate measurements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold shrink-0">•</span>
                      <span>Follow the specified torque values exactly—do not exceed or under-tighten</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold shrink-0">•</span>
                      <span>Overtightening can strip threads, damage components, or cause failure</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold shrink-0">•</span>
                      <span>Undertightening can lead to leaks, loose components, or safety hazards</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold shrink-0">•</span>
                      <span>Re-check torque values after the first few hours of operation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Clean Professional Table */}
            <div className="overflow-x-auto mb-8 print:mb-6">
              <table className="w-full border-collapse print-table bg-white">
                <thead>
                  <tr className="bg-gray-100 print:bg-gray-100">
                    <th className="text-left py-4 px-6 text-sm font-bold text-gray-900 uppercase tracking-wide print:py-3 print:px-4 print:text-xs">
                      Component
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-gray-900 uppercase tracking-wide print:py-3 print:px-4 print:text-xs">
                      Torque (ft-lb)
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-gray-900 uppercase tracking-wide print:py-3 print:px-4 print:text-xs">
                      Torque (in-lb)
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-gray-900 uppercase tracking-wide print:py-3 print:px-4 print:text-xs">
                      Installation Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {specs.specs.map((spec, index) => (
                    <tr
                      key={index}
                      className={cn(
                        'border-b border-gray-200 transition-colors',
                        'hover:bg-gray-50 print:hover:bg-transparent',
                        index === specs.specs.length - 1 && 'border-b-0'
                      )}
                    >
                      <td className="py-4 px-6 font-semibold text-gray-900 print:py-3 print:px-4 component-name">
                        {spec.component}
                      </td>
                      <td className="py-4 px-6 text-gray-900 print:py-3 print:px-4 torque-value">
                        {normalizeTorqueValue(spec.torqueFtLb)}
                      </td>
                      <td className="py-4 px-6 text-gray-900 print:py-3 print:px-4 torque-value">
                        {spec.torqueInLb}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700 print:py-3 print:px-4 print:text-xs">
                        {spec.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Professional Footer */}
            <div className="print-footer pt-6 border-t-2 border-gray-300 print:border-black">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:flex-row print:gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900 print:text-xs print:font-bold">
                    Always use a calibrated torque wrench
                  </p>
                  <p className="text-xs text-gray-600 print:text-xs print:mt-1">
                    Overtightening or undertightening can cause component failure or safety hazards
                  </p>
                </div>
                <p className="text-xs text-gray-500 print:text-xs">
                  GoKartPartPicker.com • {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
