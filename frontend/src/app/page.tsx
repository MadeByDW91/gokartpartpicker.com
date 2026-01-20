import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { OrganizationStructuredData, WebsiteStructuredData } from '@/components/StructuredData';
import { 
  Wrench, 
  Cog, 
  Package, 
  Zap, 
  Shield, 
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'GoKartPartPicker - Build Your Ultimate Go-Kart',
  description: 'Build your ultimate go-kart with our compatibility checker. Find engines, parts, and accessories that work together. Real-time compatibility checking ensures every component fits precisely.',
  keywords: [
    'go-kart',
    'go kart parts',
    'go-kart engine',
    'kart building',
    'parts compatibility',
    'predator engine',
    'torque converter',
    'clutch',
    'go-kart builder',
    'kart configurator',
  ],
  openGraph: {
    title: 'GoKartPartPicker - Build Your Ultimate Go-Kart',
    description: 'Build your ultimate go-kart with our compatibility checker. Find engines, parts, and accessories that work together.',
    type: 'website',
    url: 'https://gokartpartpicker.com',
    siteName: 'GoKartPartPicker',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GoKartPartPicker - Build Your Ultimate Go-Kart',
    description: 'Build your ultimate go-kart with our compatibility checker. Find engines, parts, and accessories that work together.',
  },
  alternates: {
    canonical: 'https://gokartpartpicker.com',
  },
};

const features = [
  {
    icon: Shield,
    title: 'Compatibility Checker',
    description: 'Our system ensures all parts work together before you buy.',
  },
  {
    icon: Zap,
    title: 'Performance Insights',
    description: 'Get horsepower, torque, and speed estimates for your build.',
  },
  {
    icon: TrendingUp,
    title: 'Community Builds',
    description: 'Browse and learn from builds created by other enthusiasts.',
  },
];

const categories = [
  { name: 'Engines', href: '/engines', icon: Cog, count: '50+' },
  { name: 'Clutches', href: '/parts?category=clutch', icon: Package, count: '30+' },
  { name: 'Torque Converters', href: '/parts?category=torque_converter', icon: Package, count: '25+' },
  { name: 'Chains & Sprockets', href: '/parts?category=chain', icon: Package, count: '40+' },
  { name: 'Wheels & Tires', href: '/parts?category=wheel', icon: Package, count: '35+' },
  { name: 'Brakes', href: '/parts?category=brake', icon: Package, count: '20+' },
];

const steps = [
  { step: 1, title: 'Choose Your Engine', description: 'Start with the heart of your kart' },
  { step: 2, title: 'Add Parts', description: 'Select compatible components' },
  { step: 3, title: 'Check Compatibility', description: 'Our system verifies everything works' },
  { step: 4, title: 'Save & Share', description: 'Save your build or share it with others' },
];

