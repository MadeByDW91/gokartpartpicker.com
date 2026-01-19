'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DataTable, StatusBadge, TableActions } from '@/components/admin/DataTable';
import { formatDate } from '@/lib/utils';
import { Plus, Search, Pencil, Eye, Trash2, BookOpen, Filter, X } from 'lucide-react';
import { getAllGuides, toggleGuidePublish, deleteGuide } from '@/actions/admin-guides';
import type { Guide } from '@/types/guides';

export default function AdminGuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPublished, setFilterPublished] = useState<'all' | 'published' | 'unpublished'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchGuides = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: {
        is_published?: boolean;
        category?: string;
      } = {};

      if (filterPublished === 'published') {
        filters.is_published = true;
      } else if (filterPublished === 'unpublished') {
        filters.is_published = false;
      }

      if (filterCategory !== 'all') {
        filters.category = filterCategory;
      }

      const result = await getAllGuides(filters);
      
      if (result.success) {
        setGuides(result.data || []);
      } else if (!result.success) {
        setError(result.error || 'Failed to fetch guides');
      }
    } catch (error) {
      console.error('Error fetching guides:', error);
      setError('Failed to fetch guides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, [filterPublished, filterCategory]);

  const handleTogglePublish = async (guide: Guide) => {
    setToggling(guide.id);
    setError(null);
    try {
      const result = await toggleGuidePublish(guide.id, !guide.is_published);
      
      if (result.success) {
        // Update local state
        setGuides(guides.map(g => 
          g.id === guide.id 
            ? { ...g, is_published: !g.is_published, published_at: result.data?.published_at || null }
            : g
        ));
      } else if (!result.success) {
        const errorMsg = result.error || 'Failed to update guide status';
        setError(errorMsg);
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Error toggling guide status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update guide status';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (guide: Guide) => {
    if (!confirm(`Are you sure you want to delete "${guide.title}"? This will deactivate the guide.`)) {
      return;
    }

    setDeleting(guide.id);
    setError(null);
    try {
      const result = await deleteGuide(guide.id, false); // Soft delete
      
      if (result.success) {
        // Refresh the list
        await fetchGuides();
      } else if (!result.success) {
        const errorMsg = result.error || 'Failed to delete guide';
        setError(errorMsg);
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Error deleting guide:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete guide';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setDeleting(null);
    }
  };

  // Get unique categories
  const categories = Array.from(new Set(guides.map(g => g.category).filter(Boolean))) as string[];

  // Filter guides by search query
  const filteredGuides = guides.filter((guide) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      guide.title.toLowerCase().includes(query) ||
      guide.slug.toLowerCase().includes(query) ||
      (guide.excerpt && guide.excerpt.toLowerCase().includes(query)) ||
      guide.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  const columns = [
    {
      key: 'title',
      header: 'Guide',
      render: (guide: Guide) => (
        <div>
          <p className="font-medium text-cream-100">{guide.title}</p>
          <p className="text-xs text-cream-400">{guide.slug}</p>
          {guide.excerpt && (
            <p className="text-xs text-cream-500 mt-1 line-clamp-1">{guide.excerpt}</p>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (guide: Guide) => guide.category || '—',
    },
    {
      key: 'difficulty',
      header: 'Difficulty',
      render: (guide: Guide) => {
        if (!guide.difficulty_level) return '—';
        const colors = {
          beginner: 'text-green-400',
          intermediate: 'text-yellow-400',
          advanced: 'text-orange-400',
          expert: 'text-red-400',
        };
        return (
          <span className={colors[guide.difficulty_level] || 'text-cream-400'}>
            {guide.difficulty_level.charAt(0).toUpperCase() + guide.difficulty_level.slice(1)}
          </span>
        );
      },
    },
    {
      key: 'views',
      header: 'Views',
      render: (guide: Guide) => guide.views_count || 0,
    },
    {
      key: 'helpful',
      header: 'Helpful',
      render: (guide: Guide) => guide.helpful_count || 0,
    },
    {
      key: 'is_published',
      header: 'Status',
      render: (guide: Guide) => (
        <div className="flex items-center gap-2">
          <StatusBadge active={guide.is_published} />
          {guide.is_published && (
            <button
              onClick={() => handleTogglePublish(guide)}
              disabled={toggling === guide.id}
              className="text-xs text-cream-400 hover:text-orange-400 disabled:opacity-50"
              title="Unpublish"
            >
              {toggling === guide.id ? '...' : 'Unpublish'}
            </button>
          )}
          {!guide.is_published && (
            <button
              onClick={() => handleTogglePublish(guide)}
              disabled={toggling === guide.id}
              className="text-xs text-cream-400 hover:text-green-400 disabled:opacity-50"
              title="Publish"
            >
              {toggling === guide.id ? '...' : 'Publish'}
            </button>
          )}
        </div>
      ),
    },
    {
      key: 'updated_at',
      header: 'Updated',
      render: (guide: Guide) => formatDate(guide.updated_at),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-32',
      render: (guide: Guide) => (
        <TableActions>
          {guide.is_published && (
            <Link href={`/guides/${guide.slug}`} target="_blank">
              <button 
                className="p-2 text-cream-400 hover:text-cream-100 hover:bg-olive-600 rounded transition-colors"
                title="View"
              >
                <Eye className="w-4 h-4" />
              </button>
            </Link>
          )}
          <Link href={`/admin/guides/${guide.id}`}>
            <button 
              className="p-2 text-cream-400 hover:text-orange-400 hover:bg-olive-600 rounded transition-colors"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </Link>
          <button
            onClick={() => handleDelete(guide)}
            disabled={deleting === guide.id}
            className="p-2 text-cream-400 hover:text-red-400 hover:bg-olive-600 rounded transition-colors disabled:opacity-50"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </TableActions>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-3xl text-cream-100">Guides</h1>
          <p className="text-cream-300 mt-1">Manage installation guides and tutorials</p>
        </div>
        <Link href="/admin/guides/new">
          <Button icon={<Plus className="w-4 h-4" />}>
            New Guide
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-olive-800 rounded-lg border border-olive-700">
        <div className="flex-1 min-w-[200px] max-w-md">
          <Input
            placeholder="Search guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        
        <Select
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'published', label: 'Published' },
            { value: 'unpublished', label: 'Unpublished' },
          ]}
          value={filterPublished}
          onChange={(e) => setFilterPublished(e.target.value as 'all' | 'published' | 'unpublished')}
          className="w-40"
        />

        <Select
          options={[
            { value: 'all', label: 'All Categories' },
            ...categories.map(cat => ({ value: cat, label: cat })),
          ]}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="w-40"
        />

        {(searchQuery || filterPublished !== 'all' || filterCategory !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setFilterPublished('all');
              setFilterCategory('all');
            }}
            icon={<X className="w-4 h-4" />}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Table */}
      <DataTable
        data={filteredGuides}
        columns={columns}
        loading={loading}
        emptyMessage="No guides found. Create your first guide to get started."
        keyExtractor={(guide) => guide.id}
      />
    </div>
  );
}
