'use client';

import Link from 'next/link';
import { Wrench, Calendar, DollarSign, Globe, Lock, MoreVertical, Trash2, Edit, GitCompare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Build } from '@/types/database';
import { useState } from 'react';

interface BuildCardProps {
  build: Build;
  onDelete?: (id: string) => void;
  onEdit?: (build: Build) => void;
  showActions?: boolean;
}

export function BuildCard({ 
  build, 
  onDelete, 
  onEdit,
  showActions = true 
}: BuildCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const partCount = Object.keys(build.parts || {}).length;
  
  return (
    <Card hoverable className="relative">
      <CardContent className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <Link 
              href={`/builds/${build.id}`}
              className="text-lg font-bold text-cream-100 hover:text-orange-400 transition-colors line-clamp-1"
            >
              {build.name}
            </Link>
            <div className="flex items-center gap-3 mt-1 text-sm text-cream-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(build.updated_at)}
              </span>
              {build.is_public ? (
                <Badge variant="success" size="sm">
                  <Globe className="w-3 h-3" />
                  Public
                </Badge>
              ) : (
                <Badge variant="default" size="sm">
                  <Lock className="w-3 h-3" />
                  Private
                </Badge>
              )}
            </div>
          </div>
          
          {/* Actions Menu */}
          {showActions && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1.5 text-cream-400 hover:text-cream-100 hover:bg-olive-600 rounded transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {menuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setMenuOpen(false)} 
                  />
                  <div className="absolute right-0 mt-1 w-40 bg-olive-800 border border-olive-600 rounded-lg shadow-lg z-20 overflow-hidden">
                    <Link
                      href={`/builds/compare?builds=${build.id}`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-cream-200 hover:bg-olive-700 hover:text-orange-400 transition-colors"
                    >
                      <GitCompare className="w-4 h-4" />
                      Compare
                    </Link>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit?.(build);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-cream-200 hover:bg-olive-700 hover:text-orange-400 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete?.(build.id);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-cream-200 hover:bg-olive-700 hover:text-[var(--error)] transition-colors border-t border-olive-600"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        
        {/* Description */}
        {build.description && (
          <p className="text-sm text-cream-400 line-clamp-2">
            {build.description}
          </p>
        )}
        
        {/* Engine Info */}
        {build.engine && (
          <div className="flex items-center gap-2 px-3 py-2 bg-olive-800 rounded-md">
            <Wrench className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-cream-200">
              <span className="text-cream-400">Engine:</span>{' '}
              {build.engine.brand} {build.engine.name}
            </span>
          </div>
        )}
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-olive-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-xl font-bold text-orange-400">
              <DollarSign className="w-5 h-5" />
              {formatPrice(build.total_price).replace('$', '')}
            </span>
            <span className="text-sm text-cream-400">
              {partCount} part{partCount !== 1 ? 's' : ''}
            </span>
          </div>
          
          <Link href={`/builds/${build.id}`}>
            <Button variant="secondary" size="sm">
              View Build
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
