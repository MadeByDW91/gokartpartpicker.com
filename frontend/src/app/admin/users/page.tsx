'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DataTable, TableActions } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { Search, Eye, Shield, Users } from 'lucide-react';
import { getUsers } from '@/actions/admin/users';
import type { AdminProfile } from '@/types/admin';

interface UserWithBuilds extends AdminProfile {
  buildsCount: number;
  lastBuildDate: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithBuilds[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const result = await getUsers();
        
        if (result.success && result.data) {
          setUsers(result.data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users by search query
  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(query) ||
      user.username?.toLowerCase().includes(query) ||
      user.id.toLowerCase().includes(query)
    );
  });

  const getRoleBadge = (role: string) => {
    const variants = {
      super_admin: { variant: 'error' as const, label: 'Super Admin' },
      admin: { variant: 'warning' as const, label: 'Admin' },
      user: { variant: 'default' as const, label: 'User' },
    };
    const config = variants[role as keyof typeof variants] || variants.user;
    return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
  };

  const columns = [
    {
      key: 'email',
      header: 'User',
      render: (user: UserWithBuilds) => (
        <div>
          <p className="font-medium text-cream-100">{user.email || 'No email'}</p>
          {user.username && (
            <p className="text-xs text-cream-400">@{user.username}</p>
          )}
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (user: UserWithBuilds) => getRoleBadge(user.role),
    },
    {
      key: 'buildsCount',
      header: 'Builds',
      render: (user: UserWithBuilds) => (
        <span className="text-cream-200">{user.buildsCount}</span>
      ),
    },
    {
      key: 'created_at',
      header: 'Joined',
      render: (user: UserWithBuilds) => (
        <span className="text-sm text-cream-400">
          {formatDate(user.created_at)}
        </span>
      ),
    },
    {
      key: 'lastBuildDate',
      header: 'Last Build',
      render: (user: UserWithBuilds) => (
        <span className="text-sm text-cream-400">
          {user.lastBuildDate ? formatDate(user.lastBuildDate) : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (user: UserWithBuilds) => (
        <TableActions>
          <Link href={`/admin/users/${user.id}`}>
            <button 
              className="p-2 text-cream-400 hover:text-orange-400 hover:bg-olive-600 rounded transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
          </Link>
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
            <Users className="w-6 h-6 text-orange-400" />
            <h1 className="text-display text-3xl text-cream-100">Users</h1>
          </div>
          <p className="text-cream-300 mt-1">
            {loading ? 'Loading...' : `${users.length} total users`}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search by email or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        loading={loading}
        emptyMessage="No users found."
        keyExtractor={(user) => user.id}
        onRowClick={(user) => router.push(`/admin/users/${user.id}`)}
      />
    </div>
  );
}
