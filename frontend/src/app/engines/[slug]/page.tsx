import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getEngineBySlug } from '@/actions/engines';
import { getCompatibleParts } from '@/actions/compatibility';
import { getEngineClones } from '@/actions/admin/engine-clones';
import { getEngineVideos } from '@/actions/videos';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { PartCard } from '@/components/PartCard';
import { SelectEngineButton } from './SelectEngineButton';
import { ProductStructuredData, BreadcrumbStructuredData } from '@/components/StructuredData';
import { VideoSection } from '@/components/lazy';
import { EngineClonesList } from '@/components/engines/EngineClonesList';
import { GuidesSection } from '@/components/guides/GuidesSection';
import { ManualCard } from '@/components/engines/ManualCard';
import { MountDimensionsDiagram } from '@/components/engines/MountDimensionsDiagram';
import { ShaftCalloutDiagram } from '@/components/engines/ShaftCalloutDiagram';
import { EngineDetailTabs } from '@/components/engines/EngineDetailTabs';
import { EngineTorqueSpecs } from '@/components/engines/EngineTorqueSpecs';
import { BuilderInsights } from '@/components/lazy';
import { 
  ArrowLeft, 
  Cog, 
  Zap, 
  Gauge, 
  Ruler, 
  Weight,
  ExternalLink,
  Wrench,
  Package,
  ChevronRight,
  Link2
} from 'lucide-react';

interface EnginePageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Get engine badge SVG path based on brand
 */
function getEngineBadge(brand: string): string | null {
  const brandLower = brand.toLowerCase();
  if (brandLower.includes('predator')) return '/badges/badge-engine-predator-v1.svg';
  if (brandLower.includes('clone')) return '/badges/badge-engine-clone-v1.svg';
  if (brandLower.includes('tillotson')) return '/badges/badge-engine-tillotson-v1.svg';
  if (brandLower.includes('briggs')) return '/badges/badge-engine-briggs-v1.svg';
  return null;
}

/**
 * Generate dynamic SEO metadata for engine pages
 */
