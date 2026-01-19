'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DataTable, StatusBadge, TableActions } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { Plus, Search, Pencil, Trash2, Loader2, GitCompare } from 'lucide-react';
import {
  getAdminCompatibilityRules,
  createCompatibilityRule,
  updateCompatibilityRule,
  deleteCompatibilityRule,
  toggleRuleActive,
} from '@/actions/admin/compatibility';
import type { CompatibilityRule } from '@/types/database';
import { PART_CATEGORIES } from '@/types/database';

const RULE_TYPES = [
  'shaft_compatibility',
  'mounting_compatibility',
  'performance_requirement',
  'safety_requirement',
  'part_conflict',
  'part_dependency',
] as const;

const SEVERITY_TYPES = ['error', 'warning', 'info'] as const;

interface CompatibilityRuleFormData {
  rule_type: string;
  source_category: string;
  target_category: string;
  condition: Record<string, unknown>;
  warning_message: string;
  severity: 'error' | 'warning' | 'info';
  is_active: boolean;
}

export default function AdminCompatibilityPage() {
  const router = useRouter();
  const [rules, setRules] = useState<CompatibilityRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<CompatibilityRule | null>(null);
  const [formData, setFormData] = useState<CompatibilityRuleFormData>({
    rule_type: 'shaft_compatibility',
    source_category: 'engine',
    target_category: 'clutch',
    condition: {},
    warning_message: '',
    severity: 'warning',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  const fetchRules = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminCompatibilityRules();

      if (result.success && result.data) {
        setRules(result.data);
      } else if (!result.success) {
        setError('error' in result ? result.error : 'Failed to fetch compatibility rules');
      }
    } catch (error) {
      console.error('Error fetching compatibility rules:', error);
      setError('Failed to fetch compatibility rules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleDelete = async (rule: CompatibilityRule) => {
    if (!confirm(`Are you sure you want to delete this compatibility rule?`)) {
      return;
    }

    setDeleting(rule.id);
    setError(null);
    try {
      const result = await deleteCompatibilityRule(rule.id);

      if (result.success) {
        await fetchRules();
      } else if (!result.success) {
        const errorMsg = 'error' in result ? result.error : 'Failed to delete rule';
        setError(errorMsg);
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
      setError('Failed to delete rule');
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleActive = async (rule: CompatibilityRule) => {
    try {
      const result = await toggleRuleActive(rule.id, !rule.is_active);
      if (result.success) {
        await fetchRules();
      }
    } catch (error) {
      console.error('Error toggling rule:', error);
      setError('Failed to toggle rule status');
    }
  };

  const handleEdit = (rule: CompatibilityRule) => {
    setEditingRule(rule);
    setFormData({
      rule_type: rule.rule_type,
      source_category: rule.source_category,
      target_category: rule.target_category,
      condition: rule.condition,
      warning_message: rule.warning_message,
      severity: rule.severity,
      is_active: rule.is_active,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!formData.warning_message || !formData.source_category || !formData.target_category) {
        throw new Error('Warning message, source category, and target category are required');
      }

      let result;
      if (editingRule) {
        result = await updateCompatibilityRule(editingRule.id, formData);
      } else {
        result = await createCompatibilityRule(formData);
      }

      if (result.success) {
        setShowForm(false);
        setEditingRule(null);
        setFormData({
          rule_type: 'shaft_compatibility',
          source_category: 'engine',
          target_category: 'clutch',
          condition: {},
          warning_message: '',
          severity: 'warning',
          is_active: true,
        });
        await fetchRules();
      } else if (!result.success) {
        setError('error' in result ? result.error : 'Failed to save rule');
      }
    } catch (error) {
      console.error('Error saving rule:', error);
      setError(error instanceof Error ? error.message : 'Failed to save rule');
    } finally {
      setSaving(false);
    }
  };

  // Filter rules by search query
  const filteredRules = rules.filter((rule) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      rule.rule_type.toLowerCase().includes(query) ||
      rule.source_category.toLowerCase().includes(query) ||
      rule.target_category.toLowerCase().includes(query) ||
      rule.warning_message.toLowerCase().includes(query)
    );
  });

  const getSeverityBadge = (severity: string) => {
    const badgeColors = {
      error: 'bg-red-500/20 text-red-400 border-red-500/30',
      warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };
    const color = badgeColors[severity as keyof typeof badgeColors] || badgeColors.warning;
    
    return (
      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${color}`}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  };

  const columns = [
    {
      key: 'rule_type',
      header: 'Rule Type',
      render: (rule: CompatibilityRule) => (
        <div>
          <p className="font-medium text-cream-100">{rule.rule_type}</p>
        </div>
      ),
    },
    {
      key: 'categories',
      header: 'Categories',
      render: (rule: CompatibilityRule) => (
        <div className="text-sm">
          <p className="text-cream-300">
            <span className="text-cream-400">{rule.source_category}</span>
            {' → '}
            <span className="text-cream-400">{rule.target_category}</span>
          </p>
        </div>
      ),
    },
    {
      key: 'warning_message',
      header: 'Warning Message',
      render: (rule: CompatibilityRule) => (
        <p className="text-sm text-cream-300 max-w-md truncate">{rule.warning_message}</p>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      render: (rule: CompatibilityRule) => getSeverityBadge(rule.severity),
    },
    {
      key: 'status',
      header: 'Status',
      render: (rule: CompatibilityRule) => (
        <StatusBadge active={rule.is_active} />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (rule: CompatibilityRule) => (
        <TableActions>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(rule);
            }}
            className="p-2 text-cream-400 hover:text-orange-400 transition-colors"
            title="Edit rule"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleActive(rule);
            }}
            className="p-2 text-cream-400 hover:text-orange-400 transition-colors"
            title={rule.is_active ? 'Deactivate' : 'Activate'}
          >
            {rule.is_active ? '✓' : '○'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(rule);
            }}
            disabled={deleting === rule.id}
            className="p-2 text-[var(--error)] hover:text-red-400 transition-colors disabled:opacity-50"
            title="Delete rule"
          >
            {deleting === rule.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </TableActions>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GitCompare className="w-8 h-8 text-orange-400" />
          <div>
            <h1 className="text-display text-3xl text-cream-100">Compatibility Rules</h1>
            <p className="text-cream-300 mt-1">
              {loading ? 'Loading...' : `${rules.length} compatibility rules`}
            </p>
          </div>
        </div>
        <Button
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setEditingRule(null);
            setFormData({
              rule_type: 'shaft_compatibility',
              source_category: 'engine',
              target_category: 'clutch',
              condition: {},
              warning_message: '',
              severity: 'warning',
              is_active: true,
            });
            setShowForm(true);
          }}
        >
          New Rule
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-[rgba(166,61,64,0.1)] border border-[rgba(166,61,64,0.3)] rounded-md">
          <p className="text-sm text-[var(--error)]">{error}</p>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="p-6 bg-olive-800 border border-olive-600 rounded-lg">
          <h2 className="text-xl font-semibold text-cream-100 mb-4">
            {editingRule ? 'Edit Compatibility Rule' : 'New Compatibility Rule'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-cream-200 mb-1.5">Rule Type</label>
                <select
                  className="w-full px-4 py-3 bg-olive-900 border-2 border-olive-600 rounded-md text-cream-100 transition-colors focus:outline-none focus:border-orange-500"
                  value={formData.rule_type}
                  onChange={(e) => setFormData({ ...formData, rule_type: e.target.value })}
                  required
                >
                  {RULE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-cream-200 mb-1.5">Severity</label>
                <select
                  className="w-full px-4 py-3 bg-olive-900 border-2 border-olive-600 rounded-md text-cream-100 transition-colors focus:outline-none focus:border-orange-500"
                  value={formData.severity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      severity: e.target.value as 'error' | 'warning' | 'info',
                    })
                  }
                  required
                >
                  {SEVERITY_TYPES.map((severity) => (
                    <option key={severity} value={severity}>
                      {severity.charAt(0).toUpperCase() + severity.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-cream-200 mb-1.5">Source Category</label>
                <select
                  className="w-full px-4 py-3 bg-olive-900 border-2 border-olive-600 rounded-md text-cream-100 transition-colors focus:outline-none focus:border-orange-500"
                  value={formData.source_category}
                  onChange={(e) => setFormData({ ...formData, source_category: e.target.value })}
                  required
                >
                  <option value="engine">Engine</option>
                  {PART_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-cream-200 mb-1.5">Target Category</label>
                <select
                  className="w-full px-4 py-3 bg-olive-900 border-2 border-olive-600 rounded-md text-cream-100 transition-colors focus:outline-none focus:border-orange-500"
                  value={formData.target_category}
                  onChange={(e) => setFormData({ ...formData, target_category: e.target.value })}
                  required
                >
                  {PART_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-cream-200 mb-1.5">Warning Message</label>
              <textarea
                className="w-full px-4 py-3 bg-olive-900 border-2 border-olive-600 rounded-md text-cream-100 placeholder:text-cream-400 transition-colors focus:outline-none focus:border-orange-500 min-h-[100px]"
                placeholder="e.g., Shaft diameter mismatch: Part requires 3/4 inch but engine has 1 inch shaft"
                value={formData.warning_message}
                onChange={(e) => setFormData({ ...formData, warning_message: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cream-200 mb-1.5">Condition (JSON)</label>
              <textarea
                className="w-full px-4 py-3 bg-olive-900 border-2 border-olive-600 rounded-md text-cream-100 placeholder:text-cream-400 transition-colors focus:outline-none focus:border-orange-500 min-h-[150px] font-mono text-sm"
                placeholder='{"field": "engine.shaft_diameter", "operator": "equals", "value": 0.75}'
                value={JSON.stringify(formData.condition, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setFormData({ ...formData, condition: parsed });
                  } catch {
                    // Invalid JSON - keep as is for editing
                  }
                }}
                required
              />
              <p className="mt-1 text-xs text-cream-400">
                Condition logic in JSON format. See documentation for format details.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 rounded border-olive-600 bg-olive-900 text-orange-500 focus:ring-orange-500"
              />
              <label htmlFor="is_active" className="text-cream-200">
                Active (rule is enabled)
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" loading={saving}>
                {editingRule ? 'Update Rule' : 'Create Rule'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditingRule(null);
                  setError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      {!showForm && (
        <div className="flex gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>
      )}

      {/* Data Table */}
      {!showForm && (
        <DataTable
          columns={columns}
          data={filteredRules}
          loading={loading}
          emptyMessage="No compatibility rules found. Create one to get started."
          keyExtractor={(rule) => rule.id}
        />
      )}
    </div>
  );
}
