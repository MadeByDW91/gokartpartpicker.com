'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { Search, X, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch?: (query: string) => void;
  suggestions?: string[];
  className?: string;
}

export function EnhancedSearch({
  value,
  onChange,
  placeholder = 'Search...',
  onSearch,
  suggestions = [],
  className,
}: EnhancedSearchProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('admin-search-history');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Save to history when search is performed
  const handleSearch = (query: string) => {
    if (query.trim().length >= 2) {
      const updated = [
        query.trim(),
        ...searchHistory.filter((h) => h !== query.trim()),
      ].slice(0, 10); // Keep last 10 searches
      setSearchHistory(updated);
      localStorage.setItem('admin-search-history', JSON.stringify(updated));
    }
    onSearch?.(query);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(value);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const filteredSuggestions = suggestions.filter((s) =>
    s.toLowerCase().includes(value.toLowerCase())
  );

  const filteredHistory = searchHistory.filter((h) =>
    h.toLowerCase().includes(value.toLowerCase())
  );

  const hasSuggestions = (filteredSuggestions.length > 0 || filteredHistory.length > 0) && value.length > 0;

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          icon={<Search className="w-4 h-4" />}
          className="pr-10"
        />
        {value && (
          <button
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-cream-400 hover:text-cream-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && hasSuggestions && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowSuggestions(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 bg-olive-800 border border-olive-600 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
            {/* Suggestions */}
            {filteredSuggestions.length > 0 && (
              <div className="p-2">
                <div className="px-2 py-1 text-xs font-medium text-cream-400 uppercase tracking-wide">
                  Suggestions
                </div>
                {filteredSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onChange(suggestion);
                      handleSearch(suggestion);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-cream-200 hover:bg-olive-700 rounded transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Search History */}
            {filteredHistory.length > 0 && (
              <div className="p-2 border-t border-olive-600">
                <div className="px-2 py-1 text-xs font-medium text-cream-400 uppercase tracking-wide flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Recent Searches
                </div>
                {filteredHistory.map((history, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onChange(history);
                      handleSearch(history);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-cream-200 hover:bg-olive-700 rounded transition-colors flex items-center justify-between"
                  >
                    <span>{history}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = searchHistory.filter((h) => h !== history);
                        setSearchHistory(updated);
                        localStorage.setItem('admin-search-history', JSON.stringify(updated));
                      }}
                      className="p-1 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Highlight search terms in text
 */
export function highlightSearch(text: string, query: string): React.ReactNode {
  if (!query || !text) return text;

  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, idx) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={idx} className="bg-orange-500/30 text-orange-200 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}
