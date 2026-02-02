'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, type, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    // Determine inputMode based on type for better mobile keyboard
    const getInputMode = (): React.InputHTMLAttributes<HTMLInputElement>['inputMode'] => {
      if (props.inputMode) return props.inputMode; // Allow override
      
      switch (type) {
        case 'email':
          return 'email';
        case 'tel':
          return 'tel';
        case 'url':
          return 'url';
        case 'number':
          return 'numeric';
        case 'search':
          return 'search';
        default:
          // For text inputs, infer from label/name if possible
          const lowerLabel = label?.toLowerCase() || '';
          const lowerName = (props.name || '').toLowerCase();
          const combined = `${lowerLabel} ${lowerName}`;
          
          if (combined.includes('email')) return 'email';
          if (combined.includes('phone') || combined.includes('tel')) return 'tel';
          if (combined.includes('url') || combined.includes('link')) return 'url';
          if (combined.includes('price') || combined.includes('cost') || combined.includes('hp') || combined.includes('cc') || combined.includes('weight') || combined.includes('torque')) return 'decimal';
          if (combined.includes('number') || combined.includes('count') || combined.includes('quantity')) return 'numeric';
          
          return undefined;
      }
    };
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-cream-200 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            inputMode={getInputMode()}
            autoComplete={props.autoComplete || (type === 'email' ? 'email' : type === 'tel' ? 'tel' : undefined)}
            className={cn(
              'w-full px-4 py-3 min-h-[44px] bg-olive-800 border-2 border-olive-600 rounded-md text-cream-100 placeholder:text-cream-400 transition-colors focus:outline-none focus:border-orange-500 text-base sm:text-sm',
              icon && 'pl-10',
              error && 'border-[var(--error)] focus:border-[var(--error)]',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-[var(--error)]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
