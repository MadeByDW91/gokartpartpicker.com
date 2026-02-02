'use client';

import { Button } from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onNext?: () => void;
  onPrev?: () => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  onNext,
  onPrev,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onPrev}
        disabled={currentPage === 1}
        icon={<ChevronLeft className="w-4 h-4" />}
        className="min-h-[44px] touch-manipulation"
      >
        <span className="hidden sm:inline">Previous</span>
        <span className="sm:hidden">Prev</span>
      </Button>
      
      {/* Desktop: Full pagination with page numbers */}
      <div className="hidden md:flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-cream-400">
                ...
              </span>
            );
          }
          
          const pageNum = page as number;
          const isActive = pageNum === currentPage;
          
          return (
            <Button
              key={pageNum}
              variant={isActive ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              className={cn(
                'min-w-[2.5rem] min-h-[44px] touch-manipulation',
                isActive && 'font-bold'
              )}
            >
              {pageNum}
            </Button>
          );
        })}
      </div>
      
      {/* Mobile: Current page indicator */}
      <div className="md:hidden px-3 py-1.5 text-sm text-cream-300 bg-olive-800 rounded-md border border-olive-600 min-h-[44px] flex items-center justify-center">
        {currentPage} / {totalPages}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onNext}
        disabled={currentPage === totalPages}
        className="min-h-[44px] touch-manipulation"
      >
        <span className="hidden sm:inline">Next</span>
        <span className="sm:hidden">Next</span>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
