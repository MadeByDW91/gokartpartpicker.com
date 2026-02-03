'use client';

import { useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';
import { useFocusTrap } from '@/hooks/use-focus-trap';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { AdvancedSearch } from './AdvancedSearch';
import type { Engine, Part } from '@/types/database';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResultClick?: (result: Engine | Part) => void;
}

export function SearchModal({ isOpen, onClose, onResultClick }: SearchModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, isOpen);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleResultClick = (result: Engine | Part) => {
    if (onResultClick) {
      onResultClick(result);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-20 safe-area-top">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-olive-900/90 backdrop-blur-sm" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-modal-title"
        className="relative w-full max-w-3xl h-full sm:h-auto flex flex-col"
      >
        <Card className="border border-olive-600 shadow-2xl flex-1 sm:flex-none flex flex-col">
          <CardContent className="p-4 sm:p-6 flex-1 flex flex-col min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6 flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-cream-100" />
                </div>
                <div className="min-w-0">
                  <h2 id="search-modal-title" className="text-display text-lg sm:text-xl text-cream-100">Search</h2>
                  <p className="text-xs sm:text-sm text-cream-400 hidden sm:block">Find engines, parts, and more</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="text-cream-400 hover:text-cream-100 flex-shrink-0 min-w-[44px] min-h-[44px] touch-manipulation"
                aria-label="Close search"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
            </div>

            {/* Search Input */}
            <div className="mb-4 flex-shrink-0">
              <AdvancedSearch 
                placeholder="Search engines, parts, builds..." 
                onResultClick={handleResultClick}
              />
            </div>

            {/* Keyboard Shortcut Hint - Desktop only */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-cream-500 pt-4 border-t border-olive-700 flex-shrink-0">
              <kbd className="px-2 py-1 bg-olive-700 rounded text-cream-300 font-mono">
                ESC
              </kbd>
              <span>to close</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
