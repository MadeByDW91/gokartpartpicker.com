'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '@/hooks/use-auth';
import { useUserBuilds } from '@/hooks/use-builds';
import { getProfile, updateProfile, getUserStats } from '@/actions/profile';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { 
  User, 
  Mail, 
  Calendar, 
  Save,
  Loader2,
  Shield,
  BarChart3,
  Settings,
  Heart,
  Eye,
  Wrench,
  BookOpen,
  MapPin,
  Target,
  DollarSign,
  Bell,
  Lock,
  Globe,
  TrendingUp,
  Activity,
  CheckCircle
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Profile } from '@/types/database';
import { PART_CATEGORIES } from '@/types/database';
import { getCategoryLabel } from '@/lib/utils';

type Tab = 'overview' | 'settings' | 'preferences' | 'activity';

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

const BUDGET_RANGES = [
  { value: 'under-500', label: 'Under $500' },
  { value: '500-1000', label: '$500 - $1,000' },
  { value: '1000-2000', label: '$1,000 - $2,000' },
  { value: '2000-5000', label: '$2,000 - $5,000' },
  { value: '5000-plus', label: '$5,000+' },
];

const USE_CASES = [
  { value: 'racing', label: 'Racing' },
  { value: 'recreation', label: 'Recreation' },
  { value: 'kids', label: 'Kids Kart' },
  { value: 'work', label: 'Work/Utility' },
  { value: 'competition', label: 'Competition' },
  { value: 'other', label: 'Other' },
];

const BUILD_GOALS = [
  { value: 'speed', label: 'Speed' },
  { value: 'torque', label: 'Torque' },
  { value: 'budget', label: 'Budget Build' },
  { value: 'beginner', label: 'Beginner Friendly' },
  { value: 'competition', label: 'Competition Ready' },
  { value: 'kids', label: 'Kids Kart' },
];

