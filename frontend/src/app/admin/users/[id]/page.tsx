'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { formatDate } from '@/lib/utils';
import { ChevronLeft, Loader2, Shield, Package, Eye, AlertCircle } from 'lucide-react';
import { getUser, updateUserRole } from '@/actions/admin/users';
import { useAdmin } from '@/hooks/use-admin';
import type { AdminProfile } from '@/types/admin';

interface UserWithBuilds extends AdminProfile {
  buildsCount: number;
  lastBuildDate: string | null;
  builds: any[];
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isSuperAdmin } = useAdmin();
  const [user, setUser] = useState<UserWithBuilds | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<'user' | 'admin' | 'super_admin'>('user');

  useEffect(() => {
    const fetchUser = async () => {
      if (!params.id) return;

      setLoading(true);
      setError(null);

      try {
        const result = await getUser(params.id as string);
        
        if (result.success && result.data) {
          setUser(result.data);
          setRole(result.data.role as 'user' | 'admin' | 'super_admin');
        } else if (!result.success) {
          setError('error' in result ? result.error : 'User not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [params.id]);

  const handleRoleUpdate = async () => {
    if (!user || !isSuperAdmin) return;

    setUpdating(true);
    setError(null);

    try {
      const result = await updateUserRole(user.id, role);
      
      if (result.success && result.data) {
        setUser({ ...user, role: result.data.role as 'user' | 'admin' | 'super_admin' });
        setRole(result.data.role as 'user' | 'admin' | 'super_admin');
        alert('Role updated successfully');
      } else if (!result.success) {
        setError('error' in result ? result.error : 'Failed to update role');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setUpdating(false);
    }
  };

  const getRoleBadge = (userRole: string) => {
    const variants = {
      super_admin: { variant: 'error' as const, label: 'Super Admin' },
      admin: { variant: 'warning' as const, label: 'Admin' },
      user: { variant: 'default' as const, label: 'User' },
    };
    const config = variants[userRole as keyof typeof variants] || variants.user;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Users
        </Link>
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="text-red-400">{error || 'User not found'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Users
        </Link>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-display text-3xl text-cream-100">User Details</h1>
            <p className="text-cream-300 mt-1">{user.email || 'No email'}</p>
          </div>
          {getRoleBadge(user.role)}
        </div>
      </div>

      {/* User Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-cream-100">Profile Information</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-cream-400">Email</label>
              <p className="text-cream-100 mt-1">{user.email || '—'}</p>
            </div>
            <div>
              <label className="text-sm text-cream-400">Username</label>
              <p className="text-cream-100 mt-1">{user.username || '—'}</p>
            </div>
            <div>
              <label className="text-sm text-cream-400">User ID</label>
              <p className="text-xs text-cream-400 mt-1 font-mono break-all">{user.id}</p>
            </div>
            <div>
              <label className="text-sm text-cream-400">Joined</label>
              <p className="text-cream-100 mt-1">{formatDate(user.created_at)}</p>
            </div>
            <div>
              <label className="text-sm text-cream-400">Last Updated</label>
              <p className="text-cream-100 mt-1">{formatDate(user.updated_at)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Role Management (Super Admin Only) */}
        {isSuperAdmin && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-400" />
                <h2 className="text-lg font-semibold text-cream-100">Role Management</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
              <div>
                <label className="text-sm text-cream-400 mb-2 block">User Role</label>
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'user' | 'admin' | 'super_admin')}
                  options={[
                    { value: 'user', label: 'User' },
                    { value: 'admin', label: 'Admin' },
                    { value: 'super_admin', label: 'Super Admin' },
                  ]}
                />
              </div>
              <Button
                onClick={handleRoleUpdate}
                disabled={updating || role === user.role}
                loading={updating}
                variant="secondary"
              >
                Update Role
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Build Stats */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-cream-100">Build Statistics</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-cream-400">Total Builds</label>
              <p className="text-2xl font-bold text-cream-100 mt-1">{user.buildsCount}</p>
            </div>
            <div>
              <label className="text-sm text-cream-400">Last Build</label>
              <p className="text-cream-100 mt-1">
                {user.lastBuildDate ? formatDate(user.lastBuildDate) : 'No builds yet'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Builds */}
        {user.builds && user.builds.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-cream-100">Recent Builds</h2>
                <Link href="/admin/builds">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {user.builds.slice(0, 10).map((build: any) => (
                  <div
                    key={build.id}
                    className="flex items-center justify-between p-3 bg-olive-700/50 rounded-md"
                  >
                    <div>
                      <p className="font-medium text-cream-100">{build.name}</p>
                      <p className="text-xs text-cream-400 mt-1">
                        {formatDate(build.created_at)}
                        {build.is_public && (
                          <Badge variant="info" size="sm" className="ml-2">
                            Public
                          </Badge>
                        )}
                      </p>
                    </div>
                    <Link href={`/builds/${build.id}`}>
                      <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />}>
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
