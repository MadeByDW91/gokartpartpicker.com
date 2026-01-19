'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  getBannedUsers,
  banUser,
  unbanUser,
  type BannedUser,
} from '@/actions/admin/security';
import {
  Ban,
  UserX,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function BanManagementPage() {
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'expired'>('all');

  useEffect(() => {
    fetchBannedUsers();
  }, []);

  const fetchBannedUsers = async () => {
    try {
      setLoading(true);
      const result = await getBannedUsers();
      if (result.success) {
        setBannedUsers(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load banned users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnban = async (banId: string) => {
    if (!confirm('Are you sure you want to unban this user?')) {
      return;
    }

    try {
      const result = await unbanUser(banId);
      if (result.success) {
        await fetchBannedUsers();
      } else {
        alert(result.error);
      }
    } catch (err) {
      alert('Failed to unban user');
      console.error(err);
    }
  };

  const filteredBans = bannedUsers.filter((ban) => {
    const matchesSearch =
      ban.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ban.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ban.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'active' && ban.is_active) ||
      (filterType === 'expired' && !ban.is_active);

    return matchesSearch && matchesFilter;
  });

  const activeBans = bannedUsers.filter((ban) => ban.is_active);
  const expiredBans = bannedUsers.filter((ban) => !ban.is_active);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-display text-3xl text-cream-100">Ban Management</h1>
          <p className="text-cream-300 mt-1">Manage user bans and restrictions</p>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="bg-olive-800 border-olive-600">
              <CardContent className="p-6">
                <div className="h-4 bg-olive-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-olive-700 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-3xl text-cream-100">Ban Management</h1>
          <p className="text-cream-300 mt-1">Manage user bans and restrictions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-olive-800 border-olive-600">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Ban className="w-5 h-5 text-red-400" />
              <span className="text-sm text-cream-300">Total Bans</span>
            </div>
            <div className="text-2xl font-bold text-cream-100">{bannedUsers.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-olive-800 border-olive-600">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <span className="text-sm text-cream-300">Active Bans</span>
            </div>
            <div className="text-2xl font-bold text-cream-100">{activeBans.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-olive-800 border-olive-600">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm text-cream-300">Expired Bans</span>
            </div>
            <div className="text-2xl font-bold text-cream-100">{expiredBans.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-olive-800 border-olive-600">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cream-400" />
              <input
                type="text"
                placeholder="Search by username, email, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-olive-700 border border-olive-600 rounded-md text-cream-100 placeholder-cream-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                All
              </Button>
              <Button
                variant={filterType === 'active' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilterType('active')}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Active
              </Button>
              <Button
                variant={filterType === 'expired' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilterType('expired')}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Expired
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Banned Users List */}
      <div className="space-y-4">
        {filteredBans.length > 0 ? (
          filteredBans.map((ban) => (
            <Card
              key={ban.id}
              className={`bg-olive-800 border-olive-600 ${
                ban.is_active ? 'border-red-500/30' : 'border-green-500/30'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <UserX
                        className={`w-5 h-5 ${
                          ban.is_active ? 'text-red-400' : 'text-green-400'
                        }`}
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-cream-100">
                          {ban.username}
                        </h3>
                        <p className="text-sm text-cream-400">{ban.email}</p>
                      </div>
                      {ban.is_active ? (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                          Expired
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-cream-300">
                      <p>
                        <span className="font-medium">Reason:</span> {ban.reason}
                      </p>
                      <p>
                        <span className="font-medium">Type:</span>{' '}
                        <span className="capitalize">{ban.ban_type}</span>
                      </p>
                      {ban.ban_type === 'temporary' && ban.expires_at && (
                        <p className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">Expires:</span>{' '}
                          {formatDate(ban.expires_at)}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Banned by:</span> {ban.banned_by_username}
                      </p>
                      <p>
                        <span className="font-medium">Banned on:</span>{' '}
                        {formatDate(ban.created_at)}
                      </p>
                    </div>
                  </div>
                  {ban.is_active && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleUnban(ban.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Unban
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-olive-800 border-olive-600">
            <CardContent className="p-12 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
              <p className="text-cream-300 text-lg">No banned users found</p>
              <p className="text-cream-400 text-sm mt-2">
                {searchTerm || filterType !== 'all'
                  ? 'Try adjusting your filters'
                  : 'All users are in good standing'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