export async function generateMetadata({ params }: EnginePageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getEngineBySlug(slug);
  
  if (!result.success) {
    return {
      title: 'Engine Not Found',
      description: 'The requested engine could not be found.',
    };
  }
  
  const engine = result.data;
  const description = `${engine.name} - ${engine.displacement_cc}cc, ${engine.horsepower}HP ${engine.shaft_type} shaft go-kart engine. View specs, price, and compatible parts.`;
  
  return {
    title: `${engine.name} | ${engine.brand} Engine`,
    description,
    keywords: [
      engine.name.toLowerCase(),
      engine.brand.toLowerCase(),
      `${engine.displacement_cc}cc engine`,
      'go-kart engine',
      'small engine',
      engine.shaft_type ? `${engine.shaft_type} shaft` : undefined,
    ].filter(Boolean) as string[],
    openGraph: {
      title: `${engine.name} | GoKartPartPicker`,
      description,
      type: 'website',
      url: `https://gokartpartpicker.com/engines/${engine.slug}`,
      images: engine.image_url ? [{ url: engine.image_url }] : [{ url: '/og/og-default-v1-1200x630.png' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${engine.name} | GoKartPartPicker`,
      description,
      images: engine.image_url ? [engine.image_url] : ['/og/og-default-v1-1200x630.png'],
    },
    alternates: {
      canonical: `https://gokartpartpicker.com/engines/${engine.slug}`,
    },
  };
}

// Enable ISR (Incremental Static Regeneration) for better performance
// Pages are statically generated and revalidated every 1 hour
export const revalidate = 3600; // 1 hour

/**
 * Engine detail page - Server Component
 * Uses slug for SEO-friendly URLs
 */
export default async function EnginePage({ params }: EnginePageProps) {
  const { slug } = await params;
  const result = await getEngineBySlug(slug);
  
  if (!result.success) {
    notFound();
  }
  
  const engine = result.data;
  
  // Fetch compatible parts (clutches and torque converters that match shaft diameter)
  const compatiblePartsResult = await getCompatibleParts(engine.id);
  const compatibleParts = compatiblePartsResult.success ? compatiblePartsResult.data : [];
  
  // Fetch clone/compatible engines
  const clonesResult = await getEngineClones(engine.id);
  const clones = clonesResult.success ? clonesResult.data : [];
  
  // Fetch videos for this engine (server-side so they appear on first load)
  const videosResult = await getEngineVideos(engine.id);
  const initialVideos = videosResult.success && videosResult.data ? videosResult.data : [];
  
  // Performance tier calculation
  const getPerformanceTier = (hp: number): { tier: string; color: string; description: string } => {
    if (hp < 6) return { tier: 'Entry-Level', color: 'text-green-400', description: 'Perfect for beginners' };
    if (hp >= 6 && hp < 10) return { tier: 'Mid-Range', color: 'text-orange-400', description: 'Great for recreational use' };
    if (hp >= 10 && hp < 15) return { tier: 'High Performance', color: 'text-red-400', description: 'Racing and competition' };
    return { tier: 'Extreme', color: 'text-purple-400', description: 'Maximum power' };
  };
  
  const performanceTier = getPerformanceTier(engine.horsepower);
  
  const engineUrl = `https://gokartpartpicker.com/engines/${engine.slug}`;
  const breadcrumbs = [
    { name: 'Home', url: 'https://gokartpartpicker.com' },
    { name: 'Engines', url: 'https://gokartpartpicker.com/engines' },
    { name: engine.brand, url: `https://gokartpartpicker.com/engines?brand=${encodeURIComponent(engine.brand)}` },
    { name: engine.name, url: engineUrl },
  ];

  return (
    <>
      {/* Structured Data */}
      <ProductStructuredData
        name={engine.name}
        description={`${engine.name} - ${engine.displacement_cc}cc, ${engine.horsepower}HP ${engine.shaft_type} shaft go-kart engine`}
        brand={engine.brand}
        price={engine.price}
        image={engine.image_url || undefined}
        category="Go-Kart Engine"
        url={engineUrl}
      />
      <BreadcrumbStructuredData items={breadcrumbs} />
      
      <div className="min-h-screen bg-olive-900">
      {/* Breadcrumb Header */}
      <div className="bg-olive-800 border-b border-olive-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/engines"
              className="inline-flex items-center gap-2 text-cream-400 hover:text-orange-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              All Engines
            </Link>
            <span className="text-cream-600">/</span>
            <span className="text-cream-300">{engine.brand}</span>
            <span className="text-cream-600">/</span>
            <span className="text-cream-100">{engine.name}</span>
          </nav>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Image Section - smaller, left-aligned */}
          <div className="relative lg:col-span-4">
            <div className="sticky top-24">
              <div className="space-y-6">
                {/* Product Image */}
                <div className="relative w-full max-w-sm mx-auto lg:max-w-none">
                  <div className="relative w-full aspect-[4/3] lg:aspect-[1] bg-gradient-to-br from-olive-800 to-olive-800/80 rounded-2xl overflow-hidden border border-olive-600/50 shadow-xl shadow-black/20 ring-1 ring-olive-500/10">
                    {engine.image_url ? (
                      <Image
                        src={engine.image_url}
                        alt={`${engine.brand} ${engine.name}`}
                        fill
                        className="object-contain p-4 sm:p-6"
                        priority
                        sizes="(max-width: 1024px) 100vw, 380px"
                      />
                    ) : (
                      <Image
                        src="/placeholders/placeholder-engine-v1.svg"
                        alt="Engine placeholder"
                        fill
                        className="object-contain p-8 opacity-60"
                      />
                    )}
                  </div>
                </div>
                
                {/* Manual and Torque Specs - Side by Side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Manual Card */}
                  {(engine.manual_url || engine.schematic_url) && (
                    <ManualCard
                      manualUrl={engine.manual_url || engine.schematic_url || ''}
                      engineName={engine.name}
                      type="manual"
                    />
                  )}
                  
                  {/* Torque Specifications */}
                  <EngineTorqueSpecs engine={engine} compact={true} />
                </div>
            </div>
          </div>
          </div>
          
          {/* Details Section */}
          <div className="lg:col-span-8 space-y-4">
            {/* Brand + Title */}
            <div className="flex items-start gap-4 mb-6">
              {getEngineBadge(engine.brand) ? (
                <div className="w-16 h-16 relative shrink-0 rounded-xl border-2 border-olive-600/40 bg-gradient-to-br from-olive-800/60 to-olive-900/40 p-2 shadow-md">
                  <Image
                    src={getEngineBadge(engine.brand)!}
                    alt={`${engine.brand} badge`}
                    fill
                    className="object-contain p-1"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl border-2 border-olive-600/40 bg-gradient-to-br from-olive-800/60 to-olive-900/40 flex items-center justify-center shadow-md">
                  <Badge variant="default" className="text-xs font-semibold">
                    {engine.brand}
                  </Badge>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-display text-2xl sm:text-3xl lg:text-4xl font-bold text-cream-100 tracking-tight mb-1">
                  {engine.name}
                </h1>
                {!getEngineBadge(engine.brand) && (
                  <p className="text-sm text-cream-400 font-medium">{engine.brand}</p>
                )}
              </div>
            </div>
            
            {/* Price & Actions - Unified Professional Layout */}
            <div className="rounded-xl border border-olive-600/50 bg-gradient-to-br from-olive-800/40 to-olive-900/30 p-5 shadow-lg">
              {/* Price Section */}
              {engine.price && (
                <div className="mb-5 pb-5 border-b border-olive-600/30">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl sm:text-4xl font-bold text-orange-400 tabular-nums">
                      {formatPrice(engine.price)}
                    </span>
                    <span className="text-xs text-cream-500/70 font-medium uppercase tracking-wide" title="Prices vary by retailer">
                      Est.
                    </span>
                  </div>
                  <p className="text-xs text-cream-500/60">Prices may vary by retailer</p>
                </div>
              )}
              
              {/* Primary Action */}
              <div className="mb-3">
                <SelectEngineButton engine={engine} />
              </div>
              
              {/* Secondary Actions */}
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Harbor Freight Link for Predator Engines */}
                {engine.brand.toLowerCase().includes('predator') ? (
                  <a
                    href="https://www.harborfreight.com/brands/predator/engines.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button
                      variant="secondary"
                      size="md"
                      icon={<ExternalLink className="w-4 h-4" />}
                      className="w-full text-sm"
                    >
                      View on Harbor Freight
                    </Button>
                  </a>
                ) : engine.affiliate_url ? (
                  <a
                    href={engine.affiliate_url}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="flex-1"
                    aria-label="Buy Now (affiliate link)"
                  >
                    <Button
                      variant="secondary"
                      size="md"
                      icon={<ExternalLink className="w-4 h-4" />}
                      className="w-full text-sm"
                    >
                      Buy Now
                    </Button>
                  </a>
                ) : null}
                
                <Link href="/builder" className="flex-1">
                  <Button
                    variant="secondary"
                    size="md"
                    icon={<Wrench className="w-4 h-4" />}
                    className="w-full text-sm"
                  >
                    Open Builder
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Tabbed Specifications */}
            <EngineDetailTabs engine={engine} performanceTier={performanceTier} />
          </div>
        </div>
        
        {/* Video Section */}
        <VideoSection engineId={engine.id} initialVideos={initialVideos} />
        
        {/* Installation Guides Section */}
        <GuidesSection engineId={engine.id} limit={3} />
        
        {/* Compatible/Clone Engines Section */}
        {clones.length > 0 && (
          <section className="mt-16">
            <EngineClonesList clones={clones} currentEngineName={engine.name} />
          </section>
        )}
        
        {/* Compatible Parts Section */}
        {compatibleParts.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-orange-400" />
                <h2 className="text-display text-2xl text-cream-100">Compatible Parts</h2>
              </div>
              <Link href={`/parts?shaft_diameter=${engine.shaft_diameter}`}>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            
            <p className="text-cream-400 mb-6">
              These parts are compatible with the {engine.shaft_diameter}&quot; shaft diameter of this engine.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {compatibleParts.slice(0, 4).map((part) => (
                <PartCard
                  key={part.id}
                  part={part}
                  showAddButton={true}
                  compact={true}
                />
              ))}
            </div>
            
            {compatibleParts.length > 4 && (
              <div className="text-center mt-6">
                <Link href={`/parts?shaft_diameter=${engine.shaft_diameter}`}>
                  <Button variant="secondary">
                    View {compatibleParts.length - 4} More Compatible Parts
                  </Button>
                </Link>
              </div>
            )}
          </section>
        )}
        
        {/* Builder Insights */}
        <div className="mt-16">
          <BuilderInsights
            engines={[engine]}
            selectedItem={engine}
            activePowerSource="gas"
            variant="engines-page"
          />
        </div>
        
        {/* Related Engines - Optional future feature */}
        {/* We could add a section for similar engines by HP range or brand */}
      </div>
      </div>
    </>
  );
}
