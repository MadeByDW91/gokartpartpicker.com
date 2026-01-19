'use client';

import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const variants = {
      default: 'bg-olive-600/50 text-cream-200 border-olive-500',
      success: 'bg-[rgba(74,124,89,0.2)] text-[#6fa87e] border-[rgba(74,124,89,0.4)]',
      warning: 'bg-[rgba(212,128,60,0.2)] text-[#e09654] border-[rgba(212,128,60,0.4)]',
      error: 'bg-[rgba(166,61,64,0.2)] text-[#c46366] border-[rgba(166,61,64,0.4)]',
      info: 'bg-[rgba(90,125,154,0.2)] text-[#7a9db9] border-[rgba(90,125,154,0.4)]',
    };
    
    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-xs',
    };
    
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 font-semibold uppercase tracking-wide rounded-full border',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
