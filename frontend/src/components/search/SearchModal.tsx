'use client';

import { useEffect } from 'react';
import { X, Search } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-olive-900/90 backdrop-blur-sm" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-3xl">
        <Card className="border border-olive-600 shadow-2xl">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                  <Search className="w-5 h-5 text-cream-100" />
                </div>
                <div>
                  <h2 className="text-display text-xl text-cream-100">Search</h2>
                  <p className="text-sm text-cream-400">Find engines, parts, and more</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="text-cream-400 hover:text-cream-100"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Search Input */}
            <div className="mb-4">
              <AdvancedSearch 
                placeholder="Search engines, parts, builds..." 
                onResultClick={handleResultClick}
              />
            </div>

            {/* Keyboard Shortcut Hint */}
            <div className="flex items-center gap-2 text-xs text-cream-500 pt-4 border-t border-olive-700">
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
