import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPartBySlug } from '@/actions/parts';
import { getEngines } from '@/actions/engines';
import { getPartVideos } from '@/actions/videos';
import { formatPrice, getCategoryLabel } from '@/lib/utils';
import type { Engine } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { EngineCard } from '@/components/EngineCard';
import { SelectPartButton } from './SelectPartButton';
import { ProductStructuredData, BreadcrumbStructuredData } from '@/components/StructuredData';
import { VideoSection } from '@/components/lazy';
import { AffiliateDisclosure } from '@/components/affiliate/AffiliateDisclosure';
import { 
  ArrowLeft, 
  Package, 
  ExternalLink,
  Wrench,
  Info,
  Cog,
} from 'lucide-react';

interface PartPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generate dynamic SEO metadata for part pages
 */
export async function generateMetadata({ params }: PartPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPartBySlug(slug);
  
  if (!result.success) {
    return {
      title: 'Part Not Found',
      description: 'The requested part could not be found.',
    };
  }
  
  const part = result.data;
  const description = `${part.name} by ${part.brand} - ${getCategoryLabel(part.category)} for go-karts. View specs, price, and compatibility.`;
  
  return {
    title: `${part.name} | ${part.brand} ${getCategoryLabel(part.category)}`,
    description,
    keywords: [
      part.name.toLowerCase(),
      part.brand?.toLowerCase(),
      getCategoryLabel(part.category).toLowerCase(),
      'go-kart parts',
      'kart parts',
    ].filter(Boolean) as string[],
    openGraph: {
      title: `${part.name} | GoKartPartPicker`,
      description,
      type: 'website',
      url: `https://gokartpartpicker.com/parts/${part.slug}`,
      images: part.image_url ? [{ url: part.image_url }] : [{ url: '/og/og-default-v1-1200x630.png' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${part.name} | GoKartPartPicker`,
      description,
      images: part.image_url ? [part.image_url] : ['/og/og-default-v1-1200x630.png'],
    },
    alternates: {
      canonical: `https://gokartpartpicker.com/parts/${part.slug}`,
    },
  };
}

export const dynamic = 'force-dynamic';

/**
 * Part detail page - Server Component
 * Uses slug for SEO-friendly URLs
 */
export default async function PartPage({ params }: PartPageProps) {
  const { slug } = await params;
  const result = await getPartBySlug(slug);
  
  if (!result.success) {
    notFound();
  }
  
  const part = result.data;
  
  // Find compatible engines (matching shaft diameter for clutches/torque converters)
  let compatibleEngines: Engine[] = [];
  if (part.category === 'clutch' || part.category === 'torque_converter') {
    const boreDiameter = part.specifications?.bore_diameter || part.specifications?.bore_in;
    if (boreDiameter && typeof boreDiameter === 'number') {
      const enginesResult = await getEngines({ 
        shaft_type: undefined, // Get all shaft types
        limit: 10 
      });
      if (enginesResult.success) {
        compatibleEngines = enginesResult.data.filter(
          (engine) => Math.abs(engine.shaft_diameter - boreDiameter) < 0.01
        ).slice(0, 4);
      }
    }
  }
  
  // Format specifications for display
  const specs = part.specifications 
    ? Object.entries(part.specifications)
        .filter(([_, value]) => value !== null && value !== undefined && value !== '')
        .map(([key, value]) => ({
          label: key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
          value: String(value),
        }))
    : [];
  
  const partUrl = `https://gokartpartpicker.com/parts/${part.slug}`;
  const breadcrumbs = [
    { name: 'Home', url: 'https://gokartpartpicker.com' },
    { name: 'Parts', url: 'https://gokartpartpicker.com/parts' },
    { name: getCategoryLabel(part.category), url: `https://gokartpartpicker.com/parts?category=${part.category}` },
    { name: part.name, url: partUrl },
  ];

  return (
    <>
      {/* Structured Data */}
      <ProductStructuredData
        name={part.name}
        description={`${part.name} by ${part.brand} - ${getCategoryLabel(part.category)} for go-karts`}
        brand={part.brand}
        price={part.price}
        image={part.image_url || undefined}
        category={getCategoryLabel(part.category)}
        url={partUrl}
      />
      <BreadcrumbStructuredData items={breadcrumbs} />
      
      <div className="min-h-screen bg-olive-900">
      {/* Breadcrumb Header */}
      <div className="bg-olive-800 border-b border-olive-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/parts"
              className="inline-flex items-center gap-2 text-cream-400 hover:text-orange-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              All Parts
            </Link>
            <span className="text-cream-600">/</span>
            <Link
              href={`/parts?category=${part.category}`}
              className="text-cream-400 hover:text-orange-400 transition-colors"
            >
              {getCategoryLabel(part.category)}
            </Link>
            <span className="text-cream-600">/</span>
            <span className="text-cream-100">{part.name}</span>
          </nav>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Section */}
          <div className="relative">
            <div className="sticky top-24">
              <div className="aspect-square bg-olive-800 rounded-xl overflow-hidden border border-olive-600">
                {part.image_url ? (
                  <Image
                    src={part.image_url}
                    alt={`${part.brand} ${part.name}`}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <Image
                    src="/placeholders/placeholder-part-v1.svg"
                    alt="Part placeholder"
                    fill
                    className="object-contain p-8 opacity-60"
                  />
                )}
              </div>
            </div>
          </div>
          
          {/* Details Section */}
          <div className="space-y-6">
            {/* Category Badge */}
            <Badge variant="default" className="text-sm">
              {getCategoryLabel(part.category)}
            </Badge>
            
            {/* Brand */}
            {part.brand && (
              <p className="text-sm text-cream-400 uppercase tracking-wide">
                {part.brand}
              </p>
            )}
            
            {/* Title */}
            <h1 className="text-display text-4xl sm:text-5xl text-cream-100">
              {part.name}
            </h1>
            
            {/* Price */}
            {part.price && (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-orange-400">
                  {formatPrice(part.price)}
                </span>
                <span className="text-cream-400 text-sm">estimated</span>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <SelectPartButton part={part} />
              
              {part.affiliate_url && (
                <a
                  href={part.affiliate_url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="flex-1 sm:flex-none"
                  aria-label="Buy Now (affiliate link)"
                >
                  <Button
                    variant="secondary"
                    size="lg"
                    icon={<ExternalLink className="w-5 h-5" />}
                    className="w-full"
                  >
                    Buy Now
                  </Button>
                </a>
              )}
              
              <Link href="/builder" className="flex-1 sm:flex-none">
                <Button
                  variant="ghost"
                  size="lg"
                  icon={<Wrench className="w-5 h-5" />}
                  className="w-full"
                >
                  Open Builder
                </Button>
              </Link>
            </div>
            
            {/* Affiliate Disclosure */}
            {part.affiliate_url && (
              <div className="mt-4">
                <AffiliateDisclosure variant="inline" />
              </div>
            )}
            
            {/* Specifications Card */}
            {specs.length > 0 && (
              <Card className="mt-6">
                <CardHeader className="border-b border-olive-600">
                  <h2 className="text-display text-xl text-cream-100">Specifications</h2>
                </CardHeader>
                <CardContent>
                  <dl className="divide-y divide-olive-600">
                    {specs.map((spec, index) => (
                      <div 
                        key={spec.label} 
                        className={`flex items-center justify-between py-3 ${
                          index === 0 ? 'pt-0' : ''
                        } ${index === specs.length - 1 ? 'pb-0' : ''}`}
                      >
                        <dt className="text-cream-400">{spec.label}</dt>
                        <dd className="font-semibold text-cream-100">{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        {/* Video Section */}
        <VideoSection partId={part.id} />
        
        {/* Compatible Engines Section */}
        {compatibleEngines.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center gap-3 mb-6">
              <Cog className="w-6 h-6 text-orange-400" />
              <h2 className="text-display text-2xl text-cream-100">Compatible Engines</h2>
            </div>
            
            <p className="text-cream-400 mb-6">
              These engines are compatible with this part based on shaft/bore diameter matching.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {compatibleEngines.map((engine) => (
                <EngineCard
                  key={engine.id}
                  engine={engine}
                  showAddButton={true}
                />
              ))}
            </div>
            
            <div className="text-center mt-6">
              <Link href="/engines">
                <Button variant="secondary">
                  Browse All Engines
                </Button>
              </Link>
            </div>
          </section>
        )}
      </div>
      </div>
    </>
  );
}
