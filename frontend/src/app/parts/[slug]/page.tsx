import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPartBySlug } from '@/actions/parts';
import { getEngines } from '@/actions/engines';
import { getPartVideos } from '@/actions/videos';
import { getCategoryLabel, getPartBrandDisplay } from '@/lib/utils';
import type { Engine, Part } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { EngineCard } from '@/components/EngineCard';
import { SelectPartButton } from './SelectPartButton';
import { ProductStructuredData, BreadcrumbStructuredData } from '@/components/StructuredData';
import { VideoSection, BuilderInsights } from '@/components/lazy';
import { AffiliateDisclosure } from '@/components/affiliate/AffiliateDisclosure';
import { PriceComparison } from '@/components/parts/PriceComparison';
import { PartDetailHero } from '@/components/parts/PartDetailHero';
import { getPartSupplierLinksPublic } from '@/actions/admin/part-suppliers';
import { 
  ArrowLeft, 
  Package, 
  Wrench,
  Info,
  Cog,
  Zap,
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
  const brandDisplay = getPartBrandDisplay(part.brand);
  const description = `${part.name} by ${brandDisplay} - ${getCategoryLabel(part.category)} for go-karts. View specs, price, and compatibility.`;
  
  return {
    title: `${part.name} | ${brandDisplay} ${getCategoryLabel(part.category)}`,
    description,
    keywords: [
      part.name.toLowerCase(),
      brandDisplay.toLowerCase(),
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

// Enable ISR (Incremental Static Regeneration) for better performance
// Pages are statically generated and revalidated every 1 hour
export const revalidate = 3600; // 1 hour

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

  // Serializable copy for client components (avoids RSC serialization errors with DB row shape)
  const clientPart: Part = {
    ...part,
    brand: part.brand ?? null,
    specifications:
      part.specifications &&
      typeof part.specifications === 'object' &&
      !Array.isArray(part.specifications)
        ? part.specifications
        : {},
  };

  // Find compatible engines (matching shaft diameter for clutches/torque converters)
  // Optimize: Only fetch if needed and limit upfront
  let compatibleEngines: Engine[] = [];
  if (part.category === 'clutch' || part.category === 'torque_converter') {
    const boreDiameter = part.specifications?.bore_diameter || part.specifications?.bore_in;
    if (boreDiameter && typeof boreDiameter === 'number') {
      // Fetch only 4 engines we need instead of 10 then filtering
      const enginesResult = await getEngines({ 
        shaft_type: undefined,
        limit: 4 // Only fetch what we need
      });
      if (enginesResult.success) {
        // Filter by diameter match
        compatibleEngines = enginesResult.data.filter(
          (engine) => Math.abs(engine.shaft_diameter - boreDiameter) < 0.01
        );
      }
    }
  }
  
  // Format specifications for display (guard: only plain objects)
  const specsObj =
    part.specifications &&
    typeof part.specifications === 'object' &&
    !Array.isArray(part.specifications)
      ? part.specifications
      : null;
  const specs = specsObj
    ? Object.entries(specsObj)
        .filter(([_, value]) => value !== null && value !== undefined && value !== '')
        .map(([key, value]) => ({
          label: key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
          value: String(value),
        }))
    : [];
  
  // Supplier / buy links for "Where to buy" (public, cached)
  const supplierResult = await getPartSupplierLinksPublic(part.id);
  const supplierLinks = supplierResult.success && supplierResult.data ? supplierResult.data : [];
  const hasAnyBuyLink = !!(part.affiliate_url || supplierLinks.length > 0);

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
        description={`${part.name} by ${getPartBrandDisplay(part.brand)} - ${getCategoryLabel(part.category)} for go-karts`}
        brand={getPartBrandDisplay(part.brand)}
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
        <PartDetailHero part={clientPart} supplierLinks={supplierLinks}>
          {hasAnyBuyLink && (
            <div className="mt-2">
              <AffiliateDisclosure variant="inline" />
            </div>
          )}
          {specs.length > 0 && (
            <Card className="mt-6">
              <CardHeader className="border-b border-olive-600">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-olive-700/30 border border-olive-600/20">
                    <Zap className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-display text-xl text-cream-100">Key Specifications</h2>
                    <p className="text-xs text-cream-500 mt-0.5">Part details and dimensions</p>
                  </div>
                </div>
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
        </PartDetailHero>
        
        {/* Price Comparison */}
        <PriceComparison partId={part.id} fallbackPrice={part.price} />
        
        {/* Builder Insights — tools and guides for this part / build */}
        <section id="builder-insights" className="mt-12 sm:mt-16 scroll-mt-20" aria-labelledby="builder-insights-heading">
          <div className="mb-4">
            <h2 id="builder-insights-heading" className="text-display text-2xl text-cream-100">
              Tools & insights
            </h2>
            <p className="text-cream-400 mt-1 text-sm max-w-2xl">
              Add this part to your build and pick an engine in the Builder to see cost estimates, compatibility, manuals, and guides.
            </p>
          </div>
          <BuilderInsights
            category={part.category}
            variant="builder-page"
            context="part-detail"
          />
        </section>
        
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
