'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { FileText, Download, Eye, Printer, Wrench } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { getAbsoluteManualUrl } from '@/lib/manual-url';
import { ManualViewer } from './ManualViewer';

interface ManualCardProps {
  manualUrl: string;
  engineName: string;
  type?: 'manual' | 'schematic';
  /** When set, show a link to the printable torque specs page */
  torqueSpecsHref?: string;
}

export function ManualCard({ manualUrl, engineName, type = 'manual', torqueSpecsHref }: ManualCardProps) {
  const [showViewer, setShowViewer] = useState(false);

  const title = 'Engine Manual';
  const description = 'Access the complete owner\'s manual with detailed specifications, maintenance instructions, and technical diagrams.';
  const filename = manualUrl.split('/').pop() || 'manual.pdf';

  // Resolve to absolute URL; /manuals/* paths become Supabase storage URLs so they don't 404
  const getAbsoluteUrl = getAbsoluteManualUrl;

  const handleView = () => {
    setShowViewer(true);
  };

  const handleDownload = () => {
    // Only allow download for actual file URLs (PDFs, etc.)
    // Don't download if it's a route or page URL
    const isFileUrl = manualUrl.match(/\.(pdf|doc|docx|txt|csv)$/i) || manualUrl.startsWith('http');
    
    if (!isFileUrl) {
      // If it's not a file URL, just open it in a new tab instead
      window.open(getAbsoluteUrl(manualUrl), '_blank', 'noopener,noreferrer');
      return;
    }
    
    const link = document.createElement('a');
    link.href = getAbsoluteUrl(manualUrl);
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    // Open manual in new tab; user can use browser Print (Ctrl/Cmd+P) there. Programmatic print() is unreliable for PDFs.
    const url = getAbsoluteUrl(manualUrl);
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (opened) {
      toast.info('Opened in new tab — use Print (Ctrl/Cmd+P) there to print.');
    }
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

  return (
    <>
      <Card className="rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-blue-500/5 shadow-sm transition-shadow hover:shadow-md h-full flex flex-col">
        <CardContent className="p-5 flex flex-col flex-1">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-500/20 shrink-0">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-cream-100 mb-2">{title}</h3>
              <p className="text-sm text-cream-400/90 leading-relaxed">
                {description}
              </p>
              {torqueSpecsHref && (
                <Link
                  href={torqueSpecsHref}
                  className="inline-flex items-center gap-1.5 mt-2 text-xs text-orange-400 hover:text-orange-300 transition-colors"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  Printable torque specs
                </Link>
              )}
            </div>
          </div>
          <div className="mt-auto">
            <DropdownMenu
              trigger="Manual Options"
              items={menuItems}
              variant="blue"
            />
          </div>
        </CardContent>
      </Card>

      {/* Manual Viewer Modal */}
      {showViewer && (
        <ManualViewer
          manualUrl={manualUrl}
          engineName={engineName}
          onClose={() => setShowViewer(false)}
        />
      )}
    </>
  );
}
