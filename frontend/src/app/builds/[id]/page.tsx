'use client';

import { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useBuild } from '@/hooks/use-builds';
import { BuildPerformanceCard } from '@/components/builder/BuildPerformanceCard';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { 
  ArrowLeft, 
  Cog,
  Package,
  Calendar,
  DollarSign,
  Globe,
  Lock,
  ExternalLink,
  Edit,
  Share2,
  GitCompare,
  ShoppingCart
} from 'lucide-react';
import { formatPrice, formatDate, getCategoryLabel } from '@/lib/utils';

interface BuildPageProps {
  params: Promise<{ id: string }>;
}

export default function BuildPage({ params }: BuildPageProps) {
  const { id } = use(params);
  const { data: build, isLoading, error } = useBuild(id);
  
  if (error) {
    return (
      <div className="min-h-screen bg-olive-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-cream-100 mb-4">Build Not Found</h1>
          <Link href="/builds">
            <Button variant="secondary" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Builds
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-olive-900">
      {/* Back Link */}
      <div className="bg-olive-800 border-b border-olive-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/builds"
            className="inline-flex items-center gap-2 text-sm text-cream-400 hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Builds
          </Link>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-12 w-1/2" />
            <Skeleton className="h-6 w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          </div>
        ) : build ? (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-display text-3xl sm:text-4xl text-cream-100 mb-2">
                  {build.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-cream-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Updated {formatDate(build.updated_at)}
                  </span>
                  {build.is_public ? (
                    <Badge variant="success">
                      <Globe className="w-3 h-3" />
                      Public
                    </Badge>
                  ) : (
                    <Badge variant="default">
                      <Lock className="w-3 h-3" />
                      Private
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <Link href={`/builds/${build.id}/shopping-list`}>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<ShoppingCart className="w-4 h-4" />}
                  >
                    Shopping List
                  </Button>
                </Link>
                <Link href={`/builds/compare?builds=${build.id}`}>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<GitCompare className="w-4 h-4" />}
                  >
                    Compare
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Share2 className="w-4 h-4" />}
                >
                  Share
                </Button>
                <Link href={`/builder?load=${build.id}`}>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Edit className="w-4 h-4" />}
                  >
                    Edit Build
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Description */}
            {build.description && (
              <p className="text-cream-300">{build.description}</p>
            )}
            
            {/* Total Price */}
            <Card variant="accent">
              <CardContent className="flex items-center justify-between py-6">
                <span className="text-cream-300 text-lg">Estimated Total</span>
                <span className="text-3xl font-bold text-orange-400 flex items-center">
                  <DollarSign className="w-7 h-7" />
                  {build.total_price.toFixed(2)}
                </span>
              </CardContent>
            </Card>
            
            {/* Performance Metrics */}
            {build.engine && (
              <BuildPerformanceCard build={build} />
            )}
            
            {/* Engine */}
            {build.engine && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Cog className="w-5 h-5 text-orange-400" />
                    <h2 className="text-display text-lg text-cream-100">Engine</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-olive-600 rounded-lg flex items-center justify-center">
                      {build.engine.image_url ? (
                        <Image
                          src={build.engine.image_url}
                          alt={build.engine.name}
                          width={80}
                          height={80}
                          className="object-cover rounded-lg"
                        />
                      ) : (
                        <Cog className="w-10 h-10 text-olive-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-cream-100">{build.engine.name}</h3>
                      <p className="text-sm text-cream-400">{build.engine.brand}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-cream-300">
                        <span>{build.engine.horsepower} HP</span>
                        <span>{build.engine.displacement_cc} cc</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-orange-400">
                        {build.engine.price ? formatPrice(build.engine.price) : '—'}
                      </span>
                      {build.engine.affiliate_url && (
                        <a
                          href={build.engine.affiliate_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 mt-1"
                          aria-label="View on Harbor Freight"
                        >
                          Buy <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Parts */}
            {Object.keys(build.parts || {}).length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-orange-400" />
                    <h2 className="text-display text-lg text-cream-100">Parts</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-olive-600">
                    {Object.entries(build.parts).map(([category, partId]) => (
                      <div key={category} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-cream-400 uppercase tracking-wide mb-1">
                              {getCategoryLabel(category)}
                            </p>
                            <p className="text-cream-100">Part ID: {partId}</p>
                          </div>
                          <Link href={`/parts/${partId}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Created By */}
            {build.profile && (
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-cream-100 font-bold">
                      {build.profile.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-sm text-cream-400">Created by</p>
                      <p className="font-medium text-cream-100">{build.profile.username}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
