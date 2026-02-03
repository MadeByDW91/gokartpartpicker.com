import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getMotorBySlug, getCompatibleMotorParts } from '@/actions/motors';
import { formatPrice, getMotorBrandDisplay } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { PartCard } from '@/components/PartCard';
import { SelectMotorButton } from './SelectMotorButton';
import { ProductStructuredData, BreadcrumbStructuredData } from '@/components/StructuredData';
import { MountDimensionsDiagram } from '@/components/engines/MountDimensionsDiagram';
import { ShaftCalloutDiagram } from '@/components/engines/ShaftCalloutDiagram';
import { 
  ArrowLeft, 
  Battery, 
  Zap, 
  Gauge, 
  Ruler, 
  Weight,
  ExternalLink,
  Wrench,
  Info,
  Activity,
  Package
} from 'lucide-react';

interface MotorPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generate dynamic SEO metadata for motor pages
 */
export async function generateMetadata({ params }: MotorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getMotorBySlug(slug);
  
  if (!result.success) {
    return {
      title: 'Motor Not Found',
      description: 'The requested electric motor could not be found.',
    };
  }
  
  const motor = result.data;
  const description = `${motor.name} - ${motor.voltage}V, ${motor.power_kw}kW (${motor.horsepower}HP) electric motor. View specs, price, and compatible EV components.`;
  
  const brandDisplay = getMotorBrandDisplay(motor.brand);
  return {
    title: `${motor.name} | ${brandDisplay} Electric Motor`,
    description,
    keywords: [
      motor.name.toLowerCase(),
      brandDisplay.toLowerCase(),
      `${motor.voltage}v motor`,
      `${motor.power_kw}kw motor`,
      'electric go-kart motor',
      'BLDC motor',
      'EV motor',
    ].filter(Boolean) as string[],
    openGraph: {
      title: `${motor.name} | GoKartPartPicker`,
      description,
      type: 'website',
      url: `https://gokartpartpicker.com/motors/${motor.slug}`,
      images: motor.image_url ? [{ url: motor.image_url }] : [{ url: '/og/og-default-v1-1200x630.png' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${motor.name} | GoKartPartPicker`,
      description,
      images: motor.image_url ? [motor.image_url] : ['/og/og-default-v1-1200x630.png'],
    },
    alternates: {
      canonical: `https://gokartpartpicker.com/motors/${motor.slug}`,
    },
  };
}

// Enable ISR (Incremental Static Regeneration) for better performance
export const revalidate = 3600; // 1 hour

/**
 * Electric Motor detail page - Server Component
 * Uses slug for SEO-friendly URLs
 */
export default async function MotorPage({ params }: MotorPageProps) {
  const { slug } = await params;
  const result = await getMotorBySlug(slug);
  
  if (!result.success) {
    notFound();
  }
  
  const motor = result.data;
  const brandDisplay = getMotorBrandDisplay(motor.brand);

  // Fetch compatible EV parts (batteries, controllers, chargers matching voltage)
  const compatiblePartsResult = await getCompatibleMotorParts(motor.id);
  const compatibleParts = compatiblePartsResult.success ? compatiblePartsResult.data : [];
  
  // Group compatible parts by category
  const partsByCategory = compatibleParts.reduce((acc, part) => {
    if (!acc[part.category]) {
      acc[part.category] = [];
    }
    acc[part.category].push(part);
    return acc;
  }, {} as Record<string, typeof compatibleParts>);
  
  // Category labels for display
  const categoryLabels: Record<string, string> = {
    battery: 'Batteries',
    motor_controller: 'Motor Controllers',
    charger: 'Chargers',
    bms: 'Battery Management Systems',
    throttle_controller: 'Throttle Controllers',
    voltage_converter: 'Voltage Converters',
    battery_mount: 'Battery Mounts',
    wiring_harness: 'Wiring Harnesses',
  };
  
  // Group specs for display
  const specs = [
    { label: 'Voltage', value: `${motor.voltage}V`, icon: Battery },
    { label: 'Power (Continuous)', value: `${motor.power_kw} kW`, icon: Zap },
    ...(motor.peak_power_kw ? [{ label: 'Power (Peak)', value: `${motor.peak_power_kw} kW`, icon: Activity }] : []),
    { label: 'Horsepower', value: `${motor.horsepower} HP`, icon: Zap },
    { label: 'Torque', value: `${motor.torque_lbft} lb-ft`, icon: null },
    ...(motor.rpm_max ? [{ label: 'Max RPM', value: `${motor.rpm_max.toLocaleString()}`, icon: Gauge }] : []),
    ...(motor.rpm_rated ? [{ label: 'Rated RPM', value: `${motor.rpm_rated.toLocaleString()}`, icon: Gauge }] : []),
    ...(motor.efficiency ? [{ label: 'Efficiency', value: `${(motor.efficiency * 100).toFixed(0)}%`, icon: Activity }] : []),
    ...(motor.shaft_diameter ? [{ label: 'Shaft Diameter', value: `${motor.shaft_diameter}"`, icon: Ruler }] : []),
    ...(motor.shaft_length ? [{ label: 'Shaft Length', value: `${motor.shaft_length}"`, icon: Ruler }] : []),
    ...(motor.shaft_type ? [{ label: 'Shaft Type', value: motor.shaft_type, capitalize: true, icon: null }] : []),
    ...(motor.mount_type ? [{ label: 'Mount Type', value: motor.mount_type, icon: null }] : []),
    ...(motor.cooling_type ? [{ label: 'Cooling', value: motor.cooling_type, capitalize: true, icon: null }] : []),
    ...(motor.weight_lbs ? [{ label: 'Weight', value: `${motor.weight_lbs} lbs`, icon: Weight }] : []),
  ];
  
  const motorUrl = `https://gokartpartpicker.com/motors/${motor.slug}`;
  const breadcrumbs = [
    { name: 'Home', url: 'https://gokartpartpicker.com' },
    { name: 'Engines', url: 'https://gokartpartpicker.com/engines' },
    { name: brandDisplay, url: `https://gokartpartpicker.com/engines?brand=${encodeURIComponent(brandDisplay)}` },
    { name: motor.name, url: motorUrl },
  ];

  return (
    <>
      {/* Structured Data */}
      <ProductStructuredData
        name={motor.name}
        description={`${motor.name} - ${motor.voltage}V, ${motor.power_kw}kW (${motor.horsepower}HP) electric motor`}
        brand={brandDisplay}
        price={motor.price}
        image={motor.image_url || undefined}
        category="Electric Go-Kart Motor"
        url={motorUrl}
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
              Back to Motors
            </Link>
            <span className="text-cream-600">/</span>
            <span className="text-cream-300">{brandDisplay}</span>
            <span className="text-cream-600">/</span>
            <span className="text-cream-100">{motor.name}</span>
          </nav>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Section */}
          <div className="relative">
            <div className="sticky top-24">
              <div className="aspect-square bg-olive-800 rounded-xl overflow-hidden border border-olive-600">
                {motor.image_url ? (
                  <Image
                    src={motor.image_url}
                    alt={`${brandDisplay} ${motor.name}`}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <Image
                    src="/placeholders/placeholder-engine-v1.svg"
                    alt="Motor placeholder"
                    fill
                    className="object-contain p-8 opacity-60"
                  />
                )}
              </div>
              
              {/* Compatibility Info Box - Desktop */}
              <div className="hidden lg:block mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-400 mb-1">EV System Requirements</h3>
                    <p className="text-sm text-cream-300">
                      This {motor.voltage}V motor requires a matching {motor.voltage}V battery, compatible motor controller, and charger. 
                      {motor.controller_required && ' A motor controller is required.'}
                      {motor.cooling_type && ` Cooling: ${motor.cooling_type}.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Details Section */}
          <div className="space-y-6">
            {/* Brand Badge */}
            <Badge variant="default" className="text-sm bg-blue-500/20 text-blue-400 border-blue-500/30">
              <Battery className="w-3 h-3 mr-1" />
              {brandDisplay}
            </Badge>
            
            {/* Title */}
            <h1 className="text-display text-4xl sm:text-5xl text-cream-100">
              {motor.name}
            </h1>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Zap className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-cream-100">{motor.horsepower}</p>
                  <p className="text-xs text-cream-400 uppercase tracking-wide">Horsepower</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Battery className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-cream-100">{motor.voltage}</p>
                  <p className="text-xs text-cream-400 uppercase tracking-wide">Volts</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Gauge className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-cream-100">{motor.power_kw}</p>
                  <p className="text-xs text-cream-400 uppercase tracking-wide">kW</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Ruler className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-cream-100">{motor.torque_lbft}</p>
                  <p className="text-xs text-cream-400 uppercase tracking-wide">lb-ft</p>
                </div>
              </div>
            </div>
            
            {/* Price */}
            {motor.price && (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-orange-400">
                  {formatPrice(motor.price)}
                </span>
                <span className="text-cream-400 text-sm">estimated</span>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <SelectMotorButton motor={motor} />
              
              {motor.affiliate_url && (
                <a
                  href={motor.affiliate_url}
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
            
            {/* Compatibility Info Box - Mobile */}
            <div className="lg:hidden p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-cream-300">
                  This {motor.voltage}V motor requires a matching {motor.voltage}V battery and compatible controller.
                  {motor.controller_required && ' Controller required.'}
                </p>
              </div>
            </div>
            
            {/* Specifications Card */}
            <Card className="mt-6">
              <CardHeader className="border-b border-olive-600">
                <h2 className="text-display text-xl text-cream-100">Full Specifications</h2>
              </CardHeader>
              <CardContent>
                {motor.mount_type && (
                  <div className="mb-6">
                    <MountDimensionsDiagram
                      mountType={motor.mount_type}
                      productName={motor.name}
                      productType="motor"
                      className="max-w-sm"
                    />
                  </div>
                )}
                {motor.shaft_diameter != null && motor.shaft_length != null && motor.shaft_type && (
                  <div className="mb-6">
                    <ShaftCalloutDiagram
                      shaftDiameter={motor.shaft_diameter}
                      shaftLength={motor.shaft_length}
                      shaftType={motor.shaft_type}
                      className="max-w-sm"
                    />
                  </div>
                )}
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
            
            {/* Notes */}
            {motor.notes && (
              <Card className="mt-6">
                <CardHeader className="border-b border-olive-600">
                  <h2 className="text-display text-xl text-cream-100">Additional Notes</h2>
                </CardHeader>
                <CardContent>
                  <p className="text-cream-300 whitespace-pre-line">{motor.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        {/* Compatible EV Parts Section */}
        {compatibleParts.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-blue-400" />
                <h2 className="text-display text-2xl text-cream-100">Compatible EV Components</h2>
              </div>
              <Link href={`/parts?voltage=${motor.voltage}`}>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            
            <p className="text-cream-400 mb-6">
              These components are compatible with this {motor.voltage}V motor. Batteries and chargers match the voltage, and controllers are rated for the motor's power requirements.
            </p>
            
            {/* Display parts grouped by category */}
            {Object.entries(partsByCategory).map(([category, parts]) => (
              <div key={category} className="mb-8">
                <h3 className="text-display text-lg text-cream-200 mb-4">
                  {categoryLabels[category] || category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {parts.slice(0, 4).map((part) => (
                    <PartCard
                      key={part.id}
                      part={part}
                      showAddButton={true}
                      compact={true}
                    />
                  ))}
                </div>
                {parts.length > 4 && (
                  <div className="text-center mt-4">
                    <Link href={`/parts?category=${category}&voltage=${motor.voltage}`}>
                      <Button variant="secondary" size="sm">
                        View {parts.length - 4} More {categoryLabels[category] || category}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}
      </div>
      </div>
    </>
  );
}
