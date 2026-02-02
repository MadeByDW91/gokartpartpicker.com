'use client';

import Link from 'next/link';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Sparkline } from './Sparkline';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  href?: string;
  color?: string;
  bgColor?: string;
  trend?: number[]; // Array of values for sparkline
  trendLabel?: string;
  subtitle?: string;
  loading?: boolean;
  className?: string;
}

/**
 * Enhanced stat card with sparkline and trend indicators
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  href,
  color = 'text-orange-400',
  bgColor = 'bg-orange-500/10',
  trend,
  trendLabel,
  subtitle,
  loading = false,
  className = '',
}: StatCardProps) {
  const content = (
    <Card
      hoverable={!!href}
      className={cn(
        'p-5 relative overflow-hidden group transition-all duration-300',
        'hover:shadow-lg hover:shadow-orange-500/10',
        className
      )}
    >
      {/* Background gradient effect */}
      <div className={cn('absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300', bgColor)} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-xs text-cream-400 uppercase tracking-wider font-medium mb-1">
              {label}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-cream-100">
                {loading ? '—' : typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {trend && trend.length > 1 && (
                <div className="flex items-center gap-1">
                  {trend[trend.length - 1] > trend[0] ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : trend[trend.length - 1] < trend[0] ? (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  ) : (
                    <Minus className="w-4 h-4 text-cream-500" />
                  )}
                </div>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-cream-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={cn('p-3 rounded-xl', bgColor, 'group-hover:scale-110 transition-transform duration-300')}>
            <Icon className={cn('w-6 h-6', color)} />
          </div>
        </div>

        {/* Sparkline */}
        {trend && trend.length > 0 && (
          <div className="mt-4 pt-4 border-t border-olive-600">
            <div className="flex items-center justify-between">
              <span className="text-xs text-cream-500">{trendLabel || 'Trend'}</span>
              <Sparkline
                data={trend}
                width={80}
                height={24}
                color={color.includes('orange') ? '#f97316' : color.includes('blue') ? '#60a5fa' : color.includes('green') ? '#4ade80' : color.includes('purple') ? '#a78bfa' : color.includes('cyan') ? '#22d3ee' : '#f97316'}
                className="opacity-70"
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
