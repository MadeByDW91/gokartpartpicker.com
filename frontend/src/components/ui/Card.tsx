'use client';

import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'accent' | 'ghost';
  hoverable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hoverable = false, children, ...props }, ref) => {
    const variants = {
      default: 'bg-olive-800/50 border border-olive-700/50',
      accent: 'bg-olive-800/50 border-2 border-orange-500/50',
      ghost: 'bg-transparent border border-olive-700/30',
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl transition-colors duration-200',
          variants[variant],
          hoverable && 'hover:border-orange-500/50 cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-5 py-4 border-b border-olive-600', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-5 py-4', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-5 py-4 border-t border-olive-600', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold text-cream-100', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

export { Card, CardHeader, CardContent, CardFooter, CardTitle };
