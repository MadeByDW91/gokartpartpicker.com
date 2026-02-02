'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRequireAuth } from '@/hooks/use-auth';
import { useImpersonation } from '@/hooks/use-impersonation';
import { useUserBuilds, useDeleteBuild } from '@/hooks/use-builds';
import { BuildCard } from '@/components/BuildCard';
import { BuildCardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { 
  Bookmark, 
  Plus, 
  Wrench, 
  Loader2,
  Trash2,
  GitCompare
} from 'lucide-react';

export default function SavedBuildsPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const { active: impersonating } = useImpersonation();
  const { data: builds, isLoading, error } = useUserBuilds();
  const deleteBuild = useDeleteBuild();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const viewOnly = impersonating;

  const handleDelete = async (id: string) => {
    await deleteBuild.mutateAsync(id);
    setDeleteConfirm(null);
  };
  
  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-olive-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    );
  }
  
  // This will redirect if not authenticated
  if (!user) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-olive-900">
      {/* Header */}
      <div className="bg-olive-800 border-b border-olive-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Bookmark className="w-8 h-8 text-orange-400" />
                <h1 className="text-display text-3xl sm:text-4xl text-cream-100">
                  Saved Builds
                </h1>
              </div>
              <p className="text-cream-400">
                {viewOnly
                  ? 'Viewing this user’s builds (view-only). Exit view-as to make changes.'
                  : 'Your saved go-kart builds. Edit, share, or continue building.'}
              </p>
            </div>
            
            {!viewOnly && (
              <div className="flex items-center gap-2">
                <Link href="/builds/compare">
                  <Button variant="secondary" icon={<GitCompare className="w-4 h-4" />}>
                    Compare Builds
                  </Button>
                </Link>
                <Link href="/builder">
                  <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
                    New Build
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-[var(--error)]">Failed to load builds. Please try again.</p>
          </div>
        )}
        
        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <BuildCardSkeleton key={i} />
            ))}
          </div>
        )}
        
        {/* Empty State */}
        {!isLoading && builds?.length === 0 && (
          <div className="text-center py-16">
            <Image
              src="/ui/ui-empty-no-builds-v1.svg"
              alt="No builds yet"
              width={300}
              height={200}
              className="mx-auto mb-6"
            />
            <h2 className="text-2xl text-cream-100 mb-2">
              {viewOnly ? 'No Builds' : 'No Builds Yet'}
            </h2>
            <p className="text-cream-400 mb-6 max-w-md mx-auto">
              {viewOnly
                ? 'This user has no saved builds.'
                : 'Start building your first go-kart! Choose an engine and add compatible parts.'}
            </p>
            {!viewOnly && (
              <Link href="/builder">
                <Button variant="primary" size="lg" icon={<Plus className="w-5 h-5" />}>
                  Create Your First Build
                </Button>
              </Link>
            )}
          </div>
        )}
        
        {/* Builds Grid */}
        {!isLoading && builds && builds.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {builds.map((build) => (
              <BuildCard
                key={build.id}
                build={build}
                onDelete={viewOnly ? undefined : (id) => setDeleteConfirm(id)}
                onEdit={
                  viewOnly
                    ? undefined
                    : (b) => {
                        window.location.href = `/builder?load=${b.id}`;
                      }
                }
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal (hidden when view-only) */}
      {!viewOnly && deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-olive-900/80 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />
          <Card className="relative w-full max-w-sm animate-fade-in">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-[rgba(166,61,64,0.2)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-[var(--error)]" />
              </div>
              <h3 className="text-lg font-bold text-cream-100 mb-2">Delete Build?</h3>
              <p className="text-sm text-cream-400 mb-6">
                This action cannot be undone. Your build will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(deleteConfirm)}
                  loading={deleteBuild.isPending}
                  icon={<Trash2 className="w-4 h-4" />}
                  className="flex-1"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
