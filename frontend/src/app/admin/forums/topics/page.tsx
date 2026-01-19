'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { DataTable, StatusBadge, TableActions } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { 
  Search, 
  Eye, 
  Trash2, 
  Pin, 
  Lock, 
  Archive, 
  Move,
  MessageSquare
} from 'lucide-react';
import { 
  getAdminForumTopics, 
  deleteForumTopic, 
  archiveForumTopic,
  moveForumTopic
} from '@/actions/admin/forums';
import { pinTopic, lockTopic } from '@/actions/forums';
import { getAdminForumCategories } from '@/actions/admin/forums';
import type { ForumTopic, ForumCategory } from '@/types/database';
import type { ForumTopicsFilters } from '@/actions/admin/forums';

interface AdminForumTopic extends Omit<ForumTopic, 'user' | 'category'> {
  user?: { id: string; username: string | null; avatar_url: string | null };
  category?: { id: string; slug: string; name: string };
}

export default function AdminForumsTopicsPage() {
  const [topics, setTopics] = useState<AdminForumTopic[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ForumTopicsFilters>({
    page: 1,
    limit: 50,
    sort: 'newest',
    is_archived: false,
  });
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const result = await getAdminForumTopics({
        ...filters,
        search: searchQuery || undefined,
      });
      
      if (result.success && result.data) {
        setTopics(result.data as AdminForumTopic[]);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const result = await getAdminForumCategories();
      if (result.success && result.data) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [filters, searchQuery]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handlePin = async (topic: AdminForumTopic) => {
    try {
      const result = await pinTopic({
        topic_id: topic.id,
        is_pinned: !topic.is_pinned,
      });
      
      if (result.success) {
        await fetchTopics();
      } else {
        alert(result.error || 'Failed to pin topic');
      }
    } catch (error) {
      console.error('Error pinning topic:', error);
      alert('Failed to pin topic');
    }
  };

  const handleLock = async (topic: AdminForumTopic) => {
    try {
      const result = await lockTopic({
        topic_id: topic.id,
        is_locked: !topic.is_locked,
      });
      
      if (result.success) {
        await fetchTopics();
      } else {
        alert(result.error || 'Failed to lock topic');
      }
    } catch (error) {
      console.error('Error locking topic:', error);
      alert('Failed to lock topic');
    }
  };

  const handleDelete = async (topic: AdminForumTopic) => {
    if (!confirm(`Are you sure you want to delete "${topic.title}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(topic.id);
    try {
      const result = await deleteForumTopic(topic.id);
      
      if (result.success) {
        await fetchTopics();
      } else {
        alert(result.error || 'Failed to delete topic');
      }
    } catch (error) {
      console.error('Error deleting topic:', error);
      alert('Failed to delete topic');
    } finally {
      setDeleting(null);
    }
  };

  const handleArchive = async (topic: AdminForumTopic) => {
    if (!confirm(`Archive "${topic.title}"?`)) {
      return;
    }

    try {
      const result = await archiveForumTopic(topic.id);
      
      if (result.success) {
        await fetchTopics();
      } else {
        alert(result.error || 'Failed to archive topic');
      }
    } catch (error) {
      console.error('Error archiving topic:', error);
      alert('Failed to archive topic');
    }
  };

  const handleMove = async (topic: AdminForumTopic, categoryId: string) => {
    try {
      const result = await moveForumTopic(topic.id, categoryId);
      
      if (result.success) {
        await fetchTopics();
      } else {
        alert(result.error || 'Failed to move topic');
      }
    } catch (error) {
      console.error('Error moving topic:', error);
      alert('Failed to move topic');
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Topic',
      render: (topic: AdminForumTopic) => (
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {topic.is_pinned && (
              <Pin className="w-4 h-4 text-orange-400 fill-orange-400" />
            )}
            {topic.is_locked && (
              <Lock className="w-4 h-4 text-red-400" />
            )}
            <p className="font-medium text-cream-100 truncate">{topic.title}</p>
          </div>
          {topic.category && (
            <Badge variant="default" className="text-xs">
              {topic.category.name}
            </Badge>
          )}
          <p className="text-xs text-cream-400 mt-1 line-clamp-1">{topic.content}</p>
        </div>
      ),
    },
    {
      key: 'user',
      header: 'Author',
      render: (topic: AdminForumTopic) => (
        <div>
          <p className="text-sm text-cream-200">{topic.user?.username || 'Anonymous'}</p>
        </div>
      ),
    },
    {
      key: 'stats',
      header: 'Stats',
      render: (topic: AdminForumTopic) => (
        <div className="text-sm text-cream-300 space-y-1">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-3 h-3" />
            <span>{topic.replies_count} replies</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-3 h-3" />
            <span>{topic.views_count} views</span>
          </div>
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (topic: AdminForumTopic) => (
        <span className="text-sm text-cream-300">{formatDate(topic.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-40',
      render: (topic: AdminForumTopic) => (
        <TableActions>
          <Link href={`/forums/${topic.category?.slug || 'general'}/${topic.slug}`} target="_blank">
            <button
              className="p-2 text-cream-400 hover:text-cream-100 hover:bg-olive-600 rounded transition-colors"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
          </Link>
          <button
            onClick={() => handlePin(topic)}
            className={`p-2 rounded transition-colors ${
              topic.is_pinned
                ? 'text-orange-400 hover:text-orange-300 hover:bg-olive-600'
                : 'text-cream-400 hover:text-orange-400 hover:bg-olive-600'
            }`}
            title={topic.is_pinned ? 'Unpin' : 'Pin'}
          >
            <Pin className={`w-4 h-4 ${topic.is_pinned ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => handleLock(topic)}
            className={`p-2 rounded transition-colors ${
              topic.is_locked
                ? 'text-red-400 hover:text-red-300 hover:bg-olive-600'
                : 'text-cream-400 hover:text-red-400 hover:bg-olive-600'
            }`}
            title={topic.is_locked ? 'Unlock' : 'Lock'}
          >
            <Lock className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const categorySlug = prompt('Enter category slug to move to:');
              const targetCategory = categories.find(c => c.slug === categorySlug);
              if (targetCategory) {
                handleMove(topic, targetCategory.id);
              }
            }}
            className="p-2 text-cream-400 hover:text-blue-400 hover:bg-olive-600 rounded transition-colors"
            title="Move"
          >
            <Move className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleArchive(topic)}
            className="p-2 text-cream-400 hover:text-yellow-400 hover:bg-olive-600 rounded transition-colors"
            title="Archive"
          >
            <Archive className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(topic)}
            disabled={deleting === topic.id}
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
          <h1 className="text-display text-3xl text-cream-100 mb-2">Forum Topics</h1>
          <p className="text-cream-400">Manage and moderate forum discussions</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-olive-800 border-olive-600">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filters.category_id || ''}
                onChange={(e) => setFilters({ ...filters, category_id: e.target.value || undefined, page: 1 })}
                className="px-3 py-2 bg-olive-700 border border-olive-600 rounded-md text-cream-100 text-sm"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <select
                value={filters.sort || 'newest'}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value as any, page: 1 })}
                className="px-3 py-2 bg-olive-700 border border-olive-600 rounded-md text-cream-100 text-sm"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="most_replies">Most Replies</option>
                <option value="most_views">Most Views</option>
              </select>
              <select
                value={filters.is_archived ? 'archived' : 'active'}
                onChange={(e) => setFilters({ ...filters, is_archived: e.target.value === 'archived', page: 1 })}
                className="px-3 py-2 bg-olive-700 border border-olive-600 rounded-md text-cream-100 text-sm"
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Topics Table */}
      <DataTable
        columns={columns}
        data={topics}
        loading={loading}
        emptyMessage="No topics found"
        keyExtractor={(topic) => topic.id}
        onRowClick={(topic) => {
          router.push(`/forums/${topic.category?.slug || 'general'}/${topic.slug}`);
        }}
      />
    </div>
  );
}
