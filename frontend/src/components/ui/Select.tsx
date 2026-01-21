'use client';

import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, children, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-cream-200 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full px-4 py-3 min-h-[44px] bg-olive-800 border-2 border-olive-600 rounded-md text-cream-100 appearance-none transition-colors focus:outline-none focus:border-orange-500 cursor-pointer text-base sm:text-sm touch-manipulation',
              error && 'border-[var(--error)] focus:border-[var(--error)]',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {/* Support both options prop and children */}
            {options
              ? options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
                ))
              : children}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-400 pointer-events-none" />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-[var(--error)]">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
