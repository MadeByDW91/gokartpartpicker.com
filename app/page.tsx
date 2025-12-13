import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import VideoCarousel, { type Video } from '@/components/VideoCarousel'
import { getContextualVideos } from '@/lib/videoUtils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Go-Kart Engine Builds, Upgrades & Calculators | GoKartPartPicker',
  description:
    'Plan go-kart engine builds with real torque specs, upgrade compatibility, live HP calculators, and install guides. Built for Predator 212 and beyond.',
  openGraph: {
    title: 'Go-Kart Engine Builds, Upgrades & Calculators | GoKartPartPicker',
    description:
      'Plan go-kart engine builds with real torque specs, upgrade compatibility, live HP calculators, and install guides.',
    type: 'website',
  },
}

// Popular engines to show (by slug)
const POPULAR_ENGINE_SLUGS = ['predator-212-hemi', 'predator-212-ghost', 'predator-420']

// Example builds (static config for now)
const EXAMPLE_BUILDS = [
  {
    name: 'Stage 1 Street Build',
    engineSlug: 'predator-212-hemi',
    parts: ['stage-1-air-filter-kit', 'header-exhaust-pipe'],
    estimatedHp: '7-8',
    riskLevel: 'LOW',
    costEstimate: '$150-200',
  },
  {
    name: 'Stage 2 Performance',
    engineSlug: 'predator-212-ghost',
    parts: ['mikuni-vm22-carburetor', 'stage-2-camshaft', '22lb-valve-springs', 'billet-flywheel'],
    estimatedHp: '10-12',
    riskLevel: 'MED',
    costEstimate: '$400-500',
  },
  {
    name: 'High RPM Race Build',
    engineSlug: 'predator-212-ghost',
    parts: [
      'mikuni-vm22-carburetor',
      'stage-2-camshaft',
      '22lb-valve-springs',
      'billet-flywheel',
      'billet-connecting-rod',
      'governor-delete-kit',
    ],
    estimatedHp: '12-15',
    riskLevel: 'HIGH',
    costEstimate: '$600-800',
  },
]

async function getPopularEngines() {
  return await prisma.engine.findMany({
    where: {
      slug: {
        in: POPULAR_ENGINE_SLUGS,
      },
    },
    orderBy: {
      name: 'asc',
    },
  })
}

async function getFeaturedProducts() {
  return await prisma.product.findMany({
    where: { isActive: true },
    take: 6,
    orderBy: { createdAt: 'desc' },
  })
}

