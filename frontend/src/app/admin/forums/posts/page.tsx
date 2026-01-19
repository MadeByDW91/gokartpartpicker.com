'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { DataTable, TableActions } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { 
  Search, 
  Eye, 
  Trash2, 
  MessageSquare,
  CheckCircle
} from 'lucide-react';
import { 
  getAdminForumPosts, 
  deleteForumPost,
  type ForumPostsFilters
} from '@/actions/admin/forums';
import type { ForumPost } from '@/types/database';

interface AdminForumPost extends Omit<ForumPost, 'user' | 'topic'> {
  user?: { id: string; username: string | null; avatar_url: string | null };
  topic?: { 
    id: string; 
    title: string; 
    slug: string;
    category?: { slug: string; name: string };
  };
}

export default function AdminForumsPostsPage() {
  const [posts, setPosts] = useState<AdminForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ForumPostsFilters>({
    page: 1,
    limit: 50,
    sort: 'newest',
  });
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const result = await getAdminForumPosts({
        ...filters,
        search: searchQuery || undefined,
      });
      
      if (result.success && result.data) {
        setPosts(result.data as AdminForumPost[]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filters, searchQuery]);

  const handleDelete = async (post: AdminForumPost) => {
    if (!confirm(`Are you sure you want to delete this post? This action cannot be undone.`)) {
      return;
    }

    setDeleting(post.id);
    try {
      const result = await deleteForumPost(post.id);
      
      if (result.success) {
        await fetchPosts();
      } else {
        alert(result.error || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    } finally {
      setDeleting(null);
    }
  };

  const columns = [
    {
      key: 'content',
      header: 'Post',
      render: (post: AdminForumPost) => (
        <div className="min-w-0 max-w-md">
          <div className="flex items-center gap-2 mb-1">
            {post.is_solution && (
              <Badge variant="success" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Solution
              </Badge>
            )}
            {post.is_edited && (
              <span className="text-xs text-cream-400">(edited)</span>
            )}
          </div>
          <p className="text-sm text-cream-200 line-clamp-2">{post.content}</p>
          {post.topic && (
            <Link 
              href={`/forums/${post.topic.category?.slug || 'general'}/${post.topic.slug}`}
              className="text-xs text-orange-400 hover:text-orange-300 mt-1 inline-block"
              onClick={(e) => e.stopPropagation()}
            >
              in: {post.topic.title}
            </Link>
          )}
        </div>
      ),
    },
    {
      key: 'user',
      header: 'Author',
      render: (post: AdminForumPost) => (
        <div>
          <p className="text-sm text-cream-200">{post.user?.username || 'Anonymous'}</p>
        </div>
      ),
    },
    {
      key: 'stats',
      header: 'Stats',
      render: (post: AdminForumPost) => (
        <div className="text-sm text-cream-300 space-y-1">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-3 h-3" />
            <span>{post.likes_count || 0} likes</span>
          </div>
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (post: AdminForumPost) => (
        <span className="text-sm text-cream-300">{formatDate(post.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-32',
      render: (post: AdminForumPost) => (
        <TableActions>
          {post.topic && (
            <Link 
              href={`/forums/${post.topic.category?.slug || 'general'}/${post.topic.slug}`}
              target="_blank"
            >
              <button
                className="p-2 text-cream-400 hover:text-cream-100 hover:bg-olive-600 rounded transition-colors"
                title="View Topic"
              >
                <Eye className="w-4 h-4" />
              </button>
            </Link>
          )}
          <button
            onClick={() => handleDelete(post)}
            disabled={deleting === post.id}
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
          <h1 className="text-display text-3xl text-cream-100 mb-2">Forum Posts</h1>
          <p className="text-cream-400">Manage forum posts and replies</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-olive-800 border-olive-600">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filters.sort || 'newest'}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value as any, page: 1 })}
                className="px-3 py-2 bg-olive-700 border border-olive-600 rounded-md text-cream-100 text-sm"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <DataTable
        columns={columns}
        data={posts}
        loading={loading}
        emptyMessage="No posts found"
        keyExtractor={(post) => post.id}
        onRowClick={(post) => {
          if (post.topic) {
            router.push(`/forums/${post.topic.category?.slug || 'general'}/${post.topic.slug}`);
          }
        }}
      />
    </div>
  );
}
