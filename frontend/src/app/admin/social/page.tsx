'use client';

import { useState } from 'react';
import { useAdmin } from '@/hooks/use-admin';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  Share2,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Link as LinkIcon,
  Calendar,
  TrendingUp,
  Eye,
  Save,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ScheduledPost {
  id: string;
  platform: 'twitter' | 'facebook' | 'instagram';
  content: string;
  image_url?: string;
  scheduled_at: string;
  status: 'draft' | 'scheduled' | 'published';
  engagement?: {
    likes: number;
    shares: number;
    comments: number;
  };
}

export default function AdminSocialPage() {
  const { isAdmin, loading } = useAdmin();
  const [selectedPlatform, setSelectedPlatform] = useState<'twitter' | 'facebook' | 'instagram'>('twitter');
  const [content, setContent] = useState('');
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAdmin) {
    return <div className="flex items-center justify-center min-h-screen">Unauthorized</div>;
  }

  const platforms = [
    { id: 'twitter', name: 'Twitter/X', icon: Twitter, color: 'text-blue-400' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-500' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  ];

  const handleSaveDraft = () => {
    // Save draft to localStorage or database
    const draft: ScheduledPost = {
      id: Date.now().toString(),
      platform: selectedPlatform,
      content,
      status: 'draft',
      scheduled_at: new Date().toISOString(),
    };
    setScheduledPosts([...scheduledPosts, draft]);
    setContent('');
  };

  const handleSchedule = () => {
    // Schedule post (in production, this would save to database)
    alert('Scheduling feature - would save to database and schedule via API');
  };

  const handlePost = () => {
    // Post immediately (in production, this would call social media API)
    alert('Posting feature - would call social media API');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-display text-3xl text-cream-100">Social Media Manager</h1>
        <p className="text-cream-400 mt-1">
          Create, schedule, and manage social media posts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Post Composer */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-lg font-semibold text-cream-100">Create Post</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Platform Selector */}
            <div className="flex gap-2">
              {platforms.map((platform) => {
                const Icon = platform.icon;
                const isSelected = selectedPlatform === platform.id;
                return (
                  <Button
                    key={platform.id}
                    variant={isSelected ? 'primary' : 'secondary'}
                    onClick={() => setSelectedPlatform(platform.id as any)}
                    icon={<Icon className="w-4 h-4" />}
                  >
                    {platform.name}
                  </Button>
                );
              })}
            </div>

            {/* Content Editor */}
            <div>
              <label className="text-sm font-medium text-cream-300 mb-2 block">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post..."
                className="w-full h-32 bg-olive-800 border border-olive-600 rounded px-3 py-2 text-cream-100 placeholder-cream-500 resize-none"
              />
              <p className="text-xs text-cream-400 mt-1">
                {content.length} characters
              </p>
            </div>

            {/* Image Upload (placeholder) */}
            <div>
              <label className="text-sm font-medium text-cream-300 mb-2 block">
                Image (Optional)
              </label>
              <div className="border-2 border-dashed border-olive-600 rounded-lg p-8 text-center">
                <p className="text-cream-400 text-sm">
                  Drag and drop image here or click to upload
                </p>
                <Button variant="ghost" size="sm" className="mt-2">
                  Upload Image
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleSaveDraft} icon={<Save className="w-4 h-4" />}>
                Save Draft
              </Button>
              <Button variant="secondary" onClick={handleSchedule} icon={<Calendar className="w-4 h-4" />}>
                Schedule
              </Button>
              <Button variant="primary" onClick={handlePost} icon={<Share2 className="w-4 h-4" />}>
                Post Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Posts & Stats */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-cream-100">Quick Stats</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-cream-400">Scheduled</span>
                <span className="text-lg font-bold text-cream-100">
                  {scheduledPosts.filter((p) => p.status === 'scheduled').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-cream-400">Drafts</span>
                <span className="text-lg font-bold text-cream-100">
                  {scheduledPosts.filter((p) => p.status === 'draft').length}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Posts */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-cream-100">Recent Posts</h3>
            </CardHeader>
            <CardContent>
              {scheduledPosts.length === 0 ? (
                <p className="text-sm text-cream-400 text-center py-4">
                  No posts yet
                </p>
              ) : (
                <div className="space-y-3">
                  {scheduledPosts.slice(0, 5).map((post) => {
                    const PlatformIcon = platforms.find((p) => p.id === post.platform)?.icon || Share2;
                    return (
                      <div
                        key={post.id}
                        className="p-3 bg-olive-800 rounded-lg border border-olive-600"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <PlatformIcon className="w-4 h-4 text-cream-400" />
                            <Badge
                              variant={
                                post.status === 'published'
                                  ? 'success'
                                  : post.status === 'scheduled'
                                    ? 'warning'
                                    : 'default'
                              }
                              size="sm"
                            >
                              {post.status}
                            </Badge>
                          </div>
                          <span className="text-xs text-cream-500">
                            {formatDate(post.scheduled_at)}
                          </span>
                        </div>
                        <p className="text-sm text-cream-200 line-clamp-2">{post.content}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