export default function HomePage() {
  return (
    <>
      {/* Structured Data */}
      <OrganizationStructuredData />
      <WebsiteStructuredData />
      
      <div className="relative w-full max-w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden w-full max-w-full">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/ui/ui-hero-home-v1-1920x1080.webp"
            alt=""
            fill
            className="object-cover opacity-40 hidden md:block"
            priority
            sizes="100vw"
          />
          {/* Mobile version */}
          <Image
            src="/ui/ui-hero-home-mobile-v1-768x1024.webp"
            alt=""
            fill
            className="object-cover opacity-40 md:hidden"
            priority
            sizes="100vw"
          />
        </div>
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-olive-900/80 via-olive-800/70 to-olive-900/80" />
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 texture-noise" />
        
        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full mb-6 animate-fade-in">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-sm text-orange-400 font-medium">Part Compatibility Made Easy</span>
            </div>
            
            {/* Headline */}
            <h1 className="text-display text-5xl sm:text-6xl lg:text-7xl text-cream-100 leading-tight mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
              Build Your Ultimate{' '}
              <span className="text-orange-500 glow-orange-text">Go-Kart</span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-cream-300 mb-8 max-w-2xl animate-fade-in" style={{ animationDelay: '200ms' }}>
              Stop guessing if parts will work together. Our compatibility checker ensures every component fits precisely before you buy.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <Link
                href="/builder"
                className="btn btn-primary text-base sm:text-lg px-6 sm:px-8 py-3.5 sm:py-4 min-h-[52px] sm:min-h-[56px] animate-pulse-glow touch-manipulation flex items-center justify-center gap-2"
              >
                <Wrench className="w-5 h-5 sm:w-6 sm:h-6" />
                Start Building
              </Link>
              <Link
                href="/templates"
                className="btn btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3.5 sm:py-4 min-h-[52px] sm:min-h-[56px] touch-manipulation flex items-center justify-center gap-2"
              >
                Browse Templates
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 mt-12 pt-8 border-t border-olive-700 animate-fade-in" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center gap-2 text-cream-400">
                <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />
                <span>100+ Compatible Parts</span>
              </div>
              <div className="flex items-center gap-2 text-cream-400">
                <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />
                <span>Real-Time Compatibility</span>
              </div>
              <div className="flex items-center gap-2 text-cream-400">
                <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />
                <span>Save Unlimited Builds</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-20 bg-olive-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-display text-3xl sm:text-4xl text-cream-100 mb-4">
              How It Works
            </h2>
            <p className="text-cream-400 max-w-2xl mx-auto">
              Building a go-kart has never been easier. Follow these simple steps.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {steps.map(({ step, title, description }) => (
              <div
                key={step}
                className="relative p-6 bg-olive-700 border border-olive-600 rounded-lg hover:border-orange-500 transition-colors group"
              >
                <div className="absolute -top-4 left-6 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-cream-100 font-bold text-sm group-hover:scale-110 transition-transform">
                  {step}
                </div>
                <h3 className="text-display text-xl text-cream-100 mt-2 mb-2">{title}</h3>
                <p className="text-sm text-cream-400">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-20 bg-olive-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-display text-3xl sm:text-4xl text-cream-100 mb-6">
                Built for <span className="text-orange-500">Enthusiasts</span>
              </h2>
              <p className="text-cream-400 mb-8">
                Whether you&apos;re building your first backyard kart or upgrading a racing machine, our tools help you make the right choices.
              </p>
              
              <div className="space-y-6">
                {features.map((feature) => (
                  <div key={feature.title} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-cream-100 font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-cream-400">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Feature Visual */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-transparent rounded-2xl blur-2xl" />
              <div className="relative bg-olive-800 border border-olive-600 rounded-2xl p-6 racing-stripe">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-olive-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Cog className="w-8 h-8 text-orange-400" />
                      <div>
                        <p className="font-semibold text-cream-100">Predator 212cc</p>
                        <p className="text-sm text-cream-400">6.5 HP Engine</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-orange-400">$149</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-olive-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Package className="w-8 h-8 text-orange-400" />
                      <div>
                        <p className="font-semibold text-cream-100">TAV2 30 Series</p>
                        <p className="text-sm text-cream-400">Torque Converter</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-orange-400">$89</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-[rgba(74,124,89,0.15)] border border-[rgba(74,124,89,0.3)] rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />
                    <span className="text-sm text-cream-200">All parts are compatible!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Quick Links */}
      <section className="py-20 bg-olive-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-display text-3xl sm:text-4xl text-cream-100 mb-4">
              Quick Links
            </h2>
            <p className="text-cream-400 max-w-2xl">
              Get started quickly with our most popular tools and resources.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Link
              href="/builder"
              className="p-4 sm:p-5 bg-olive-700 rounded-lg border border-olive-600 hover:border-orange-500 transition-colors group touch-manipulation min-h-[80px] sm:min-h-[100px]"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-base sm:text-lg text-cream-100">Build Configurator</h3>
                  <p className="text-sm sm:text-base text-cream-400">Start building your kart</p>
                </div>
              </div>
            </Link>
            <Link
              href="/engines"
              className="p-4 sm:p-5 bg-olive-700 rounded-lg border border-olive-600 hover:border-orange-500 transition-colors group touch-manipulation min-h-[80px] sm:min-h-[100px]"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <Cog className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-base sm:text-lg text-cream-100">Browse Engines</h3>
                  <p className="text-sm sm:text-base text-cream-400">Find the ultimate engine</p>
                </div>
              </div>
            </Link>
            <Link
              href="/parts"
              className="p-4 sm:p-5 bg-olive-700 rounded-lg border border-olive-600 hover:border-orange-500 transition-colors group touch-manipulation min-h-[80px] sm:min-h-[100px]"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-base sm:text-lg text-cream-100">Browse Parts</h3>
                  <p className="text-sm sm:text-base text-cream-400">Explore all parts</p>
                </div>
              </div>
            </Link>
            <Link
              href="/templates"
              className="p-4 sm:p-5 bg-olive-700 rounded-lg border border-olive-600 hover:border-orange-500 transition-colors group touch-manipulation min-h-[80px] sm:min-h-[100px]"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-base sm:text-lg text-cream-100">Build Templates</h3>
                  <p className="text-sm sm:text-base text-cream-400">Start from a template</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Categories */}
      <section className="py-20 bg-olive-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-display text-3xl sm:text-4xl text-cream-100 mb-4">
              Browse by Category
            </h2>
            <p className="text-cream-400 max-w-2xl mx-auto">
              Find exactly what you need for your build.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 stagger-children">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group p-4 bg-olive-800 border border-olive-600 rounded-lg hover:border-orange-500 hover:shadow-[0_0_20px_rgba(201,106,36,0.2)] transition-all text-center"
              >
                <category.icon className="w-8 h-8 text-orange-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-sm font-semibold text-cream-100 mb-1">{category.name}</h3>
                <p className="text-xs text-cream-400">{category.count} items</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-olive-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-display text-3xl sm:text-4xl lg:text-5xl text-cream-100 mb-6">
            Ready to Build Your Dream Kart?
          </h2>
          <p className="text-lg text-cream-400 mb-8 max-w-2xl mx-auto">
            Start with our builder tool and let us help you pick the ultimate parts for your project.
          </p>
          <Link
            href="/builder"
            className="btn btn-primary text-lg px-10 py-4 inline-flex animate-pulse-glow"
          >
            <Wrench className="w-5 h-5" />
            Start Building Now
          </Link>
        </div>
      </section>
      </div>
    </>
  );
}
