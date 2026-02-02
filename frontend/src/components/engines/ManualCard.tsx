'use client';

import { useState } from 'react';
import { FileText, Download, Eye, Printer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { ManualViewer } from './ManualViewer';

interface ManualCardProps {
  manualUrl: string;
  engineName: string;
  type?: 'manual' | 'schematic';
}

export function ManualCard({ manualUrl, engineName, type = 'manual' }: ManualCardProps) {
  const [showViewer, setShowViewer] = useState(false);

  const title = 'Engine Manual Available';
  const description = 'Access the complete owner\'s manual with detailed specifications, maintenance instructions, and technical diagrams.';
  const filename = manualUrl.split('/').pop() || 'manual.pdf';
  
  // Ensure URL is absolute for download link
  const getAbsoluteUrl = (url: string) => {
    if (typeof window === 'undefined') return url;
    return url.startsWith('http') ? url : `${window.location.origin}${url.startsWith('/') ? url : `/${url}`}`;
  };

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
    const printWindow = window.open(getAbsoluteUrl(manualUrl), '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
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
