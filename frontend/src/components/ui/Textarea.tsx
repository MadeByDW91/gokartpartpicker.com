'use client';

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={cn(
            'w-full px-4 py-3 min-h-[44px] bg-olive-800 border-2 border-olive-600 rounded-md text-cream-100 placeholder:text-cream-400 focus:outline-none focus:border-orange-500 transition-colors text-base sm:text-sm resize-y touch-manipulation',
            error ? 'border-[var(--error)] focus:border-[var(--error)]' : '',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-[var(--error)]">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
