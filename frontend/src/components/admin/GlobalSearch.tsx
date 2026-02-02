'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { adminGlobalSearch, type SearchResult, type SearchEntityType } from '@/actions/admin/search';
import {
  Search,
  Cog,
  Package,
  Wrench,
  Users,
  FileText,
  BookOpen,
  Video,
  MessageSquare,
  Loader2,
  Command,
  X,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TYPE_LABELS: Record<SearchEntityType, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  engine: { label: 'Engine', icon: Cog, color: 'text-orange-400' },
  motor: { label: 'Electric Motor', icon: Cog, color: 'text-blue-400' },
  part: { label: 'Part', icon: Package, color: 'text-blue-400' },
  build: { label: 'Build', icon: Wrench, color: 'text-green-400' },
  user: { label: 'User', icon: Users, color: 'text-purple-400' },
  template: { label: 'Template', icon: FileText, color: 'text-blue-400' },
  guide: { label: 'Guide', icon: BookOpen, color: 'text-purple-400' },
  video: { label: 'Video', icon: Video, color: 'text-red-400' },
  forum_topic: { label: 'Forum Topic', icon: MessageSquare, color: 'text-green-400' },
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  published: 'bg-green-500/20 text-green-400 border-green-500/30',
  draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

interface GlobalSearchProps {
  className?: string;
}

export function GlobalSearch({ className }: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
        setResults([]);
      }
      if (e.key === 'ArrowDown' && isOpen && results.length > 0) {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
      }
      if (e.key === 'ArrowUp' && isOpen && results.length > 0) {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      }
      if (e.key === 'Enter' && isOpen && selectedIndex >= 0 && results[selectedIndex]) {
        e.preventDefault();
        handleSelectResult(results[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery('');
        setResults([]);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Search debounce
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await adminGlobalSearch(query);
        if (result.success && result.data) {
          setResults(result.data);
          setSelectedIndex(-1);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelectResult = (result: SearchResult) => {
    router.push(result.url);
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
  };

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<SearchEntityType, SearchResult[]>);

  return (
    <div ref={searchRef} className={cn('relative', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-400 pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search engines, parts, builds, users..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.length >= 2) {
              setIsOpen(true);
            }
          }}
          className="pl-10 pr-20 w-full max-w-md min-h-[44px]"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                inputRef.current?.focus();
              }}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-cream-400 hover:text-cream-100 transition-colors touch-manipulation"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-cream-400 bg-olive-800 border border-olive-600 rounded">
            <Command className="w-3 h-3" />K
          </kbd>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-olive-800 border border-olive-600 rounded-lg shadow-xl z-50 max-h-[70vh] sm:max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-6 h-6 text-orange-400 animate-spin mx-auto mb-2" />
              <p className="text-sm text-cream-400">Searching...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center">
              <Search className="w-8 h-8 text-olive-600 mx-auto mb-2" />
              <p className="text-sm text-cream-400">No results found</p>
              <p className="text-xs text-cream-500 mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="py-2">
              {Object.entries(groupedResults).map(([type, typeResults]) => {
                const config = TYPE_LABELS[type as SearchEntityType];
                const Icon = config.icon;

                return (
                  <div key={type} className="mb-2">
                    <div className="px-4 py-2 flex items-center gap-2 border-b border-olive-600">
                      <Icon className={cn('w-4 h-4', config.color)} />
                      <span className="text-xs font-semibold text-cream-300 uppercase tracking-wide">
                        {config.label}
                      </span>
                      <Badge variant="default" size="sm" className="ml-auto">
                        {typeResults.length}
                      </Badge>
                    </div>
                    {typeResults.map((result, idx) => {
                      const globalIdx = results.indexOf(result);
                      const isSelected = selectedIndex === globalIdx;

                      return (
                        <button
                          key={result.id}
                          onClick={() => handleSelectResult(result)}
                          className={cn(
                            'w-full px-4 py-3 min-h-[44px] text-left hover:bg-olive-700 active:bg-olive-600 transition-colors touch-manipulation',
                            isSelected && 'bg-olive-700'
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-cream-100 truncate">{result.title}</p>
                                {result.status && (
                                  <Badge
                                    variant="default"
                                    size="sm"
                                    className={cn(
                                      'text-xs border',
                                      STATUS_COLORS[result.status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                    )}
                                  >
                                    {result.status}
                                  </Badge>
                                )}
                              </div>
                              {result.description && (
                                <p className="text-xs text-cream-400 line-clamp-1">{result.description}</p>
                              )}
                              {result.metadata && (
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  {typeof result.metadata.brand === 'string' && result.metadata.brand && (
                                    <span className="text-xs text-cream-500">{result.metadata.brand}</span>
                                  )}
                                  {typeof result.metadata.category === 'string' && result.metadata.category && (
                                    <span className="text-xs text-cream-500">{result.metadata.category}</span>
                                  )}
                                  {typeof result.metadata.goal === 'string' && result.metadata.goal && (
                                    <span className="text-xs text-cream-500">{result.metadata.goal}</span>
                                  )}
                                </div>
                              )}
                            </div>
                            <ArrowRight className="w-4 h-4 text-cream-400 flex-shrink-0" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}

              {/* Footer */}
              <div className="px-4 py-2 border-t border-olive-600 bg-olive-900/50">
                <p className="text-xs text-cream-500 text-center">
                  Use <kbd className="px-1.5 py-0.5 bg-olive-800 border border-olive-600 rounded text-cream-400">
                    ↑↓
                  </kbd> to navigate, <kbd className="px-1.5 py-0.5 bg-olive-800 border border-olive-600 rounded text-cream-400">
                    Enter
                  </kbd> to select, <kbd className="px-1.5 py-0.5 bg-olive-800 border border-olive-600 rounded text-cream-400">
                    Esc
                  </kbd> to close
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
