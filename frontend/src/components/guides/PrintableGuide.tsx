'use client';

import { useRef } from 'react';
import { Printer, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { GuideWithSteps } from '@/types/guides';
import { formatDate } from '@/lib/utils';

interface PrintableGuideProps {
  guide: GuideWithSteps;
  engineName?: string;
}

export function PrintableGuide({ guide, engineName }: PrintableGuideProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = printRef.current.innerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${guide.title} - Maintenance Guide</title>
          <style>
            @media print {
              @page {
                margin: 0.5in;
              }
              body {
                font-family: Arial, sans-serif;
                color: #000;
                line-height: 1.6;
              }
              .no-print {
                display: none;
              }
              .page-break {
                page-break-after: always;
              }
            }
            body {
              font-family: Arial, sans-serif;
              color: #000;
              line-height: 1.6;
              max-width: 8.5in;
              margin: 0 auto;
              padding: 20px;
            }
            h1 {
              color: #f97316;
              border-bottom: 3px solid #f97316;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            h2 {
              color: #333;
              margin-top: 30px;
              margin-bottom: 15px;
            }
            .meta-info {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .step {
              margin-bottom: 25px;
              padding: 15px;
              border-left: 4px solid #f97316;
              background: #fafafa;
            }
            .step-number {
              font-weight: bold;
              color: #f97316;
              font-size: 1.2em;
            }
            .step-title {
              font-weight: bold;
              margin-bottom: 10px;
            }
            .step-content {
              margin-top: 10px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #ddd;
              text-align: center;
              color: #666;
              font-size: 0.9em;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;

    try {
      // Use html2pdf library or similar
      // For now, we'll use browser's print to PDF
      handlePrint();
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('PDF generation failed. Please use the print option and save as PDF.');
    }
  };

  const isMaintenanceGuide = guide.category === 'Maintenance';

  return (
    <div>
      {/* Print/Download Buttons */}
      <div className="flex items-center gap-2 mb-4 no-print">
        <Button
          variant="primary"
          onClick={handlePrint}
          icon={<Printer className="w-4 h-4" />}
        >
          Print Guide
        </Button>
        <Button
          variant="secondary"
          onClick={handleDownloadPDF}
          icon={<Download className="w-4 h-4" />}
        >
          Save as PDF
        </Button>
        {isMaintenanceGuide && (
          <div className="flex items-center gap-2 text-sm text-cream-400">
            <FileText className="w-4 h-4" />
            <span>Maintenance guides are optimized for printing</span>
          </div>
        )}
      </div>

      {/* Printable Content */}
      <div ref={printRef} className="bg-white text-black p-8 rounded-lg">
        <style jsx>{`
          @media print {
            .no-print {
              display: none !important;
            }
          }
        `}</style>
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{guide.title}</h1>
          {engineName && (
            <p className="text-lg text-gray-600 mb-2">
              <strong>Engine:</strong> {engineName}
            </p>
          )}
          {guide.category && (
            <p className="text-sm text-gray-500 mb-4">
              Category: {guide.category}
            </p>
          )}
        </div>

        {/* Meta Information */}
        <div className="meta-info mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {guide.difficulty_level && (
              <div>
                <strong>Difficulty:</strong> {guide.difficulty_level}
              </div>
            )}
            {guide.estimated_time_minutes && (
              <div>
                <strong>Estimated Time:</strong> ~{guide.estimated_time_minutes} minutes
              </div>
            )}
            <div>
              <strong>Date:</strong> {formatDate(new Date().toISOString())}
            </div>
            {guide.views_count !== undefined && (
              <div>
                <strong>Views:</strong> {guide.views_count}
              </div>
            )}
          </div>
        </div>

        {/* Introduction */}
        {guide.body && (
          <div className="mb-8">
            <h2>Introduction</h2>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: guide.body }}
            />
          </div>
        )}

        {/* Steps */}
        {guide.steps && guide.steps.length > 0 && (
          <div className="mb-8">
            <h2>Step-by-Step Instructions</h2>
            {guide.steps.map((step, index) => (
              <div key={step.id} className="step">
                <div className="step-number">Step {step.step_number}</div>
                <div className="step-title">{step.title}</div>
                {step.instructions && (
                  <div 
                    className="step-content"
                    dangerouslySetInnerHTML={{ __html: step.instructions }}
                  />
                )}
                {step.description && (
                  <div className="step-description">{step.description}</div>
                )}
                {step.warning && (
                  <div className="step-warning">⚠️ {step.warning}</div>
                )}
                {step.tips && (
                  <div className="step-tips">💡 {step.tips}</div>
                )}
                {step.image_url && (
                  <div className="mt-4">
                    <img 
                      src={step.image_url} 
                      alt={step.title}
                      className="max-w-full h-auto rounded"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="footer">
          <p>Generated from GoKartPartPicker.com</p>
          <p>For the most up-to-date information, visit: https://gokartpartpicker.com/guides/{guide.slug}</p>
        </div>
      </div>
    </div>
  );
}
