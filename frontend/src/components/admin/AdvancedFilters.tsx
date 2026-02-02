'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'date' | 'boolean';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface FilterValue {
  [key: string]: string | number | boolean | null | undefined;
}

interface AdvancedFiltersProps {
  filters: FilterOption[];
  values: FilterValue;
  onChange: (values: FilterValue) => void;
  onReset: () => void;
  quickFilters?: Array<{
    label: string;
    filters: FilterValue;
    icon?: React.ComponentType<{ className?: string }>;
  }>;
}

export function AdvancedFilters({
  filters,
  values,
  onChange,
  onReset,
  quickFilters = [],
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const activeFilterCount = Object.values(values).filter(
    (v) => v !== null && v !== undefined && v !== ''
  ).length;

  const handleFilterChange = (key: string, value: string | number | boolean | null) => {
    onChange({
      ...values,
      [key]: value === '' ? null : value,
    });
  };

  const removeFilter = (key: string) => {
    const newValues = { ...values };
    delete newValues[key];
    onChange(newValues);
  };

  const applyQuickFilter = (quickFilter: FilterValue) => {
    onChange({ ...values, ...quickFilter });
  };

  const activeFilters = Object.entries(values)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .map(([key]) => {
      const filter = filters.find((f) => f.key === key);
      return filter ? { key, label: filter.label, value: values[key] } : null;
    })
    .filter(Boolean) as Array<{ key: string; label: string; value: unknown }>;

  return (
    <div className="space-y-3">
      {/* Quick Filters */}
      {quickFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((quickFilter, idx) => {
            const Icon = quickFilter.icon || Filter;
            return (
              <Button
                key={idx}
                size="sm"
                variant="secondary"
                icon={<Icon className="w-4 h-4" />}
                onClick={() => applyQuickFilter(quickFilter.filters)}
              >
                {quickFilter.label}
              </Button>
            );
          })}
        </div>
      )}

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-sm text-cream-300 hover:text-cream-100 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>Advanced Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="default" size="sm">
              {activeFilterCount}
            </Badge>
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {activeFilterCount > 0 && (
          <Button size="sm" variant="secondary" onClick={onReset}>
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge
              key={filter.key}
              variant="default"
              className="flex items-center gap-1"
            >
              <span className="text-xs">
                {filter.label}: {String(filter.value)}
              </span>
              <button
                onClick={() => removeFilter(filter.key)}
                className="ml-1 hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Filter Panel */}
      {isOpen && (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-cream-100">Filter Options</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filters.map((filter) => {
                if (filter.type === 'select') {
                  return (
                    <Select
                      key={filter.key}
                      label={filter.label}
                      value={String(values[filter.key] || '')}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    >
                      <option value="">All</option>
                      {filter.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  );
                }

                if (filter.type === 'boolean') {
                  return (
                    <div key={filter.key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={filter.key}
                        checked={values[filter.key] === true}
                        onChange={(e) => handleFilterChange(filter.key, e.target.checked)}
                        className="w-4 h-4 rounded border-olive-600 bg-olive-800 text-orange-500 focus:ring-orange-500"
                      />
                      <label htmlFor={filter.key} className="text-sm text-cream-200">
                        {filter.label}
                      </label>
                    </div>
                  );
                }

                return (
                  <Input
                    key={filter.key}
                    label={filter.label}
                    type={filter.type === 'number' ? 'number' : filter.type === 'date' ? 'date' : 'text'}
                    placeholder={filter.placeholder}
                    value={String(values[filter.key] || '')}
                    onChange={(e) => {
                      const value = filter.type === 'number' 
                        ? e.target.value ? Number(e.target.value) : null
                        : e.target.value;
                      handleFilterChange(filter.key, value);
                    }}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