export default async function HomePage() {
  const [popularEngines, featuredProducts, videos] = await Promise.all([
    getPopularEngines(),
    getFeaturedProducts(),
    getContextualVideos({ limit: 6 }),
  ])

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'GoKartPartPicker',
            url: 'https://gokartpartpicker.com',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://gokartpartpicker.com/search?q={search_term_string}',
              },
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'GoKartPartPicker',
            url: 'https://gokartpartpicker.com',
            logo: 'https://gokartpartpicker.com/logo.png',
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Go-Kart Engine Build Planner',
            applicationCategory: 'WebApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            description:
              'Plan go-kart engine builds with real torque specs, upgrade compatibility, live HP calculators, and install guides.',
          }),
        }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* 1. Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-garage-dark mb-6">
            Plan Smarter Go-Kart Engine Builds
          </h1>
          <p className="text-xl md:text-2xl text-garage-gray mb-8 max-w-3xl mx-auto">
            Real torque specs, upgrade compatibility checks, live HP calculators, and step-by-step
            install guides. Everything you need to build safely and confidently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/build"
              className="bg-garage-orange text-white px-8 py-4 rounded-lg font-heading text-lg hover:bg-opacity-90 transition shadow-lg"
            >
              Start a Build
            </Link>
            <Link
              href="/engines"
              className="bg-garage-dark text-white px-8 py-4 rounded-lg font-heading text-lg hover:bg-opacity-90 transition"
            >
              Browse Engines
            </Link>
          </div>
          {/* Calculator Preview Card */}
          <div className="max-w-md mx-auto bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-heading font-semibold text-garage-dark mb-2">
              Ignition Timing Calculator
            </h3>
            <p className="text-sm text-garage-gray mb-4">
              Calculate optimal timing for your build with our interactive calculator.
            </p>
            <Link
              href="/learn/ignition-timing/calculator"
              className="text-garage-orange font-semibold hover:underline text-sm"
            >
              Try Calculator →
            </Link>
          </div>
        </section>

        {/* 2. Engine Picker */}
        <section className="mb-16">
          <h2 className="text-3xl font-heading font-bold text-garage-dark mb-6 text-center">
            Popular Engines
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {popularEngines.map((engine) => (
              <div
                key={engine.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition"
              >
                <h3 className="text-2xl font-heading mb-2 text-garage-dark">{engine.name}</h3>
                <p className="text-garage-gray mb-4 line-clamp-2">{engine.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-garage-gray">Stock HP</p>
                    <p className="font-semibold">
                      {engine.stockHp || `${engine.baseHpMin}-${engine.baseHpMax}`} HP
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-garage-gray">Stock RPM</p>
                    <p className="font-semibold">{engine.stockRpm} RPM</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/engines/${engine.slug}`}
                    className="flex-1 text-center bg-gray-200 text-gray-800 py-2 rounded-lg font-heading hover:bg-gray-300 transition"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/build?engine=${engine.slug}`}
                    className="flex-1 text-center bg-garage-orange text-white py-2 rounded-lg font-heading hover:bg-opacity-90 transition"
                  >
                    Start Build
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. How It Works */}
        <section className="mb-16 bg-white rounded-lg border border-gray-200 p-8 md:p-12">
          <h2 className="text-3xl font-heading font-bold text-garage-dark mb-8 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-garage-orange rounded-full flex items-center justify-center text-white text-2xl font-heading font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-heading font-semibold text-garage-dark mb-2">
                Choose Engine
              </h3>
              <p className="text-garage-gray">
                Select your base engine from Predator 212 variants, 420, or 670. See real torque
                specs and compatibility data.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-garage-orange rounded-full flex items-center justify-center text-white text-2xl font-heading font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-heading font-semibold text-garage-dark mb-2">
                Pick Upgrades
              </h3>
              <p className="text-garage-gray">
                Add performance parts with live compatibility checks. See HP gains, RPM limits, and
                safety warnings in real-time.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-garage-orange rounded-full flex items-center justify-center text-white text-2xl font-heading font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-heading font-semibold text-garage-dark mb-2">
                See Results
              </h3>
              <p className="text-garage-gray">
                Get estimated HP range, safe RPM limits, required tools, torque specs, and
                step-by-step install guides.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Featured Tools & Calculators */}
        <section className="mb-16">
          <h2 className="text-3xl font-heading font-bold text-garage-dark mb-6 text-center">
            Tools & Calculators
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              href="/engines/predator-212-hemi"
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition"
            >
              <h3 className="text-xl font-heading font-semibold text-garage-dark mb-2">
                Torque Specs
              </h3>
              <p className="text-garage-gray mb-4">
                View complete torque specifications for all engine fasteners, organized by category.
              </p>
              <span className="text-garage-orange font-semibold text-sm">View Specs →</span>
            </Link>
            <Link
              href="/build"
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition"
            >
              <h3 className="text-xl font-heading font-semibold text-garage-dark mb-2">
                Build Planner
              </h3>
              <p className="text-garage-gray mb-4">
                Plan your complete build with live HP calculations, compatibility checks, and cost
                estimates.
              </p>
              <span className="text-garage-orange font-semibold text-sm">Start Planning →</span>
            </Link>
            <Link
              href="/learn/ignition-timing/calculator"
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition"
            >
              <h3 className="text-xl font-heading font-semibold text-garage-dark mb-2">
                Ignition Timing Calculator
              </h3>
              <p className="text-garage-gray mb-4">
                Calculate optimal ignition timing with advanced timing keys. See HP impact and
                safety warnings.
              </p>
              <span className="text-garage-orange font-semibold text-sm">Try Calculator →</span>
            </Link>
          </div>
        </section>

        {/* 5. Example Builds */}
        <section className="mb-16">
          <h2 className="text-3xl font-heading font-bold text-garage-dark mb-6 text-center">
            Example Builds
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {EXAMPLE_BUILDS.map((build, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition"
              >
                <h3 className="text-xl font-heading font-semibold text-garage-dark mb-2">
                  {build.name}
                </h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-garage-gray">Estimated HP:</span>
                    <span className="font-semibold">{build.estimatedHp} HP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-garage-gray">Risk Level:</span>
                    <span
                      className={`font-semibold ${
                        build.riskLevel === 'LOW'
                          ? 'text-green-600'
                          : build.riskLevel === 'MED'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                      }`}
                    >
                      {build.riskLevel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-garage-gray">Est. Cost:</span>
                    <span className="font-semibold">{build.costEstimate}</span>
                  </div>
                </div>
                <Link
                  href={`/engines/${build.engineSlug}?build=${build.parts.join(',')}`}
                  className="block text-center bg-garage-orange text-white py-2 rounded-lg font-heading hover:bg-opacity-90 transition"
                >
                  View Build
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Videos Teaser Strip */}
        {videos.length > 0 && (
          <section className="mb-16">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-heading font-bold text-garage-dark">
                Featured Videos
              </h2>
              <Link
                href="/videos"
                className="text-garage-orange font-semibold hover:underline"
              >
                Browse All Videos →
              </Link>
            </div>
            <VideoCarousel videos={videos} compact maxVisible={4} />
          </section>
        )}

        {/* 7. Store Preview */}
        <section className="mb-16">
          <h2 className="text-3xl font-heading font-bold text-garage-dark mb-6 text-center">
            Featured Products
          </h2>
          {featuredProducts.length > 0 ? (
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/store/${product.slug}`}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition"
                >
                  <div className="aspect-square bg-gray-100 rounded mb-2 flex items-center justify-center">
                    {product.images && Array.isArray(product.images) && product.images[0] ? (
                      <Image
                        src={product.images[0] as string}
                        alt={product.name}
                        width={200}
                        height={200}
                        className="object-cover rounded"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">No Image</span>
                    )}
                  </div>
                  <h3 className="font-heading font-semibold text-garage-dark text-sm mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-garage-orange font-bold">
                    ${(product.priceCents / 100).toFixed(2)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg border border-gray-200 p-6 text-center"
                >
                  <div className="aspect-square bg-gray-100 rounded mb-4"></div>
                  <h3 className="font-heading font-semibold text-garage-dark mb-2">
                    Product {i}
                  </h3>
                  <p className="text-garage-gray text-sm">Coming soon</p>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-6">
            <Link
              href="/store"
              className="inline-block bg-garage-orange text-white px-8 py-3 rounded-lg font-heading hover:bg-opacity-90 transition"
            >
              Visit Store
            </Link>
          </div>
        </section>

        {/* 8. Account Benefits */}
        <section className="mb-16 bg-garage-dark text-white rounded-lg p-8 md:p-12">
          <h2 className="text-3xl font-heading font-bold mb-6 text-center">
            Create a Free Account
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-4xl mb-3">💾</div>
              <h3 className="text-xl font-heading font-semibold mb-2">Save Up to 10 Builds</h3>
              <p className="text-gray-300">
                Save and compare multiple builds. Access them anytime, anywhere.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🔧</div>
              <h3 className="text-xl font-heading font-semibold mb-2">
                Track Tools & Torque Specs
              </h3>
              <p className="text-gray-300">
                Keep track of required tools and torque specifications for your builds.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">📺</div>
              <h3 className="text-xl font-heading font-semibold mb-2">Bookmark Videos</h3>
              <p className="text-gray-300">
                Save helpful installation and tuning videos for quick reference.
              </p>
            </div>
          </div>
          <div className="text-center">
            <Link
              href="/signup"
              className="inline-block bg-garage-orange text-white px-8 py-4 rounded-lg font-heading text-lg hover:bg-opacity-90 transition"
            >
              Create Free Account
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
