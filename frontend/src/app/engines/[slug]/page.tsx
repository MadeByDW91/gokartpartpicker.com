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
  Info
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

// Always fetch fresh data (videos, etc.) so auto-filled URLs and thumbnails show without cache delay
export const dynamic = 'force-dynamic';

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
  
  // Group specs for display
  const specs = [
    { label: 'Displacement', value: `${engine.displacement_cc} cc`, icon: Gauge },
    { label: 'Horsepower', value: `${engine.horsepower} HP`, icon: Zap },
    { label: 'Torque', value: `${engine.torque} lb-ft`, icon: null },
    { label: 'Shaft Diameter', value: `${engine.shaft_diameter}"`, icon: Ruler },
    { label: 'Shaft Length', value: `${engine.shaft_length}"`, icon: null },
    { label: 'Shaft Type', value: engine.shaft_type, capitalize: true, icon: null },
    { label: 'Mount Type', value: engine.mount_type, icon: null },
    ...(engine.weight_lbs ? [{ label: 'Weight', value: `${engine.weight_lbs} lbs`, icon: Weight }] : []),
  ];
  
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Section */}
          <div className="relative">
            <div className="sticky top-24">
              <div className="aspect-square bg-olive-800 rounded-xl overflow-hidden border border-olive-600">
                {engine.image_url ? (
                  <Image
                    src={engine.image_url}
                    alt={`${engine.brand} ${engine.name}`}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
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
              
              {/* Compatibility Info Box - Desktop */}
              <div className="hidden lg:block mt-6 p-4 bg-[rgba(90,125,154,0.1)] border border-[rgba(90,125,154,0.3)] rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#7a9db9] flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-[#7a9db9] mb-1">Compatibility Note</h3>
                    <p className="text-sm text-cream-300">
                      This engine has a <strong className="text-cream-100">{engine.shaft_diameter}&quot;</strong>{' '}
                      <strong className="text-cream-100 capitalize">{engine.shaft_type}</strong> shaft. 
                      Make sure your clutch or torque converter has a matching bore size.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Details Section */}
          <div className="space-y-6">
            {/* Brand Badge */}
            {getEngineBadge(engine.brand) ? (
              <div className="w-20 h-20 relative">
                <Image
                  src={getEngineBadge(engine.brand)!}
                  alt={`${engine.brand} badge`}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <Badge variant="default" className="text-sm">
                {engine.brand}
              </Badge>
            )}
            
            {/* Title */}
            <h1 className="text-display text-4xl sm:text-5xl text-cream-100">
              {engine.name}
            </h1>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Zap className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-cream-100">{engine.horsepower}</p>
                  <p className="text-xs text-cream-400 uppercase tracking-wide">Horsepower</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Gauge className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-cream-100">{engine.displacement_cc}</p>
                  <p className="text-xs text-cream-400 uppercase tracking-wide">CC</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Ruler className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-cream-100">{engine.shaft_diameter}&quot;</p>
                  <p className="text-xs text-cream-400 uppercase tracking-wide">Shaft</p>
                </div>
              </div>
            </div>
            
            {/* Price */}
            {engine.price && (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-orange-400">
                  {formatPrice(engine.price)}
                </span>
                <span className="text-cream-400 text-sm">estimated</span>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <SelectEngineButton engine={engine} />
              
              {/* Harbor Freight Link for Predator Engines */}
              {engine.brand.toLowerCase().includes('predator') ? (
                <a
                  href="https://www.harborfreight.com/brands/predator/engines.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none"
                >
                  <Button
                    variant="secondary"
                    size="lg"
                    icon={<ExternalLink className="w-5 h-5" />}
                    className="w-full"
                  >
                    View on Harbor Freight
                  </Button>
                </a>
              ) : engine.affiliate_url ? (
                <a
                  href={engine.affiliate_url}
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
              ) : null}
              
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
            
            {/* Compatibility Info Box - Mobile */}
            <div className="lg:hidden p-4 bg-[rgba(90,125,154,0.1)] border border-[rgba(90,125,154,0.3)] rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-[#7a9db9] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-cream-300">
                  This engine has a <strong className="text-cream-100">{engine.shaft_diameter}&quot;</strong>{' '}
                  <strong className="text-cream-100 capitalize">{engine.shaft_type}</strong> shaft.
                </p>
              </div>
            </div>
            
            {/* Specifications Card */}
            <Card className="mt-6">
              <CardHeader className="border-b border-olive-600">
                <h2 className="text-display text-xl text-cream-100">Full Specifications</h2>
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
                      <dt className="flex items-center gap-2 text-cream-400">
                        {spec.icon && <spec.icon className="w-4 h-4" />}
                        {spec.label}
                      </dt>
                      <dd className={`font-semibold text-cream-100 ${spec.capitalize ? 'capitalize' : ''}`}>
                        {spec.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
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
        
        {/* Related Engines - Optional future feature */}
        {/* We could add a section for similar engines by HP range or brand */}
      </div>
      </div>
    </>
  );
}