export default function ProfilePage() {
  const { user, loading: authLoading } = useRequireAuth();
  const { data: builds } = useUserBuilds();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<{
    totalBuilds: number;
    publicBuilds: number;
    privateBuilds: number;
    totalLikes: number;
    totalViews: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    location: '',
    experience_level: null as Profile['experience_level'],
    build_goals: [] as string[],
    budget_range: null as Profile['budget_range'],
    primary_use_case: null as Profile['primary_use_case'],
    interested_categories: [] as string[],
    newsletter_subscribed: false,
    email_notifications: true,
    public_profile: true,
    show_builds_publicly: true,
  });

  // Fetch profile and stats
  useEffect(() => {
    async function fetchData() {
      if (!user) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const [profileResult, statsResult] = await Promise.all([
          getProfile(),
          getUserStats(),
        ]);

        if (profileResult.success && profileResult.data) {
          const profileData = profileResult.data;
          setProfile(profileData);
          setFormData({
            username: profileData.username || '',
            bio: profileData.bio || '',
            location: profileData.location || '',
            experience_level: profileData.experience_level || null,
            build_goals: profileData.build_goals || [],
            budget_range: profileData.budget_range || null,
            primary_use_case: profileData.primary_use_case || null,
            interested_categories: profileData.interested_categories || [],
            newsletter_subscribed: profileData.newsletter_subscribed ?? false,
            email_notifications: profileData.email_notifications ?? true,
            public_profile: profileData.public_profile ?? true,
            show_builds_publicly: profileData.show_builds_publicly ?? true,
          });
        }

        if (statsResult.success && statsResult.data) {
          setStats(statsResult.data);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const result = await updateProfile(formData);
      
      if (result.success && result.data) {
        setProfile(result.data);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else if (!result.success) {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const toggleBuildGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      build_goals: prev.build_goals.includes(goal)
        ? prev.build_goals.filter(g => g !== goal)
        : [...prev.build_goals, goal],
    }));
  };

  const toggleCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      interested_categories: prev.interested_categories.includes(category)
        ? prev.interested_categories.filter(c => c !== category)
        : [...prev.interested_categories, category],
    }));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-olive-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: BarChart3 },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
    { id: 'preferences' as Tab, label: 'Preferences', icon: Target },
    { id: 'activity' as Tab, label: 'Activity', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-olive-900">
      {/* Header */}
      <div className="bg-olive-800 border-b border-olive-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-cream-100 font-bold text-3xl">
              {profile.username?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-display text-3xl text-cream-100">
                {profile.username || 'Profile'}
              </h1>
              <p className="text-cream-400 mt-1">
                {profile.bio || 'No bio yet'}
              </p>
              {profile.location && (
                <div className="flex items-center gap-1 mt-2 text-sm text-cream-400">
                  <MapPin className="w-4 h-4" />
                  {profile.location}
                </div>
              )}
            </div>
            {profile.role && profile.role !== 'user' && (
              <div className="ml-auto flex items-center gap-1">
                <Shield className="w-5 h-5 text-orange-400" />
                <Badge variant="default">
                  {profile.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-olive-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2
                  ${activeTab === tab.id
                    ? 'text-orange-400 border-orange-400'
                    : 'text-cream-400 border-transparent hover:text-cream-200 hover:border-cream-400'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-cream-400 uppercase tracking-wide">Total Builds</p>
                        <p className="text-3xl font-bold text-cream-100 mt-1">
                          {stats.totalBuilds}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-orange-500/10">
                        <Wrench className="w-6 h-6 text-orange-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-cream-400 uppercase tracking-wide">Public</p>
                        <p className="text-3xl font-bold text-cream-100 mt-1">
                          {stats.publicBuilds}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-green-500/10">
                        <Globe className="w-6 h-6 text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-cream-400 uppercase tracking-wide">Likes</p>
                        <p className="text-3xl font-bold text-cream-100 mt-1">
                          {stats.totalLikes}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-red-500/10">
                        <Heart className="w-6 h-6 text-red-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-cream-400 uppercase tracking-wide">Views</p>
                        <p className="text-3xl font-bold text-cream-100 mt-1">
                          {stats.totalViews}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-blue-500/10">
                        <Eye className="w-6 h-6 text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-cream-400 uppercase tracking-wide">Experience</p>
                        <p className="text-lg font-bold text-cream-100 mt-1">
                          {profile.experience_level 
                            ? EXPERIENCE_LEVELS.find(e => e.value === profile.experience_level)?.label || '—'
                            : 'Not set'
                          }
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-purple-500/10">
                        <TrendingUp className="w-6 h-6 text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Profile Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-cream-100">Profile Information</h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-cream-400" />
                    <div>
                      <p className="text-xs text-cream-400 uppercase tracking-wide">Email</p>
                      <p className="text-cream-100">{profile.email || user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-olive-600">
                    <Calendar className="w-5 h-5 text-cream-400" />
                    <div>
                      <p className="text-xs text-cream-400 uppercase tracking-wide">Member Since</p>
                      <p className="text-cream-100">{formatDate(profile.created_at)}</p>
                    </div>
                  </div>

                  {profile.primary_use_case && (
                    <div className="flex items-center gap-3 pt-2 border-t border-olive-600">
                      <Target className="w-5 h-5 text-cream-400" />
                      <div>
                        <p className="text-xs text-cream-400 uppercase tracking-wide">Primary Use</p>
                        <p className="text-cream-100">
                          {USE_CASES.find(u => u.value === profile.primary_use_case)?.label || profile.primary_use_case}
                        </p>
                      </div>
                    </div>
                  )}

                  {profile.budget_range && (
                    <div className="flex items-center gap-3 pt-2 border-t border-olive-600">
                      <DollarSign className="w-5 h-5 text-cream-400" />
                      <div>
                        <p className="text-xs text-cream-400 uppercase tracking-wide">Budget Range</p>
                        <p className="text-cream-100">
                          {BUDGET_RANGES.find(b => b.value === profile.budget_range)?.label || profile.budget_range}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Builds */}
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-cream-100">Recent Builds</h2>
                  <Link href="/builds">
                    <Button variant="ghost" size="sm">View All</Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {builds && builds.length > 0 ? (
                    <div className="space-y-3">
                      {builds.slice(0, 5).map((build) => (
                        <Link
                          key={build.id}
                          href={`/builds/${build.id}`}
                          className="block p-3 rounded-md bg-olive-700/50 hover:bg-olive-700 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-cream-100">{build.name}</p>
                              <p className="text-sm text-cream-400">{formatDate(build.created_at)}</p>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-cream-400">
                              {build.is_public && (
                                <span className="flex items-center gap-1">
                                  <Eye className="w-4 h-4" />
                                  {build.views_count || 0}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                {build.likes_count || 0}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Wrench className="w-12 h-12 text-cream-400 mx-auto mb-4 opacity-50" />
                      <p className="text-cream-400 mb-4">No builds yet</p>
                      <Link href="/builder">
                        <Button size="sm">Create Your First Build</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-cream-100">Profile Settings</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => {
                    setFormData({ ...formData, username: e.target.value });
                    setError('');
                    setSuccess(false);
                  }}
                  icon={<User className="w-4 h-4" />}
                  placeholder="your_username"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-cream-200 mb-2">
                    Bio
                  </label>
                  <textarea
                    className="w-full px-4 py-2 bg-olive-700 border border-olive-600 rounded-md text-cream-100 placeholder-cream-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Tell us about yourself..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-cream-400 mt-1">
                    {formData.bio.length}/500 characters
                  </p>
                </div>

                <Input
                  label="Location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  icon={<MapPin className="w-4 h-4" />}
                  placeholder="City, State, Country"
                />

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-md flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <p className="text-sm text-green-400">Profile updated successfully!</p>
                  </div>
                )}

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSave}
                  loading={saving}
                  icon={<Save className="w-5 h-5" />}
                  className="w-full"
                >
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-cream-100 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-orange-400" />
                  Privacy Settings
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-md hover:bg-olive-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-cream-400" />
                    <div>
                      <p className="text-cream-100 font-medium">Public Profile</p>
                      <p className="text-sm text-cream-400">Allow others to view your profile</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.public_profile}
                    onChange={(e) => setFormData({ ...formData, public_profile: e.target.checked })}
                    className="w-5 h-5 text-orange-500 bg-olive-700 border-olive-600 rounded focus:ring-orange-500"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-3 rounded-md hover:bg-olive-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Wrench className="w-5 h-5 text-cream-400" />
                    <div>
                      <p className="text-cream-100 font-medium">Show Builds Publicly</p>
                      <p className="text-sm text-cream-400">Make your builds visible to others</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.show_builds_publicly}
                    onChange={(e) => setFormData({ ...formData, show_builds_publicly: e.target.checked })}
                    className="w-5 h-5 text-orange-500 bg-olive-700 border-olive-600 rounded focus:ring-orange-500"
                  />
                </label>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-cream-100 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-400" />
                  Notification Settings
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-md hover:bg-olive-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-cream-400" />
                    <div>
                      <p className="text-cream-100 font-medium">Email Notifications</p>
                      <p className="text-sm text-cream-400">Receive email updates about your builds</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.email_notifications}
                    onChange={(e) => setFormData({ ...formData, email_notifications: e.target.checked })}
                    className="w-5 h-5 text-orange-500 bg-olive-700 border-olive-600 rounded focus:ring-orange-500"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-3 rounded-md hover:bg-olive-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-cream-400" />
                    <div>
                      <p className="text-cream-100 font-medium">Newsletter</p>
                      <p className="text-sm text-cream-400">Subscribe to our newsletter for tips and updates</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.newsletter_subscribed}
                    onChange={(e) => setFormData({ ...formData, newsletter_subscribed: e.target.checked })}
                    className="w-5 h-5 text-orange-500 bg-olive-700 border-olive-600 rounded focus:ring-orange-500"
                  />
                </label>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-cream-100">Build Preferences</h2>
                <p className="text-sm text-cream-400 mt-1">
                  Help us personalize your experience and show you relevant parts and builds
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Experience Level"
                    value={formData.experience_level || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      experience_level: e.target.value as Profile['experience_level'] || null 
                    })}
                  >
                    <option value="">Select Experience Level</option>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </Select>

                  <Select
                    label="Primary Use Case"
                    value={formData.primary_use_case || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      primary_use_case: e.target.value as Profile['primary_use_case'] || null 
                    })}
                  >
                    <option value="">Select Use Case</option>
                    {USE_CASES.map((useCase) => (
                      <option key={useCase.value} value={useCase.value}>
                        {useCase.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cream-200 mb-3">
                    Budget Range
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {BUDGET_RANGES.map((range) => (
                      <button
                        key={range.value}
                        type="button"
                        onClick={() => setFormData({ 
                          ...formData, 
                          budget_range: (formData.budget_range === range.value ? null : range.value) as Profile['budget_range'] 
                        })}
                        className={`
                          p-3 rounded-md border-2 transition-colors text-left
                          ${formData.budget_range === range.value
                            ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                            : 'border-olive-600 bg-olive-700 text-cream-200 hover:border-olive-500'
                          }
                        `}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cream-200 mb-3">
                    Build Goals (Select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {BUILD_GOALS.map((goal) => (
                      <button
                        key={goal.value}
                        type="button"
                        onClick={() => toggleBuildGoal(goal.value)}
                        className={`
                          px-4 py-2 rounded-full text-sm font-medium transition-colors
                          ${formData.build_goals.includes(goal.value)
                            ? 'bg-orange-500 text-cream-100'
                            : 'bg-olive-700 text-cream-300 hover:bg-olive-600'
                          }
                        `}
                      >
                        {goal.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cream-200 mb-3">
                    Interested Categories (Select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                    {PART_CATEGORIES.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className={`
                          px-3 py-1.5 rounded-md text-sm transition-colors
                          ${formData.interested_categories.includes(category)
                            ? 'bg-orange-500 text-cream-100'
                            : 'bg-olive-700 text-cream-300 hover:bg-olive-600'
                          }
                        `}
                      >
                        {getCategoryLabel(category)}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-md flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <p className="text-sm text-green-400">Preferences updated successfully!</p>
                  </div>
                )}

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSave}
                  loading={saving}
                  icon={<Save className="w-5 h-5" />}
                  className="w-full"
                >
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-cream-100">Recent Activity</h2>
              </CardHeader>
              <CardContent>
                {builds && builds.length > 0 ? (
                  <div className="space-y-4">
                    {builds.slice(0, 10).map((build) => (
                      <div
                        key={build.id}
                        className="flex items-center justify-between p-4 rounded-md bg-olive-700/50 border border-olive-600"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                            <Wrench className="w-5 h-5 text-orange-400" />
                          </div>
                          <div>
                            <Link
                              href={`/builds/${build.id}`}
                              className="font-medium text-cream-100 hover:text-orange-400 transition-colors"
                            >
                              {build.name}
                            </Link>
                            <p className="text-sm text-cream-400">
                              {build.is_public ? 'Public build' : 'Private build'} • {formatDate(build.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-cream-400">
                          {build.is_public && (
                            <>
                              <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {build.views_count || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                {build.likes_count || 0}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Activity className="w-16 h-16 text-cream-400 mx-auto mb-4 opacity-50" />
                    <p className="text-cream-400 mb-4">No activity yet</p>
                    <Link href="/builder">
                      <Button size="sm">Create Your First Build</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
