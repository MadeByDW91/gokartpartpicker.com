import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Clock, AlertTriangle, ThumbsUp, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getGuideBySlug } from '@/actions/guides';
import { GuideViewer } from '@/components/lazy';
import { ArticleStructuredData, BreadcrumbStructuredData } from '@/components/StructuredData';

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getGuideBySlug(slug);
  
  if (!result.success || !result.data) {
    return {
      title: 'Guide Not Found - GoKartPartPicker',
    };
  }
  
  const guide = result.data;
  
  const description = guide.excerpt || `Step-by-step installation guide for ${guide.title}. Learn how to install, maintain, and upgrade your go-kart.`;
  
  return {
    title: `${guide.title} - Installation Guide | GoKartPartPicker`,
    description,
    openGraph: {
      title: `${guide.title} - Installation Guide`,
      description,
      type: 'article',
      url: `https://gokartpartpicker.com/guides/${guide.slug}`,
      images: guide.featured_image_url ? [{ url: guide.featured_image_url }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${guide.title} - Installation Guide`,
      description,
    },
    alternates: {
      canonical: `https://gokartpartpicker.com/guides/${guide.slug}`,
    },
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const result = await getGuideBySlug(slug);
  
  if (!result.success || !result.data) {
    notFound();
  }
  
  const guide = result.data;
  
  const guideUrl = `https://gokartpartpicker.com/guides/${guide.slug}`;
  const breadcrumbs = [
    { name: 'Home', url: 'https://gokartpartpicker.com' },
    { name: 'Guides', url: 'https://gokartpartpicker.com/guides' },
    { name: guide.title, url: guideUrl },
  ];
  
  return (
    <>
      {/* Structured Data */}
      <ArticleStructuredData
        title={guide.title}
        description={guide.excerpt || `Step-by-step installation guide for ${guide.title}`}
        publishedDate={guide.published_at || undefined}
        modifiedDate={guide.updated_at}
        image={guide.featured_image_url || undefined}
        url={guideUrl}
      />
      <BreadcrumbStructuredData items={breadcrumbs} />
      
      <div className="min-h-screen bg-olive-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/guides"
            className="inline-flex items-center gap-1 text-sm text-cream-400 hover:text-orange-400 transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Guides
          </Link>
          
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-display text-3xl md:text-4xl text-cream-100 mb-3">
                {guide.title}
              </h1>
              {guide.excerpt && (
                <p className="text-lg text-cream-300 mb-4">
                  {guide.excerpt}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3">
                {guide.category && (
                  <Badge variant="default">{guide.category}</Badge>
                )}
                {guide.difficulty_level && (
                  <Badge variant={
                    guide.difficulty_level === 'beginner' ? 'success' :
                    guide.difficulty_level === 'intermediate' ? 'info' :
                    guide.difficulty_level === 'advanced' ? 'warning' : 'error'
                  }>
                    {guide.difficulty_level}
                  </Badge>
                )}
                {guide.estimated_time_minutes && (
                  <div className="flex items-center gap-1 text-cream-400">
                    <Clock className="w-4 h-4" />
                    <span>~{guide.estimated_time_minutes} minutes</span>
                  </div>
                )}
                {guide.views_count > 0 && (
                  <span className="text-cream-400 text-sm">
                    {guide.views_count} views
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Guide Content */}
        <GuideViewer 
          guide={guide} 
          engineName={(guide as any).engine ? `${(guide as any).engine.brand} ${(guide as any).engine.name}` : undefined}
        />
      </div>
    </div>
    </>
  );
}
