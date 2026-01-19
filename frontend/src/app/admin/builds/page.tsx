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
import { Search, Eye, Trash2, CheckCircle, XCircle, Wrench } from 'lucide-react';
import { getAdminBuilds, updateBuildVisibility, deleteBuild, getBuildAnalytics } from '@/actions/admin/builds';
import type { Build } from '@/types/database';

interface AdminBuild extends Omit<Build, 'profile' | 'engine'> {
  profile?: {
    username: string | null;
    email: string | null;
  };
  engine?: Build['engine'];
}

export default function AdminBuildsPage() {
  const [builds, setBuilds] = useState<AdminBuild[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<{
    totalBuilds: number;
    publicBuilds: number;
    totalLikes: number;
    totalViews: number;
    mostPopularBuilds: Array<{ id: string; name: string; likes: number; views: number }>;
  } | null>(null);
  const router = useRouter();

  const fetchBuilds = async () => {
    setLoading(true);
    try {
      const result = await getAdminBuilds();
      
      if (result.success && result.data) {
        // getAdminBuilds should already include profile data via join
        // If not, we'll need to add it to the server action
        setBuilds(result.data as AdminBuild[]);
      }

      // Fetch analytics
      const analyticsResult = await getBuildAnalytics();
      if (analyticsResult.success && analyticsResult.data) {
        setAnalytics(analyticsResult.data);
      }
    } catch (error) {
      console.error('Error fetching builds:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuilds();
  }, []);

  const handleToggleVisibility = async (build: AdminBuild) => {
    try {
      const result = await updateBuildVisibility(build.id, !build.is_public);
      
      if (result.success) {
        await fetchBuilds();
      } else {
        alert(result.error || 'Failed to update build visibility');
      }
    } catch (error) {
      console.error('Error updating build:', error);
      alert('Failed to update build visibility');
    }
  };

  const handleDelete = async (build: AdminBuild) => {
    if (!confirm(`Are you sure you want to delete "${build.name}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(build.id);
    try {
      const result = await deleteBuild(build.id);
      
      if (result.success) {
        await fetchBuilds();
      } else {
        alert(result.error || 'Failed to delete build');
      }
    } catch (error) {
      console.error('Error deleting build:', error);
      alert('Failed to delete build');
    } finally {
      setDeleting(null);
    }
  };

  // Filter builds by search query
  const filteredBuilds = builds.filter((build) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      build.name.toLowerCase().includes(query) ||
      build.description?.toLowerCase().includes(query) ||
      build.profile?.username?.toLowerCase().includes(query) ||
      build.profile?.email?.toLowerCase().includes(query)
    );
  });

  const columns = [
    {
      key: 'name',
      header: 'Build',
      render: (build: AdminBuild) => (
        <div>
          <p className="font-medium text-cream-100">{build.name}</p>
          {build.description && (
            <p className="text-xs text-cream-400 truncate max-w-md">{build.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'user',
      header: 'Creator',
      render: (build: AdminBuild) => (
        <div>
          <p className="text-sm text-cream-200">{build.profile?.username || build.profile?.email || 'Unknown'}</p>
        </div>
      ),
    },
    {
      key: 'is_public',
      header: 'Status',
      render: (build: AdminBuild) => <StatusBadge active={build.is_public} />,
    },
    {
      key: 'likes_count',
      header: 'Likes',
      render: (build: AdminBuild) => <span className="text-cream-200">{build.likes_count || 0}</span>,
    },
    {
      key: 'views_count',
      header: 'Views',
      render: (build: AdminBuild) => <span className="text-cream-200">{build.views_count || 0}</span>,
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (build: AdminBuild) => (
        <span className="text-sm text-cream-400">{formatDate(build.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-40',
      render: (build: AdminBuild) => (
        <TableActions>
          <Link href={`/builds/${build.id}`} target="_blank">
            <button 
              className="p-2 text-cream-400 hover:text-cream-100 hover:bg-olive-600 rounded transition-colors"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
          </Link>
          <button
            onClick={() => handleToggleVisibility(build)}
            className={`p-2 rounded transition-colors ${
              build.is_public
                ? 'text-yellow-400 hover:text-yellow-300 hover:bg-olive-600'
                : 'text-green-400 hover:text-green-300 hover:bg-olive-600'
            }`}
            title={build.is_public ? 'Hide' : 'Make Public'}
          >
            {build.is_public ? (
              <XCircle className="w-4 h-4" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => handleDelete(build)}
            disabled={deleting === build.id}
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
          <div className="flex items-center gap-3 mb-1">
            <Wrench className="w-6 h-6 text-orange-400" />
            <h1 className="text-display text-3xl text-cream-100">Build Moderation</h1>
          </div>
          <p className="text-cream-300 mt-1">
            {loading ? 'Loading...' : `${builds.length} total builds`}
          </p>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-cream-400 uppercase tracking-wide">Total Builds</p>
              <p className="text-2xl font-bold text-cream-100 mt-1">{analytics.totalBuilds}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-cream-400 uppercase tracking-wide">Public Builds</p>
              <p className="text-2xl font-bold text-cream-100 mt-1">{analytics.publicBuilds}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-cream-400 uppercase tracking-wide">Total Likes</p>
              <p className="text-2xl font-bold text-cream-100 mt-1">{analytics.totalLikes}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-cream-400 uppercase tracking-wide">Total Views</p>
              <p className="text-2xl font-bold text-cream-100 mt-1">{analytics.totalViews}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search builds..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredBuilds}
        loading={loading}
        emptyMessage="No builds found."
        keyExtractor={(build) => build.id}
        onRowClick={(build) => router.push(`/builds/${build.id}`)}
      />
    </div>
  );
}
