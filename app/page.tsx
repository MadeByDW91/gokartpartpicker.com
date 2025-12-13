import Link from 'next/link'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-heading font-bold text-garage-dark mb-4">
          Build Your Dream Go-Kart Engine
        </h1>
        <p className="text-xl text-garage-gray mb-8">
          Find the right parts, compare prices, and follow step-by-step guides
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/engines"
            className="bg-garage-orange text-white px-8 py-3 rounded-lg font-heading text-lg hover:bg-opacity-90 transition"
          >
            Browse Engines
          </Link>
          <Link
            href="/build"
            className="bg-garage-dark text-white px-8 py-3 rounded-lg font-heading text-lg hover:bg-opacity-90 transition"
          >
            Start Building
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-16">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-2xl font-heading mb-4 text-garage-dark">Engines</h2>
          <p className="text-garage-gray mb-4">
            Browse our selection of Predator engines and find the perfect base for your build.
          </p>
          <Link href="/engines" className="text-garage-orange font-semibold hover:underline">
            View Engines →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-2xl font-heading mb-4 text-garage-dark">Parts Catalog</h2>
          <p className="text-garage-gray mb-4">
            Find performance parts, compare prices from multiple vendors, and add them to your build.
          </p>
          <Link href="/parts" className="text-garage-orange font-semibold hover:underline">
            Browse Parts →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-2xl font-heading mb-4 text-garage-dark">Guides</h2>
          <p className="text-garage-gray mb-4">
            Step-by-step installation guides with safety warnings and best practices.
          </p>
          <Link href="/guides" className="text-garage-orange font-semibold hover:underline">
            View Guides →
          </Link>
        </div>
      </div>
    </div>
  )
}

