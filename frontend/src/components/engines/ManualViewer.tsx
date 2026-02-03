'use client';

import { useEffect, useState } from 'react';
import { X, Download, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getAbsoluteManualUrl } from '@/lib/manual-url';

interface ManualViewerProps {
  manualUrl: string;
  engineName: string;
  onClose: () => void;
}

const isPdfUrl = (url: string) => /\.(pdf|doc|docx|txt|csv)$/i.test(url) || url.includes('.pdf?');

export function ManualViewer({ manualUrl, engineName, onClose }: ManualViewerProps) {
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [iframeBlocked, setIframeBlocked] = useState(false);
  const pdfOftenBlockedInIframe = isPdfUrl(manualUrl);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    // Close on Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Extract filename for download
  const filename = manualUrl.split('/').pop() || 'manual.pdf';

  // Resolve to absolute URL; /manuals/* paths become Supabase storage URLs so they don't 404
  const absoluteUrl = getAbsoluteManualUrl(manualUrl);

  // Handle iframe load with timeout
  useEffect(() => {
    // Reset loading state when URL changes
    setIsLoading(true);
    setLoadError(false);
    
    // Set a timeout - if still loading after 15 seconds, hide loading spinner
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 15000);

    return () => clearTimeout(timeout);
  }, [manualUrl]);

  const handleIframeLoad = () => {
    setTimeout(() => {
      setIsLoading(false);
      // For PDFs, many hosts block embedding; assume we may need fallback
      if (pdfOftenBlockedInIframe) {
        setIframeBlocked(true);
      }
    }, 1200);
  };

  const handleIframeError = () => {
    setLoadError(true);
    setIframeBlocked(true);
    setIsLoading(false);
  };
  
  // Also hide loading after reasonable timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
      }
    }, 8000);
    return () => clearTimeout(timeout);
  }, [isLoading]);

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-6xl h-[90vh] bg-olive-800 rounded-lg overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-olive-900 border-b border-olive-700 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-cream-100 truncate">
              {engineName} - Owner's Manual
            </h2>
            <p className="text-sm text-cream-400 truncate">
              {filename}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            {/* Download button - only show for actual file URLs */}
            {isPdfUrl(manualUrl) && (
              <a
                href={absoluteUrl}
                download={filename}
                className="flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Download className="w-4 h-4" />}
                >
                  Download
                </Button>
              </a>
            )}
            {/* Open in new tab */}
            <a
              href={absoluteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="sm"
                icon={<ExternalLink className="w-4 h-4" />}
              >
                Open
              </Button>
            </a>
            {/* Close button */}
            <button
              onClick={onClose}
              className="w-10 h-10 bg-olive-700 hover:bg-olive-600 rounded-lg flex items-center justify-center text-cream-100 transition-colors flex-shrink-0"
              aria-label="Close manual viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden bg-olive-900 relative">
          {loadError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
              <AlertCircle className="w-12 h-12 text-orange-400 mb-4" />
              <h3 className="text-lg font-semibold text-cream-100 mb-2">
                Unable to Load Manual
              </h3>
              <p className="text-sm text-cream-400 mb-4 max-w-md">
                The manual PDF could not be loaded. It may not exist yet or there may be a connection issue.
              </p>
              <div className="flex gap-3">
                <a
                  href={absoluteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button variant="primary" icon={<ExternalLink className="w-4 h-4" />}>
                    Open in New Tab
                  </Button>
                </a>
                {isPdfUrl(manualUrl) && (
                  <a
                    href={absoluteUrl}
                    download={filename}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button variant="secondary" icon={<Download className="w-4 h-4" />}>
                      Try Download
                    </Button>
                  </a>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* PDFs often can't be embedded (CORS/X-Frame-Options). Show open/download so view & print work. */}
              {(iframeBlocked || pdfOftenBlockedInIframe) ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <p className="text-sm text-cream-400 mb-4 max-w-md">
                    Use the buttons below to open or download the manual. You can view and print from the new tab.
                  </p>
                  <div className="flex gap-3 flex-wrap justify-center">
                    <a
                      href={absoluteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="primary" icon={<ExternalLink className="w-4 h-4" />}>
                        Open in new tab
                      </Button>
                    </a>
                    {isPdfUrl(manualUrl) && (
                      <a
                        href={absoluteUrl}
                        download={filename}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="secondary" icon={<Download className="w-4 h-4" />}>
                          Download
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-olive-900/80 z-10">
                      <div className="text-center">
                        <div className="inline-block w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin mb-3" />
                        <p className="text-sm text-cream-400">Loading manual...</p>
                      </div>
                    </div>
                  )}
                  <iframe
                    key={absoluteUrl}
                    src={`${absoluteUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                    className="w-full h-full border-0"
                    title={`${engineName} Owner's Manual`}
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                    allow="fullscreen"
                    style={{ minHeight: '600px' }}
                    loading="eager"
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
